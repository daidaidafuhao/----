"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_login = require("../../common/api/login.js");
const common_api_wechat = require("../../common/api/wechat.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        date: this.getCurrentDate(),
        fastingGlucose: "",
        postprandialGlucose: ""
      },
      glucoseErrors: {
        fastingGlucose: "",
        postprandialGlucose: ""
      },
      rules: {
        date: {
          rules: [{
            required: true,
            errorMessage: "请选择日期"
          }]
        },
        fastingGlucose: {
          rules: [{
            required: true,
            errorMessage: "请输入空腹血糖值"
          }]
        },
        postprandialGlucose: {
          rules: [{
            required: true,
            errorMessage: "请输入餐后两小时血糖值"
          }]
        }
      },
      isNarrowScreen: false
    };
  },
  computed: {
    isFormValid() {
      return this.formData.date && this.formData.fastingGlucose && this.formData.postprandialGlucose;
    }
  },
  onLoad() {
    if (!common_api_login.checkLoginAndRedirect()) {
      return;
    }
    this.checkScreenWidth();
  },
  onShow() {
    if (!common_api_login.checkLoginAndRedirect()) {
      return;
    }
  },
  methods: {
    checkScreenWidth() {
      const info = common_vendor.index.getSystemInfoSync();
      this.isNarrowScreen = info.windowWidth < 600;
    },
    getCurrentDate() {
      const date = /* @__PURE__ */ new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    changeDate(days) {
      const currentDate = new Date(this.formData.date);
      currentDate.setDate(currentDate.getDate() + days);
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const day = currentDate.getDate().toString().padStart(2, "0");
      this.formData.date = `${year}-${month}-${day}`;
    },
    validateGlucose(field) {
      const value = parseFloat(this.formData[field]);
      this.glucoseErrors[field] = "";
      if (!this.formData[field]) {
        return;
      }
      if (isNaN(value)) {
        this.glucoseErrors[field] = "请输入有效数值";
        return;
      }
      if (field === "fastingGlucose") {
        if (value < 3) {
          this.glucoseErrors[field] = "血糖值过低，请确认是否正确";
        } else if (value > 7) {
          this.glucoseErrors[field] = "血糖值偏高，请注意控制";
        }
      }
      if (field === "postprandialGlucose") {
        if (value < 3) {
          this.glucoseErrors[field] = "血糖值过低，请确认是否正确";
        } else if (value > 11.1) {
          this.glucoseErrors[field] = "血糖值过高，请及时就医";
        } else if (value > 7.8) {
          this.glucoseErrors[field] = "血糖值偏高，请注意控制";
        }
      }
    },
    submitForm() {
      if (!this.isFormValid) {
        return;
      }
      this.$refs.form.validate().then((res) => {
        if (res) {
          this.validateGlucose("fastingGlucose");
          this.validateGlucose("postprandialGlucose");
          if (this.glucoseErrors.fastingGlucose || this.glucoseErrors.postprandialGlucose) {
            common_vendor.index.showToast({
              title: "血糖值异常，但仍可提交",
              icon: "none",
              duration: 2e3
            });
          }
          common_vendor.index.showLoading({
            title: "提交中..."
          });
          const loginState = common_api_wechat.getWechatLoginState();
          if (!loginState.isLoggedIn) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "您尚未登录",
              icon: "none"
            });
            setTimeout(() => {
              common_api_login.checkLoginAndRedirect();
            }, 1500);
            return;
          }
          common_vendor.nr.callFunction({
            name: "glucose-service",
            data: {
              action: "add",
              params: {
                userId: loginState.userInfo._id || loginState.openid,
                date: this.formData.date,
                fastingGlucose: this.formData.fastingGlucose,
                postprandialGlucose: this.formData.postprandialGlucose
              }
            }
          }).then((res2) => {
            common_vendor.index.hideLoading();
            if (res2.result && res2.result.code === 0) {
              common_vendor.index.showToast({
                title: res2.result.message || "提交成功",
                icon: "success"
              });
              this.formData = {
                date: this.getCurrentDate(),
                fastingGlucose: "",
                postprandialGlucose: ""
              };
              this.glucoseErrors = {
                fastingGlucose: "",
                postprandialGlucose: ""
              };
            } else {
              common_vendor.index.showToast({
                title: res2.result && res2.result.message || "提交失败",
                icon: "none"
              });
            }
          }).catch((err) => {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "网络错误，请稍后重试",
              icon: "none"
            });
            common_vendor.index.__f__("error", "at pages/data-entry/index.vue:270", "提交血糖数据失败", err);
          });
        } else {
          common_vendor.index.showToast({
            title: "请填写完整信息",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/data-entry/index.vue:279", "表单错误：", err);
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_icons2 + _easycom_uni_datetime_picker2 + _easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_forms2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_datetime_picker + _easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_forms)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o(($event) => $options.changeDate(-1)),
    b: common_vendor.p({
      type: "left",
      size: "20",
      color: "#666"
    }),
    c: common_vendor.o(($event) => $data.formData.date = $event),
    d: common_vendor.p({
      type: "date",
      modelValue: $data.formData.date
    }),
    e: common_vendor.o(($event) => $options.changeDate(1)),
    f: common_vendor.p({
      type: "right",
      size: "20",
      color: "#666"
    }),
    g: common_vendor.p({
      label: "日期",
      required: true
    }),
    h: $data.isNarrowScreen ? 1 : "",
    i: common_vendor.o(($event) => $options.validateGlucose("fastingGlucose")),
    j: common_vendor.o(($event) => $data.formData.fastingGlucose = $event),
    k: common_vendor.p({
      type: "digit",
      placeholder: "请输入",
      ["input-border"]: false,
      modelValue: $data.formData.fastingGlucose
    }),
    l: $data.glucoseErrors.fastingGlucose
  }, $data.glucoseErrors.fastingGlucose ? {
    m: common_vendor.t($data.glucoseErrors.fastingGlucose)
  } : {}, {
    n: common_vendor.p({
      label: "空腹血糖值",
      required: true
    }),
    o: $data.isNarrowScreen ? 1 : "",
    p: common_vendor.o(($event) => $options.validateGlucose("postprandialGlucose")),
    q: common_vendor.o(($event) => $data.formData.postprandialGlucose = $event),
    r: common_vendor.p({
      type: "digit",
      placeholder: "请输入",
      ["input-border"]: false,
      modelValue: $data.formData.postprandialGlucose
    }),
    s: $data.glucoseErrors.postprandialGlucose
  }, $data.glucoseErrors.postprandialGlucose ? {
    t: common_vendor.t($data.glucoseErrors.postprandialGlucose)
  } : {}, {
    v: common_vendor.p({
      label: "餐后两小时血糖值",
      required: true
    }),
    w: $data.isNarrowScreen ? 1 : "",
    x: $options.isFormValid ? "primary" : "default",
    y: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args)),
    z: !$options.isFormValid,
    A: !$options.isFormValid ? 1 : "",
    B: $options.isFormValid ? 1 : "",
    C: common_vendor.sr("form", "26578643-0"),
    D: common_vendor.p({
      modelValue: $data.formData,
      rules: $data.rules,
      validateTrigger: "bind"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/data-entry/index.js.map
