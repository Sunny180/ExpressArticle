var express = require('express');
var router = express.Router();
// // 載入 jwt 函式庫協助處理建立/驗證 token
// const jwt = require('jsonwebtoken');
// // 載入設定
// require('dotenv').config();
// // // 載入資料模型
// // var User = require('./app/models/user')

// app.user(express.json());

// DataBase 
const mariadb = require('mariadb');
const app = require('../app');
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'pratice'
});

const posts = [
  {
    username: 'Kyle',
    title: 'Post 1'
  },
  {
    username: 'Jim',
    title: 'Post 2'
  }
]

router.get('/posts',authenticateToken, (req, res) => {
  res.json(posts.filter(post => post.username === req.user.name))
})

/* POST localhost:3000/login -login */
router.post('/api/login', function (req, res, next) {
  // Authenticate User

  pool.getConnection().then(conn => {
    const login = {
      account: req.body.account,
      password: req.body.password
    };
    const user = {
      name: username
    }

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken})

    conn.query(`select u.Id, u.Role_Id from user u JOIN role r on u.Role_Id = r.Id where account= '${login.account}' AND password='${login.password}'`).then(rows => {
      console.log(rows[0].Role_Id);
      if (rows[0].Role_Id === 1) {
        res.send({ role: 'administrator', userId: Number(rows[0].Id) });
      } else if (rows[0].Role_Id === 2) {
        res.send({ role: 'author', userId: Number(rows[0].Id) });
      }
      conn.end();
    }).catch(err => {
      res.send({ role: 'nobody', userId: 0 });
      conn.end();
    })
  })
});

function authenticateToken(req, res, next){
  const authHearder = req.headers['authorization']
  const token = authHearder && authHearder.split(' ')[1]
  if(token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, user) =>{
    if(err) return res.sendStatus(403)
    req.user = user
    next()
  })
}


module.exports = router;
