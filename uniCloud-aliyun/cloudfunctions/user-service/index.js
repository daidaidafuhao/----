'use strict';

/**
 * 用户信息服务云函数
 * 提供用户信息的增删改查功能
 */
const db = uniCloud.database();
const usersCollection = db.collection('users');

exports.main = async (event, context) => {
	// 获取客户端信息
	const { PLATFORM, LOCALE, DEVICEID } = context;
	
	// 获取传入参数
	const { action, params } = event;
	
	// 根据不同的操作执行不同的逻辑
	switch(action) {
		case 'getUserByOpenid':
			return await getUserByOpenid(params);
		case 'updateUserInfo':
			return await updateUserInfo(params);
		case 'saveWxUserInfo':
			return await saveWxUserInfo(params);
		default:
			return {
				code: 400,
				message: '未知操作: ' + action
			};
	}
};

/**
 * 根据openid获取用户信息
 * @param {Object} params - 包含openid的参数对象
 * @return {Object} 包含用户信息的响应对象
 */
async function getUserByOpenid(params) {
	const { openid } = params;
	
	if(!openid) {
		return {
			code: 400,
			message: 'openid不能为空'
		};
	}
	
	try {
		const userResult = await usersCollection.where({ openid }).limit(1).get();
		
		if(userResult.data && userResult.data.length > 0) {
			return {
				code: 0,
				message: '获取用户信息成功',
				data: userResult.data[0]
			};
		} else {
			return {
				code: 404,
				message: '用户不存在',
				data: null
			};
		}
	} catch(error) {
		console.error('获取用户信息失败', error);
		return {
			code: 500,
			message: '获取用户信息失败: ' + error.message
		};
	}
}

/**
 * 更新用户信息
 * @param {Object} params - 包含用户信息的参数对象
 * @return {Object} 操作结果响应对象
 */
async function updateUserInfo(params) {
	const { 
		openid, 
		name, 
		contactMethod, 
		contactPerson, 
		notes, 
		gender, 
		phone, 
		height, 
		weight, 
		bmi, 
		bloodPressure, 
		basicDisease 
	} = params;
	
	if(!openid) {
		return {
			code: 400,
			message: 'openid不能为空'
		};
	}
	
	if(!name) {
		return {
			code: 400,
			message: '用户姓名不能为空'
		};
	}
	
	try {
		// 检查用户是否存在
		const userResult = await usersCollection.where({ openid }).limit(1).get();
		
		const userData = {
			name,
			contactMethod,
			contactPerson,
			notes,
			gender,
			phone,
			height,
			weight,
			bmi,
			bloodPressure,
			basicDisease,
			updateTime: new Date().getTime()
		};
		
		if(userResult.data && userResult.data.length > 0) {
			// 用户存在，更新用户信息
			await usersCollection.doc(userResult.data[0]._id).update(userData);
			
			return {
				code: 0,
				message: '更新用户信息成功'
			};
		} else {
			// 用户不存在，创建新用户
			userData.openid = openid;
			userData.createTime = new Date().getTime();
			
			await usersCollection.add(userData);
			
			return {
				code: 0,
				message: '创建用户信息成功'
			};
		}
	} catch(error) {
		console.error('更新用户信息失败', error);
		return {
			code: 500,
			message: '更新用户信息失败: ' + error.message
		};
	}
}

/**
 * 保存微信用户信息
 * @param {Object} params - 包含微信用户信息的参数对象
 * @return {Object} 操作结果响应对象
 */
async function saveWxUserInfo(params) {
	const { openid, userInfo } = params;
	
	if(!openid) {
		return {
			code: 400,
			message: 'openid不能为空'
		};
	}
	
	if(!userInfo) {
		return {
			code: 400,
			message: '用户信息不能为空'
		};
	}
	
	try {
		// 检查用户是否存在
		const userResult = await usersCollection.where({ openid }).limit(1).get();
		
		if(userResult.data && userResult.data.length > 0) {
			// 用户存在，更新微信用户信息
			await usersCollection.doc(userResult.data[0]._id).update({
				wxUserInfo: userInfo,
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl,
				updateTime: new Date().getTime()
			});
			
			return {
				code: 0,
				message: '更新微信用户信息成功'
			};
		} else {
			// 用户不存在，创建新用户
			await usersCollection.add({
				openid,
				wxUserInfo: userInfo,
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl,
				createTime: new Date().getTime(),
				updateTime: new Date().getTime()
			});
			
			return {
				code: 0,
				message: '创建微信用户信息成功'
			};
		}
	} catch(error) {
		console.error('保存微信用户信息失败', error);
		return {
			code: 500,
			message: '保存微信用户信息失败: ' + error.message
		};
	}
} 