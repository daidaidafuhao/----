'use strict';

/**
 * 管理员服务云函数
 * 提供数据统计和导出功能
 */
exports.main = async (event, context) => {
	// 云函数入口函数
	console.log('管理员服务云函数 event : ', event)
	
	const db = uniCloud.database();
	const action = event.action || '';
	const params = event.params || {};
	
	// 根据action参数执行不同的数据库操作
	switch (action) {
		case 'statistics': {
			// 获取统计信息
			const userCountResult = await db.collection('users').count();
			const recordCountResult = await db.collection('glucose_records').count();
			
			// 获取最近一周的记录数
			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
			const lastWeekCountResult = await db.collection('glucose_records')
				.where({
					create_date: db.command.gte(oneWeekAgo)
				})
				.count();
			
			// 计算活跃用户数（最近30天有记录的用户）
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			
			const activeUsersResult = await db.collection('glucose_records')
				.where({
					create_date: db.command.gte(thirtyDaysAgo)
				})
				.field({
					user_id: true
				})
				.get();
			
			// 提取不重复的用户ID数量
			const activeUserIds = new Set();
			activeUsersResult.data.forEach(record => {
				activeUserIds.add(record.user_id);
			});
			
			return {
				code: 0,
				data: {
					userCount: userCountResult.total,
					recordCount: recordCountResult.total,
					lastWeekCount: lastWeekCountResult.total,
					activeUserCount: activeUserIds.size
				},
				message: '获取统计信息成功'
			}
		}
		
		case 'export': {
			// 导出所有用户数据
			const { dateRange, format } = params;
			
			// 获取所有用户
			const usersResult = await db.collection('users').get();
			const users = usersResult.data;
			
			// 获取日期范围内的记录
			let whereCondition = {};
			if (dateRange && dateRange.startDate && dateRange.endDate) {
				const startDate = new Date(dateRange.startDate);
				startDate.setHours(0, 0, 0, 0);
				
				const endDate = new Date(dateRange.endDate);
				endDate.setHours(23, 59, 59, 999);
				
				whereCondition.date = db.command.gte(startDate).and(db.command.lte(endDate));
			}
			
			const recordsResult = await db.collection('glucose_records')
				.where(whereCondition)
				.get();
			
			// 按日期组织记录
			const recordsByDate = {};
			recordsResult.data.forEach(record => {
				const dateStr = new Date(record.date).toISOString().split('T')[0];
				
				if (!recordsByDate[dateStr]) {
					recordsByDate[dateStr] = {};
				}
				
				// 按用户ID组织记录
				if (!recordsByDate[dateStr][record.user_id]) {
					recordsByDate[dateStr][record.user_id] = record;
				}
			});
			
			// 构造导出数据
			const exportData = {
				users,
				recordsByDate,
				format: format || 'xlsx'
			};
			
			return {
				code: 0,
				data: exportData,
				message: '导出数据成功'
			}
		}
		
		default:
			return {
				code: -1,
				message: '未知操作类型'
			}
	}
}; 