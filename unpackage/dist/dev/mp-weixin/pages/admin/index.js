"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      dateRanges: ["最近一周", "最近一个月", "最近三个月", "自定义"],
      dateRangeIndex: 1,
      customStartDate: this.getLastMonthDate(),
      customEndDate: this.getCurrentDate(),
      formats: ["Excel (.xlsx)", "CSV (.csv)"],
      formatIndex: 0,
      // 模拟统计数据
      userCount: 56,
      recordCount: 421,
      lastWeekCount: 35,
      activeUserCount: 28
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
    getLastMonthDate() {
      const date = /* @__PURE__ */ new Date();
      date.setMonth(date.getMonth() - 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    handleDateRangeChange(e) {
      this.dateRangeIndex = e.detail.value;
    },
    handleFormatChange(e) {
      this.formatIndex = e.detail.value;
    },
    exportData() {
      common_vendor.index.showToast({
        title: "数据导出成功",
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
    a: common_vendor.t($data.dateRanges[$data.dateRangeIndex]),
    b: common_vendor.o((...args) => $options.handleDateRangeChange && $options.handleDateRangeChange(...args)),
    c: $data.dateRangeIndex,
    d: $data.dateRanges,
    e: $data.dateRangeIndex === 3
  }, $data.dateRangeIndex === 3 ? {
    f: common_vendor.o(($event) => $data.customStartDate = $event),
    g: common_vendor.p({
      type: "date",
      modelValue: $data.customStartDate
    })
  } : {}, {
    h: $data.dateRangeIndex === 3
  }, $data.dateRangeIndex === 3 ? {
    i: common_vendor.o(($event) => $data.customEndDate = $event),
    j: common_vendor.p({
      type: "date",
      modelValue: $data.customEndDate
    })
  } : {}, {
    k: common_vendor.t($data.formats[$data.formatIndex]),
    l: common_vendor.o((...args) => $options.handleFormatChange && $options.handleFormatChange(...args)),
    m: $data.formatIndex,
    n: $data.formats,
    o: common_vendor.o((...args) => $options.exportData && $options.exportData(...args)),
    p: common_vendor.t($data.userCount),
    q: common_vendor.t($data.recordCount),
    r: common_vendor.t($data.lastWeekCount),
    s: common_vendor.t($data.activeUserCount)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/index.js.map
