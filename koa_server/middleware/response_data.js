// 返回请求数据的中间件
// 借助node自带的path模块处理路径
const path = require('path')
// 借助node自带的fs模块读取文件
const fs = require('fs')
// 简化了操作，数据放在文件夹里而不是放在数据库里
module.exports = async (ctx, next) => {
    // 拼接文件路径
    // ctx.request.url获取到端口号后面的路径
    // 这里要注意数据不在同一文件夹下
    let filePath='../data'+ctx.request.url+'.json'
    filePath = path.join(__dirname, filePath)
    // 设置响应体
    // 不能直接在fs的回调中设置ctx.response.body，异步函数不能给同步变量赋值
    // 利用try-catch捕获错误
    try {
        ctx.response.body = await new Promise((res, rej) => {
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err) {
                    rej(err.message)
                } else {
                    res(data)
                }
            })
        })
    } catch (error) {
        ctx.response.body=error
    }
    
    // 即使是最后一层最好也加上
    await next()
}