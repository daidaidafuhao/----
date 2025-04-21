"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      startDate: this.getLastMonthDate(),
      endDate: this.getCurrentDate(),
      records: [
        // 模拟数据
        { date: "2023-04-21", fastingGlucose: "5.6", postprandialGlucose: "7.8" },
        { date: "2023-04-20", fastingGlucose: "5.5", postprandialGlucose: "7.6" },
        { date: "2023-04-19", fastingGlucose: "5.7", postprandialGlucose: "8.0" },
        { date: "2023-04-18", fastingGlucose: "5.4", postprandialGlucose: "7.5" },
        { date: "2023-04-17", fastingGlucose: "5.8", postprandialGlucose: "8.2" }
      ]
    };
  },
  computed: {
    hasRecords() {
      return this.records && this.records.length > 0;
    }
  },
  methods: {
    getCurrentDate() {
      const date = /* @__PURE__ */ new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    getLastMonthDate() {
      const date = /* @__PURE__ */ new Date();
      date.setMonth(date.getMonth() - 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    searchRecords() {
      common_vendor.index.showToast({
        title: "加载数据成功",
        icon: "success"
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  _easycom_uni_datetime_picker2();
}
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
if (!Math) {
  _easycom_uni_datetime_picker();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o(($event) => $data.startDate = $event),
    b: common_vendor.p({
      type: "date",
      modelValue: $data.startDate
    }),
    c: common_vendor.o(($event) => $data.endDate = $event),
    d: common_vendor.p({
      type: "date",
      modelValue: $data.endDate
    }),
    e: common_vendor.o((...args) => $options.searchRecords && $options.searchRecords(...args)),
    f: $options.hasRecords
  }, $options.hasRecords ? {} : {}, {
    g: !$options.hasRecords
  }, !$options.hasRecords ? {} : {
    h: common_vendor.f($data.records, (item, index, i0) => {
      return {
        a: common_vendor.t(item.date),
        b: common_vendor.t(item.fastingGlucose),
        c: common_vendor.t(item.postprandialGlucose),
        d: index
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/history/index.js.map
