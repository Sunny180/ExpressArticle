const express = require('express');
const router = express.Router();
const pool = require('../dataBase');
require('dotenv').config();
const jwt = require('jsonwebtoken');

let payload = {
  userId: Number,
  roleId: Number,
  userName: String,
};

let resp = {
  StatusCode: Number,
  Message: String,
  Data: String
};

const success = 0;
const system_fail = -1;
const permission_denied = -2; // 沒有權限
const Incorrect_account_or_password = -3;
const login_timeout = -4;
const data_not_found = -5;
const token_not_found = -6;
const token_err = -7;
const header_err = -8;
const varToString = varObj => Object.keys(varObj)[0];

/* GET localhost:3000/api/articles (這個user_id的所有文章,可給可不給) -所有文章的article_id,article_title,user_name  */
router.get('/api/articles', async function (req, res) {
  const userId = req.query.userId;
  const keyword = req.query.keyword;
  let sql = '';
  let conn;
  if (userId === undefined && keyword === undefined) {
    sql = 'SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id';
  }
  else if (userId === undefined && keyword) {
    sql = `SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id WHERE BINARY article.Title LIKE '%${keyword}%' OR BINARY user.Name LIKE '%${keyword}%'`;
  }
  else if (userId && keyword === undefined) {
    sql = `SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id where user.Id = ${userId}`;
  }
  else {
    sql = `SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id WHERE user.Id = ${userId} AND BINARY article.Title LIKE '%${keyword}%'`;
  }
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(sql);
    if (rows.length > 0) {
      resp.StatusCode = success;
      resp.Message = varToString({ success });
      resp.Data = rows;
    } else {
      resp.StatusCode = data_not_found;
      resp.Message = varToString({ data_not_found });
      resp.Data = null;
    }
  } catch {
    resp.StatusCode = system_fail;
    resp.Message = varToString({ system_fail });
    resp.Data = null;
  } finally {
    if (conn) {
      conn.release();
      res.send(resp);
    }
    else;
  }
});

