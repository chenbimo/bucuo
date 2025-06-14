/**
 * 文件详情 API - /core/tool/file/:filename
 */

import path from 'path';
import { createGetAPI, validators } from 'bunfly';

export default createGetAPI(validators.filename(), async (data, context) => {
    const { request, response, config, util } = context;

    const url = new URL(request.url);
    const filename = url.pathname.split('/').pop();

    if (!filename) {
        response.status = 400;
        return { error: '文件名是必须的' };
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
        return { error: '读取文件信息失败' };
    }
});
