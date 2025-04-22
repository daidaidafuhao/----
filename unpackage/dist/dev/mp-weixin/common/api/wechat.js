"use strict";
const common_vendor = require("../vendor.js");
function isWechatMP() {
  return true;
}
function getWechatLoginState() {
  try {
    const openid = common_vendor.index.getStorageSync("openid");
    const userInfo = common_vendor.index.getStorageSync("userInfo");
    return {
      isLoggedIn: !!openid,
      openid: openid || "",
      userInfo: userInfo || null
    };
  } catch (e) {
    common_vendor.index.__f__("error", "at common/api/wechat.js:28", "获取登录状态失败", e);
    return {
      isLoggedIn: false,
      openid: "",
      userInfo: null
    };
  }
}
function wechatLogin() {
  return new Promise((resolve, reject) => {
    try {
      common_vendor.index.login({
        provider: "weixin",
        success: (loginRes) => {
          common_vendor.index.__f__("log", "at common/api/wechat.js:45", loginRes);
          try {
            getWechatOpenid(loginRes.code).then((openidRes) => {
              try {
                common_vendor.index.getUserProfile({
                  desc: "用于完善会员资料",
                  success: (userInfoRes) => {
                    try {
                      saveWechatUserInfo(openidRes.openid, userInfoRes.userInfo).then((saveRes) => {
                        resolve({
                          openid: openidRes.openid,
                          userInfo: userInfoRes.userInfo,
                          userId: saveRes.userId,
                          isAdmin: openidRes.isAdmin || false
                        });
                      }).catch((err) => {
                        common_vendor.index.__f__("error", "at common/api/wechat.js:69", "保存用户信息失败", err);
                        reject(err instanceof Error ? err : new Error("保存用户信息失败"));
                      });
                    } catch (e) {
                      common_vendor.index.__f__("error", "at common/api/wechat.js:73", "处理用户信息出错", e);
                      reject(e instanceof Error ? e : new Error("处理用户信息出错"));
                    }
                  },
                  fail: (err) => {
                    common_vendor.index.__f__("error", "at common/api/wechat.js:78", "获取用户信息失败", err);
                    reject(err instanceof Error ? err : new Error("获取用户信息失败"));
                  }
                });
              } catch (e) {
                common_vendor.index.__f__("error", "at common/api/wechat.js:83", "获取用户信息出错", e);
                reject(e instanceof Error ? e : new Error("获取用户信息出错"));
              }
            }).catch((err) => {
              common_vendor.index.__f__("error", "at common/api/wechat.js:88", "获取openid失败", err);
              reject(err instanceof Error ? err : new Error("获取openid失败"));
            });
          } catch (e) {
            common_vendor.index.__f__("error", "at common/api/wechat.js:92", "调用登录方法出错", e);
            reject(e instanceof Error ? e : new Error("调用登录方法出错"));
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at common/api/wechat.js:97", "微信登录失败", err);
          reject(err instanceof Error ? err : new Error("微信登录失败"));
        }
      });
    } catch (e) {
      common_vendor.index.__f__("error", "at common/api/wechat.js:107", "微信登录过程出错", e);
      reject(e instanceof Error ? e : new Error("微信登录过程出错"));
    }
  });
}
function getWechatOpenid(code) {
  return new Promise((resolve, reject) => {
    try {
      common_vendor.index.__f__("log", "at common/api/wechat.js:117", code);
      common_vendor.index.request({
        url: "https://97fca9f2-41f6-449f-a35e-3f135d4c3875.bspapp.com/http/user-center",
        method: "POST",
        data: {
          action: "loginByWeixin",
          params: {
            code,
            platform: "mp-weixin"
          }
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at common/api/wechat.js:130", res);
          try {
            if (!res.data || res.data.code !== 0) {
              const errMsg = res.data && res.data.errMsg ? res.data.errMsg : "获取openid失败";
              reject(new Error(errMsg));
              return;
            }
            common_vendor.index.setStorageSync("openid", res.data.openid);
            resolve({
              openid: res.data.openid,
              isAdmin: res.data.isAdmin
            });
          } catch (e) {
            common_vendor.index.__f__("error", "at common/api/wechat.js:146", "处理获取openid响应出错", e);
            reject(e instanceof Error ? e : new Error("处理获取openid响应出错"));
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at common/api/wechat.js:151", "请求获取openid失败", err);
          reject(err instanceof Error ? err : new Error("请求获取openid失败"));
        }
      });
    } catch (e) {
      common_vendor.index.__f__("error", "at common/api/wechat.js:156", "发送获取openid请求出错", e);
      reject(e instanceof Error ? e : new Error("发送获取openid请求出错"));
    }
  });
}
function saveWechatUserInfo(openid, userInfo) {
  return new Promise((resolve, reject) => {
    try {
      common_vendor.index.setStorageSync("userInfo", userInfo);
      common_vendor.nr.callFunction({
        name: "user-service",
        data: {
          action: "saveWxUserInfo",
          params: {
            openid,
            userInfo
          }
        },
        success: (res) => {
          try {
            if (!res.result || res.result.code !== 0) {
              const errMsg = res.result && res.result.message ? res.result.message : "保存用户信息失败";
              reject(new Error(errMsg));
              return;
            }
            resolve({
              userId: res.result.data.userId,
              isNew: res.result.data.isNew
            });
          } catch (e) {
            common_vendor.index.__f__("error", "at common/api/wechat.js:192", "处理保存用户信息响应出错", e);
            reject(e instanceof Error ? e : new Error("处理保存用户信息响应出错"));
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at common/api/wechat.js:197", "调用保存用户信息云函数失败", err);
          reject(err instanceof Error ? err : new Error("调用保存用户信息云函数失败"));
        }
      });
    } catch (e) {
      common_vendor.index.__f__("error", "at common/api/wechat.js:202", "保存用户信息过程出错", e);
      reject(e instanceof Error ? e : new Error("保存用户信息过程出错"));
    }
  });
}
exports.getWechatLoginState = getWechatLoginState;
exports.isWechatMP = isWechatMP;
exports.wechatLogin = wechatLogin;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/wechat.js.map
