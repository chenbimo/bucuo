import { Code, Bunpi } from 'bunpi';

// 配置服务器
const app = new Bunpi({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
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
    console.log(`🚀 服务器已启动: http://${server.hostname}:${server.port}`);
});
