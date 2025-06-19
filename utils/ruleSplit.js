export const ruleSplit = (rule) => {
    const allParts = rule.split(',');

    // 如果部分数量小于等于5，直接返回
    if (allParts.length <= 5) {
        return allParts;
    }

    // 只取前4个部分，剩余的都合并为第5个部分
    return [allParts[0], allParts[1], allParts[2], allParts[3], allParts.slice(4).join(',')];
};
