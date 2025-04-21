"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        name: "",
        age: "",
        gender: "男",
        phone: "",
        notes: ""
      },
      genderOptions: [
        { text: "男", value: "男" },
        { text: "女", value: "女" }
      ]
    };
  },
  onLoad() {
    setTimeout(() => {
      this.formData = {
        name: "张三",
        age: "45",
        gender: "男",
        phone: "13800138000",
        notes: "糖尿病2型，确诊时间：2020年"
      };
    }, 500);
  },
  methods: {
    submitForm() {
      this.$refs.form.validate().then((res) => {
        if (res) {
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: "请填写完整信息",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/user-info/index.vue:83", "表单错误：", err);
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
  return {
    a: common_vendor.o(($event) => $data.formData.name = $event),
    b: common_vendor.p({
      type: "text",
      placeholder: "请输入姓名",
      modelValue: $data.formData.name
    }),
    c: common_vendor.p({
      label: "姓名",
      required: true
    }),
    d: common_vendor.o(($event) => $data.formData.age = $event),
    e: common_vendor.p({
      type: "number",
      placeholder: "请输入年龄",
      modelValue: $data.formData.age
    }),
    f: common_vendor.p({
      label: "年龄",
      required: true
    }),
    g: common_vendor.o(($event) => $data.formData.gender = $event),
    h: common_vendor.p({
      localdata: $data.genderOptions,
      modelValue: $data.formData.gender
    }),
    i: common_vendor.p({
      label: "性别",
      required: true
    }),
    j: common_vendor.o(($event) => $data.formData.phone = $event),
    k: common_vendor.p({
      type: "number",
      placeholder: "请输入联系电话",
      modelValue: $data.formData.phone
    }),
    l: common_vendor.p({
      label: "联系电话"
    }),
    m: common_vendor.o(($event) => $data.formData.notes = $event),
    n: common_vendor.p({
      type: "textarea",
      placeholder: "请输入备注信息",
      modelValue: $data.formData.notes
    }),
    o: common_vendor.p({
      label: "备注信息"
    }),
    p: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args)),
    q: common_vendor.sr("form", "5f7f6c12-0"),
    r: common_vendor.p({
      modelValue: $data.formData
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user-info/index.js.map
