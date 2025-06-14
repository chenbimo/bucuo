/**
 * 用户相关验证规则
 */

import { commonRules, paginationRules, extendRules } from '../../core/schema/common.js';

/**
 * 用户特有验证规则
 */
export const userRules = {
    // 用户基础信息
    username: 'string,用户名,3,20,^[a-zA-Z0-9_]+$',
    password: 'string,密码,6,100',
    nickname: 'string,昵称,2,50',
    avatar: 'string,头像,5,500,^https?://',
    bio: 'string,个人简介,0,200',

    // 用户属性
    gender: 'string,性别,4,6,^(male|female|other)$',
    birthdate: 'string,生日,10,10,^\\d{4}-\\d{2}-\\d{2}$',
    role: 'string,角色,4,5,^(admin|user|guest)$',
    status: 'string,状态,6,8,^(active|inactive|banned)$',

    // 数组类型示例
    tags: 'array,标签,0,10,[a-z]+,null',
    interests: 'array,兴趣爱好,0,20,[a-z]+,;',
    skills: 'array,技能,0,50,[a-zA-Z0-9+#]+,|'
};

/**
 * 用户验证规则组合
 */
export const user = {
    // 用户注册
    register: extendRules(
        {
            username: userRules.username,
            password: userRules.password,
            email: commonRules.email
        },
        {
            nickname: userRules.nickname
        }
    ),

    // 用户登录
    login: {
        username: userRules.username,
        password: userRules.password
    },

    // 用户更新
    update: extendRules(
        {
            id: commonRules.id
        },
        {
            nickname: userRules.nickname,
            avatar: userRules.avatar,
            bio: userRules.bio,
            tags: userRules.tags,
            interests: userRules.interests
        }
    ),

    // 用户查询
    query: extendRules(paginationRules, {
        keyword: commonRules.keyword,
        role: userRules.role,
        status: userRules.status
    }),

    // 用户详情
    detail: {
        id: commonRules.id
    },

    // 批量操作
    batchUpdate: {
        ids: 'array,用户ID列表,1,100,\\d+,null',
        action: 'string,操作类型,6,10,^(activate|deactivate|delete)$'
    },

    // 用户资料 (无需参数)
    profile: {}
};
