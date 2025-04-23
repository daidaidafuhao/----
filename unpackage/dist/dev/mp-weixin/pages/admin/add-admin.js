"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_admin = require("../../common/api/admin.js");
const _sfc_main = {
  data() {
    return {
      loading: true,
      message: "正在添加管理员权限...",
      success: false
    };
  },
  onLoad() {
    this.addCurrentUserAsAdmin();
  },
  methods: {
    addCurrentUserAsAdmin() {
      const openid = common_vendor.index.getStorageSync("openid");
      if (!openid) {
        this.loading = false;
        this.message = "获取用户信息失败，请先登录";
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: "/pages/login/index"
          });
        }, 1500);
        return;
      }
      common_api_admin.addAdmin(openid, openid).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          this.success = true;
          this.message = "已成功添加为管理员！";
          setTimeout(() => {
            common_vendor.index.redirectTo({
              url: "/pages/admin/index"
            });
          }, 3e3);
        } else if (res.code === 403) {
          this.message = "无权执行此操作";
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/data-entry/index"
            });
          }, 1500);
        } else {
          this.message = res.message || "添加管理员失败";
        }
      }).catch((err) => {
        this.loading = false;
        this.message = "操作失败: " + (err.message || "未知错误");
        common_vendor.index.__f__("error", "at pages/admin/add-admin.vue:81", "添加管理员出错", err);
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : $data.success ? {} : {
    c: common_vendor.t($data.message)
  }, {
    b: $data.success
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/add-admin.js.map
