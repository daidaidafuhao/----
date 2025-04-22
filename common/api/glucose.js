/**
 * 血糖记录相关API
 */
import request from './request.js';

// 添加血糖记录
export function addGlucoseRecord(record) {
	return request.callCloudFunction('glucose-service', {
		action: 'add',
		params: record
	});
}

// 获取血糖记录详情
export function getGlucoseRecord(recordId) {
	return request.callCloudFunction('glucose-service', {
		action: 'get',
		params: { recordId }
	});
}

// 获取血糖记录列表
export function getGlucoseRecordList(userId, startDate, endDate, page = 1, pageSize = 20) {
	return request.callCloudFunction('glucose-service', {
		action: 'list',
		params: {
			userId,
			startDate,
			endDate,
			page,
			pageSize
		}
	});
}

// 删除血糖记录
export function deleteGlucoseRecord(recordId) {
	return request.callCloudFunction('glucose-service', {
		action: 'delete',
		params: { recordId }
	});
}

// 导出用户血糖记录
export function exportGlucoseRecords(userId, startDate, endDate) {
	return request.callCloudFunction('glucose-service', {
		action: 'export',
		params: {
			userId,
			startDate,
			endDate
		}
	});
}

export default {
	addGlucoseRecord,
	getGlucoseRecord,
	getGlucoseRecordList,
	deleteGlucoseRecord,
	exportGlucoseRecords
}; 