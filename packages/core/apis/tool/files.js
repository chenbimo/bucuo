/**
 * 文件列表 API - /core/tool/files
 */

export default async (context) => {
    const { request, response, config, util, query } = context;

    // 只支持 GET 请求
    if (request.method !== 'GET') {
        response.status = 405;
        return { error: '不允许的请求方法', allowedMethods: ['GET'] };
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;

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
};
