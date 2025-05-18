'use strict';

/**
 * 页面配置管理云函数
 * 提供页面显示/隐藏的配置管理功能
 */
const db = uniCloud.database();
const pageConfigCollection = db.collection('page_config');

// 默认页面配置
const DEFAULT_PAGES = [
	{
		pageId: 'user-info',
		isVisible: false
	}
	// 可以在这里添加更多页面的默认配置
];

exports.main = async (event, context) => {
	const { action, params } = event;
	
	switch(action) {
		case 'initConfig': {
			// 初始化页面配置
			try {
				// 检查是否已经存在配置
				const existingConfigs = await pageConfigCollection.get();
				
				if(existingConfigs.data && existingConfigs.data.length > 0) {
					return {
						code: 0,
						message: '配置已存在，无需初始化'
					};
				}
				
				// 批量添加默认配置
				const now = Date.now();
				const configsToAdd = DEFAULT_PAGES.map(page => ({
					...page,
					createTime: now,
					updateTime: now
				}));
				
				await pageConfigCollection.add(configsToAdd);
				
				return {
					code: 0,
					message: '初始化配置成功'
				};
			} catch(error) {
				console.error('初始化配置失败', error);
				return {
					code: 500,
					message: '初始化配置失败: ' + error.message
				};
			}
		}
		
		case 'getConfig': {
			// 获取页面配置
			const { pageId } = params;
			
			if(!pageId) {
				return {
					code: 400,
					message: '缺少页面ID参数'
				};
			}
			
			try {
				const configResult = await pageConfigCollection.where({ pageId }).limit(1).get();
				
				if(configResult.data && configResult.data.length > 0) {
					console.log('获取配置成功')
					return {
						code: 0,
						data: configResult.data[0],
						message: '获取配置成功'
					};
				} else {
					console.log('如果配置不存在')
					// 如果配置不存在，返回默认配置（隐藏）
					return {
						code: 0,
						data: {
							pageId,
							isVisible: false,
							createTime: Date.now(),
							updateTime: Date.now()
						},
						message: '获取配置成功（默认配置）'
					};
				}
			} catch(error) {
				console.error('获取页面配置失败', error);
				return {
					code: 500,
					message: '获取页面配置失败: ' + error.message
				};
			}
		}
		
		case 'updateConfig': {
			// 更新页面配置
			const { pageId, isVisible } = params;
			
			if(!pageId) {
				return {
					code: 400,
					message: '缺少页面ID参数'
				};
			}
			
			try {
				const configResult = await pageConfigCollection.where({ pageId }).limit(1).get();
				
				if(configResult.data && configResult.data.length > 0) {
					// 更新现有配置
					await pageConfigCollection.doc(configResult.data[0]._id).update({
						isVisible,
						updateTime: Date.now()
					});
				} else {
					// 创建新配置
					await pageConfigCollection.add({
						pageId,
						isVisible,
						createTime: Date.now(),
						updateTime: Date.now()
					});
				}
				
				return {
					code: 0,
					message: '更新配置成功'
				};
			} catch(error) {
				console.error('更新页面配置失败', error);
				return {
					code: 500,
					message: '更新页面配置失败: ' + error.message
				};
			}
		}
		
		default:
			return {
				code: 400,
				message: '未知操作类型'
			};
	}
}; 