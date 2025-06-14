/**
 * 请求统计 API - /stats/requests
 */

import { createGetAPI, createResponse } from 'bunfly';
import { stats } from '../../schema/index.js';

export default createGetAPI(stats.requests(), async (data, context) => {请求统计 API - /stats/requests
 */

import { createGetAPI, validators } from 'bunfly';

export default createGetAPI(validators.empty(), async (data, context) => {
    const { cache, util } = context;

    if (!cache) {
        return { error: 'Cache not available' };
    }

    try {
        const today = util.formatDate(new Date(), 'YYYY-MM-DD');

        const [total, daily] = await Promise.all([cache.get('stats:requests:total') || 0, cache.get(`stats:requests:daily:${today}`) || 0]);

        return {
            total,
            today: daily,
            date: today
        };
    } catch (error) {
        return { error: '获取统计信息失败' };
    }
});
