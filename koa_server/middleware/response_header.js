// 设置响应头的中间件
module.exports = async (ctx, next) => {
    // 这里简化了操作，因为数据都是json就直接设置为json了
    ctx.set('Content-Type', 'application/json;charset=utf-8')
    // 设置允许跨域
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE')
    await next()
}