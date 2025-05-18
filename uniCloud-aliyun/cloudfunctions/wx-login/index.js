'use strict';

// 微信小程序配置信息
const wxConfig = {
  appid: 'wx5891aec381d1839a', // 填入您的微信小程序appid
  secret: '2b3c244749f2eb61558ec03a2e793ba7' // 填入您的微信小程序secret
};
const db = uniCloud.database();
const usersCollection = db.collection('users');
exports.main = async (event, context) => {
  try {
    // 获取客户端传来的code
    const { code } = event;
    
    // 参数校验
    if (!code) {
      return {
        code: -1,
        msg: '缺少参数code'
      };
    }
    
    // 请求微信API获取openid和session_key
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${wxConfig.appid}&secret=${wxConfig.secret}&js_code=${code}&grant_type=authorization_code`;
    
    // 使用uniCloud内置的httpclient
    const { data } = await uniCloud.httpclient.request(url, {
      method: 'GET',
      dataType: 'json'
    });
    
    // 检查是否成功获取openid
    if (data.errcode) {
      return {
        code: data.errcode,
        msg: data.errmsg || '微信登录失败'
      };
    }
    
    // 从微信返回数据中获取openid
    const { openid } = data;
    
    // 检查用户是否存在
    const userResult = await usersCollection.where({ openid }).limit(1).get();
        
    if(!(userResult.data && userResult.data.length > 0)) {
      // 用户不存在，创建新用户
      const newUserData = {
        openid,
        wxUserInfo: "",
        nickName: "",
        avatarUrl: "",
        createTime: new Date().getTime(),
        updateTime: new Date().getTime(),
        isAdmin: false // 默认非管理员
      };
      
      // 添加新用户到数据库
      const addResult = await usersCollection.add(newUserData);
      console.log('创建新用户成功:', addResult);
    } else {
      console.log('用户已存在:', openid);
    }
    
    // 获取用户信息（包括管理员状态）
    const userInfo = await usersCollection.where({ openid }).limit(1).get();
    const isAdmin = userInfo.data && userInfo.data.length > 0 ? userInfo.data[0].isAdmin : false;
    
    // 返回openid等信息
    return {
      code: 0,
      msg: '登录成功',
      data: {
        openid: data.openid,
        isAdmin: isAdmin,
        // session_key不应该返回给客户端，这里仅做演示
        // 实际应用中建议存储在云端，并返回自定义登录态标识
        session_key: data.session_key,
      }
    };
    
  } catch (error) {
    console.error('登录出错:', error);
    return {
      code: -3,
      msg: '云函数执行异常',
      error: error.message
    };
  }
}; 