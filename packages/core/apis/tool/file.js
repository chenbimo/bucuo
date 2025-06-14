/**
 * 文件详情 API - /core/tool/file/:filename
 */

import path from 'path';

export default async (context) => {
    const { request, response, config, util } = context;

    // 只支持 GET 请求
    if (request.method !== 'GET') {
        response.status = 405;
        return { error: '不允许的请求方法', allowedMethods: ['GET'] };
    }

    const url = new URL(request.url);
    const filename = url.pathname.split('/').pop();

    if (!filename) {
        response.status = 400;
        return { error: 'Filename is required' };
    }

    const filePath = path.join(config.upload.uploadDir, filename);
    const exists = await util.fileExists(filePath);

    if (!exists) {
        response.status = 404;
        return { error: '文件未找到' };
    }

    try {
        const bunFile = Bun.file(filePath);
        const stats = await bunFile.stat();

        return {
            filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            type: bunFile.type,
            url: `/core/tool/file/${filename}`,
            downloadUrl: `/core/tool/download/${filename}`
        };
    } catch (error) {
        response.status = 500;
        return { error: 'Failed to read file info' };
    }
};