/* GET localhost:3000/articles/:article_id -一筆資料的user_id,user_name,article_title,article_content,create_time,update_time */
router.get('/api/articles/:article_id', async function (req, res) {
  const articleId = req.params.article_id;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT u.Name, a.User_Id, a.Id, a.Title, a.Content, a.CreateTime, a.UpdateTime FROM article a join user u on a.User_Id = u.Id where a.Id= ${articleId}`);
    if (rows.length > 0) {
      resp.StatusCode = success;
      resp.Message = varToString({ success });
      resp.Data = rows[0];
    } else {
      resp.StatusCode = data_not_found;
      resp.Message = varToString({ data_not_found });
      resp.Data = null;
    }
  } catch {
    resp.StatusCode = system_fail;
    resp.Message = varToString({ system_fail });
    resp.Data = null;
  } finally {
    if (conn) {
      conn.release();
      res.send(resp);
    }
    else;
  }
});


/* GET localhost:3000/api/authors -所有作者 */
router.get('/api/authors', authenticateToken, async function (req, res) {
  let conn;
  try {
    conn = await pool.getConnection();
    if (payload.roleId === 1) {
      let rows = await conn.query('SELECT Id, Name FROM user');
      if (rows.length > 0) {
        resp.StatusCode = success;
        resp.Message = varToString({ success });
        resp.Data = rows;
      } else {
        resp.StatusCode = data_not_found;
        resp.Message = varToString({ data_not_found });
        resp.Data = null;
      }
    }
    else {
      resp.StatusCode = permission_denied;
      resp.Message = varToString({ permission_denied });
      resp.Data = null;
    }
  } catch {
    resp.StatusCode = system_fail;
    resp.Message = varToString({ system_fail });
    resp.Data = null;
  } finally {
    if (conn) {
      conn.release();
      res.send(resp);
    }
    else;
  }
});

/* POST localhost:3000/articles -insert一筆資料 */
router.post('/api/articles', authenticateToken, async function (req, res) {
  let conn;
  const Article = {
    article_title: req.body.Title,
    article_content: req.body.Content,
    userId: req.body.User_Id,
    adminId: req.body.AdminId
  };
  if (payload.roleId) {
    try {
      conn = await pool.getConnection();
      conn.query(`INSERT INTO article(Title, Content, User_Id, AdminId) values ('${Article.article_title}','${Article.article_content}',${Article.userId},${Article.adminId})`);
      resp.StatusCode = success;
      resp.Message = varToString({ success });
      resp.Data = null;
    } catch {
      resp.StatusCode = system_fail;
      resp.Message = varToString({ system_fail });
      resp.Data = null;
    } finally {
      if (conn) {
        conn.release();
        res.send(resp);
      }
      else;
    }
  } else {
    res.send({ StatusCode: permission_denied, Message: varToString({ permission_denied }), Data: null });
  }
});

/* PUT localhost:3000/articles/:article_id -update一筆資料 */
router.put('/api/articles/:article_id', authenticateToken, async function (req, res) {
  let conn;
  const article_id = req.params.article_id;
  const Article = {
    article_title: req.body.Title,
    article_content: req.body.Content,
    adminId: req.body.AdminId
  };
  let sql = '';
  try {
    conn = await pool.getConnection();
    if (payload.roleId === 1) {
      sql = `UPDATE article SET Title='${Article.article_title}', Content='${Article.article_content}', AdminId='${Article.adminId}' where Id= ${article_id}`;
    }
    else if (payload.roleId === 2) {
      sql = `UPDATE article SET Title='${Article.article_title}', Content='${Article.article_content}', AdminId='${Article.adminId}' where Id= ${article_id} AND User_Id=${payload.userId}`;
    }
    else {
      resp.StatusCode = permission_denied;
      resp.Message = varToString({ permission_denied });
      resp.Data = null;
    }
    const rows = await conn.query(`SELECT * FROM article WHERE Id = ${article_id}`);
    if (rows.length > 0) {
      connect.query(sql);
      resp.StatusCode = success;
      resp.Message = varToString({ success });
      resp.Data = null;
    }
    else {
      resp.StatusCode = data_not_found;
      resp.Message = varToString({ data_not_found });
      resp.Data = null;
    }
  } catch {
    resp.StatusCode = system_fail;
    resp.Message = varToString({ system_fail });
    resp.Data = null;
  } finally {
    if (conn) {
      conn.release();
      res.send(resp);
    }
    else;
  }
});

/* PUT localhost:3000/authors/:author_id -update一筆資料 */
router.put('/api/authors/:author_id', authenticateToken, async function (req, res) {
  let conn;
  const author_id = req.params.author_id;
  const Author = {
    name: req.body.Name,
    adminId: req.body.AdminId
  };
  try {
    conn = await pool.getConnection();
    if (payload.roleId === 1) {
      const rows = await conn.query(`SELECT * FROM user WHERE Id = ${author_id}`);
      if (rows.length > 0) {
        conn.query(`UPDATE user SET Name='${Author.name}', AdminId='${Author.adminId}' where Id= ${author_id}`);
        resp.StatusCode = success;
        resp.Message = varToString({ success });
        resp.Data = null;
      }
      else {
        resp.StatusCode = data_not_found;
        resp.Message = varToString({ data_not_found });
        resp.Data = null;
      }
    }
    else {
      resp.StatusCode = permission_denied;
      resp.Message = varToString({ permission_denied });
      resp.Data = null;
    }
  } catch {
    resp.StatusCode = system_fail;
    resp.Message = varToString({ system_fail });
    resp.Data = null;
  } finally {
    if (conn) {
      conn.release();
      res.send(resp);
    }
    else;
  }
});


/* DELETE localhost:3000/articles/:article_id -delete一筆資料 */
router.delete('/api/articles/:article_id', authenticateToken, async function (req, res) {
  let conn;
  const article_id = req.params.article_id;
  let sql = '';
  try {
    conn = await pool.getConnection();
    if (payload.roleId === 1) {
      sql = `DELETE FROM article WHERE Id = ${article_id}`;
    }
    else if (payload.roleId === 2) {
      sql = `DELETE FROM article WHERE Id = ${article_id} AND User_Id = ${payload.userId}`;
    }
    else {
      resp.StatusCode = permission_denied;
      resp.Message = varToString({ permission_denied });
      resp.Data = null;
    }
    const rows = await conn.query(`SELECT * FROM article WHERE Id = ${article_id}`);
    if (rows.length > 0) {
      conn.query(sql);
      resp.StatusCode = success;
      resp.Message = varToString({ success });
      resp.Data = null;
    }
    else {
      resp.StatusCode = data_not_found;
      resp.Message = varToString({ data_not_found });
      resp.Data = null;
    }
  } catch {
    resp.StatusCode = system_fail;
    resp.Message = varToString({ system_fail });
    resp.Data = null;
  } finally {
    if (conn) {
      conn.release();
      res.send(resp);
    }
    else;
  }
});

/* DELETE localhost:3000/api/authors/:author_id -delete一個作者 */
router.delete('/api/authors/:author_id', authenticateToken, async function (req, res) {
  let conn;
  const author_id = req.params.author_id;
  try {
    conn = await pool.getConnection();
    if (payload.roleId === 1) {
      const rows = await conn.query(`SELECT Id FROM user WHERE Id = ${author_id}`);
      if (rows.length > 0) {
        conn.query(`DELETE u,a FROM user u join article a on u.Id = a.User_Id WHERE u.Id = ${author_id};DELETE FROM user WHERE Id = ${author_id};`);
        resp.StatusCode = success;
        resp.Message = varToString({ success });
        resp.Data = null;
      }
      else {
        resp.StatusCode = data_not_found;
        resp.Message = varToString({ data_not_found });
        resp.Data = null;
      }
    }
    else {
      resp.StatusCode = permission_denied;
      resp.Message = varToString({ permission_denied });
      resp.Data = null;
    }
  } catch {
    resp.StatusCode = system_fail;
    resp.Message = varToString({ system_fail });
    resp.Data = null;
  } finally {
    if (conn) {
      conn.release();
      res.send(resp);
    }
    else;
  }
});

/* POST localhost:3000/logout -logout */
router.post('/api/logout', authenticateToken, async function (req, res) {
  let conn;
  const userId = req.body.User_Id;
  try {
    conn = await pool.getConnection();
    if (payload.roleId) {
      const rows = await conn.query(`SELECT t.User_Id FROM token t JOIN user u ON t.User_Id = u.Id where t.User_Id = ${userId}`);
      if (rows.length > 0) {
        conn.query(`UPDATE token SET Token = '' WHERE User_Id = ${rows[0].User_Id}`);
        resp.StatusCode = success;
        resp.Message = varToString({ success });
        resp.Data = null;
      }
      else {
        resp.StatusCode = token_not_found;
        resp.Message = varToString({ token_not_found });
        resp.Data = null;
      }
    }
    else {
      resp.StatusCode = permission_denied;
      resp.Message = varToString({ permission_denied });
      resp.Data = null;
    }
  } catch {
    resp.StatusCode = system_fail;
    resp.Message = varToString({ system_fail });
    resp.Data = null;
  } finally {
    if (conn) {
      conn.release();
      res.send(resp);
    }
    else;
  }
});

/* POST localhost:3000/login -login */
router.post('/api/login', async function (req, res) {
  let conn;
  let accessToken;
  const login = {
    account: req.body.account,
    password: req.body.password
  };
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`select u.Id, u.Name, u.Role_Id from user u JOIN role r on u.Role_Id = r.Id where account= '${login.account}' AND password='${login.password}'`);
    if (rows.length > 0) {
      // 產生 JWT
      const payload = {
        userId: Number(rows[0].Id),
        roleId: Number(rows[0].Role_Id),
        userName: rows[0].Name
      };
      // 取得 API Token
      accessToken = jwt.sign({ payload, exp: Math.floor(Date.now() / 1000) + (60 * 20) }, process.env.ACCESS_TOKEN_SECRET);
      const row = await conn.query(`SELECT t.User_Id FROM user u JOIN token t ON u.Id = t.User_Id where u.Id = ${rows[0].Id}`);
      if (row.length > 0) {
        conn.query(`UPDATE token SET Token = '${accessToken}' where User_Id = ${row[0].User_Id}`);
        resp.StatusCode = success;
        resp.Message = varToString({ success });
        resp.Data = accessToken;
        console.log('a');
      }
      else {
        conn.query(`INSERT INTO token (User_Id, Token) values (${payload.userId}, '${accessToken}')`);
        resp.StatusCode = success;
        resp.Message = varToString({ success });
        resp.Data = accessToken;
        console.log('aa');
      }
    }
    else {
      resp.StatusCode = Incorrect_account_or_password;
      resp.Message = varToString({ Incorrect_account_or_password });
      resp.Data = null;
      console.log('aaa');
    }
  } catch {
    resp.StatusCode = system_fail;
    resp.Message = varToString({ system_fail });
    resp.Data = null;
  } finally {
    if (conn) {
      conn.release();
      res.send(resp);
    }
    else;
  }
});

async function authenticateToken(req, res, next) {
  try {
    const authorization = await req.headers['authorization'].split(' ');
    const token = await authorization[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
      if (err) {
        if (err.message === 'jwt expired') {
          res.send({ StatusCode: login_timeout, Message: varToString({ login_timeout }), Data: null });
        } else {
          console.log({ StatusCode: token_err, Message: varToString({ token_err }), Data: null });
        }
      } else {
        const userId = decoded.payload.userId;
        let conn;
        try {
          conn = await pool.getConnection();
          const rows = await conn.query(`select Id, Role_Id from user where Id = ${userId}`);
          if (rows.length > 0) {
            payload = decoded.payload;
            console.log({ StatusCode: success, Message: varToString({ success }), Data: rows[0] });
          } else {
            console.log({ StatusCode: data_not_found, Message: varToString({ data_not_found }), Data: null });
          }
        } catch {
          resp.StatusCode = system_fail;
          resp.Message = varToString({ system_fail });
          resp.Data = null;
        } finally {
          if (conn) {
            conn.release();
            res.send(resp);
          }
          else;
        } next();
      }
    });
  } catch {
    console.log({ StatusCode: header_err, Message: varToString({ header_err }), Data: null });
  }
}
module.exports = router;

// if (req.headers['authorization']) {
//     const authorization = req.headers['authorization'].split(' ');
//     const token = authorization[1];
//     if (token === null) {
//       return res.send({ StatusCode: -3, Message: 'token為null', Data: null })
//     } else {
//       jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//           if (err.message === 'jwt expired') {
//             res.send({ StatusCode: login_timeout, Message: 'login_timeout', Data: null });
//           } else {
//             console.log(err);
//             console.log({ StatusCode: -3, Message: 'err', Data: null });
//           }
//         }
//         else {
//           const userId = decoded.payload.userId;
//           pool.getConnection().then(conn => {
//             conn.query(`select Id, Role_Id from user where Id = ${userId}`).then((rows) => {
//               console.log({ StatusCode: success, Message: 'success', Data: rows[0] });
//               payload = decoded.payload;
//               conn.end();
//             });
//           }); next()
//         };
//       });
//     }
//   } else {
//     res.send({ StatusCode: -8, Message: 'header_authorization_miss', Data: null });
//   }
// }


// /* POST localhost:3000/login -login */
// router.post('/api/login', function (req, res, next) {
//   pool.getConnection().then(conn => {
//     const login = {
//       account: req.body.account,
//       password: req.body.password
//     };
//     conn.query(`select u.Id, u.Name, u.Role_Id from user u JOIN role r on u.Role_Id = r.Id where account= '${login.account}' AND password='${login.password}'`).then(rows => {
//       // 產生 JWT
//       const payload = {
//         userId: Number(rows[0].Id),
//         roleId: Number(rows[0].Role_Id),
//         userName: rows[0].Name
//       };
//       // 取得 API Token
//       const accessToken = jwt.sign({ payload, exp: Math.floor(Date.now() / 1000) + (60 * 30) }, process.env.ACCESS_TOKEN_SECRET);
//       conn.query(`IF EXISTS (SELECT t.User_Id FROM user u JOIN token t ON u.Id = t.User_Id where u.Id = ${rows[0].Id})\
//       UPDATE token SET Token = '${accessToken}' where User_Id = ${row[0].User_Id} ELSE\
//       INSERT INTO token (User_Id, Token) values (${payload.userId}, '${accessToken}')`).then((row) => {
//         res.send({ StatusCode: 0, Message: '登入成功', Data: accessToken });
//         conn.end();
//       }).catch(err => {
//         res.send({ StatusCode: -1, Message: '登入失敗', Data: null });
//         conn.end();
//       })
//     }).catch(err => {
//       res.send({ StatusCode: -1, Message: '登入失敗', Data: null });
//       conn.end();
//     })
//   })
// });

// router.get('/api/posts', authenticateToken, (req, res) => {
//   pool.getConnection().then(conn => {
//     console.log(userId);
//     conn.query(`select Id, Role_Id from user where Id = ${userId}`).then(rows => {
//       res.send(rows[0]);
//       conn.end();
//     })
//   })
// });

/*async function asyncFunction() {
  let conn;
  try {
    let conn = await pool.getConnection();
    let rows = await conn.query("INSERT INTO login (id,account,password) value ('3','Sunny','Sunny')");
    console.log('data inserted'); // { affectedRows: 1, insertId: 1, warningStatus: 0 }

  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}
 asyncFunction();*/

// /* GET localhost:3000/api/articles (這個user_id的所有文章,可給可不給) -所有文章的article_id,article_title,user_name  */
// router.get(`/api/articles`, function (req, res, next) {
//   pool.getConnection().then(conn => {
//     const userId = req.query.userId;
//     const keyword = req.query.keyword;
//     if (userId === undefined && keyword === undefined) {
//       conn.query(`SELECT a.Id, a.Title, a.User_Id, u.Name FROM article a join user u on a.User_Id = u.Id`)
//         .then(rows => {
//           res.send({ StatusCode: 0, Message: '成功', Data: rows });
//         }).catch(err => {
//           console.log(err);
//           res.send({ StatusCode: -1, Message: '失敗', Data: null });
//         }).finally(() => {
//           conn.end();
//         });
//     } else if (userId === undefined && keyword) {
//       conn.query(`SELECT a.Id, a.Title, a.User_Id, u.Name FROM article a join user u on a.User_Id = u.Id WHERE a.Title LIKE '%${keyword}%' OR u.Name LIKE '%${keyword}%' `).then(rows => {
//         res.send({ StatusCode: 0, Message: '成功', Data: rows });
//       }).catch(err => {
//         console.log(err);
//         res.send({ StatusCode: -1, Message: '失敗', Data: null });
//       }).finally(() => {
//         conn.end();
//       });
//     } else if (userId && keyword === undefined) {
//       conn.query(`SELECT Id FROM user where Id = ${userId}`).then(rows => {
//         if (rows[0]) {
//           conn.query(`SELECT a.Id, a.Title, a.User_Id, u.Name FROM article a join user u on a.User_Id = u.Id where u.Id = ${userId}`).then(rows => {
//             if (rows[0]) {
//               res.send({ StatusCode: 0, Message: '成功', Data: rows });
//             } else {
//               res.send({ StatusCode: -1, Message: '這個作者沒有文章', Data: null });
//             }
//           });
//         } else {
//           res.send({ StatusCode: -1, Message: '沒有這個作者', Data: null });
//         }
//       }).catch(err => {
//         console.log(err);
//         res.send({ StatusCode: -1, Message: '失敗', Data: null });
//       }).finally(() => {
//         conn.end();
//       });
//     } else {
//       conn.query(`SELECT a.Id, a.Title, a.User_Id, u.Name FROM article a join user u on a.User_Id = u.Id WHERE u.Id = ${userId} AND a.Title LIKE '%${keyword}%'`).then(rows => {
//         res.send({ StatusCode: 0, Message: '成功', Data: rows });
//       }).catch(err => {
//         console.log(err);
//         res.send({ StatusCode: -1, Message: '失敗', Data: null });
//       }).finally(() => {
//         conn.end();
//       });
//     }
//   });
// });