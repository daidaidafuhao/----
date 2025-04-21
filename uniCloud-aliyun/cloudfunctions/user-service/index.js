'use strict';

/**
 * 用户信息服务云函数
 * 提供用户信息的增删改查功能
 */
exports.main = async (event, context) => {
	// 云函数入口函数
	console.log('用户服务云函数 event : ', event)
	
	const db = uniCloud.database();
	const collection = db.collection('users');
	const action = event.action || '';
	const params = event.params || {};
	
	// 根据action参数执行不同的数据库操作
	switch (action) {
		case 'get': {
			// 获取用户信息
			let userId = params.userId;
			if (!userId) {
				return {
					code: -1,
					message: '缺少用户ID'
				}
			}
			
			let result = await collection.doc(userId).get();
			return {
				code: 0,
				data: result.data[0] || null,
				message: result.data.length ? '获取用户信息成功' : '用户不存在'
			}
		}
		
		case 'add': {
			// 添加用户信息
			if (!params.name || !params.age || !params.gender) {
				return {
					code: -1,
					message: '缺少必要的用户信息'
				}
			}
			
			let result = await collection.add({
				name: params.name,
				age: parseInt(params.age),
				gender: params.gender,
				phone: params.phone || '',
				notes: params.notes || ''
			});
			
			return {
				code: 0,
				data: {
					id: result.id
				},
				message: '添加用户信息成功'
			}
		}
		
		case 'update': {
			// 更新用户信息
			let userId = params.userId;
			if (!userId) {
				return {
					code: -1,
					message: '缺少用户ID'
				}
			}
			
			let updateData = {};
			['name', 'age', 'gender', 'phone', 'notes'].forEach(field => {
				if (params[field] !== undefined) {
					updateData[field] = field === 'age' ? parseInt(params[field]) : params[field];
				}
			});
			
			updateData.update_date = Date.now();
			
			let result = await collection.doc(userId).update(updateData);
			
			return {
				code: 0,
				data: result,
				message: '更新用户信息成功'
			}
		}
		
		case 'delete': {
			// 删除用户信息
			let userId = params.userId;
			if (!userId) {
				return {
					code: -1,
					message: '缺少用户ID'
				}
			}
			
			let result = await collection.doc(userId).remove();
			
			return {
				code: 0,
				data: result,
				message: '删除用户信息成功'
			}
		}
		
		default:
			return {
				code: -1,
				message: '未知操作类型'
			}
	}
}; 