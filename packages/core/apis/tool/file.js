/**
 * 文件详情 API - /core/tool/file/:filename
 */

import path from 'path';
import { createAPI, createResponse, ERROR_CODES } from '../../libs/http.js';
import { common } from '../../schema/index.js';

export default createAPI({
    name: '文件详情',
    schema: common.filename,
    method: 'get',
    handler: async (data, context) => {
    const { request, response, config, util } = context;

    const url = new URL(request.url);
    const filename = url.pathname.split('/').pop();

    if (!filename) {
        return createResponse(ERROR_CODES.MISSING_REQUIRED_PARAMS, '文件名是必须的');
    }

    const filePath = path.join(config.upload.uploadDir, filename);
    const exists = await util.fileExists(filePath);

    if (!exists) {
        return createResponse(ERROR_CODES.FILE_NOT_FOUND, '文件未找到');
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
        return createResponse(ERROR_CODES.FILE_READ_ERROR, '读取文件信息失败', error.message);
    }
});
