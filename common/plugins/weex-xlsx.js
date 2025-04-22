/**
 * xlsx wrapper for uni-app
 * 用于在小程序中处理Excel文件的插件
 */

// 声明XLSX变量
let XLSX;

// 动态加载XLSX库
try {
  // 尝试直接导入
  XLSX = require('xlsx');
} catch (e) {
  // 如果直接导入失败，提供一个基本的实现
  console.warn('xlsx库加载失败，部分功能可能不可用', e);
  XLSX = {
    utils: {
      book_new: () => ({}),
      aoa_to_sheet: () => ({}),
      book_append_sheet: () => ({}),
    },
    write: () => new Uint8Array(),
  };
}

// 导出XLSX对象，使其可以在其他地方被引用
export default XLSX;

// 注册为全局插件
const install = (Vue) => {
  if (typeof Vue.prototype !== 'undefined') {
    Vue.prototype.$xlsx = XLSX;
  } else if (Vue.config && Vue.config.globalProperties) {
    // Vue 3
    Vue.config.globalProperties.$xlsx = XLSX;
  }
  
  // 扩展uni对象
  if (typeof uni !== 'undefined') {
    uni.xlsx = XLSX;
  }
};

// 自动安装
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export {
  XLSX,
  install
}; 