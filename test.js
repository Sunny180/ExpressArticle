function promise() {
    return new getConnect(reslove, reject)
        .then(() => {
            console.log(a);
        })
        .then(() => {

        });
}



// /* GET localhost:3000/api/articles (這個user_id的所有文章,可給可不給) -所有文章的article_id,article_title,user_name  */
// router.get('/api/articles', async function (req, res) {
//     const userId = req.query.userId;
//     const keyword = req.query.keyword;
//     let sql = '';
//     let connect;
//     if (userId === undefined && keyword === undefined) {
//         sql = 'SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id';
//     }
//     else if (userId === undefined && keyword) {
//         sql = `SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id WHERE BINARY article.Title LIKE '%${keyword}%' OR BINARY user.Name LIKE '%${keyword}%'`;
//     }
//     else if (userId && keyword === undefined) {
//         sql = `SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id where user.Id = ${userId}`;
//     }
//     else {
//         sql = `SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id WHERE user.Id = ${userId} AND BINARY article.Title LIKE '%${keyword}%'`;
//     }
//     pool.getConnection() //->promise
//         .then((conn) => {
//             connect = conn;
//             return conn.query(sql);
//         })
//         .then((rows) => {
//             if (rows.length > 0) {
//                 res.send({ StatusCode: success, Message: 'success', Data: rows });
//             } else {
//                 res.send({ StatusCode: data_not_found, Message: 'data_not_found', Data: rows });
//             }
//         })
//         .catch(err => {
//             console.log(err);
//             res.send({ StatusCode: system_fail, Message: 'system_fail', Data: null });
//         })
//         .finally(() => {
//             if (connect) connect.close();
//         });
// });
