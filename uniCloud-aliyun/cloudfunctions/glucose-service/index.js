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
			// 添加血糖记录 - 修改为允许部分数据提交
			if (!params.userId || !params.date || !(params.fastingGlucose || params.postprandialGlucose)) {
				return {
					code: -1,
					message: '请至少提供用户ID、日期和一项血糖值'
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
				
				// 构建更新对象，只包含有值的字段
				const updateData = {
					update_date: Date.now()
				};
				
				if (params.fastingGlucose) {
					updateData.fasting_glucose = parseFloat(params.fastingGlucose);
				}
				
				if (params.postprandialGlucose) {
					updateData.postprandial_glucose = parseFloat(params.postprandialGlucose);
				}
				
				// 添加血压字段
				if (params.bloodPressure) {
					updateData.blood_pressure = params.bloodPressure;
				}
				
				result = await collection.doc(recordId).update(updateData);
				
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
				const newData = {
					user_id: params.userId,
					date: recordDate,
					create_date: Date.now()
				};
				
				// 只添加提供的字段
				if (params.fastingGlucose) {
					newData.fasting_glucose = parseFloat(params.fastingGlucose);
				}
				
				if (params.postprandialGlucose) {
					newData.postprandial_glucose = parseFloat(params.postprandialGlucose);
				}
				
				// 添加血压字段
				if (params.bloodPressure) {
					newData.blood_pressure = params.bloodPressure;
				}
				
				result = await collection.add(newData);
				
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
		
		case 'update': {
			// 更新血糖记录 - 允许部分更新
			if (!params.recordId || !params.userId) {
				return {
					code: -1,
					message: '缺少记录ID或用户ID'
				}
			}
			
			// 构建更新对象，只包含有值的字段
			const updateData = {
				update_date: Date.now()
			};
			
			if (params.fastingGlucose) {
				updateData.fasting_glucose = parseFloat(params.fastingGlucose);
			}
			
			if (params.postprandialGlucose) {
				updateData.postprandial_glucose = parseFloat(params.postprandialGlucose);
			}
			
			// 添加血压字段
			if (params.bloodPressure) {
				updateData.blood_pressure = params.bloodPressure;
			}
			
			if (params.date) {
				updateData.date = new Date(params.date);
			}
			
			let result = await collection.doc(params.recordId).update(updateData);
			
			return {
				code: 0,
				data: result,
				message: '更新血糖记录成功'
			}
		}
		
		case 'getByDate': {
			// 根据日期获取血糖记录
			if (!params.userId || !params.date) {
				return {
					code: -1,
					message: '缺少用户ID或日期'
				}
			}
			
			const recordDate = new Date(params.date);
			const startOfDay = new Date(recordDate);
			startOfDay.setHours(0, 0, 0, 0);
			
			const endOfDay = new Date(recordDate);
			endOfDay.setHours(23, 59, 59, 999);
			
			let result = await collection.where({
				user_id: params.userId,
				date: db.command.gte(startOfDay).and(db.command.lte(endOfDay))
			}).get();
			
			if (result.data.length > 0) {
				// 格式化返回的数据
				const record = result.data[0];
				const formattedRecord = {
					_id: record._id,
					userId: record.user_id,
					date: record.date,
					fastingGlucose: record.fasting_glucose,
					postprandialGlucose: record.postprandial_glucose,
					bloodPressure: record.blood_pressure || ''
				};
				
				return {
					code: 0,
					data: formattedRecord,
					message: '获取血糖记录成功'
				}
			} else {
				return {
					code: 0,
					data: null,
					message: '未找到记录'
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
			
			// 格式化返回的数据
			if (result.data.length > 0) {
				const record = result.data[0];
				result.data[0] = {
					_id: record._id,
					userId: record.user_id,
					date: record.date,
					fastingGlucose: record.fasting_glucose,
					postprandialGlucose: record.postprandial_glucose,
					bloodPressure: record.blood_pressure || ''
				};
			}
			
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
			
			// 格式化返回的数据
			const formattedList = result.data.map(record => {
				return {
					_id: record._id,
					userId: record.user_id,
					date: record.date,
					fastingGlucose: record.fasting_glucose,
					postprandialGlucose: record.postprandial_glucose,
					bloodPressure: record.blood_pressure || ''
				};
			});
			
			return {
				code: 0,
				data: {
					list: formattedList,
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
			
			// 格式化返回的数据
			const formattedList = result.data.map(record => {
				return {
					_id: record._id,
					userId: record.user_id,
					date: record.date,
					fastingGlucose: record.fasting_glucose,
					postprandialGlucose: record.postprandial_glucose,
					bloodPressure: record.blood_pressure || ''
				};
			});
			
			// 构造完整的数据（包含用户基本信息）
			const exportData = {
				userInfo: userData,
				records: formattedList
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