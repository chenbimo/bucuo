/**
 * 文件上传插件
 */

import path from 'path';
import { util } from '../util.js';

export const uploadPlugin = {
    name: 'upload',
    order: 3,
    async handler(context) {
        const { request, config } = context;
        const uploadConfig = config.upload;

        if (!uploadConfig.enabled) {
            return;
        }

        // 只处理文件上传请求
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return;
        }

        try {
            const formData = await request.formData();
            const files = [];
            const fields = {};

            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    // 验证文件大小
                    if (value.size > uploadConfig.maxSize) {
                        context.response.status = 413;
                        context.response.json({
                            error: 'File Too Large',
                            message: `File size exceeds ${uploadConfig.maxSize} bytes`
                        });
                        context.response.sent = true;
                        return;
                    }

                    // 验证文件类型
                    if (uploadConfig.allowedTypes && uploadConfig.allowedTypes.length > 0) {
                        const isAllowed = uploadConfig.allowedTypes.some((type) => {
                            if (type.endsWith('/*')) {
                                return value.type.startsWith(type.slice(0, -1));
                            }
                            return value.type === type;
                        });

                        if (!isAllowed) {
                            context.response.status = 415;
                            context.response.json({
                                error: 'Unsupported Media Type',
                                message: `File type ${value.type} is not allowed`
                            });
                            context.response.sent = true;
                            return;
                        }
                    }

                    // 生成唯一文件名
                    const ext = path.extname(value.name);
                    const filename = `${util.uuid()}${ext}`;
                    const filePath = path.join(uploadConfig.uploadDir, filename);

                    // 确保上传目录存在
                    await util.ensureDir(uploadConfig.uploadDir);

                    // 保存文件 - 使用 Bun 的文件 API
                    const buffer = await value.arrayBuffer();
                    const success = await Bun.write(filePath, new Uint8Array(buffer));

                    if (success) {
                        files.push({
                            fieldName: key,
                            originalName: value.name,
                            filename: filename,
                            path: filePath,
                            size: value.size,
                            mimetype: value.type
                        });
                    } else {
                        context.response.status = 500;
                        context.response.json({
                            error: 'Upload Failed',
                            message: 'Failed to save file'
                        });
                        context.response.sent = true;
                        return;
                    }
                } else {
                    // 普通字段
                    fields[key] = value;
                }
            }

            // 将文件和字段信息添加到上下文
            context.files = files;
            context.fields = fields;
            context.body = { ...fields, files };
        } catch (error) {
            context.response.status = 400;
            context.response.json({
                error: 'Upload Error',
                message: error.message
            });
            context.response.sent = true;
        }
    }
};
