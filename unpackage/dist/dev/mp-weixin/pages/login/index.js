"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      loading: false
    };
  },
  methods: {
    onGetUserInfo(e) {
      if (!e.detail.userInfo) {
        common_vendor.index.showToast({
          title: "需要授权才能使用",
          icon: "none"
        });
        return;
      }
      if (this.loading)
        return;
      this.loading = true;
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      const userInfo = e.detail.userInfo;
      common_vendor.index.login({
        provider: "weixin",
        success: (res) => {
          const code = res.code;
          common_vendor.index.__f__("log", "at pages/login/index.vue:50", "获取到登录code:", code);
          common_vendor.nr.callFunction({
            name: "wx-login",
            data: {
              code
            },
            success: (res2) => {
              var _a;
              common_vendor.index.__f__("log", "at pages/login/index.vue:59", "云函数调用成功:", res2);
              if (res2.result && res2.result.code === 0) {
                common_vendor.index.setStorageSync("openid", res2.result.data.openid);
                common_vendor.index.setStorageSync("userInfo", userInfo);
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "登录成功",
                  icon: "success"
                });
                const isAdmin = res2.result.data.isAdmin;
                setTimeout(() => {
                  if (isAdmin) {
                    common_vendor.index.reLaunch({
                      url: "/pages/admin/index"
                    });
                  } else {
                    common_vendor.index.switchTab({
                      url: "/pages/data-entry/index"
                    });
                  }
                }, 1500);
              } else {
                common_vendor.index.hideLoading();
                common_vendor.index.__f__("error", "at pages/login/index.vue:94", "获取openid失败", res2.result);
                common_vendor.index.showToast({
                  title: "登录失败: " + (((_a = res2.result) == null ? void 0 : _a.msg) || "未知错误"),
                  icon: "none"
                });
                this.loading = false;
              }
            },
            fail: (err) => {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/login/index.vue:104", "云函数调用失败", err);
              common_vendor.index.showToast({
                title: "登录失败，请检查网络" + err.errMsg,
                icon: "none"
              });
              this.loading = false;
            }
          });
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.__f__("error", "at pages/login/index.vue:115", "微信登录失败", err);
          common_vendor.index.showToast({
            title: "登录失败，请重试",
            icon: "none"
          });
          this.loading = false;
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.o((...args) => $options.onGetUserInfo && $options.onGetUserInfo(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
