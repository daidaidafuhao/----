"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_wechat = require("../../common/api/wechat.js");
const common_api_login = require("../../common/api/login.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
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
    if (!common_api_login.checkLoginAndRedirect()) {
      return;
    }
    this.initPageData();
  },
  onShow() {
    if (!common_api_login.checkLoginAndRedirect()) {
      return;
    }
    this.initPageData();
  },
  methods: {
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
          common_vendor.index.__f__("error", "at pages/user-info/index.vue:175", "登录失败", err);
          common_vendor.index.showToast({
            title: "登录失败，请重试",
            icon: "none"
          });
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/user-info/index.vue:183", "登录过程出错:", error);
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
          common_vendor.index.__f__("error", "at pages/user-info/index.vue:245", "获取用户信息失败", err);
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
              common_vendor.index.__f__("error", "at pages/user-info/index.vue:314", "保存用户信息失败", err);
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
    a: !$data.isLoggedIn
  }, !$data.isLoggedIn ? {
    b: common_assets._imports_0,
    c: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args))
  } : {
    d: $data.userInfo.avatarUrl || "/static/icons/user-avatar-placeholder.png",
    e: common_vendor.t($data.userInfo.nickName || "微信用户"),
    f: common_vendor.o(($event) => $data.formData.name = $event),
    g: common_vendor.p({
      type: "text",
      placeholder: "请输入姓名",
      modelValue: $data.formData.name
    }),
    h: common_vendor.p({
      label: "姓名",
      required: true
    }),
    i: common_vendor.o(($event) => $data.formData.contactMethod = $event),
    j: common_vendor.p({
      type: "text",
      placeholder: "请输入联系方式",
      modelValue: $data.formData.contactMethod
    }),
    k: common_vendor.p({
      label: "联系方式"
    }),
    l: common_vendor.o(($event) => $data.formData.contactPerson = $event),
    m: common_vendor.p({
      type: "text",
      placeholder: "请输入联系人姓名",
      modelValue: $data.formData.contactPerson
    }),
    n: common_vendor.p({
      label: "联系人"
    }),
    o: common_vendor.o(($event) => $data.formData.notes = $event),
    p: common_vendor.p({
      type: "textarea",
      placeholder: "请输入备注信息",
      modelValue: $data.formData.notes
    }),
    q: common_vendor.p({
      label: "备注"
    }),
    r: common_vendor.o(($event) => $data.formData.gender = $event),
    s: common_vendor.p({
      localdata: $data.genderOptions,
      modelValue: $data.formData.gender
    }),
    t: common_vendor.p({
      label: "性别",
      required: true
    }),
    v: common_vendor.o(($event) => $data.formData.phone = $event),
    w: common_vendor.p({
      type: "number",
      placeholder: "请输入电话号码",
      modelValue: $data.formData.phone
    }),
    x: common_vendor.p({
      label: "电话"
    }),
    y: common_vendor.o(($event) => $data.formData.height = $event),
    z: common_vendor.p({
      type: "number",
      placeholder: "请输入身高(cm)",
      modelValue: $data.formData.height
    }),
    A: common_vendor.p({
      label: "身高(cm)"
    }),
    B: common_vendor.o($options.calculateBMI),
    C: common_vendor.o(($event) => $data.formData.weight = $event),
    D: common_vendor.p({
      type: "digit",
      placeholder: "请输入体重(kg)",
      modelValue: $data.formData.weight
    }),
    E: common_vendor.p({
      label: "体重(kg)"
    }),
    F: common_vendor.o(($event) => $data.formData.bmi = $event),
    G: common_vendor.p({
      type: "text",
      disabled: true,
      modelValue: $data.formData.bmi
    }),
    H: common_vendor.p({
      label: "BMI"
    }),
    I: common_vendor.o(($event) => $data.formData.bloodPressure = $event),
    J: common_vendor.p({
      type: "text",
      placeholder: "例如: 120/80",
      modelValue: $data.formData.bloodPressure
    }),
    K: common_vendor.p({
      label: "血压(mmHg)"
    }),
    L: common_vendor.o(($event) => $data.formData.basicDisease = $event),
    M: common_vendor.p({
      type: "textarea",
      placeholder: "请输入基础疾病信息",
      modelValue: $data.formData.basicDisease
    }),
    N: common_vendor.p({
      label: "基础疾病"
    }),
    O: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args)),
    P: common_vendor.sr("form", "5f7f6c12-0"),
    Q: common_vendor.p({
      modelValue: $data.formData
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user-info/index.js.map
