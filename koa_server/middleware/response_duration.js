// 计算响应总时长的中间件，位于第一层
module.exports = async(ctx, next) => {
    const start = Date.now()
    await next()
    const end = Date.now()
    const duration = end - start
    // 设置响应头返回响应的时间
    ctx.set('X-Response-Time',duration+'ms')
}