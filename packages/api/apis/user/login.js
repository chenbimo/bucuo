import { createApi, createRes, ERROR_CODES } from 'bunfly';
import userSchema from '../../schema/user.json';

export default createApi({
    name: '用户登录',
    schema: {
        fields: [userSchema.username, userSchema.password],
        required: ['username', 'password']
    },
    handler: async (data, context) => {
        const { generateToken } = context;
        const { username, password } = data;

        // 模拟验证用户
        if (username === 'admin' && password === 'admin123') {
            const userInfo = {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                nickname: '管理员',
                role: 'admin'
            };

            const token = generateToken ? await generateToken(userInfo) : 'mock-jwt-token';

            return createRes(ERROR_CODES.SUCCESS, '登录成功', {
                user: userInfo,
                token
            });
        } else {
            return createRes(ERROR_CODES.UNAUTHORIZED, '用户名或密码错误');
        }
    }
});
