/**
 * 管理员相关API
 */
import request from './request.js';

// 检查用户是否为管理员
export function checkIsAdmin(openid) {
	return request.callCloudFunction('admin-service', {
		action: 'checkAdmin',
		params: {
			openid
		}
	});
}

// 添加管理员
export function addAdmin(openid, targetOpenid) {
	return request.callCloudFunction('admin-service', {
		action: 'addAdmin',
		params: {
			openid,
			targetOpenid
		}
	});
}

// 移除管理员
export function removeAdmin(openid, targetOpenid) {
	return request.callCloudFunction('admin-service', {
		action: 'removeAdmin',
		params: {
			openid,
			targetOpenid
		}
	});
}

// 获取管理员列表
export function listAdmins(openid) {
	return request.callCloudFunction('admin-service', {
		action: 'listAdmins',
		params: {
			openid
		}
	});
}

// 获取统计信息
export function getStatistics(openid) {
	return request.callCloudFunction('admin-service', {
		action: 'statistics',
		params: {
			openid
		}
	});
}

// 导出所有数据
export function exportAllData(openid, dateRange, format = 'xlsx') {
	return request.callCloudFunction('admin-service', {
		action: 'export',
		params: {
			openid,
			dateRange,
			format
		}
	});
}

export default {
	checkIsAdmin,
	addAdmin,
	removeAdmin,
	listAdmins,
	getStatistics,
	exportAllData
}; 