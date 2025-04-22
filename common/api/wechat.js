/**
 * 微信相关API工具类
 */

// 检查是否微信小程序环境
export function isWechatMP() {
    // #ifdef MP-WEIXIN
    return true;
    // #endif
    
    // #ifndef MP-WEIXIN
    return false;
    // #endif
}

// 获取微信登录状态
export function getWechatLoginState() {
    try {
        const openid = uni.getStorageSync('openid');
        const userInfo = uni.getStorageSync('userInfo');
        
        return {
            isLoggedIn: !!openid,
            openid: openid || '',
            userInfo: userInfo || null
        };
    } catch (e) {
        console.error('获取登录状态失败', e);
        return {
            isLoggedIn: false,
            openid: '',
            userInfo: null
        };
    }
}

// 微信登录
export function wechatLogin() {
    return new Promise((resolve, reject) => {
        try {
            // #ifdef MP-WEIXIN
            uni.login({
                provider: 'weixin',
                success: (loginRes) => {
                    console.log(loginRes);
                    
                    try {
                        // 获取openid
                        getWechatOpenid(loginRes.code)
                            .then(openidRes => {
                                try {
                                    // 获取用户信息
                                    uni.getUserProfile({
                                        desc: '用于完善会员资料',
                                        success: (userInfoRes) => {
                                            try {
                                                // 保存用户信息
                                                saveWechatUserInfo(openidRes.openid, userInfoRes.userInfo)
                                                    .then(saveRes => {
                                                        // 直接使用wx-login返回的isAdmin状态
                                                        resolve({
                                                            openid: openidRes.openid,
                                                            userInfo: userInfoRes.userInfo,
                                                            userId: saveRes.userId,
                                                            isAdmin: openidRes.isAdmin || false
                                                        });
                                                    })
                                                    .catch(err => {
                                                        console.error('保存用户信息失败', err);
                                                        reject(err instanceof Error ? err : new Error('保存用户信息失败'));
                                                    });
                                            } catch (e) {
                                                console.error('处理用户信息出错', e);
                                                reject(e instanceof Error ? e : new Error('处理用户信息出错'));
                                            }
                                        },
                                        fail: (err) => {
                                            console.error('获取用户信息失败', err);
                                            reject(err instanceof Error ? err : new Error('获取用户信息失败'));
                                        }
                                    });
                                } catch (e) {
                                    console.error('获取用户信息出错', e);
                                    reject(e instanceof Error ? e : new Error('获取用户信息出错'));
                                }
                            })
                            .catch(err => {
                                console.error('获取openid失败', err);
                                reject(err instanceof Error ? err : new Error('获取openid失败'));
                            });
                    } catch (e) {
                        console.error('调用登录方法出错', e);
                        reject(e instanceof Error ? e : new Error('调用登录方法出错'));
                    }
                },
                fail: (err) => {
                    console.error('微信登录失败', err);
                    reject(err instanceof Error ? err : new Error('微信登录失败'));
                }
            });
            // #endif
            
            // #ifndef MP-WEIXIN
            reject(new Error('仅支持微信小程序环境'));
            // #endif
        } catch (e) {
            console.error('微信登录过程出错', e);
            reject(e instanceof Error ? e : new Error('微信登录过程出错'));
        }
    });
}

