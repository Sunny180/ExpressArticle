
// User schema
const userSchema = new Schema({
    // 名字欄位
    // Eamil 欄位
    // 歲數
    // 密碼等其他欄位
    // 大頭貼欄位
    // 新增欄位存放 Token
    tokens: [{
      token: {
        type: String,
        required: true
      }
    }],
  })