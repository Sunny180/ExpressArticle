// 設定密鑰
const SECRET = 'thisismynewproject'
// 建立 Token
const token = jwt.sign({ _id: user._id.toString() }, SECRET, { expiresIn: '1 day' })