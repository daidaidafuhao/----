"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_wechat = require("../../common/api/wechat.js");
const common_api_login = require("../../common/api/login.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isPageVisible: false,
      // 控制页面显示/隐藏
      isLoggedIn: false,
      userInfo: null,
      openid: "",
      formData: {
        name: "",
        contactMethod: "",
        contactPerson: "",
        notes: "",
        gender: "男",
        phone: "",
        height: "",
        weight: "",
        bmi: "",
        bloodPressure: "",
        basicDisease: ""
      },
      genderOptions: [
        { text: "男", value: "男" },
        { text: "女", value: "女" }
      ]
    };
  },
  onLoad() {
    this.getPageConfig();
    if (!common_api_login.checkLoginAndRedirect()) {
      return;
    }
    this.initPageData();
  },
  onShow() {
    this.getPageConfig();
    if (!common_api_login.checkLoginAndRedirect()) {
      return;
    }
    this.initPageData();
  },
  methods: {
    // 获取页面配置
    async getPageConfig() {
      try {
        const result = await common_vendor.nr.callFunction({
          name: "page-config",
          data: {
            action: "getConfig",
            params: {
              pageId: "user-info"
            }
          }
        });
        if (result.result.code === 0) {
          common_vendor.index.__f__("log", "at pages/user-info/index.vue:158", "页面配置", result.result.data.isVisible);
          this.isPageVisible = result.result.data.isVisible;
        } else {
          common_vendor.index.__f__("error", "at pages/user-info/index.vue:162", "获取页面配置失败:", result.result.message);
          this.isPageVisible = false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user-info/index.vue:166", "获取页面配置出错:", error);
        this.isPageVisible = false;
      }
    },
    // 初始化页面数据
    initPageData() {
      const loginState = common_api_wechat.getWechatLoginState();
      this.isLoggedIn = loginState.isLoggedIn;
      this.openid = loginState.openid;
      this.userInfo = loginState.userInfo;
      this.getUserInfo();
    },
    // 微信登录处理
    handleWechatLogin() {
      try {
        if (!common_api_wechat.isWechatMP())
          ;
        common_vendor.index.showLoading({
          title: "登录中..."
        });
        common_api_wechat.wechatLogin().then((res) => {
          common_vendor.index.hideLoading();
          this.isLoggedIn = true;
          this.openid = res.openid;
          this.userInfo = res.userInfo;
          this.getUserInfo();
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
        }).catch((err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.__f__("error", "at pages/user-info/index.vue:214", "登录失败", err);
          common_vendor.index.showToast({
            title: "登录失败，请重试",
            icon: "none"
          });
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/user-info/index.vue:222", "登录过程出错:", error);
        common_vendor.index.showToast({
          title: "登录出错，请重试",
          icon: "none"
        });
      }
    },
    // 获取用户详细信息
    getUserInfo() {
      if (!this.openid)
        return;
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      common_vendor.nr.callFunction({
        name: "user-service",
        data: {
          action: "getUserByOpenid",
          params: {
            openid: this.openid
          }
        },
        success: (res) => {
          common_vendor.index.hideLoading();
          if (res.result.code === 0 && res.result.data) {
            const userData = res.result.data;
            this.formData = {
              name: userData.name || "",
              contactMethod: userData.contactMethod || "",
              contactPerson: userData.contactPerson || "",
              notes: userData.notes || "",
              gender: userData.gender || "男",
              phone: userData.phone || "",
              height: userData.height ? String(userData.height) : "",
              weight: userData.weight ? String(userData.weight) : "",
              bmi: userData.bmi || "",
              bloodPressure: userData.bloodPressure || "",
              basicDisease: userData.basicDisease || ""
            };
            if (this.formData.height && this.formData.weight && !this.formData.bmi) {
              this.calculateBMI();
            }
          } else {
            if (this.userInfo && this.userInfo.nickName) {
              this.formData.name = this.userInfo.nickName;
            }
            if (this.userInfo && this.userInfo.gender !== void 0) {
              this.formData.gender = this.userInfo.gender === 1 ? "男" : "女";
            }
          }
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.__f__("error", "at pages/user-info/index.vue:284", "获取用户信息失败", err);
        }
      });
    },
    // 计算BMI
    calculateBMI() {
      const height = parseFloat(this.formData.height);
      const weight = parseFloat(this.formData.weight);
      if (height && weight && height > 0) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        this.formData.bmi = bmi.toFixed(2);
      } else {
        this.formData.bmi = "";
      }
    },
    // 提交表单
    submitForm() {
      this.$refs.form.validate().then((res) => {
        if (res) {
          common_vendor.index.showLoading({
            title: "保存中..."
          });
          if (this.formData.height && this.formData.weight) {
            this.calculateBMI();
          }
          common_vendor.nr.callFunction({
            name: "user-service",
            data: {
              action: "updateUserInfo",
              params: {
                openid: this.openid,
                name: this.formData.name,
                contactMethod: this.formData.contactMethod,
                contactPerson: this.formData.contactPerson,
                notes: this.formData.notes,
                gender: this.formData.gender,
                phone: this.formData.phone,
                height: this.formData.height ? parseFloat(this.formData.height) : null,
                weight: this.formData.weight ? parseFloat(this.formData.weight) : null,
                bmi: this.formData.bmi,
                bloodPressure: this.formData.bloodPressure,
                basicDisease: this.formData.basicDisease
              }
            },
            success: (res2) => {
              common_vendor.index.hideLoading();
              if (res2.result.code === 0) {
                common_vendor.index.showToast({
                  title: "保存成功",
                  icon: "success"
                });
              } else {
                common_vendor.index.showToast({
                  title: res2.result.message || "保存失败",
                  icon: "none"
                });
              }
            },
            fail: (err) => {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/user-info/index.vue:353", "保存用户信息失败", err);
              common_vendor.index.showToast({
                title: "保存失败，请重试",
                icon: "none"
              });
            }
          });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_checkbox2 + _easycom_uni_forms2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_checkbox + _easycom_uni_forms)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.isPageVisible
  }, !$data.isPageVisible ? {} : common_vendor.e({
    b: !$data.isLoggedIn
  }, !$data.isLoggedIn ? {
    c: common_assets._imports_0,
    d: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args))
  } : {
    e: $data.userInfo.avatarUrl || "/static/icons/user-avatar-placeholder.png",
    f: common_vendor.t($data.userInfo.nickName || "微信用户"),
    g: common_vendor.o(($event) => $data.formData.name = $event),
    h: common_vendor.p({
      type: "text",
      placeholder: "请输入姓名",
      modelValue: $data.formData.name
    }),
    i: common_vendor.p({
      label: "姓名",
      required: true
    }),
    j: common_vendor.o(($event) => $data.formData.contactMethod = $event),
    k: common_vendor.p({
      type: "text",
      placeholder: "请输入联系方式",
      modelValue: $data.formData.contactMethod
    }),
    l: common_vendor.p({
      label: "联系方式"
    }),
    m: common_vendor.o(($event) => $data.formData.contactPerson = $event),
    n: common_vendor.p({
      type: "text",
      placeholder: "请输入联系人姓名",
      modelValue: $data.formData.contactPerson
    }),
    o: common_vendor.p({
      label: "联系人"
    }),
    p: common_vendor.o(($event) => $data.formData.notes = $event),
    q: common_vendor.p({
      type: "textarea",
      placeholder: "请输入备注信息",
      modelValue: $data.formData.notes
    }),
    r: common_vendor.p({
      label: "备注"
    }),
    s: common_vendor.o(($event) => $data.formData.gender = $event),
    t: common_vendor.p({
      localdata: $data.genderOptions,
      modelValue: $data.formData.gender
    }),
    v: common_vendor.p({
      label: "性别",
      required: true
    }),
    w: common_vendor.o(($event) => $data.formData.phone = $event),
    x: common_vendor.p({
      type: "number",
      placeholder: "请输入电话号码",
      modelValue: $data.formData.phone
    }),
    y: common_vendor.p({
      label: "电话"
    }),
    z: common_vendor.o(($event) => $data.formData.height = $event),
    A: common_vendor.p({
      type: "number",
      placeholder: "请输入身高(cm)",
      modelValue: $data.formData.height
    }),
    B: common_vendor.p({
      label: "身高(cm)"
    }),
    C: common_vendor.o($options.calculateBMI),
    D: common_vendor.o(($event) => $data.formData.weight = $event),
    E: common_vendor.p({
      type: "digit",
      placeholder: "请输入体重(kg)",
      modelValue: $data.formData.weight
    }),
    F: common_vendor.p({
      label: "体重(kg)"
    }),
    G: common_vendor.o(($event) => $data.formData.bmi = $event),
    H: common_vendor.p({
      type: "text",
      disabled: true,
      modelValue: $data.formData.bmi
    }),
    I: common_vendor.p({
      label: "BMI"
    }),
    J: common_vendor.o(($event) => $data.formData.bloodPressure = $event),
    K: common_vendor.p({
      type: "text",
      placeholder: "例如: 120/80",
      modelValue: $data.formData.bloodPressure
    }),
    L: common_vendor.p({
      label: "血压(mmHg)"
    }),
    M: common_vendor.o(($event) => $data.formData.basicDisease = $event),
    N: common_vendor.p({
      type: "textarea",
      placeholder: "请输入基础疾病信息",
      modelValue: $data.formData.basicDisease
    }),
    O: common_vendor.p({
      label: "基础疾病"
    }),
    P: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args)),
    Q: common_vendor.sr("form", "7eb2cfe4-0"),
    R: common_vendor.p({
      modelValue: $data.formData
    })
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user-info/index.js.map
