import { getWechatLoginState, wechatLogin } from './wechat.js';
import store from '../../store/index.js';

// 检查登录状态并处理未登录情况
export function checkLoginAndRedirect() {
  const loginState = getWechatLoginState();
  if (!loginState.isLoggedIn) {
    // 未登录，跳转到登录页面
    // 使用绝对路径（确保以/开头）
    uni.redirectTo({
      url: '/pages/login/index'
    });
    return false;
  }
  return true;
}

// 执行登录流程
export function doLogin() {
  return new Promise((resolve, reject) => {
    uni.showLoading({
      title: '登录中...'
    });
    
    wechatLogin()
      .then(res => {
        uni.hideLoading();
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        // 保存登录状态到Vuex
        store.commit('login', 'weixin');
        store.commit('setOpenid', res.openid);
        
        // 保存管理员状态到Vuex
        if (res.isAdmin) {
          store.commit('setAdmin', true);
          
          // 管理员用户跳转到管理页面
          uni.reLaunch({
            url: '/pages/admin/index'
          });
        } else {
          store.commit('setAdmin', false);
          
          // 普通用户跳转到数据录入页面
          uni.switchTab({
            url: '/pages/data-entry/index'
          });
        }
        
        resolve(res);
      })
      .catch(err => {
        uni.hideLoading();
        uni.showToast({
          title: '登录失败: ' + (err.message || '未知错误'),
          icon: 'none'
        });
        reject(err);
      });
  });
}

export default {
  checkLoginAndRedirect,
  doLogin
}; 