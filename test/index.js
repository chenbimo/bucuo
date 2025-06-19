/**
 * Buko 测试套件入口文件
 * 包含所有测试模块的导入和配置
 */

console.log('🧪 Buko 测试套件启动');
console.log('📁 测试目录结构:');
console.log('  ├── core/libs/     - Core库测试');
console.log('  ├── api/user/      - 用户API测试');
console.log('  └── ...            - 其他模块测试');
console.log('');

// 测试统计
let testCount = 0;
let passedCount = 0;
let failedCount = 0;

// 导出测试工具函数
export function getTestStats() {
    return {
        total: testCount,
        passed: passedCount,
        failed: failedCount
    };
}

export function resetTestStats() {
    testCount = 0;
    passedCount = 0;
    failedCount = 0;
}

// 测试完成后的回调
export function onTestComplete(result) {
    testCount++;
    if (result.success) {
        passedCount++;
    } else {
        failedCount++;
    }
}
