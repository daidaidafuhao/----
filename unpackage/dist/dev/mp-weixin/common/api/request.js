"use strict";
const common_vendor = require("../vendor.js");
function callCloudFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    common_vendor.index.showLoading({
      title: "加载中"
    });
    common_vendor.nr.callFunction({
      name,
      data
    }).then((res) => {
      common_vendor.index.hideLoading();
      if (res.result && res.result.code !== 0) {
        common_vendor.index.showToast({
          title: res.result.message || "请求失败",
          icon: "none"
        });
        reject(res.result);
        return;
      }
      resolve(res.result);
    }).catch((err) => {
      common_vendor.index.hideLoading();
      common_vendor.index.showToast({
        title: "网络请求失败",
        icon: "none"
      });
      common_vendor.index.__f__("error", "at common/api/request.js:41", `调用云函数${name}出错:`, err);
      reject(err);
    });
  });
}
const request = {
  callCloudFunction
};
exports.request = request;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/request.js.map
