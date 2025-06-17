import { describe, it, expect } from 'vitest';
import { Validate } from '../../../core/libs/validate.js';

describe('验证器测试', () => {
    describe('基本参数验证', () => {
        it('应该拒绝非对象格式的数据', () => {
            const result = Validate(null, {}, []);
            expect(result.code).toBe(1);
            expect(result.error).toBe('数据必须是对象格式');
        });

        it('应该拒绝非对象格式的规则', () => {
            const result = Validate({}, null, []);
            expect(result.code).toBe(1);
            expect(result.error).toBe('验证规则必须是对象格式');
        });

        it('应该拒绝非数组格式的必传字段', () => {
            const result = Validate({}, {}, 'not-array');
            expect(result.code).toBe(1);
            expect(result.error).toBe('必传字段必须是数组格式');
        });
    });

    describe('必传字段验证', () => {
        it('应该检测缺失的必传字段', () => {
            const data = { title: '测试标题' };
            const rules = {
                limit: '每页数量,number,1,100',
                title: '标题,string,1,200'
            };
            const required = ['limit', 'title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量为必填项');
        });

        it('应该检测空值的必传字段', () => {
            const data = { limit: '', title: '测试标题' };
            const rules = {
                limit: '每页数量,number,1,100',
                title: '标题,string,1,200'
            };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量为必填项');
        });

        it('应该检测null值的必传字段', () => {
            const data = { limit: null, title: '测试标题' };
            const rules = {
                limit: '每页数量,number,1,100',
                title: '标题,string,1,200'
            };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量为必填项');
        });
    });

    describe('数字类型验证', () => {
        it('应该验证有效的数字', () => {
            const data = { limit: 10 };
            const rules = { limit: '每页数量,number,1,100' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该拒绝非数字值', () => {
            const data = { limit: 'abc' };
            const rules = { limit: '每页数量,number,1,100' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量必须是数字');
        });

        it('应该检查数字的最小值', () => {
            const data = { limit: 0 };
            const rules = { limit: '每页数量,number,1,100' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量不能小于1');
        });

        it('应该检查数字的最大值', () => {
            const data = { limit: 200 };
            const rules = { limit: '每页数量,number,1,100' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量不能大于100');
        });
    });

    describe('字符串类型验证', () => {
        it('应该验证有效的字符串', () => {
            const data = { title: '测试标题' };
            const rules = { title: '标题,string,1,200' };
            const required = ['title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该检查字符串的最小长度', () => {
            const data = { title: '' };
            const rules = { title: '标题,string,1,200' };
            const required = ['title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.title).toBe('标题为必填项');
        });

        it('应该检查字符串的最大长度', () => {
            const data = { title: 'a'.repeat(201) };
            const rules = { title: '标题,string,1,200' };
            const required = ['title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.title).toBe('标题长度不能超过200个字符');
        });

        it('应该验证正则表达式', () => {
            const data = { email: 'invalid-email' };
            const rules = { email: '邮箱,string,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' };
            const required = ['email'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.email).toBe('邮箱格式不正确');
        });

        it('应该通过正确的邮箱格式验证', () => {
            const data = { email: 'test@example.com' };
            const rules = { email: '邮箱,string,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' };
            const required = ['email'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });
    });

    describe('数组类型验证', () => {
        it('应该验证有效的数组', () => {
            const data = { tags: ['tag1', 'tag2'] };
            const rules = { tags: '标签,array,1,5' };
            const required = ['tags'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该验证逗号分隔的字符串', () => {
            const data = { tags: 'tag1,tag2,tag3' };
            const rules = { tags: '标签,array,1,5' };
            const required = ['tags'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该检查数组的最小长度', () => {
            const data = { tags: [] };
            const rules = { tags: '标签,array,1,5' };
            const required = ['tags'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.tags).toBe('标签至少需要1个元素');
        });

        it('应该检查数组的最大长度', () => {
            const data = { tags: ['1', '2', '3', '4', '5', '6'] };
            const rules = { tags: '标签,array,1,5' };
            const required = ['tags'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.tags).toBe('标签最多只能有5个元素');
        });
    });

    describe('综合验证测试', () => {
        it('应该验证复杂的数据对象', () => {
            const data = {
                limit: 10,
                title: '测试标题',
                email: 'test@example.com',
                tags: ['tag1', 'tag2']
            };
            const rules = {
                limit: '每页数量,number,1,100',
                title: '标题,string,1,200',
                email: '邮箱,string,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                tags: '标签,array,1,5'
            };
            const required = ['limit', 'title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields).toEqual({ email: '邮箱格式不正确' });
        });

        it('应该报告多个字段的错误', () => {
            const data = {
                limit: 'abc',
                title: '',
                email: 'invalid'
            };
            const rules = {
                limit: '每页数量,number,1,100',
                title: '标题,string,1,200',
                email: '邮箱,string,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
            };
            const required = ['limit', 'title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量必须是数字');
            expect(result.fields.title).toBe('标题为必填项');
            expect(result.fields.email).toBe('邮箱格式不正确');
        });

        it('应该跳过非必传且不存在的字段', () => {
            const data = { limit: 10 };
            const rules = {
                limit: '每页数量,number,1,100',
                title: '标题,string,1,200'
            };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });
    });
});
