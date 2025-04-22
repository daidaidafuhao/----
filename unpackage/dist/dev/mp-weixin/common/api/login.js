"use strict";
const common_vendor = require("../vendor.js");
const common_api_wechat = require("./wechat.js");
require("../../store/index.js");
function checkLoginAndRedirect() {
  const loginState = common_api_wechat.getWechatLoginState();
  if (!loginState.isLoggedIn) {
    common_vendor.index.redirectTo({
      url: "/pages/login/index"
    });
    return false;
  }
  return true;
}
exports.checkLoginAndRedirect = checkLoginAndRedirect;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/login.js.map
