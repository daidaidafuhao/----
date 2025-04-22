"use strict";
const common_vendor = require("../vendor.js");
let XLSX;
try {
  XLSX = require("xlsx");
} catch (e) {
  common_vendor.index.__f__("warn", "at common/plugins/weex-xlsx.js:15", "xlsx库加载失败，部分功能可能不可用", e);
  XLSX = {
    utils: {
      book_new: () => ({}),
      aoa_to_sheet: () => ({}),
      book_append_sheet: () => ({})
    },
    write: () => new Uint8Array()
  };
}
const install = (Vue) => {
  if (typeof Vue.prototype !== "undefined") {
    Vue.prototype.$xlsx = XLSX;
  } else if (Vue.config && Vue.config.globalProperties) {
    Vue.config.globalProperties.$xlsx = XLSX;
  }
  if (typeof common_vendor.index !== "undefined") {
    common_vendor.index.xlsx = XLSX;
  }
};
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}
exports.install = install;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/plugins/weex-xlsx.js.map
