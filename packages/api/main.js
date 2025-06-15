import { Res, Code, Bunfly } from 'bunfly';

// 配置服务器
const app = new Bunfly({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
});

// 错误处理
app.onError(async (context) => {
    const { error, response, logger } = context;

    if (logger) {
        logger.error('未处理的错误:', { error: error.message, stack: error.stack });
    }

    response.json(
        Res(
            //
            Code.SERVER_ERROR,
            process.env.NODE_ENV === 'development' ? error.message : '内部服务器错误',
            {},
            process.env.NODE_ENV === 'development' ? error.stack : ''
        )
    );
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 正在优雅关闭...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 正在优雅关闭...');
    process.exit(0);
});

// 启动服务器
app.listen((server) => {
    console.log(`🚀 服务器已启动: http://${server.host}:${server.port}`);
});
