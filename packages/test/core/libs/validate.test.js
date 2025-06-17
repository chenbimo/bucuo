import { describe, it, expect } from 'vitest';
import { Validate } from '../../../core/libs/validate.js';

describe('验证器测试', () => {
    describe('基本参数验证', () => {
        it('应该拒绝非对象格式的数据', () => {
            const result = Validate(null, {}, []);
            expect(result.code).toBe(1);
            expect(result.error).toBe('数据必须是对象格式');
        });

        it('应该拒绝字符串格式的数据', () => {
            const result = Validate('not-object', {}, []);
            expect(result.code).toBe(1);
            expect(result.error).toBe('数据必须是对象格式');
        });

        it('应该拒绝非对象格式的规则', () => {
            const result = Validate({}, null, []);
            expect(result.code).toBe(1);
            expect(result.error).toBe('验证规则必须是对象格式');
        });

        it('应该拒绝字符串格式的规则', () => {
            const result = Validate({}, 'not-object', []);
            expect(result.code).toBe(1);
            expect(result.error).toBe('验证规则必须是对象格式');
        });

        it('应该拒绝非数组格式的必传字段', () => {
            const result = Validate({}, {}, 'not-array');
            expect(result.code).toBe(1);
            expect(result.error).toBe('必传字段必须是数组格式');
        });

        it('应该拒绝null格式的必传字段', () => {
            const result = Validate({}, {}, null);
            expect(result.code).toBe(1);
            expect(result.error).toBe('必传字段必须是数组格式');
        });
    });

    describe('必传字段验证', () => {
        it('应该检测缺失的必传字段', () => {
            const data = { title: '测试标题' };
            const rules = {
                limit: '每页数量,number,1,100,null',
                title: '标题,string,1,200,null'
            };
            const required = ['limit', 'title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)为必填项');
        });

        it('应该检测缺失的必传字段', () => {
            const data = { title: '测试标题' };
            const rules = {
                limit: '每页数量,number,1,100,null',
                title: '标题,string,1,200,null'
            };
            const required = ['limit', 'title', 'name'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)为必填项');
        });

        it('应该检测空字符串的必传字段', () => {
            const data = { limit: '', title: '测试标题' };
            const rules = {
                limit: '每页数量,number,1,100,null',
                title: '标题,string,1,200,null'
            };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)为必填项');
        });

        it('应该检测null值的必传字段', () => {
            const data = { limit: null, title: '测试标题' };
            const rules = {
                limit: '每页数量,number,1,100,null',
                title: '标题,string,1,200,null'
            };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)为必填项');
        });

        it('应该检测undefined值的必传字段', () => {
            const data = { limit: undefined, title: '测试标题' };
            const rules = {
                limit: '每页数量,number,1,100,null',
                title: '标题,string,1,200,null'
            };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)为必填项');
        });
    });

    describe('验证规则格式验证', () => {
        it('应该拒绝格式错误的验证规则（少于5个部分）', () => {
            const data = { limit: 10 };
            const rules = { limit: '每页数量,number,1' }; // 只有3个部分
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('字段 limit 的验证规则错误，应包含5个部分');
        });

        it('应该拒绝格式错误的验证规则（多于5个部分）', () => {
            const data = { limit: 10 };
            const rules = { limit: '每页数量,number,1,100,null,extra' }; // 6个部分
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)的计算规则必须包含等号');
        });

        it('应该拒绝不支持的数据类型', () => {
            const data = { test: 'value' };
            const rules = { test: '测试,unsupported,1,100,null' };
            const required = ['test'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.test).toBe('字段 test 的类型 unsupported 不支持');
        });
    });

    describe('数字类型验证', () => {
        it('应该验证有效的数字', () => {
            const data = { limit: 10 };
            const rules = { limit: '每页数量,number,1,100,null' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该验证边界值（最小值）', () => {
            const data = { limit: 1 };
            const rules = { limit: '每页数量,number,1,100,null' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该验证边界值（最大值）', () => {
            const data = { limit: 100 };
            const rules = { limit: '每页数量,number,1,100,null' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该拒绝非数字值', () => {
            const data = { limit: 'abc' };
            const rules = { limit: '每页数量,number,1,100,null' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)必须是数字');
        });

        it('应该拒绝字符串数字', () => {
            const data = { limit: '10' };
            const rules = { limit: '每页数量,number,1,100,null' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)必须是数字');
        });

        it('应该检查数字的最小值', () => {
            const data = { limit: 0 };
            const rules = { limit: '每页数量,number,1,100,null' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)不能小于1');
        });

        it('应该检查数字的最大值', () => {
            const data = { limit: 200 };
            const rules = { limit: '每页数量,number,1,100,null' };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)不能大于100');
        });

        it('应该支持null作为最小值（无最小值限制）', () => {
            const data = { score: -50 };
            const rules = { score: '分数,number,null,100,null' };
            const required = ['score'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该支持null作为最大值（无最大值限制）', () => {
            const data = { count: 1000 };
            const rules = { count: '数量,number,1,null,null' };
            const required = ['count'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该支持0作为最大值', () => {
            const data = { count: 100 };
            const rules = { count: '数量,number,1,0,null' };
            const required = ['count'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });
    });

    describe('数字计算验证', () => {
        it('应该验证简单的计算表达式', () => {
            const data = { value: 10 };
            const rules = { value: '数值,number,1,100,x*2=20' };
            const required = ['value'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该验证复杂的计算表达式', () => {
            const data = { value: 5 };
            const rules = { value: '数值,number,1,100,(x+1)*2=12' };
            const required = ['value'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该拒绝不满足计算条件的值', () => {
            const data = { value: 10 };
            const rules = { value: '数值,number,1,100,x*2=25' };
            const required = ['value'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.value).toBe('数值(value)不满足计算条件 x*2=25');
        });

        it('应该拒绝缺少等号的计算规则', () => {
            const data = { value: 10 };
            const rules = { value: '数值,number,1,100,x*2+25' };
            const required = ['value'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.value).toBe('数值(value)的计算规则必须包含等号');
        });

        it('应该拒绝右边非数字的计算规则', () => {
            const data = { value: 10 };
            const rules = { value: '数值,number,1,100,x*2=abc' };
            const required = ['value'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.value).toBe('数值(value)的计算规则右边必须是数字');
        });

        it('应该拒绝包含不安全字符的表达式', () => {
            const data = { value: 10 };
            const rules = { value: '数值,number,1,100,alert(x)=10' };
            const required = ['value'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.value).toBe('数值(value)的表达式包含不安全的字符');
        });
    });

    describe('字符串类型验证', () => {
        it('应该验证有效的字符串', () => {
            const data = { title: '测试标题' };
            const rules = { title: '标题,string,1,200,null' };
            const required = ['title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该拒绝非字符串值', () => {
            const data = { title: 123 };
            const rules = { title: '标题,string,1,200,null' };
            const required = ['title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.title).toBe('标题(title)必须是字符串');
        });

        it('应该检查字符串的最小长度', () => {
            const data = { title: '' };
            const rules = { title: '标题,string,1,200,null' };

            const result = Validate(data, rules, []);
            expect(result.code).toBe(1);
            expect(result.fields.title).toBe('标题(title)长度不能少于1个字符');
        });

        it('应该检查字符串的最大长度', () => {
            const data = { title: 'a'.repeat(201) };
            const rules = { title: '标题,string,1,200,null' };
            const required = ['title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.title).toBe('标题(title)长度不能超过200个字符');
        });

        it('应该验证边界长度（最小值）', () => {
            const data = { title: 'a' };
            const rules = { title: '标题,string,1,200,null' };
            const required = ['title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该验证边界长度（最大值）', () => {
            const data = { title: 'a'.repeat(200) };
            const rules = { title: '标题,string,1,200,null' };
            const required = ['title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该支持null作为最小长度（无最小长度限制）', () => {
            const data = { title: '' };
            const rules = { title: '标题,string,null,200,null' };

            const result = Validate(data, rules, []);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该支持null作为最大长度（无最大长度限制）', () => {
            const data = { title: 'a'.repeat(1000) };
            const rules = { title: '标题,string,1,null,null' };
            const required = ['title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });
    });

    describe('字符串正则验证', () => {
        it('应该验证邮箱格式', () => {
            const data = { email: 'test@example.com' };
            const rules = { email: '邮箱,string,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' };
            const required = ['email'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该拒绝无效的邮箱格式', () => {
            const data = { email: 'invalid-email' };
            const rules = { email: '邮箱,string,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' };
            const required = ['email'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.email).toBe('邮箱(email)格式不正确');
        });

        it('应该验证手机号格式', () => {
            const data = { phone: '13812345678' };
            const rules = { phone: '手机号,string,11,11,^1[3-9]\\d{9}$' };
            const required = ['phone'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该拒绝无效的手机号格式', () => {
            const data = { phone: '12345678901' };
            const rules = { phone: '手机号,string,11,11,^1[3-9]\\d{9}$' };
            const required = ['phone'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.phone).toBe('手机号(phone)格式不正确');
        });

        it('应该处理无效的正则表达式', () => {
            const data = { test: 'value' };
            const rules = { test: '测试,string,1,10,[invalid-regex' };
            const required = ['test'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.test).toBe('测试(test)的正则表达式格式错误');
        });
    });

    describe('数组类型验证', () => {
        it('应该验证有效的数组', () => {
            const data = { tags: ['tag1', 'tag2'] };
            const rules = { tags: '标签,array,1,5,null' };
            const required = ['tags'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该拒绝非数组值', () => {
            const data = { tags: 'not-array' };
            const rules = { tags: '标签,array,1,5,null' };
            const required = ['tags'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.tags).toBe('标签(tags)必须是数组');
        });

        it('应该检查数组的最小长度', () => {
            const data = { tags: [] };
            const rules = { tags: '标签,array,1,5,null' };

            const result = Validate(data, rules, []);
            expect(result.code).toBe(1);
            expect(result.fields.tags).toBe('标签(tags)至少需要1个元素');
        });

        it('应该检查数组的最大长度', () => {
            const data = { tags: ['1', '2', '3', '4', '5', '6'] };
            const rules = { tags: '标签,array,1,5,null' };
            const required = ['tags'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.tags).toBe('标签(tags)最多只能有5个元素');
        });

        it('应该验证边界长度（最小值）', () => {
            const data = { tags: ['tag1'] };
            const rules = { tags: '标签,array,1,5,null' };
            const required = ['tags'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该验证边界长度（最大值）', () => {
            const data = { tags: ['1', '2', '3', '4', '5'] };
            const rules = { tags: '标签,array,1,5,null' };
            const required = ['tags'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该支持null作为最小长度（无最小长度限制）', () => {
            const data = { tags: [] };
            const rules = { tags: '标签,array,null,5,null' };

            const result = Validate(data, rules, []);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该支持null作为最大长度（无最大长度限制）', () => {
            const data = { tags: Array.from({ length: 100 }, (_, i) => `tag${i}`) };
            const rules = { tags: '标签,array,1,null,null' };
            const required = ['tags'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });
    });

    describe('数组正则验证', () => {
        it('应该验证数组元素的格式', () => {
            const data = { emails: ['test1@example.com', 'test2@example.com'] };
            const rules = { emails: '邮箱列表,array,1,5,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' };
            const required = ['emails'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该拒绝格式不正确的数组元素', () => {
            const data = { emails: ['test1@example.com', 'invalid-email'] };
            const rules = { emails: '邮箱列表,array,1,5,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' };
            const required = ['emails'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.emails).toBe('邮箱列表(emails)中的元素"invalid-email"格式不正确');
        });

        it('应该处理数组的无效正则表达式', () => {
            const data = { items: ['item1', 'item2'] };
            const rules = { items: '项目,array,1,5,[invalid-regex' };
            const required = ['items'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.items).toBe('项目(items)的正则表达式格式错误');
        });
    });

    describe('综合验证测试', () => {
        it('应该验证包含多种类型的复杂数据对象', () => {
            const data = {
                limit: 10,
                title: '测试标题',
                email: 'test@example.com',
                tags: ['tag1', 'tag2']
            };
            const rules = {
                limit: '每页数量,number,1,100,null',
                title: '标题,string,1,200,null',
                email: '邮箱,string,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                tags: '标签,array,1,5,null'
            };
            const required = ['limit', 'title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该报告多个字段的错误', () => {
            const data = {
                limit: 'abc',
                title: '',
                email: 'invalid',
                tags: 'not-array'
            };
            const rules = {
                limit: '每页数量,number,1,100,null',
                title: '标题,string,1,200,null',
                email: '邮箱,string,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                tags: '标签,array,1,5,null'
            };
            const required = ['limit', 'title'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)必须是数字');
            expect(result.fields.title).toBe('标题(title)为必填项');
            expect(result.fields.email).toBe('邮箱(email)格式不正确');
            expect(result.fields.tags).toBe('标签(tags)必须是数组');
        });

        it('应该跳过非必传且不存在的字段', () => {
            const data = { limit: 10 };
            const rules = {
                limit: '每页数量,number,1,100,null',
                title: '标题,string,1,200,null',
                email: '邮箱,string,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
            };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(0);
            expect(result.fields).toEqual({});
        });

        it('应该验证非必传但存在的字段', () => {
            const data = {
                limit: 10,
                email: 'invalid-email'
            };
            const rules = {
                limit: '每页数量,number,1,100,null',
                email: '邮箱,string,5,100,^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
            };
            const required = ['limit'];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.email).toBe('邮箱(email)格式不正确');
            expect(result.fields.limit).toBeUndefined();
        });

        it('应该正确处理空的必传字段数组', () => {
            const data = {
                limit: 'abc',
                title: '测试标题'
            };
            const rules = {
                limit: '每页数量,number,1,100,null',
                title: '标题,string,1,200,null'
            };
            const required = [];

            const result = Validate(data, rules, required);
            expect(result.code).toBe(1);
            expect(result.fields.limit).toBe('每页数量(limit)必须是数字');
            expect(result.fields.title).toBeUndefined();
        });
    });
});
