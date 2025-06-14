/**
 * 文件列表 API - /core/tool/files
 */

import { createGetAPI, validators } from 'bunfly';

export default createGetAPI(validators.pagination, async (data, context) => {
    const { config, util } = context;

    const page = data.page || 1;
    const limit = data.limit || 20;

    try {
        const files = await util.readDir(config.upload.uploadDir);
        const total = files.length;
        const pagination = util.pagination(total, page, limit);

        const fileList = files.slice(pagination.offset, pagination.offset + pagination.limit).map((filename) => ({
            filename,
            url: `/core/tool/file/${filename}`,
            downloadUrl: `/core/tool/download/${filename}`
        }));

        return {
            files: fileList,
            pagination
        };
    } catch (error) {
        return { files: [], pagination: util.pagination(0, page, limit) };
    }
});
