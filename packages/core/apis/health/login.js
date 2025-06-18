import { Code } from '../../config/code.js';
import { jwtSigner } from '../../utils/jwt.js';
import commonSchema from '../../schema/common.json';

export default {
    name: '系统信息',
    method: 'post',
    auth: false,
    schema: {
        fields: {
            title: commonSchema.title,
            keyword: commonSchema.keyword
        },
        required: []
    },
    handler: async (bunpi, req) => {
        const data = {
            id: 1,
            nickname: 'chensuiyi',
            role: 'user'
        };
        return {
            ...Code.SUCCESS,
            msg: '登录成功',
            token: jwtSigner(data),
            data: data
        };
    }
};
