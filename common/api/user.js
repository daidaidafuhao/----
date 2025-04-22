/**
 * 用户相关API
 */
import request from './request.js';

// 获取用户信息
export function getUserInfo(userId) {
	return request.callCloudFunction('user-service', {
		action: 'get',
		params: { userId }
	});
}

// 新增用户信息
export function addUserInfo(userInfo) {
	return request.callCloudFunction('user-service', {
		action: 'add',
		params: userInfo
	});
}

// 更新用户信息
export function updateUserInfo(userId, userInfo) {
	return request.callCloudFunction('user-service', {
		action: 'update',
		params: {
			userId,
			...userInfo
		}
	});
}

// 删除用户信息
export function deleteUserInfo(userId) {
	return request.callCloudFunction('user-service', {
		action: 'delete',
		params: { userId }
	});
}

export default {
	getUserInfo,
	addUserInfo,
	updateUserInfo,
	deleteUserInfo
}; 