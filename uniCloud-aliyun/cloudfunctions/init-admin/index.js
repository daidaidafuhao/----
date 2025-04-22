'use strict';

/**
 * 初始化管理员配置云函数
 * 这个云函数只应该被调用一次，用于设置第一个管理员
 */
exports.main = async (event, context) => {
	const { openid } = event;
	
	// 参数校验
	if (!openid) {
		return {
			code: 400,
			message: '缺少管理员OpenID参数'
		};
	}
	
	try {
		const db = uniCloud.database();
		
		// 查询是否已有配置
		const configResult = await db.collection('admin_config').get();
		
		if (configResult.data && configResult.data.length > 0) {
			// 已有配置，添加这个openid到列表（如果不存在）
			const config = configResult.data[0];
			const adminOpenIds = config.admin_openids || [];
			
			if (adminOpenIds.includes(openid)) {
				return {
					code: 0,
					message: '该用户已经是管理员'
				};
			}
			
			// 添加新管理员
			adminOpenIds.push(openid);
			
			// 更新配置
			await db.collection('admin_config').doc(config._id).update({
				admin_openids: adminOpenIds,
				update_date: new Date()
			});
			
			return {
				code: 0,
				message: '添加管理员成功',
				data: {
					admin_openids: adminOpenIds
				}
			};
		} else {
			// 没有配置，创建新的
			const result = await db.collection('admin_config').add({
				admin_openids: [openid],
				create_date: new Date(),
				update_date: new Date()
			});
			
			return {
				code: 0,
				message: '初始化管理员配置成功',
				data: {
					admin_openids: [openid],
					_id: result.id
				}
			};
		}
	} catch (error) {
		console.error('初始化管理员配置出错', error);
		return {
			code: 500,
			message: '初始化管理员配置出错',
			error: error.message
		};
	}
}; 