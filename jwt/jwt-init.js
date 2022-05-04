var express = require('express');
var router = express.Router();

// DataBase 
const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'pratice'
});

const User = require('./models/user')
// 設定 PORT
const port = process.env.PORT || 3000

// MongoDB 連線與事件監聽

// automatically parse incoming json into object
app.use(express.json())

// 登入路由
app.post('users/login', async (req, res) => {
    try {
      // 驗證使用者，並將驗證成功回傳的用戶完整資訊存在 user 上
      const user = await User.findByCredentials(req.body.email, req.body.password)
      // 為該成功登入之用戶產生 JWT
      const token = await user.generateAuthToken()
      // 回傳該用戶資訊及 JWT
      res.send({ user, token })
    } catch (err) {
      res.status(400).send()
    }
  })

// 登出路由
app.post('users/logout', async (req, res) => {
  res.send()
})

// 登出所有裝置
app.post('users/logoutAll', auth, async (req, res) => {
  res.send()
})

app.listen(port, () => {
  console.log('app is listening')
})