
// 設定之密鑰
const SECRET = 'thisismynewproject'
// 從來自客戶端請求的 header 取得和擷取 JWT
const token = req.header('Authorization').replace('Bearer ', '')
// 驗證 Token
const decoded = jwt.verify(token, SECRET)