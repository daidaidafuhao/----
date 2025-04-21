'use strict';

/**
 * 血糖记录服务云函数
 * 提供血糖记录的增删改查功能
 */
exports.main = async (event, context) => {
	// 云函数入口函数
	console.log('血糖记录服务云函数 event : ', event)
	
	const db = uniCloud.database();
	const collection = db.collection('glucose_records');
	const action = event.action || '';
	const params = event.params || {};
	
	// 根据action参数执行不同的数据库操作
	switch (action) {
		case 'add': {
			// 添加血糖记录
			if (!params.userId || !params.date || !params.fastingGlucose || !params.postprandialGlucose) {
				return {
					code: -1,
					message: '缺少必要的血糖记录信息'
				}
			}
			
			// 检查当日是否已有记录，如有则更新，无则新增
			const recordDate = new Date(params.date);
			const startOfDay = new Date(recordDate);
			startOfDay.setHours(0, 0, 0, 0);
			
			const endOfDay = new Date(recordDate);
			endOfDay.setHours(23, 59, 59, 999);
			
			const existRecord = await collection.where({
				user_id: params.userId,
				date: db.command.gte(startOfDay).and(db.command.lte(endOfDay))
			}).get();
			
			let result;
			if (existRecord.data.length > 0) {
				// 已有记录，更新
				const recordId = existRecord.data[0]._id;
				result = await collection.doc(recordId).update({
					fasting_glucose: parseFloat(params.fastingGlucose),
					postprandial_glucose: parseFloat(params.postprandialGlucose),
					update_date: Date.now()
				});
				
				return {
					code: 0,
					data: {
						id: recordId,
						updated: true
					},
					message: '更新血糖记录成功'
				}
			} else {
				// 无记录，新增
				result = await collection.add({
					user_id: params.userId,
					date: recordDate,
					fasting_glucose: parseFloat(params.fastingGlucose),
					postprandial_glucose: parseFloat(params.postprandialGlucose)
				});
				
				return {
					code: 0,
					data: {
						id: result.id,
						updated: false
					},
					message: '添加血糖记录成功'
				}
			}
		}
		
		case 'get': {
			// 获取血糖记录详情
			let recordId = params.recordId;
			if (!recordId) {
				return {
					code: -1,
					message: '缺少记录ID'
				}
			}
			
			let result = await collection.doc(recordId).get();
			return {
				code: 0,
				data: result.data[0] || null,
				message: result.data.length ? '获取血糖记录成功' : '记录不存在'
			}
		}
		
		case 'list': {
			// 获取血糖记录列表
			if (!params.userId) {
				return {
					code: -1,
					message: '缺少用户ID'
				}
			}
			
			let whereCondition = {
				user_id: params.userId
			};
			
			// 如果有日期范围，则添加到查询条件
			if (params.startDate && params.endDate) {
				const startDate = new Date(params.startDate);
				startDate.setHours(0, 0, 0, 0);
				
				const endDate = new Date(params.endDate);
				endDate.setHours(23, 59, 59, 999);
				
				whereCondition.date = db.command.gte(startDate).and(db.command.lte(endDate));
			}
			
			let query = collection.where(whereCondition).orderBy('date', 'desc');
			
			// 分页查询
			const page = params.page || 1;
			const pageSize = params.pageSize || 20;
			
			let result = await query.skip((page - 1) * pageSize).limit(pageSize).get();
			
			// 获取总记录数
			const totalResult = await collection.where(whereCondition).count();
			
			return {
				code: 0,
				data: {
					list: result.data,
					page,
					pageSize,
					total: totalResult.total
				},
				message: '获取血糖记录列表成功'
			}
		}
		
		case 'delete': {
			// 删除血糖记录
			let recordId = params.recordId;
			if (!recordId) {
				return {
					code: -1,
					message: '缺少记录ID'
				}
			}
			
			let result = await collection.doc(recordId).remove();
			
			return {
				code: 0,
				data: result,
				message: '删除血糖记录成功'
			}
		}
		
		case 'export': {
			// 导出血糖记录
			if (!params.userId) {
				return {
					code: -1,
					message: '缺少用户ID'
				}
			}
			
			let whereCondition = {
				user_id: params.userId
			};
			
			// 如果有日期范围，则添加到查询条件
			if (params.startDate && params.endDate) {
				const startDate = new Date(params.startDate);
				startDate.setHours(0, 0, 0, 0);
				
				const endDate = new Date(params.endDate);
				endDate.setHours(23, 59, 59, 999);
				
				whereCondition.date = db.command.gte(startDate).and(db.command.lte(endDate));
			}
			
			// 获取用户信息
			const userResult = await db.collection('users').doc(params.userId).get();
			const userData = userResult.data[0] || {};
			
			// 获取血糖记录
			let result = await collection.where(whereCondition).orderBy('date', 'desc').get();
			
			// 构造完整的数据（包含用户基本信息）
			const exportData = {
				userInfo: userData,
				records: result.data
			};
			
			return {
				code: 0,
				data: exportData,
				message: '导出血糖记录成功'
			}
		}
		
		default:
			return {
				code: -1,
				message: '未知操作类型'
			}
	}
}; 