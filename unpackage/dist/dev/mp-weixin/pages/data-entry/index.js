"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        date: this.getCurrentDate(),
        fastingGlucose: "",
        postprandialGlucose: ""
      }
    };
  },
  methods: {
    getCurrentDate() {
      const date = /* @__PURE__ */ new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    submitForm() {
      this.$refs.form.validate().then((res) => {
        if (res) {
          common_vendor.index.showToast({
            title: "提交成功",
            icon: "success"
          });
          this.formData = {
            date: this.getCurrentDate(),
            fastingGlucose: "",
            postprandialGlucose: ""
          };
        } else {
          common_vendor.index.showToast({
            title: "请填写完整信息",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/data-entry/index.vue:69", "表单错误：", err);
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_datetime_picker2 + _easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_forms2)();
}
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_datetime_picker + _easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_forms)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $data.formData.date = $event),
    b: common_vendor.p({
      type: "date",
      modelValue: $data.formData.date
    }),
    c: common_vendor.p({
      label: "日期",
      required: true
    }),
    d: common_vendor.o(($event) => $data.formData.fastingGlucose = $event),
    e: common_vendor.p({
      type: "number",
      placeholder: "请输入空腹血糖值",
      modelValue: $data.formData.fastingGlucose
    }),
    f: common_vendor.p({
      label: "空腹血糖值 (mmol/L)",
      required: true
    }),
    g: common_vendor.o(($event) => $data.formData.postprandialGlucose = $event),
    h: common_vendor.p({
      type: "number",
      placeholder: "请输入餐后两小时血糖值",
      modelValue: $data.formData.postprandialGlucose
    }),
    i: common_vendor.p({
      label: "餐后两小时血糖值 (mmol/L)",
      required: true
    }),
    j: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args)),
    k: common_vendor.sr("form", "26578643-0"),
    l: common_vendor.p({
      modelValue: $data.formData
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/data-entry/index.js.map