// 获取微信OpenID
function getWechatOpenid(code) {
    return new Promise((resolve, reject) => {
        try {
            console.log(code);
            
            uni.request({
                url: 'https://97fca9f2-41f6-449f-a35e-3f135d4c3875.bspapp.com/http/user-center',
                method: 'POST',
                data: {
                    action: 'loginByWeixin',
                    params: {
                        code: code,
                        platform: 'mp-weixin'
                    }
                },
                success: (res) => {
                    console.log(res);
                    
                    try {
                        if (!res.data || res.data.code !== 0) {
                            const errMsg = (res.data && res.data.errMsg) ? res.data.errMsg : '获取openid失败';
                            reject(new Error(errMsg));
                            return;
                        }
                        
                        // 存储openid
                        uni.setStorageSync('openid', res.data.openid);
                        resolve({
                            openid: res.data.openid,
                            isAdmin: res.data.isAdmin
                        });
                    } catch (e) {
                        console.error('处理获取openid响应出错', e);
                        reject(e instanceof Error ? e : new Error('处理获取openid响应出错'));
                    }
                },
                fail: (err) => {
                    console.error('请求获取openid失败', err);
                    reject(err instanceof Error ? err : new Error('请求获取openid失败'));
                }
            });
        } catch (e) {
            console.error('发送获取openid请求出错', e);
            reject(e instanceof Error ? e : new Error('发送获取openid请求出错'));
        }
    });
}

// 保存微信用户信息
function saveWechatUserInfo(openid, userInfo) {
    return new Promise((resolve, reject) => {
        try {
            // 存储用户信息到本地
            uni.setStorageSync('userInfo', userInfo);
            
            // 调用云函数保存到数据库
            uniCloud.callFunction({
                name: 'user-service',
                data: {
                    action: 'saveWxUserInfo',
                    params: {
                        openid: openid,
                        userInfo: userInfo
                    }
                },
                success: (res) => {
                    try {
                        if (!res.result || res.result.code !== 0) {
                            const errMsg = (res.result && res.result.message) ? res.result.message : '保存用户信息失败';
                            reject(new Error(errMsg));
                            return;
                        }
                        
                        resolve({
                            userId: res.result.data.userId,
                            isNew: res.result.data.isNew
                        });
                    } catch (e) {
                        console.error('处理保存用户信息响应出错', e);
                        reject(e instanceof Error ? e : new Error('处理保存用户信息响应出错'));
                    }
                },
                fail: (err) => {
                    console.error('调用保存用户信息云函数失败', err);
                    reject(err instanceof Error ? err : new Error('调用保存用户信息云函数失败'));
                }
            });
        } catch (e) {
            console.error('保存用户信息过程出错', e);
            reject(e instanceof Error ? e : new Error('保存用户信息过程出错'));
        }
    });
}

// 检查用户是否授权
export function checkAuthSetting(scope) {
    return new Promise((resolve) => {
        try {
            // #ifdef MP-WEIXIN
            uni.getSetting({
                success: (res) => {
                    try {
                        resolve(!!res.authSetting[scope]);
                    } catch (e) {
                        console.error('处理授权设置响应出错', e);
                        resolve(false);
                    }
                },
                fail: () => {
                    resolve(false);
                }
            });
            // #endif
            
            // #ifndef MP-WEIXIN
            resolve(false);
            // #endif
        } catch (e) {
            console.error('获取授权设置过程出错', e);
            resolve(false);
        }
    });
}

// 微信分享
export function shareToWechat(options = {}) {
    try {
        // #ifdef MP-WEIXIN
        uni.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
        
        const defaultOptions = {
            title: '血糖检测小程序',
            path: '/pages/index/index',
            imageUrl: '/static/logo.png'
        };
        
        const shareOptions = Object.assign({}, defaultOptions, options);
        
        // 设置分享内容
        uni.onShareAppMessage(() => {
            return {
                title: shareOptions.title,
                path: shareOptions.path,
                imageUrl: shareOptions.imageUrl
            };
        });
        
        // 设置分享到朋友圈
        if (typeof uni.onShareTimeline === 'function') {
            uni.onShareTimeline(() => {
                return {
                    title: shareOptions.title,
                    path: shareOptions.path,
                    imageUrl: shareOptions.imageUrl
                };
            });
        }
        // #endif
    } catch (e) {
        console.error('设置分享选项出错', e);
    }
}

export default {
    isWechatMP,
    getWechatLoginState,
    wechatLogin,
    checkAuthSetting,
    shareToWechat
}; 