/**
 * @module deepClone
 * @description 提供深度克隆对象的函数
 */

/**
 * 深度克隆对象或数组
 * @param {*} obj - 需要克隆的对象
 * @returns {*} 克隆后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  try {
    // 对于大多数场景，JSON.parse(JSON.stringify()) 是最简单的深拷贝方式
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    // 如果遇到循环引用或特殊对象类型，JSON处理会失败
    console.warn('深度克隆通过JSON失败，回退到浅克隆:', e);
    
    // 根据对象类型选择合适的回退方案
    if (Array.isArray(obj)) {
      return [...obj]; // 数组浅拷贝
    }
    
    // 对象浅拷贝
    return { ...obj };
  }
}

module.exports = deepClone; 