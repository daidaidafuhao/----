"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_login = require("../../common/api/login.js");
const common_api_wechat = require("../../common/api/wechat.js");
const pages_history_zujian_uCharts = require("./zujian/u-charts.js");
const _sfc_main = {
  data() {
    return {
      startDate: this.getLastMonthDate(),
      endDate: this.getCurrentDate(),
      records: [],
      loading: false,
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: false,
      cWidth: 0,
      cHeight: 0,
      pixelRatio: 1,
      glucoseChart: null,
      isDatePickerOpen: false
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
    // 格式化日期显示 - 简化为MM-DD格式
    formatShortDate(dateString) {
      if (!dateString)
        return "";
      const date = new Date(dateString);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${month}-${day}`;
    },
    // 从云函数加载数据
    loadRecordsFromCloud() {
      this.loading = true;
      const loginState = common_api_wechat.getWechatLoginState();
      if (!loginState.isLoggedIn) {
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
          action: "list",
          params: {
            userId: loginState.userInfo._id || loginState.openid,
            startDate: this.startDate,
            endDate: this.endDate,
            page: this.page,
            pageSize: this.pageSize
          }
        }
      }).then((res) => {
        this.loading = false;
        common_vendor.index.hideLoading();
        if (res.result && res.result.code === 0) {
          const formattedRecords = (res.result.data.list || []).map((item) => {
            common_vendor.index.__f__("log", "at pages/history/index.vue:156", "原始记录数据:", item);
            const fastingGlucose = item.fastingGlucose !== void 0 ? item.fastingGlucose : item.fasting_glucose !== void 0 ? item.fasting_glucose : void 0;
            const postprandialGlucose = item.postprandialGlucose !== void 0 ? item.postprandialGlucose : item.postprandial_glucose !== void 0 ? item.postprandial_glucose : void 0;
            const bloodPressure = item.bloodPressure !== void 0 ? item.bloodPressure : item.blood_pressure !== void 0 ? item.blood_pressure : void 0;
            return {
              id: item._id,
              date: this.formatShortDate(item.date),
              fastingGlucose: fastingGlucose !== void 0 ? parseFloat(fastingGlucose).toFixed(1) : "-",
              postprandialGlucose: postprandialGlucose !== void 0 ? parseFloat(postprandialGlucose).toFixed(1) : "-",
              bloodPressure: bloodPressure || "-"
            };
          });
          if (this.page === 1) {
            this.records = formattedRecords;
            if (formattedRecords.length > 0 && !this.isDatePickerOpen) {
              this.drawGlucoseChart();
            }
          } else {
            this.records = [...this.records, ...formattedRecords];
          }
          this.total = res.result.data.total || 0;
          this.hasMore = this.records.length < this.total;
          if (this.records.length === 0) {
            common_vendor.index.showToast({
              title: "暂无记录",
              icon: "none"
            });
          }
        } else {
          common_vendor.index.showToast({
            title: res.result && res.result.message || "获取记录失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        this.loading = false;
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/history/index.vue:213", "获取血糖记录失败", err);
      });
    },
    // 搜索记录
    searchRecords() {
      this.page = 1;
      if (!this.loading) {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
      }
      this.isDatePickerOpen = false;
      this.loadRecordsFromCloud();
    },
    // 加载更多
    loadMore() {
      if (this.loading || !this.hasMore)
        return;
      this.page++;
      this.loadRecordsFromCloud();
    },
    // 绘制血糖趋势图表
    drawGlucoseChart() {
      try {
        if (!this.records || this.records.length === 0) {
          common_vendor.index.__f__("log", "at pages/history/index.vue:246", "没有足够的数据来绘制图表");
          return;
        }
        const displayRecords = [...this.records].reverse().slice(0, 7);
        const categories = displayRecords.map((item) => item.date);
        const fastingData = displayRecords.map(
          (item) => item.fastingGlucose && item.fastingGlucose !== "-" ? parseFloat(item.fastingGlucose) : null
        );
        const postprandialData = displayRecords.map(
          (item) => item.postprandialGlucose && item.postprandialGlucose !== "-" ? parseFloat(item.postprandialGlucose) : null
        );
        common_vendor.index.__f__("log", "at pages/history/index.vue:262", "图表数据:", { categories, fastingData, postprandialData });
        const allValues = [...fastingData, ...postprandialData].filter((val) => val !== null && !isNaN(val));
        if (allValues.length === 0) {
          common_vendor.index.__f__("log", "at pages/history/index.vue:267", "没有有效的数据点");
          return;
        }
        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);
        const range = Math.max(maxValue - minValue, 1);
        const yAxisMin = Math.max(0, minValue - range * 0.2);
        const yAxisMax = maxValue + range * 0.2;
        const ctx = common_vendor.index.createCanvasContext("glucoseChart", this);
        this.cWidth = Math.max(this.cWidth, 300);
        this.cHeight = Math.max(this.cHeight, 280);
        const options = {
          $this: this,
          canvasId: "glucoseChart",
          type: "line",
          categories,
          series: [{
            name: "空腹血糖",
            data: fastingData,
            color: "#4095E5",
            pointShape: "circle",
            pointStyle: "fill",
            // 实心点
            pointSize: 8,
            // 增大点大小
            format: (val) => val !== null && !isNaN(val) ? val.toFixed(1) : "-"
          }, {
            name: "餐后血糖",
            data: postprandialData,
            color: "#FF6B6B",
            pointShape: "circle",
            pointStyle: "fill",
            // 实心点
            pointSize: 8,
            // 增大点大小
            format: (val) => val !== null && !isNaN(val) ? val.toFixed(1) : "-"
          }],
          width: this.cWidth,
          height: this.cHeight,
          pixelRatio: this.pixelRatio,
          animation: false,
          // 关闭动画
          background: "#FFFFFF",
          padding: [30, 15, 50, 20],
          // [上, 右, 下, 左] 进一步减小左右边距
          dataLabel: true,
          // 显示数据标签
          dataPointShape: true,
          // 显示数据点
          enableScroll: false,
          // 禁用滚动
          legend: {
            show: false
            // 图例已在外部显示
          },
          xAxis: {
            type: "category",
            // 类别轴
            boundaryGap: false,
            // 减少两端留白
            disableGrid: true,
            // 不显示网格线
            fontColor: "#666666",
            fontSize: 10,
            // 减小字体大小
            itemCount: categories.length,
            // 显示所有类别
            axisLine: true,
            // 显示轴线
            margin: 3
            // 进一步减小X轴边距
          },
          yAxis: {
            position: "left",
            // 轴位置
            type: "value",
            // 数值轴
            disabled: false,
            // 显示Y轴
            disableGrid: false,
            // 显示网格线
            splitNumber: 5,
            // Y轴分段数
            gridType: "dash",
            // 网格线类型
            gridColor: "#CCCCCC",
            // 网格线颜色
            min: yAxisMin,
            // 最小值
            max: yAxisMax,
            // 最大值
            format: (val) => val !== null && !isNaN(val) ? val.toFixed(1) : "-",
            // 格式化
            axisLine: true,
            // 显示轴线
            fontColor: "#666666",
            fontSize: 10,
            title: "血糖值",
            // Y轴标题
            titleFontColor: "#666666",
            width: 10
            // 进一步减小Y轴宽度
          },
          extra: {
            line: {
              type: "straight",
              // 直线
              width: 3,
              // 线宽
              activeType: "hollow",
              // 点击后突出显示点
              activeColor: "#000000",
              // 点击激活颜色
              activeRadius: 10
              // 点击激活半径
            },
            tooltip: {
              showBox: true,
              showArrow: true,
              borderWidth: 1,
              borderRadius: 3,
              borderColor: "#CCCCCC",
              bgColor: "#FFFFFF",
              fontColor: "#666666",
              fontSize: 12
            }
          },
          context: ctx
        };
        ctx.setFillStyle("#FFFFFF");
        ctx.fillRect(0, 0, this.cWidth, this.cHeight);
        this.glucoseChart = new pages_history_zujian_uCharts.uCharts(options);
        ctx.draw(true, () => {
          common_vendor.index.__f__("log", "at pages/history/index.vue:379", "Canvas绘制完成");
          setTimeout(() => {
            if (this.glucoseChart) {
              try {
                common_vendor.index.__f__("log", "at pages/history/index.vue:384", "执行更新...");
                this.glucoseChart = new pages_history_zujian_uCharts.uCharts(options);
                ctx.draw(true);
              } catch (err) {
                common_vendor.index.__f__("error", "at pages/history/index.vue:390", "更新图表失败", err);
              }
            }
          }, 200);
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/history/index.vue:397", "绘制图表过程中出错", error);
        common_vendor.index.showToast({
          title: "图表绘制失败",
          icon: "none"
        });
      }
    },
    // 图表触摸事件处理
    touchstart(e) {
      try {
        if (this.glucoseChart) {
          this.glucoseChart.touchLegend(e);
          this.glucoseChart.showToolTip(e, {
            format: function(item, category) {
              if (item.data === null || isNaN(item.data)) {
                return category + " " + item.name + ": 无数据";
              }
              return category + " " + item.name + ": " + item.data + " mmol/L";
            },
            fontSize: 13,
            lineHeight: 22
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/history/index.vue:421", "处理触摸事件失败", error);
      }
    },
    touchmove(e) {
      try {
        if (this.glucoseChart) {
          this.glucoseChart.showToolTip(e, {
            format: function(item, category) {
              if (item.data === null || isNaN(item.data)) {
                return category + " " + item.name + ": 无数据";
              }
              return category + " " + item.name + ": " + item.data + " mmol/L";
            },
            fontSize: 13,
            lineHeight: 22
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/history/index.vue:439", "处理移动事件失败", error);
      }
    },
    touchend(e) {
      try {
        if (this.glucoseChart) {
          this.glucoseChart.touchLegend(e);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/history/index.vue:448", "处理触摸结束事件失败", error);
      }
    },
    onDateChange(value) {
      common_vendor.index.__f__("log", "at pages/history/index.vue:452", "日期变更:", value);
      this.isDatePickerOpen = false;
      setTimeout(() => {
        if (this.hasRecords) {
          this.drawGlucoseChart();
        }
      }, 300);
    },
    onMaskClick() {
      common_vendor.index.__f__("log", "at pages/history/index.vue:464", "遮罩点击");
      this.isDatePickerOpen = false;
      setTimeout(() => {
        if (this.hasRecords) {
          this.drawGlucoseChart();
        }
      }, 300);
    },
    // 点击日期选择器时触发
    onDatePickerClick() {
      common_vendor.index.__f__("log", "at pages/history/index.vue:477", "点击日期选择器");
      this.isDatePickerOpen = true;
    }
  },
  onLoad() {
    common_vendor.index.__f__("log", "at pages/history/index.vue:482", "onLoad");
    if (!common_api_login.checkLoginAndRedirect()) {
      return;
    }
    this.loadRecordsFromCloud();
  },
  onShow() {
    common_vendor.index.__f__("log", "at pages/history/index.vue:492", "onShow");
    if (!common_api_login.checkLoginAndRedirect()) {
      return;
    }
    this.page = 1;
    this.loadRecordsFromCloud();
  },
  onReady() {
    setTimeout(() => {
      if (this.hasRecords) {
        common_vendor.index.__f__("log", "at pages/history/index.vue:508", "onReady开始绘制图表");
        this.drawGlucoseChart();
      }
    }, 300);
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.page = 1;
    this.loadRecordsFromCloud();
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
    }, 1e3);
  },
  // 触底加载更多
  onReachBottom() {
    this.loadMore();
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
    a: common_vendor.o($options.onDateChange),
    b: common_vendor.o($options.onMaskClick),
    c: common_vendor.o(($event) => $data.startDate = $event),
    d: common_vendor.p({
      type: "date",
      modelValue: $data.startDate
    }),
    e: common_vendor.o((...args) => $options.onDatePickerClick && $options.onDatePickerClick(...args)),
    f: common_vendor.o($options.onDateChange),
    g: common_vendor.o($options.onMaskClick),
    h: common_vendor.o(($event) => $data.endDate = $event),
    i: common_vendor.p({
      type: "date",
      modelValue: $data.endDate
    }),
    j: common_vendor.o((...args) => $options.onDatePickerClick && $options.onDatePickerClick(...args)),
    k: common_vendor.o((...args) => $options.searchRecords && $options.searchRecords(...args)),
    l: $options.hasRecords && !$data.isDatePickerOpen
  }, $options.hasRecords && !$data.isDatePickerOpen ? {
    m: common_vendor.o((...args) => $options.touchstart && $options.touchstart(...args)),
    n: common_vendor.o((...args) => $options.touchmove && $options.touchmove(...args)),
    o: common_vendor.o((...args) => $options.touchend && $options.touchend(...args))
  } : {}, {
    p: !$options.hasRecords
  }, !$options.hasRecords ? {} : {
    q: common_vendor.f($data.records, (item, index, i0) => {
      return {
        a: common_vendor.t(item.date),
        b: common_vendor.t(item.fastingGlucose),
        c: common_vendor.t(item.postprandialGlucose),
        d: common_vendor.t(item.bloodPressure),
        e: index
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/history/index.js.map
