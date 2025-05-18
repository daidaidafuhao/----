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
        postprandialGlucose: "",
        bloodPressure: ""
        // 新增血压字段
      },
      glucoseErrors: {
        fastingGlucose: "",
        postprandialGlucose: ""
      },
      rules: {
        date: {
          rules: []
        },
        fastingGlucose: {
          rules: []
        },
        postprandialGlucose: {
          rules: []
        }
        // 血压为选填项，不添加验证规则
      },
      isNarrowScreen: false,
      existingRecord: null,
      // 存储当前日期已有的记录
      recordId: null
      // 已有记录的ID
    };
  },
  computed: {
    canSubmit() {
      return this.formData.date && (this.formData.fastingGlucose || this.formData.postprandialGlucose || this.existingRecord && (this.existingRecord.fastingGlucose || this.existingRecord.postprandialGlucose));
    },
    submitButtonText() {
      if (this.existingRecord) {
        return "更新记录";
      }
      return "提交";
    }
  },
  onLoad() {
    if (!common_api_login.checkLoginAndRedirect()) {
      return;
    }
    this.checkScreenWidth();
    this.checkExistingRecord();
  },
  onShow() {
    if (!common_api_login.checkLoginAndRedirect()) {
      return;
    }
    this.checkExistingRecord();
  },
  methods: {
    getRecordInfoText() {
      let text = "当前日期已有记录: ";
      if (this.existingRecord.fastingGlucose && this.existingRecord.postprandialGlucose) {
        text += `空腹 ${this.existingRecord.fastingGlucose}mmol/L，餐后 ${this.existingRecord.postprandialGlucose}mmol/L`;
      } else if (this.existingRecord.fastingGlucose) {
        text += `空腹 ${this.existingRecord.fastingGlucose}mmol/L`;
      } else if (this.existingRecord.postprandialGlucose) {
        text += `餐后 ${this.existingRecord.postprandialGlucose}mmol/L`;
      }
      return text;
    },
    checkExistingRecord() {
      const loginState = common_api_wechat.getWechatLoginState();
      if (!loginState.isLoggedIn) {
        return;
      }
      this.existingRecord = null;
      this.recordId = null;
      common_vendor.index.showLoading({
        title: "查询记录..."
      });
      common_vendor.nr.callFunction({
        name: "glucose-service",
        data: {
          action: "getByDate",
          params: {
            userId: loginState.userInfo._id || loginState.openid,
            date: this.formData.date
          }
        }
      }).then((res) => {
        common_vendor.index.hideLoading();
        if (res.result && res.result.code === 0 && res.result.data) {
          this.existingRecord = res.result.data;
          this.recordId = res.result.data._id;
          if (!this.formData.fastingGlucose && this.existingRecord.fastingGlucose) {
            this.formData.fastingGlucose = this.existingRecord.fastingGlucose;
          }
          if (!this.formData.postprandialGlucose && this.existingRecord.postprandialGlucose) {
            this.formData.postprandialGlucose = this.existingRecord.postprandialGlucose;
          }
          if (!this.formData.bloodPressure && this.existingRecord.bloodPressure) {
            this.formData.bloodPressure = this.existingRecord.bloodPressure;
          }
        } else {
          this.existingRecord = null;
          this.recordId = null;
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/data-entry/index.vue:215", "查询记录失败", err);
      });
    },
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
      this.checkExistingRecord();
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
      if (!this.canSubmit) {
        return;
      }
      if (!this.formData.fastingGlucose && !this.formData.postprandialGlucose && !this.existingRecord) {
        common_vendor.index.showToast({
          title: "请至少填写一项血糖值",
          icon: "none"
        });
        return;
      }
      if (this.formData.fastingGlucose) {
        this.validateGlucose("fastingGlucose");
      }
      if (this.formData.postprandialGlucose) {
        this.validateGlucose("postprandialGlucose");
      }
      if (this.glucoseErrors.fastingGlucose || this.glucoseErrors.postprandialGlucose) {
        common_vendor.index.showToast({
          title: "血糖值异常，但仍可提交",
          icon: "none",
          duration: 2e3
        });
      }
      common_vendor.index.showLoading({
        title: this.existingRecord ? "更新中..." : "提交中..."
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
      const submitData = {
        userId: loginState.userInfo._id || loginState.openid,
        date: this.formData.date,
        bloodPressure: this.formData.bloodPressure || (this.existingRecord ? this.existingRecord.bloodPressure || "" : "")
      };
      if (this.formData.fastingGlucose) {
        submitData.fastingGlucose = this.formData.fastingGlucose;
      } else if (this.existingRecord && this.existingRecord.fastingGlucose) {
        submitData.fastingGlucose = this.existingRecord.fastingGlucose;
      }
      if (this.formData.postprandialGlucose) {
        submitData.postprandialGlucose = this.formData.postprandialGlucose;
      } else if (this.existingRecord && this.existingRecord.postprandialGlucose) {
        submitData.postprandialGlucose = this.existingRecord.postprandialGlucose;
      }
      const action = this.existingRecord ? "update" : "add";
      if (action === "update") {
        submitData.recordId = this.recordId;
      }
      common_vendor.nr.callFunction({
        name: "glucose-service",
        data: {
          action,
          params: submitData
        }
      }).then((res) => {
        common_vendor.index.hideLoading();
        if (res.result && res.result.code === 0) {
          common_vendor.index.showToast({
            title: res.result.message || (action === "update" ? "更新成功" : "提交成功"),
            icon: "success"
          });
          if (action === "add") {
            this.recordId = res.result.data && res.result.data.id;
            this.existingRecord = { ...submitData, _id: this.recordId };
          } else {
            this.existingRecord = { ...this.existingRecord, ...submitData };
          }
        } else {
          common_vendor.index.showToast({
            title: res.result && res.result.message || "提交失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/data-entry/index.vue:395", "提交血糖数据失败", err);
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
    c: common_vendor.o($options.checkExistingRecord),
    d: common_vendor.o(($event) => $data.formData.date = $event),
    e: common_vendor.p({
      type: "date",
      modelValue: $data.formData.date
    }),
    f: common_vendor.o(($event) => $options.changeDate(1)),
    g: common_vendor.p({
      type: "right",
      size: "20",
      color: "#666"
    }),
    h: common_vendor.p({
      label: "日期"
    }),
    i: $data.isNarrowScreen ? 1 : "",
    j: common_vendor.o(($event) => $options.validateGlucose("fastingGlucose")),
    k: common_vendor.o(($event) => $data.formData.fastingGlucose = $event),
    l: common_vendor.p({
      type: "digit",
      placeholder: "请输入",
      ["input-border"]: false,
      modelValue: $data.formData.fastingGlucose
    }),
    m: $data.glucoseErrors.fastingGlucose
  }, $data.glucoseErrors.fastingGlucose ? {
    n: common_vendor.t($data.glucoseErrors.fastingGlucose)
  } : {}, {
    o: common_vendor.p({
      label: "空腹血糖值"
    }),
    p: $data.isNarrowScreen ? 1 : "",
    q: common_vendor.o(($event) => $options.validateGlucose("postprandialGlucose")),
    r: common_vendor.o(($event) => $data.formData.postprandialGlucose = $event),
    s: common_vendor.p({
      type: "digit",
      placeholder: "请输入",
      ["input-border"]: false,
      modelValue: $data.formData.postprandialGlucose
    }),
    t: $data.glucoseErrors.postprandialGlucose
  }, $data.glucoseErrors.postprandialGlucose ? {
    v: common_vendor.t($data.glucoseErrors.postprandialGlucose)
  } : {}, {
    w: !$data.formData.postprandialGlucose && $data.formData.fastingGlucose
  }, !$data.formData.postprandialGlucose && $data.formData.fastingGlucose ? {} : {}, {
    x: common_vendor.p({
      label: "餐后两小时血糖值"
    }),
    y: $data.isNarrowScreen ? 1 : "",
    z: common_vendor.o(($event) => $data.formData.bloodPressure = $event),
    A: common_vendor.p({
      type: "text",
      placeholder: "请输入(例如:120/80)",
      ["input-border"]: false,
      modelValue: $data.formData.bloodPressure
    }),
    B: common_vendor.p({
      label: "血压"
    }),
    C: $data.isNarrowScreen ? 1 : "",
    D: common_vendor.t($options.submitButtonText),
    E: $options.canSubmit ? "primary" : "default",
    F: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args)),
    G: !$options.canSubmit,
    H: !$options.canSubmit ? 1 : "",
    I: $options.canSubmit ? 1 : "",
    J: $data.existingRecord
  }, $data.existingRecord ? {
    K: common_vendor.t($options.getRecordInfoText())
  } : {}, {
    L: common_vendor.sr("form", "2bd44c72-0"),
    M: common_vendor.p({
      modelValue: $data.formData,
      rules: $data.rules,
      validateTrigger: "bind"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/data-entry/index.js.map
