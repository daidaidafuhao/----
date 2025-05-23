"use strict";
const common_vendor = require("../../../common/vendor.js");
const univerifyInfoKey = "univerifyInfo";
const _sfc_main = {
  data() {
    return {
      title: "login",
      providerList: [],
      phoneNumber: "",
      univerifyBtnLoading: false
    };
  },
  computed: {
    ...common_vendor.mapState(["hasLogin", "isUniverifyLogin", "univerifyErrorMsg"])
  },
  onLoad() {
    common_vendor.index.getProvider({
      service: "oauth",
      success: (result) => {
        this.providerList = result.provider.map((value) => {
          let providerName = "";
          switch (value) {
            case "weixin":
              providerName = "微信登录";
              break;
            case "qq":
              providerName = "QQ登录";
              break;
            case "sinaweibo":
              providerName = "新浪微博登录";
              break;
            case "xiaomi":
              providerName = "小米登录";
              break;
            case "alipay":
              providerName = "支付宝登录";
              break;
            case "baidu":
              providerName = "百度登录";
              break;
            case "jd":
              providerName = "京东登录";
              break;
            case "toutiao":
              providerName = "头条登录";
              break;
            case "apple":
              providerName = "苹果登录";
              break;
            case "univerify":
              providerName = "一键登录";
              break;
          }
          return {
            name: providerName,
            id: value
          };
        });
      },
      fail: (error) => {
        common_vendor.index.__f__("log", "at pages/API/login/login.vue:104", "获取登录通道失败", error);
      }
    });
    if (this.hasLogin && this.isUniverifyLogin) {
      this.getPhoneNumber(common_vendor.index.getStorageSync(univerifyInfoKey)).then((phoneNumber) => {
        this.phoneNumber = phoneNumber;
      });
    }
  },
  methods: {
    ...common_vendor.mapMutations(["login", "setUniverifyLogin"]),
    ...common_vendor.mapActions(["getPhoneNumber"]),
    Toast(data, duration = 1e3) {
      common_vendor.index.showToast(Object.assign({}, data, {
        duration
      }));
    },
    tologin(provider) {
      if (provider.id === "univerify") {
        this.univerifyBtnLoading = true;
      }
      common_vendor.index.login({
        provider: provider.id,
        success: async (res) => {
          common_vendor.index.__f__("log", "at pages/API/login/login.vue:134", "login success:", res);
          this.Toast({
            title: "登录成功"
          });
          this.login(provider.id);
          common_vendor.index.__f__("warn", "at pages/API/login/login.vue:154", "如需获取openid请参考uni-id: https://uniapp.dcloud.net.cn/uniCloud/uni-id");
          common_vendor.index.request({
            url: "https://97fca9f2-41f6-449f-a35e-3f135d4c3875.bspapp.com/http/user-center",
            method: "POST",
            data: {
              action: "loginByWeixin",
              params: {
                code: res.code,
                platform: "mp-weixin"
              }
            },
            success: (res2) => {
              common_vendor.index.__f__("log", "at pages/API/login/login.vue:166", res2);
              if (res2.data.code !== 0) {
                common_vendor.index.__f__("log", "at pages/API/login/login.vue:168", "获取openid失败：", res2.data.errMsg);
                common_vendor.index.showModal({
                  title: "登录失败",
                  content: "获取用户信息失败，请稍后再试",
                  showCancel: false
                });
                return;
              }
              common_vendor.index.setStorageSync("openid", res2.data.openid);
              common_vendor.index.getUserProfile({
                desc: "用于完善会员资料",
                success: (userInfo) => {
                  common_vendor.index.setStorageSync("userInfo", userInfo.userInfo);
                  this.saveUserInfo(res2.data.openid, userInfo.userInfo);
                  setTimeout(() => {
                    common_vendor.index.navigateBack();
                  }, 1500);
                },
                fail: (err) => {
                  common_vendor.index.__f__("log", "at pages/API/login/login.vue:195", "获取用户信息失败", err);
                }
              });
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/API/login/login.vue:200", "获取openid失败：", err);
              common_vendor.index.showModal({
                title: "登录失败",
                content: "网络请求失败，请检查网络连接",
                showCancel: false
              });
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/API/login/login.vue:211", "login fail:", err);
          if (err.code == "30002") {
            common_vendor.index.closeAuthView();
            this.Toast({
              title: "其他登录方式"
            });
            return;
          }
          if (err.code == 1e3) {
            common_vendor.index.showModal({
              title: "登录失败",
              content: `${err.errMsg}
，错误码：${err.code}`,
              confirmText: "开通指南",
              cancelText: "确定",
              success: (res) => {
                if (res.confirm) {
                  setTimeout(() => {
                    plus.runtime.openWeb("https://ask.dcloud.net.cn/article/37965");
                  }, 500);
                }
              }
            });
            return;
          }
          if (err.code == "30005") {
            common_vendor.index.showModal({
              showCancel: false,
              title: "预登录失败",
              content: this.univerifyErrorMsg || err.errMsg
            });
            return;
          }
          if (err.code != "30003") {
            common_vendor.index.showModal({
              showCancel: false,
              title: "登录失败",
              content: JSON.stringify(err)
            });
          }
        },
        complete: () => {
          this.univerifyBtnLoading = false;
        }
      });
    },
    loginByUniverify(provider, res) {
      this.setUniverifyLogin(true);
      common_vendor.index.closeAuthView();
      const univerifyInfo = {
        provider,
        ...res.authResult
      };
      this.getPhoneNumber(univerifyInfo).then((phoneNumber) => {
        this.phoneNumber = phoneNumber;
        common_vendor.index.setStorageSync(univerifyInfoKey, univerifyInfo);
      }).catch((err) => {
        common_vendor.index.showModal({
          showCancel: false,
          title: "手机号获取失败",
          content: `${err.errMsg}
，错误码：${err.code}`
        });
        common_vendor.index.__f__("error", "at pages/API/login/login.vue:282", res);
      });
    },
    async loginByApple(provider, res) {
      let getUserInfoErr, result;
      try {
        result = await common_vendor.index.getUserInfo({
          provider
        });
      } catch (e) {
        getUserInfoErr = e;
      }
      if (getUserInfoErr) {
        let content = getUserInfoErr.errMsg;
        if (~content.indexOf("uni.login")) {
          content = "请在登录页面完成登录操作";
        }
        common_vendor.index.showModal({
          title: "获取用户信息失败",
          content: "错误原因" + content,
          showCancel: false
        });
      }
      common_vendor.index.__f__("warn", "at pages/API/login/login.vue:316", "此处使用uni-id处理苹果登录，详情参考: https://uniapp.dcloud.net.cn/uniCloud/uni-id");
      common_vendor.index.request({
        url: "https://97fca9f2-41f6-449f-a35e-3f135d4c3875.bspapp.com/http/user-center",
        method: "POST",
        data: {
          action: "loginByApple",
          params: result.userInfo
        },
        success: (res2) => {
          common_vendor.index.__f__("log", "at pages/API/login/login.vue:325", "uniId login success", res2);
          if (res2.data.code !== 0) {
            common_vendor.index.showModal({
              showCancel: false,
              content: `苹果登录失败: ${JSON.stringify(res2.data.msg)}`
            });
          } else {
            common_vendor.index.setStorageSync("openid", res2.data.openid);
            common_vendor.index.setStorageSync("apple_nickname", res2.data.userInfo.nickname);
          }
        },
        fail: (e) => {
          common_vendor.index.showModal({
            content: `苹果登录失败: ${JSON.stringify(e)}`,
            showCancel: false
          });
        }
      });
    },
    // 添加保存用户信息的方法
    saveUserInfo(openid, userInfo) {
      common_vendor.index.showLoading({
        title: "保存用户信息"
      });
      common_vendor.nr.callFunction({
        name: "user-service",
        data: {
          action: "saveWxUserInfo",
          params: {
            openid,
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city
          }
        },
        success: (res) => {
          common_vendor.index.hideLoading();
          if (res.result.code === 0) {
            common_vendor.index.showToast({
              title: "登录成功",
              duration: 1500
            });
          } else {
            common_vendor.index.__f__("error", "at pages/API/login/login.vue:373", "保存用户信息失败", res.result);
          }
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.__f__("error", "at pages/API/login/login.vue:378", "调用云函数失败", err);
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_page_head2 = common_vendor.resolveComponent("page-head");
  _easycom_page_head2();
}
const _easycom_page_head = () => "../../../components/page-head/page-head.js";
if (!Math) {
  _easycom_page_head();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      title: $data.title
    }),
    b: _ctx.hasLogin === true
  }, _ctx.hasLogin === true ? common_vendor.e({
    c: _ctx.isUniverifyLogin
  }, _ctx.isUniverifyLogin ? common_vendor.e({
    d: !$data.phoneNumber.length
  }, !$data.phoneNumber.length ? {} : {
    e: common_vendor.t($data.phoneNumber)
  }) : {}) : {}, {
    f: _ctx.hasLogin === false
  }, _ctx.hasLogin === false ? {} : {}, {
    g: common_vendor.f($data.providerList, (value, key, i0) => {
      return {
        a: common_vendor.t(value.name),
        b: common_vendor.o(($event) => $options.tologin(value), key),
        c: value.id === "univerify" ? $data.univerifyBtnLoading : false,
        d: key
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/API/login/login.js.map
