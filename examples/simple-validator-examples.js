/**
 * 简单验证器使用示例
 */

import { validate, createValidator } from 'bunfly';
import { user } from '../api/schema/user.js';
import { commonRules } from '../core/schema/common.js';

// === 基础使用示例 ===

// 1. 验证用户数据
const userData = {
    age: 18,
    nickname: 'chensuiyi',
    likes: 'movie,book,swim'
};

const userRules = {
    age: 'number,年龄,0,100',
    nickname: 'string,昵称,0,20,[a-z]+',
    likes: 'array,爱好,0,10,[a-z]+,null'
};

const result = validate(userData, userRules);
console.log('验证结果:', result);
// 输出: { success: true, data: { age: 18, nickname: "chensuiyi", likes: ["movie", "book", "swim"] } }

// 2. 创建验证器函数
const userValidator = createValidator(userRules);
const result2 = userValidator(userData);

// === 数据类型验证示例 ===

// number 类型验证
const numberData = { score: 85 };
const numberRules = { score: 'number,分数,0,100' };
console.log('数字验证:', validate(numberData, numberRules));

// string 类型验证
const stringData = { username: 'admin123' };
const stringRules = { username: 'string,用户名,3,20,^[a-zA-Z0-9]+$' };
console.log('字符串验证:', validate(stringData, stringRules));

// array 类型验证 - 逗号分隔
const arrayData1 = { tags: 'javascript,nodejs,vue' };
const arrayRules1 = { tags: 'array,标签,1,10,[a-z]+,null' };
console.log('数组验证1:', validate(arrayData1, arrayRules1));
// 输出: { success: true, data: { tags: ["javascript", "nodejs", "vue"] } }

// array 类型验证 - 自定义分隔符
const arrayData2 = { skills: 'JavaScript|Node.js|Vue.js' };
const arrayRules2 = { skills: 'array,技能,1,5,[a-zA-Z.]+,|' };
console.log('数组验证2:', validate(arrayData2, arrayRules2));
// 输出: { success: true, data: { skills: ["JavaScript", "Node.js", "Vue.js"] } }

// === 实际接口使用示例 ===

// 用户注册接口验证
const registerData = {
    username: 'newuser',
    password: 'password123',
    email: 'user@example.com',
    nickname: '新用户'
};

console.log('用户注册验证:', validate(registerData, user.register));

// 用户查询接口验证
const queryData = {
    page: '1',
    limit: '10',
    keyword: 'admin',
    role: 'user'
};

console.log('用户查询验证:', validate(queryData, user.query));

// === 错误处理示例 ===

// 验证失败的情况
const invalidData = {
    age: 'not-a-number',
    nickname: '',
    likes: ''
};

const invalidResult = validate(invalidData, userRules);
console.log('验证失败:', invalidResult);
// 输出: {
//   success: false,
//   errors: [
//     "年龄 必须是数字",
//     "昵称 长度不能少于 0 个字符",
//     "爱好 至少需要 0 个元素"
//   ]
// }

// === 复杂验证规则示例 ===

const complexData = {
    userId: 123,
    email: 'test@example.com',
    phone: '13812345678',
    birthdate: '1990-01-01',
    hobbies: 'reading;coding;gaming',
    skills: 'JavaScript|Python|Go',
    status: 'active'
};

const complexRules = {
    userId: commonRules.id,
    email: commonRules.email,
    phone: commonRules.phone,
    birthdate: 'string,生日,10,10,^\\d{4}-\\d{2}-\\d{2}$',
    hobbies: 'array,爱好,0,10,[a-z]+,;',
    skills: 'array,技能,0,20,[a-zA-Z+#]+,|',
    status: 'string,状态,6,8,^(active|inactive)$'
};

console.log('复杂验证:', validate(complexData, complexRules));

export { userData, userRules, userValidator, numberData, numberRules, stringData, stringRules, arrayData1, arrayRules1, arrayData2, arrayRules2, registerData, queryData, invalidData, complexData, complexRules };
