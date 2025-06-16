export default {
    order: 10,
    async onGet(context) {
        const { request, cache, util } = context;

        console.log(' 请求统计插件处理请求');

        if (!cache) return;

        try {
            const requestInfo = util.parseRequest(request);
            const today = util.formatDate(new Date(), 'YYYY-MM-DD');

            // 统计总请求数
            const totalKey = 'stats:requests:total';
            const dailyKey = `stats:requests:daily:${today}`;
            const methodKey = `stats:requests:method:${requestInfo.method}`;
            const pathKey = `stats:requests:path:${requestInfo.pathname}`;

            // 增加计数
            const promises = [
                cache.get(totalKey).then((count) => cache.set(totalKey, (count || 0) + 1)),
                cache.get(dailyKey).then((count) => cache.set(dailyKey, (count || 0) + 1, 86400)), // 24小时过期
                cache.get(methodKey).then((count) => cache.set(methodKey, (count || 0) + 1)),
                cache.get(pathKey).then((count) => cache.set(pathKey, (count || 0) + 1))
            ];

            await Promise.all(promises);

            // 记录用户IP统计
            if (requestInfo.ip && requestInfo.ip !== 'unknown') {
                const ipKey = `stats:ip:${requestInfo.ip}:${today}`;
                const ipCount = (await cache.get(ipKey)) || 0;
                await cache.set(ipKey, ipCount + 1, 86400); // 24小时过期
            }
        } catch (error) {
            console.warn('请求统计插件错误:', error.message);
        }
    }
};
