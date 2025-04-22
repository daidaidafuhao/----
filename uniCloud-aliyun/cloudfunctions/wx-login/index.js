'use strict';

// 微信小程序配置信息
const wxConfig = {
  appid: 'wxa0d3f6e827e77411', // 填入您的微信小程序appid
  secret: 'f3806f4493c956c65c93e4b8cb4c127d' // 填入您的微信小程序secret
};

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
    
    // 初始化数据库
    const db = uniCloud.database();
    
    // 从admin_config集合中检查用户是否为管理员
    let isAdmin = false;
    try {
      // 查询管理员配置
      const adminConfigResult = await db.collection('admin_config').get();
      
      // 如果配置存在且非空
      if (adminConfigResult.data && adminConfigResult.data.length > 0) {
        // 从配置中获取管理员列表
        const adminOpenIds = adminConfigResult.data[0].admin_openids || [];
        
        // 检查当前用户是否在管理员列表中
        isAdmin = adminOpenIds.includes(data.openid);
      }
    } catch (error) {
      console.error('检查管理员权限出错', error);
      // 出错时默认为非管理员，不影响登录流程
    }
    
    // 返回openid等信息，以及管理员状态
    return {
      code: 0,
      msg: '登录成功',
      data: {
        openid: data.openid,
        // session_key不应该返回给客户端，这里仅做演示
        // 实际应用中建议存储在云端，并返回自定义登录态标识
        session_key: data.session_key,
        isAdmin: isAdmin
      }
    };
    
  } catch (error) {
    return {
      code: -3,
      msg: '云函数执行异常',
      error: error.message
    };
  }
}; 