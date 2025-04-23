'use strict';

/**
 * 管理员服务云函数
 * 提供数据统计和导出功能
 */
// 引入xlsx库用于生成Excel文件
const XLSX = require('xlsx');
// 引入fs模块用于文件操作
const fs = require('fs');

exports.main = async (event, context) => {
	// 云函数入口函数
	console.log('管理员服务云函数 event : ', event)
	
	const db = uniCloud.database();
	const action = event.action || '';
	const params = event.params || {};
	
	// 检查用户是否为管理员的函数（从数据库获取管理员列表）
	async function isAdminUser(openid) {
		try {
			// 查询管理员配置表
			const adminConfigResult = await db.collection('admin_config').get();
			
			// 如果配置表不存在或为空，返回false
			if (!adminConfigResult.data || adminConfigResult.data.length === 0) {
				return false;
			}
			
			// 从配置中获取管理员列表
			const adminOpenIds = adminConfigResult.data[0].admin_openids || [];
			
			// 检查用户是否在管理员列表中
			return adminOpenIds.includes(openid);
		} catch (e) {
			console.error('检查管理员权限出错', e);
			return false;
		}
	}
	
	// // 检查是否为管理员用户（除了checkAdmin操作）
	// if ((action !== 'checkAdmin' || action !== 'addAdmin' && !await isAdminUser(params.openid)) {
	// 	return {
	// 		code: 403,
	// 		message: '无权访问管理员功能'
	// 	}
	// }
	
	// 根据action参数执行不同的数据库操作
	switch (action) {
		case 'checkAdmin': {
			// 检查用户是否为管理员
			const { openid } = params;
			const isAdmin = await isAdminUser(openid);
			
			return {
				code: 0,
				data: {
					isAdmin
				},
				message: '检查成功'
			}
		}
		
		case 'addAdmin': {
			// 添加管理员
			const { targetOpenid } = params;
			
			if (!targetOpenid) {
				return {
					code: 400,
					message: '缺少目标用户OpenID'
				};
			}
			
			// 查询管理员配置表
			const adminConfigResult = await db.collection('admin_config').get();
			
			if (adminConfigResult.data && adminConfigResult.data.length > 0) {
				// 已有配置，更新
				const config = adminConfigResult.data[0];
				const adminOpenIds = config.admin_openids || [];
				
				// 如果已经是管理员，则不重复添加
				if (adminOpenIds.includes(targetOpenid)) {
					return {
						code: 0,
						message: '该用户已经是管理员'
					};
				}
				
				// 添加到管理员列表
				adminOpenIds.push(targetOpenid);
				
				// 更新配置
				await db.collection('admin_config').doc(config._id).update({
					admin_openids: adminOpenIds,
					update_date: new Date()
				});
			} else {
				// 没有配置，创建新的
				await db.collection('admin_config').add({
					admin_openids: [targetOpenid],
					create_date: new Date(),
					update_date: new Date()
				});
			}
			
			return {
				code: 0,
				message: '添加管理员成功'
			};
		}
		
		case 'removeAdmin': {
			// 移除管理员
			const { targetOpenid } = params;
			
			if (!targetOpenid) {
				return {
					code: 400,
					message: '缺少目标用户OpenID'
				};
			}
			
			// 查询管理员配置表
			const adminConfigResult = await db.collection('admin_config').get();
			
			if (!adminConfigResult.data || adminConfigResult.data.length === 0) {
				return {
					code: 404,
					message: '管理员配置不存在'
				};
			}
			
			const config = adminConfigResult.data[0];
			let adminOpenIds = config.admin_openids || [];
			
			// 如果不是管理员，则无需操作
			if (!adminOpenIds.includes(targetOpenid)) {
				return {
					code: 0,
					message: '该用户不是管理员'
				};
			}
			
			// 从管理员列表中移除
			adminOpenIds = adminOpenIds.filter(id => id !== targetOpenid);
			
			// 更新配置
			await db.collection('admin_config').doc(config._id).update({
				admin_openids: adminOpenIds,
				update_date: new Date()
			});
			
			return {
				code: 0,
				message: '移除管理员成功'
			};
		}
		
		case 'listAdmins': {
			// 获取管理员列表
			const adminConfigResult = await db.collection('admin_config').get();
			
			if (!adminConfigResult.data || adminConfigResult.data.length === 0) {
				return {
					code: 0,
					data: {
						admins: []
					},
					message: '获取管理员列表成功'
				};
			}
			
			const config = adminConfigResult.data[0];
			const adminOpenIds = config.admin_openids || [];
			
			// 获取管理员用户信息
			const admins = [];
			if (adminOpenIds.length > 0) {
				const usersResult = await db.collection('users')
					.where({
						openid: db.command.in(adminOpenIds)
					})
					.get();
				
				for (const openid of adminOpenIds) {
					const userInfo = usersResult.data.find(user => user.openid === openid) || { openid };
					admins.push(userInfo);
				}
			}
			
			return {
				code: 0,
				data: {
					admins
				},
				message: '获取管理员列表成功'
			};
		}
		
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
			try {
				// 导出所有用户数据
				const { dateRange, format } = params;
				console.log('导出参数:', { dateRange, format });
				
				// 获取所有用户
				const usersResult = await db.collection('users').get();
				const users = usersResult.data;
				console.log(`获取到 ${users.length} 个用户`);
				
				// 获取日期范围内的记录
				let whereCondition = {};
				if (dateRange && dateRange.startDate && dateRange.endDate) {
					const startDate = new Date(dateRange.startDate);
					startDate.setHours(0, 0, 0, 0);
					
					const endDate = new Date(dateRange.endDate);
					endDate.setHours(23, 59, 59, 999);
					
					whereCondition.date = db.command.gte(startDate).and(db.command.lte(endDate));
					console.log('日期范围查询条件:', JSON.stringify(whereCondition));
				}
				
				const recordsResult = await db.collection('glucose_records')
					.where(whereCondition)
					.get();
				
				const records = recordsResult.data;
				console.log(`获取到 ${records.length} 条记录`);
				
				// 所有记录按日期和用户ID组织
				const recordsByDate = {};
				records.forEach(record => {
					// 格式化日期为YYYY-MM-DD
					const dateObj = new Date(record.date);
					const dateStr = dateObj.toISOString().split('T')[0];
					
					if (!recordsByDate[dateStr]) {
						recordsByDate[dateStr] = {};
					}
					
					// 使用user_id作为key保存记录
					recordsByDate[dateStr][record.user_id] = record;
				});
				
				// 创建用户ID映射，同时支持_id和openid
				const userIdMap = {};
				users.forEach(user => {
					// 确保可以通过_id查找用户
					userIdMap[user._id] = user;
					// 也支持通过openid查找
					if (user.openid) {
						userIdMap[user.openid] = user;
					}
				});
				
				// 生成文件名
				const timestamp = new Date().getTime();
				const fileName = `blood_glucose_data_${dateRange?.startDate || 'all'}_${dateRange?.endDate || 'all'}_${timestamp}`;
				
				// 根据请求的格式生成文件
				if (format === 'xlsx') {
					// 首先获取所有日期并排序
					const dates = Object.keys(recordsByDate).sort();
					
					// 创建表格内容
					const allRows = [];
					
					// 第一行：标题行
					const titleRow = ['日常身体数据记录'];
					// 为标题行填充空值，使其与最大列数一致（用户信息 + 日期*2列）
					for (let i = 0; i < 12 + dates.length * 2; i++) {
						titleRow.push('');
					}
					allRows.push(titleRow);
					
					// 第三行：血糖类型行
					const typeRow = ['编号', '姓名(监测用户)', '联系方式', '联系人(负责联系监测用户的人)', '备注', '性别', '电话', '身高(m)', '体重(kg)', 'BMI', '血压(mmHg)', '基础疾病'];
					dates.forEach(() => {
						typeRow.push('餐前');
						typeRow.push('餐后');
					});
					
					// 第二行：日期行
					const dateRow = ['', '', '', '', '', '', '', '', '', '', '', ''];  // 用户信息列留空，共12列
					dates.forEach(date => {
						dateRow.push(date);  // 每个日期占两列，但只写一次
						dateRow.push('');    // 第二列留空，后面通过合并单元格处理
					});
					
					// 按顺序添加行
					allRows.push(dateRow);
					allRows.push(typeRow);
					
					// 设置标题行合并单元格
					const titleRange = { s: { r: 0, c: 0 }, e: { r: 0, c: 12 + dates.length * 2 - 1 } };
					
					// 数据行
					users.forEach((user, index) => {
						const row = [
							index + 1,                            // 编号
							user.name || '',                      // 姓名(监测用户)
							user.contactMethod || '',                     // 联系方式
							user.contactPerson || '',            // 联系人(负责联系监测用户的人)
							user.notes || '',                      // 备注
							user.gender || '',                    // 性别
							user.phone || '',         // 电话
							user.height || '',                    // 身高(m)
							user.weight || '',                    // 体重(kg)
							user.bmi || '',                       // BMI
							user.bloodPressure || '',            // 血压(mmHg)
							user.basicDisease || ''               // 基础疾病
						];
						
						// 添加每个日期的血糖值
						dates.forEach(date => {
							// 尝试通过user._id查找记录
							let record = recordsByDate[date] && recordsByDate[date][user._id];
							// 如果找不到，尝试通过user.openid查找
							if (!record && user.openid) {
								record = recordsByDate[date] && recordsByDate[date][user.openid];
							}
							
							row.push(record ? record.fasting_glucose : ''); // 空腹血糖
							row.push(record ? record.postprandial_glucose : ''); // 餐后血糖
						});
						
						allRows.push(row);
					});
					
					// 创建工作簿并添加工作表
					const workbook = XLSX.utils.book_new();
					const worksheet = XLSX.utils.aoa_to_sheet(allRows);
					
					// 设置标题行合并单元格
					worksheet['!merges'] = [titleRange];
					
					// 设置日期合并单元格
					dates.forEach((_, idx) => {
						const dateColStart = 12 + idx * 2;
						const dateRange = { s: { r: 1, c: dateColStart }, e: { r: 1, c: dateColStart + 1 } };
						worksheet['!merges'].push(dateRange);
					});
					
					// 设置列宽
					worksheet['!cols'] = [
						{ wch: 6 },  // 编号
						{ wch: 12 }, // 姓名(监测用户)
						{ wch: 15 }, // 联系方式
						{ wch: 12 }, // 联系人(负责联系监测用户的人)
						{ wch: 12 }, // 备注
						{ wch: 8 },  // 性别
						{ wch: 12 }, // 电话
						{ wch: 10 }, // 身高(m)
						{ wch: 10 }, // 体重(kg)
						{ wch: 8 },  // BMI
						{ wch: 12 }, // 血压(mmHg)
						{ wch: 12 }, // 基础疾病
					];
					
					// 为每个日期列设置宽度
					dates.forEach(() => {
						worksheet['!cols'].push({ wch: 10 }); // 餐前
						worksheet['!cols'].push({ wch: 10 }); // 餐后
					});
					
					// 尝试设置单元格样式
					try {
						// 计算总列数 - 应该是typeRow的长度
						const totalColumns = typeRow.length;
						
						// 为所有单元格设置居中对齐
						// 注意：sheetjs免费版对样式的支持有限，这里我们创建一个通用的居中样式
						const centerStyle = { alignment: { horizontal: 'center', vertical: 'center' } };
						
						// 为标题行特别设置样式
						const titleStyle = { 
							alignment: { horizontal: 'center', vertical: 'center' }, 
							font: { bold: true, sz: 16 }
						};
						
						// 为表头行设置样式
						const headerStyle = {
							alignment: { horizontal: 'center', vertical: 'center' },
							font: { bold: true }
						};
						
						// 这里我们需要手动循环所有单元格并设置样式
						// 由于sheetjs的限制，我们使用字母+数字的单元格引用方式
						
						// 获取A-Z的字母数组
						const cols = [];
						for (let i = 0; i < 26; i++) {
							cols.push(String.fromCharCode(65 + i)); // A-Z
						}
						// 如果列数超过26，添加AA-ZZ
						if (totalColumns > 26) {
							for (let i = 0; i < 26; i++) {
								for (let j = 0; j < 26; j++) {
									cols.push(String.fromCharCode(65 + i) + String.fromCharCode(65 + j)); // AA-ZZ
								}
							}
						}
						
						// 设置所有单元格的样式
						for (let r = 0; r < allRows.length; r++) {
							for (let c = 0; c < totalColumns && c < cols.length; c++) {
								const cellRef = cols[c] + (r + 1);
								
								if (r === 0) {
									// 标题行
									if (worksheet[cellRef]) {
										worksheet[cellRef].s = titleStyle;
									}
								} else if (r <= 2) {
									// 日期行和表头行
									if (worksheet[cellRef]) {
										worksheet[cellRef].s = headerStyle;
									}
								} else {
									// 数据行
									if (worksheet[cellRef]) {
										worksheet[cellRef].s = centerStyle;
									}
								}
							}
						}
						
						console.log('设置单元格样式成功');
					} catch (e) {
						console.log('设置样式失败，忽略样式: ' + e.message);
					}
					
					XLSX.utils.book_append_sheet(workbook, worksheet, "血糖记录");
					
					// 将工作簿转换为二进制数据
					const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
					
					// 将二进制数据转换为Base64字符串
					const base64Data = Buffer.from(excelBuffer).toString('base64');
					
					// 返回Base64编码的文件内容
					return {
						code: 0,
						data: {
							fileContent: base64Data,
							fileName: `${fileName}.xlsx`,
							fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
						},
						message: '导出Excel数据成功'
					};
				} else {
					// 生成CSV文件 - 同样按照模板格式
					
					// 获取所有日期并排序
					const dates = Object.keys(recordsByDate).sort();
					
					// 创建CSV表头
					let csv = '日常身体数据记录\r\n';
					
					// 第二行：日期
					csv += ',,,,,,,,,,,,';  // 前12列留空
					dates.forEach(date => {
						csv += `,"${date}",`;  // 每个日期占两列
					});
					csv += '\r\n';
					
					// 第三行：血糖类型
					csv += '编号,姓名(监测用户),联系方式,联系人(负责联系监测用户的人),备注,性别,电话,身高(m),体重(kg),BMI,血压(mmHg),基础疾病';
					dates.forEach(() => {
						csv += ',餐前,餐后';
					});
					csv += '\r\n';
					
					// 添加用户数据行
					users.forEach((user, index) => {
						csv += `${index + 1},`;
						csv += `"${user.name || ''}",`;
						csv += `"${user.contactMethod || ''}",`;
						csv += `"${user.contactPerson || ''}",`;
						csv += `"${user.notes || ''}",`;
						csv += `"${user.gender || ''}",`;
						csv += `"${user.phone || ''}",`;
						csv += `"${user.height || ''}",`;
						csv += `"${user.weight || ''}",`;
						csv += `"${user.bmi || ''}",`;
						csv += `"${user.bloodPressure || ''}",`;
						csv += `"${user.basicDisease || ''}"`;
						
						// 添加每个日期的血糖值（空腹和餐后）
						dates.forEach(date => {
							// 尝试通过user._id查找记录
							let record = recordsByDate[date] && recordsByDate[date][user._id];
							// 如果找不到，尝试通过user.openid查找
							if (!record && user.openid) {
								record = recordsByDate[date] && recordsByDate[date][user.openid];
							}
							
							csv += `,${record ? record.fasting_glucose : ''}`;
							csv += `,${record ? record.postprandial_glucose : ''}`;
						});
						
						csv += '\r\n';
					});
					
					// 将CSV内容转换为Base64字符串
					const base64Data = Buffer.from(csv).toString('base64');
					
					// 返回Base64编码的文件内容
					return {
						code: 0,
						data: {
							fileContent: base64Data,
							fileName: `${fileName}.csv`,
							fileType: 'text/csv'
						},
						message: '导出CSV数据成功'
					};
				}
			} catch (error) {
				console.error('导出数据失败', error);
				if (error.stack) {
					console.error('错误堆栈:', error.stack);
				}
				return {
					code: 500,
					message: `导出数据失败: ${error.message || '未知错误'}`
				};
			}
		}
		
		default:
			return {
				code: -1,
				message: '未知操作类型'
			}
	}
}; 