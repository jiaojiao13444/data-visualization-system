// 服务器入口文件
// 创建koa实例对象
const Koa = require('koa')
const app = new Koa()
// 绑定中间件
const respDuration = require('./middleware/response_duration')
app.use(respDuration)

const respHeader = require('./middleware/response_header')
app.use(respHeader)

const respData = require('./middleware/response_data')
app.use(respData)
// 监听端口
app.listen(5000)
