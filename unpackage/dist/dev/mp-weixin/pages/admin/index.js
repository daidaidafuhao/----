"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_admin = require("../../common/api/admin.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      dateRanges: ["最近一周", "最近一个月", "最近三个月", "自定义"],
      dateRangeIndex: 1,
      customStartDate: "",
      // 先设为空，在created中初始化
      customEndDate: "",
      // 先设为空，在created中初始化
      formats: ["Excel (.xlsx)", "CSV (.csv)"],
      formatIndex: 0,
      userCount: 0,
      recordCount: 0,
      lastWeekCount: 0,
      activeUserCount: 0,
      loading: false,
      showQRModal: false
      // 控制QR码弹窗显示
    };
  },
  created() {
    this.customEndDate = this.getCurrentDate();
    this.customStartDate = this.getLastMonthDate();
  },
  onLoad() {
    this.loadStatistics();
  },
  methods: {
    // 显示QR码弹窗
    showQRCode() {
      this.showQRModal = true;
    },
    // 隐藏QR码弹窗
    hideQRCode() {
      this.showQRModal = false;
    },
    loadStatistics() {
      const openid = common_vendor.index.getStorageSync("openid");
      if (!openid) {
        common_vendor.index.showToast({
          title: "登录状态已失效",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: "/pages/login/index"
          });
        }, 1500);
        return;
      }
      this.loading = true;
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      common_api_admin.getStatistics(openid).then((res) => {
        this.loading = false;
        common_vendor.index.hideLoading();
        if (res.code === 0) {
          this.userCount = res.data.userCount;
          this.recordCount = res.data.recordCount;
          this.lastWeekCount = res.data.lastWeekCount;
          this.activeUserCount = res.data.activeUserCount;
        } else if (res.code === 403) {
          common_vendor.index.showToast({
            title: "无权访问管理页面",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/data-entry/index"
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: "获取统计数据失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        this.loading = false;
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "获取统计数据失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/index.vue:201", "获取统计数据出错", err);
      });
    },
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
      common_vendor.index.__f__("log", "at pages/admin/index.vue:221", this.dateRangeIndex);
      common_vendor.index.__f__("log", "at pages/admin/index.vue:223", this.dateRangeIndex === "3");
    },
    handleFormatChange(e) {
      this.formatIndex = e.detail.value;
      common_vendor.index.__f__("log", "at pages/admin/index.vue:227", this.formatIndex);
    },
    onStartDateChange(e) {
      this.customStartDate = e.detail.value;
    },
    onEndDateChange(e) {
      this.customEndDate = e.detail.value;
    },
    exportData() {
      const openid = common_vendor.index.getStorageSync("openid");
      if (!openid) {
        common_vendor.index.showToast({
          title: "登录状态已失效",
          icon: "none"
        });
        return;
      }
      let dateRange = null;
      switch (this.dateRangeIndex) {
        case "0":
          {
            const endDate = /* @__PURE__ */ new Date();
            const startDate = /* @__PURE__ */ new Date();
            startDate.setDate(endDate.getDate() - 7);
            dateRange = {
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0]
            };
          }
          break;
        case "1":
          {
            const endDate = /* @__PURE__ */ new Date();
            const startDate = /* @__PURE__ */ new Date();
            startDate.setMonth(endDate.getMonth() - 1);
            dateRange = {
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0]
            };
          }
          break;
        case "2":
          {
            const endDate = /* @__PURE__ */ new Date();
            const startDate = /* @__PURE__ */ new Date();
            startDate.setMonth(endDate.getMonth() - 3);
            dateRange = {
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0]
            };
          }
          break;
        case "3":
          dateRange = {
            startDate: this.customStartDate,
            endDate: this.customEndDate
          };
          common_vendor.index.__f__("log", "at pages/admin/index.vue:286", "自定义日期范围:", dateRange);
          break;
      }
      this.loading = true;
      common_vendor.index.showLoading({
        title: "导出中..."
      });
      const format = this.formats[this.formatIndex].toLowerCase().split(" ")[0];
      const formatType = format === "excel" ? "xlsx" : "csv";
      this.doExport(openid, dateRange, formatType);
    },
    // 实际执行导出
    doExport(openid, dateRange, formatType) {
      common_api_admin.exportAllData(openid, dateRange, formatType).then((res) => {
        this.loading = false;
        common_vendor.index.hideLoading();
        if (res.code === 0) {
          const fileData = res.data;
          try {
            if (!fileData.fileContent) {
              throw new Error("文件内容为空");
            }
            this.saveFileFromBase64(fileData.fileName, fileData.fileContent, fileData.fileType);
            common_vendor.index.showToast({
              title: "数据导出成功",
              icon: "success"
            });
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/admin/index.vue:331", "保存导出文件失败", error);
            common_vendor.index.showModal({
              title: "导出失败",
              content: `处理数据时出错: ${error.message || "未知错误"}`,
              showCancel: false
            });
          }
        } else if (res.code === 403) {
          common_vendor.index.showToast({
            title: "无权执行导出操作",
            icon: "none"
          });
        } else {
          common_vendor.index.showModal({
            title: "导出失败",
            content: res.message || "未知错误",
            showCancel: false
          });
        }
      }).catch((err) => {
        this.loading = false;
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          title: "导出数据失败",
          content: err.message || "未知错误",
          showCancel: false
        });
        common_vendor.index.__f__("error", "at pages/admin/index.vue:360", "导出数据出错", err);
      });
    },
    // 从Base64保存文件
    saveFileFromBase64(fileName, base64Data, mimeType) {
      let isMP = false;
      try {
        if (typeof common_vendor.wx$1 !== "undefined") {
          const appBaseInfo = common_vendor.wx$1.getAppBaseInfo ? common_vendor.wx$1.getAppBaseInfo() : null;
          isMP = appBaseInfo ? appBaseInfo.platform === "mp-weixin" : false;
          if (!isMP && typeof common_vendor.index !== "undefined" && common_vendor.index.getSystemInfoSync) {
            const sysInfo = common_vendor.index.getSystemInfoSync();
            isMP = sysInfo.uniPlatform === "mp-weixin";
          }
        }
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/admin/index.vue:380", "环境检测失败，默认使用移动端处理", e);
        isMP = true;
      }
      const isMobile = isMP || typeof window === "undefined";
      if (isMobile) {
        this.saveFileOnMobileFromBase64(fileName, base64Data, mimeType);
      } else {
        this.saveFileOnWebFromBase64(fileName, base64Data, mimeType);
      }
    },
    // 移动端从Base64保存文件
    saveFileOnMobileFromBase64(fileName, base64Data, mimeType) {
      try {
        common_vendor.index.__f__("log", "at pages/admin/index.vue:400", "开始处理文件保存:", fileName);
        const isPdfOrExcel = /\.(pdf|xlsx|xls|csv)$/i.test(fileName);
        if (isPdfOrExcel) {
          common_vendor.index.__f__("log", "at pages/admin/index.vue:405", "尝试直接预览文件内容");
          this.previewFileFromBase64(fileName, base64Data, mimeType);
          return;
        }
        this.saveFileToLocalStorage(fileName, base64Data, mimeType);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/index.vue:413", "处理文件保存时出错", error);
        common_vendor.index.showModal({
          title: "保存文件出错",
          content: error.message || "未知错误",
          showCancel: false
        });
      }
    },
    // 尝试直接预览文件内容，跳过保存步骤
    previewFileFromBase64(fileName, base64Data, mimeType) {
      try {
        const fs = common_vendor.index.getFileSystemManager();
        const tempFilePath = `${common_vendor.index.env.USER_DATA_PATH}/temp_preview_${fileName}`;
        let arrayBuffer = this.convertBase64ToArrayBuffer(base64Data);
        try {
          const dirPath = tempFilePath.substring(0, tempFilePath.lastIndexOf("/"));
          try {
            fs.accessSync(dirPath);
          } catch (e) {
            common_vendor.index.__f__("log", "at pages/admin/index.vue:439", "创建预览临时目录");
            fs.mkdirSync(dirPath, true);
          }
          try {
            fs.accessSync(tempFilePath);
            fs.unlinkSync(tempFilePath);
            common_vendor.index.__f__("log", "at pages/admin/index.vue:447", "删除已存在的预览临时文件");
          } catch (e) {
          }
          fs.writeFileSync(tempFilePath, arrayBuffer, "binary");
          common_vendor.index.__f__("log", "at pages/admin/index.vue:454", "预览临时文件写入成功:", tempFilePath);
          common_vendor.index.openDocument({
            filePath: tempFilePath,
            showMenu: true,
            success: () => {
              common_vendor.index.__f__("log", "at pages/admin/index.vue:461", "成功打开预览文档");
              common_vendor.index.showToast({
                title: "文件已打开",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.showModal({
                  title: "文件已打开",
                  content: '您可以使用右上角的"更多"选项保存文件',
                  confirmText: "我知道了",
                  showCancel: false
                });
              }, 1e3);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/admin/index.vue:478", "预览文档失败", err);
              common_vendor.index.showModal({
                title: "预览失败",
                content: "无法直接预览，将尝试保存文件",
                showCancel: false,
                success: () => {
                  this.saveFileToLocalStorage(fileName, base64Data, mimeType);
                }
              });
            }
          });
        } catch (writeError) {
          common_vendor.index.__f__("error", "at pages/admin/index.vue:491", "写入预览临时文件失败", writeError);
          throw new Error(`写入预览临时文件失败: ${writeError.message || "未知错误"}`);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/index.vue:495", "预览文件失败", error);
        this.saveFileToLocalStorage(fileName, base64Data, mimeType);
      }
    },
    // 将文件保存到本地存储
    saveFileToLocalStorage(fileName, base64Data, mimeType) {
      try {
        common_vendor.index.__f__("log", "at pages/admin/index.vue:504", "尝试保存文件到本地存储");
        const fs = common_vendor.index.getFileSystemManager();
        const tempFilePath = `${common_vendor.index.env.USER_DATA_PATH}/temp_${fileName}`;
        let arrayBuffer = this.convertBase64ToArrayBuffer(base64Data);
        try {
          const dirPath = tempFilePath.substring(0, tempFilePath.lastIndexOf("/"));
          try {
            fs.accessSync(dirPath);
          } catch (e) {
            fs.mkdirSync(dirPath, true);
            common_vendor.index.__f__("log", "at pages/admin/index.vue:519", "创建保存目录");
          }
        } catch (dirError) {
          common_vendor.index.__f__("error", "at pages/admin/index.vue:522", "创建目录失败", dirError);
        }
        try {
          fs.accessSync(tempFilePath);
          fs.unlinkSync(tempFilePath);
          common_vendor.index.__f__("log", "at pages/admin/index.vue:529", "删除同名文件");
        } catch (e) {
        }
        fs.writeFileSync(tempFilePath, arrayBuffer, "binary");
        common_vendor.index.__f__("log", "at pages/admin/index.vue:536", "文件写入成功:", tempFilePath);
        common_vendor.index.saveFile({
          tempFilePath,
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/admin/index.vue:542", "文件保存成功:", res.savedFilePath);
            common_vendor.index.openDocument({
              filePath: res.savedFilePath,
              showMenu: true,
              success: () => {
                common_vendor.index.__f__("log", "at pages/admin/index.vue:549", "打开保存的文件成功");
                common_vendor.index.showToast({
                  title: "文件已保存并打开",
                  icon: "success"
                });
              },
              fail: (openErr) => {
                common_vendor.index.__f__("error", "at pages/admin/index.vue:556", "打开文件失败", openErr);
                common_vendor.index.showModal({
                  title: "保存成功",
                  content: "文件已保存，但无法自动打开",
                  showCancel: false
                });
              }
            });
          },
          fail: (saveErr) => {
            common_vendor.index.__f__("error", "at pages/admin/index.vue:566", "保存文件失败", saveErr);
            if (typeof common_vendor.wx$1 !== "undefined") {
              common_vendor.index.showModal({
                title: "保存失败",
                content: '请使用右上角"..."菜单中的"复制链接"或"分享给朋友"功能来保存文件',
                confirmText: "我知道了",
                showCancel: false
              });
            } else {
              common_vendor.index.showModal({
                title: "保存失败",
                content: `保存文件失败: ${saveErr.errMsg || "未知错误"}`,
                showCancel: false
              });
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/index.vue:586", "保存到本地存储失败", error);
        common_vendor.index.showModal({
          title: "保存失败",
          content: error.message || "未知错误",
          showCancel: false
        });
      }
    },
    // 转换Base64为ArrayBuffer - 统一处理各种环境
    convertBase64ToArrayBuffer(base64Data) {
      try {
        let base64Str = base64Data;
        if (base64Str.includes(",")) {
          base64Str = base64Str.split(",")[1];
        }
        base64Str = base64Str.replace(/[\r\n]/g, "");
        let arrayBuffer;
        if (typeof common_vendor.wx$1 !== "undefined" && common_vendor.wx$1.base64ToArrayBuffer) {
          try {
            arrayBuffer = common_vendor.wx$1.base64ToArrayBuffer(base64Str);
            common_vendor.index.__f__("log", "at pages/admin/index.vue:612", "使用wx.base64ToArrayBuffer成功");
          } catch (wxError) {
            common_vendor.index.__f__("warn", "at pages/admin/index.vue:614", "wx.base64ToArrayBuffer失败", wxError);
          }
        }
        if (!arrayBuffer && common_vendor.index.base64ToArrayBuffer) {
          try {
            arrayBuffer = common_vendor.index.base64ToArrayBuffer(base64Str);
            common_vendor.index.__f__("log", "at pages/admin/index.vue:622", "使用uni.base64ToArrayBuffer成功");
          } catch (uniError) {
            common_vendor.index.__f__("warn", "at pages/admin/index.vue:624", "uni.base64ToArrayBuffer失败", uniError);
          }
        }
        if (!arrayBuffer) {
          common_vendor.index.__f__("log", "at pages/admin/index.vue:630", "使用通用JavaScript方法转换Base64");
          const binaryString = this.atob(base64Str);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          arrayBuffer = bytes.buffer;
        }
        if (!arrayBuffer) {
          throw new Error("无法转换Base64到ArrayBuffer");
        }
        return arrayBuffer;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/index.vue:646", "Base64转换失败", error);
        throw new Error(`Base64转换失败: ${error.message || "未知错误"}`);
      }
    },
    // 实现跨平台的atob函数
    atob(base64) {
      if (typeof atob === "function") {
        return atob(base64);
      }
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let output = "";
      for (let bc = 0, bs, buffer, idx = 0; buffer = base64.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
      }
      return output;
    },
    // 网页端从Base64保存文件 (仅适用于H5环境)
    saveFileOnWebFromBase64(fileName, base64Data, mimeType) {
      try {
        if (typeof window === "undefined" || typeof document === "undefined" || typeof Blob === "undefined" || typeof URL === "undefined") {
          throw new Error("当前环境不支持网页下载方式");
        }
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 0);
        common_vendor.index.showToast({
          title: "文件下载成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/index.vue:712", "网页下载方式失败", error);
        this.saveFileOnMobileFromBase64(fileName, base64Data, mimeType);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.showQRCode && $options.showQRCode(...args)),
    b: common_vendor.t($data.dateRanges[$data.dateRangeIndex]),
    c: common_vendor.o((...args) => $options.handleDateRangeChange && $options.handleDateRangeChange(...args)),
    d: $data.dateRangeIndex,
    e: $data.dateRanges,
    f: $data.dateRangeIndex === "3"
  }, $data.dateRangeIndex === "3" ? {
    g: common_vendor.t($data.customStartDate),
    h: $data.customStartDate,
    i: common_vendor.o((...args) => $options.onStartDateChange && $options.onStartDateChange(...args))
  } : {}, {
    j: $data.dateRangeIndex === "3"
  }, $data.dateRangeIndex === "3" ? {
    k: common_vendor.t($data.customEndDate),
    l: $data.customEndDate,
    m: common_vendor.o((...args) => $options.onEndDateChange && $options.onEndDateChange(...args))
  } : {}, {
    n: common_vendor.t($data.formats[$data.formatIndex]),
    o: common_vendor.o((...args) => $options.handleFormatChange && $options.handleFormatChange(...args)),
    p: $data.formatIndex,
    q: $data.formats,
    r: common_vendor.o((...args) => $options.exportData && $options.exportData(...args)),
    s: $data.loading,
    t: common_vendor.t($data.userCount),
    v: common_vendor.t($data.recordCount),
    w: common_vendor.t($data.lastWeekCount),
    x: common_vendor.t($data.activeUserCount),
    y: $data.showQRModal
  }, $data.showQRModal ? {
    z: common_assets._imports_0$1,
    A: common_vendor.o((...args) => $options.hideQRCode && $options.hideQRCode(...args)),
    B: common_vendor.o(() => {
    }),
    C: common_vendor.o((...args) => $options.hideQRCode && $options.hideQRCode(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/index.js.map
