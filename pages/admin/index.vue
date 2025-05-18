<template>
	<view class="container">
		<view class="header">
			<text class="title">数据管理</text>
		</view>
		
		<view class="admin-container">
			
			
			<view class="admin-panel">
				<view class="panel-title">导出数据</view>
				<view class="panel-content">
					<view class="export-options">
						<view class="export-option">
							<text class="option-label">数据范围：</text>
							<picker @change="handleDateRangeChange" :value="dateRangeIndex" :range="dateRanges">
								<view class="picker-value">
									<text>{{dateRanges[dateRangeIndex]}}</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</view>
						
						<view class="export-option" v-if="dateRangeIndex === '3'">
							<text class="option-label">开始日期：</text>
							<picker mode="date" :value="customStartDate" @change="onStartDateChange">
								<view class="picker-value">
									<text>{{customStartDate}}</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</view>
						
						<view class="export-option" v-if="dateRangeIndex === '3'">
							<text class="option-label">结束日期：</text>
							<picker mode="date" :value="customEndDate" @change="onEndDateChange">
								<view class="picker-value">
									<text>{{customEndDate}}</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</view>
						
						<view class="export-option">
							<text class="option-label">导出格式：</text>
							<picker @change="handleFormatChange" :value="formatIndex" :range="formats">
								<view class="picker-value">
									<text>{{formats[formatIndex]}}</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</view>
					</view>
					
					<button class="export-button" type="primary" @click="exportData" :loading="exportLoading">导出数据</button>
					
					<!-- 添加导出未填数据按钮 -->
					<view class="export-missing-section">
						<view class="export-option">
							<text class="option-label">开始日期：</text>
							<picker mode="date" :value="missingStartDate" @change="onMissingStartDateChange">
								<view class="picker-value">
									<text>{{missingStartDate}}</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</view>
						
						<view class="export-option">
							<text class="option-label">结束日期：</text>
							<picker mode="date" :value="missingEndDate" @change="onMissingEndDateChange">
								<view class="picker-value">
									<text>{{missingEndDate}}</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</view>
						
						<button class="export-button export-missing-button" type="primary" @click="exportMissingData" :loading="missingExportLoading">导出未填报名单</button>
					</view>
				</view>
			</view>
			
			<view class="admin-panel">
				<view class="panel-title">系统统计</view>
				<view class="panel-content">
					<view class="stats-grid">
						<view class="stats-item">
							<text class="stats-value">{{userCount}}</text>
							<text class="stats-label">用户总数</text>
						</view>
						<view class="stats-item">
							<text class="stats-value">{{recordCount}}</text>
							<text class="stats-label">记录总数</text>
						</view>
						<view class="stats-item">
							<text class="stats-value">{{lastWeekCount}}</text>
							<text class="stats-label">上周新增</text>
						</view>
						<view class="stats-item">
							<text class="stats-value">{{activeUserCount}}</text>
							<text class="stats-label">活跃用户</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- QR Code Modal -->
		<view class="qr-modal" v-if="showQRModal" @click="hideQRCode">
			<view class="qr-content" @click.stop>
				<view class="qr-title">管理员注册二维码</view>
				<view class="qr-description">扫描下方二维码成为管理员</view>
				<image class="qr-image" src="/static/image/addadmin.jpg" mode="aspectFit"></image>
				<button class="qr-close" @click="hideQRCode">关闭</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { getStatistics, exportAllData } from '../../common/api/admin.js';
	
	export default {
		data() {
			return {
				dateRanges: ['最近一周', '最近一个月', '最近三个月', '自定义'],
				dateRangeIndex: 1,
				customStartDate: '',  // 先设为空，在created中初始化
				customEndDate: '',    // 先设为空，在created中初始化
				formats: ['Excel (.xlsx)', 'CSV (.csv)'],
				formatIndex: 0,
				userCount: 0,
				recordCount: 0,
				lastWeekCount: 0,
				activeUserCount: 0,
				loading: false,
				exportLoading: false,        // 导出数据的loading状态
				missingExportLoading: false, // 导出未填报名单的loading状态
				showQRModal: false,  // 控制QR码弹窗显示
				missingStartDate: '', // 未填报名单开始日期
				missingEndDate: ''    // 未填报名单结束日期
			}
		},
		created() {
			// 初始化日期
			this.customEndDate = this.getCurrentDate();
			this.customStartDate = this.getLastMonthDate();
			this.missingEndDate = this.getCurrentDate();
			this.missingStartDate = this.getLastWeekDate(); // 默认显示最近一周
		},
		onLoad() {
			// 获取实际统计数据
			this.loadStatistics();
		},
		methods: {
			
			
			loadStatistics() {
				const openid = uni.getStorageSync('openid');
				if (!openid) {
					uni.showToast({
						title: '登录状态已失效',
						icon: 'none'
					});
					
					// 跳转到登录页
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/login/index'
						});
					}, 1500);
					return;
				}
				
				this.loading = true;
				uni.showLoading({
					title: '加载中...'
				});
				
				// 调用云函数获取统计数据
				getStatistics(openid)
					.then(res => {
						this.loading = false;
						uni.hideLoading();
						
						if (res.code === 0) {
							this.userCount = res.data.userCount;
							this.recordCount = res.data.recordCount;
							this.lastWeekCount = res.data.lastWeekCount;
							this.activeUserCount = res.data.activeUserCount;
						} else if (res.code === 403) {
							// 无权访问
							uni.showToast({
								title: '无权访问管理页面',
								icon: 'none'
							});
							
							// 跳转回普通用户页面
							setTimeout(() => {
								uni.switchTab({
									url: '/pages/data-entry/index'
								});
							}, 1500);
						} else {
							uni.showToast({
								title: '获取统计数据失败',
								icon: 'none'
							});
						}
					})
					.catch(err => {
						this.loading = false;
						uni.hideLoading();
						uni.showToast({
							title: '获取统计数据失败',
							icon: 'none'
						});
						console.error('获取统计数据出错', err);
					});
			},
			getCurrentDate() {
				const date = new Date();
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${year}-${month}-${day}`;
			},
			getLastMonthDate() {
				const date = new Date();
				date.setMonth(date.getMonth() - 1);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${year}-${month}-${day}`;
			},
			handleDateRangeChange(e) {
				this.dateRangeIndex = e.detail.value;
				console.log(this.dateRangeIndex);
				
				console.log(this.dateRangeIndex==="3");
			},
			handleFormatChange(e) {
				this.formatIndex = e.detail.value;
				console.log(this.formatIndex);
			},
			onStartDateChange(e) {
				this.customStartDate = e.detail.value;
			},
			onEndDateChange(e) {
				this.customEndDate = e.detail.value;
			},
			onMissingStartDateChange(e) {
				this.missingStartDate = e.detail.value;
			},
			onMissingEndDateChange(e) {
				this.missingEndDate = e.detail.value;
			},
			getLastWeekDate() {
				const date = new Date();
				date.setDate(date.getDate() - 7);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${year}-${month}-${day}`;
			},
			exportData() {
				const openid = uni.getStorageSync('openid');
				if (!openid) {
					uni.showToast({
						title: '登录状态已失效',
						icon: 'none'
					});
					return;
				}
				
				// 构造日期范围
				let dateRange = null;
				switch (this.dateRangeIndex) {
					case "0": // 最近一周
						{
							const endDate = new Date();
							const startDate = new Date();
							startDate.setDate(endDate.getDate() - 7);
							dateRange = {
								startDate: startDate.toISOString().split('T')[0],
								endDate: endDate.toISOString().split('T')[0]
							};
						}
						break;
					case "1": // 最近一个月
						{
							const endDate = new Date();
							const startDate = new Date();
							startDate.setMonth(endDate.getMonth() - 1);
							dateRange = {
								startDate: startDate.toISOString().split('T')[0],
								endDate: endDate.toISOString().split('T')[0]
							};
						}
						break;
					case "2": // 最近三个月
						{
							const endDate = new Date();
							const startDate = new Date();
							startDate.setMonth(endDate.getMonth() - 3);
							dateRange = {
								startDate: startDate.toISOString().split('T')[0],
								endDate: endDate.toISOString().split('T')[0]
							};
						}
						break;
					case "3": // 自定义
						dateRange = {
							startDate: this.customStartDate,
							endDate: this.customEndDate
						};
						console.log('自定义日期范围:', dateRange);
						
						break;
				}
				
				this.exportLoading = true;
				uni.showLoading({
					title: '导出中...'
				});
				
				// 获取文件格式
				const format = this.formats[this.formatIndex].toLowerCase().split(' ')[0];
				// 去掉括号部分
				const formatType = format === 'excel' ? 'xlsx' : 'csv';
				
				// 正常导出
				this.doExport(openid, dateRange, formatType);
			},
			
			// 实际执行导出
			doExport(openid, dateRange, formatType) {
				// 调用云函数导出数据
				exportAllData(openid, dateRange, formatType)
					.then(res => {
						this.exportLoading = false;
						uni.hideLoading();
						
						if (res.code === 0) {
							// 接收云函数返回的文件内容（Base64格式）
							const fileData = res.data;
							
							try {
								// 检查文件数据是否存在
								if (!fileData.fileContent) {
									throw new Error('文件内容为空');
								}
								
								// 直接保存云函数生成好的文件
								this.saveFileFromBase64(fileData.fileName, fileData.fileContent, fileData.fileType);
								
								uni.showToast({
									title: '数据导出成功',
									icon: 'success'
								});
							} catch (error) {
								console.error('保存导出文件失败', error);
								uni.showModal({
									title: '导出失败',
									content: `处理数据时出错: ${error.message || '未知错误'}`,
									showCancel: false
								});
							}
						} else if (res.code === 403) {
							// 无权访问
							uni.showToast({
								title: '无权执行导出操作',
								icon: 'none'
							});
						} else {
							uni.showModal({
								title: '导出失败',
								content: res.message || '未知错误',
								showCancel: false
							});
						}
					})
					.catch(err => {
						this.exportLoading = false;
						uni.hideLoading();
						uni.showModal({
							title: '导出数据失败',
							content: err.message || '未知错误',
							showCancel: false
						});
						console.error('导出数据出错', err);
					});
			},
			
			// 从Base64保存文件
			saveFileFromBase64(fileName, base64Data, mimeType) {
				// 使用推荐的新API检查环境
				let isMP = false;
				try {
					// 检测微信小程序环境
					if (typeof wx !== 'undefined') {
						const appBaseInfo = wx.getAppBaseInfo ? wx.getAppBaseInfo() : null;
						isMP = appBaseInfo ? appBaseInfo.platform === 'mp-weixin' : false;
						// 二次检查
						if (!isMP && typeof uni !== 'undefined' && uni.getSystemInfoSync) {
							const sysInfo = uni.getSystemInfoSync();
							isMP = sysInfo.uniPlatform === 'mp-weixin';
						}
					}
				} catch (e) {
					console.warn('环境检测失败，默认使用移动端处理', e);
					// 如果检测失败，默认为移动端处理
					isMP = true;
				}
				
				// 检查环境，任何非浏览器环境都使用移动端处理方法
				const isMobile = isMP || (typeof window === 'undefined');
				
				if (isMobile) {
					// 移动端和小程序处理
					this.saveFileOnMobileFromBase64(fileName, base64Data, mimeType);
				} else {
					// 网页端处理 (H5环境)
					this.saveFileOnWebFromBase64(fileName, base64Data, mimeType);
				}
			},
			
			// 移动端从Base64保存文件
			saveFileOnMobileFromBase64(fileName, base64Data, mimeType) {
				try {
					console.log('开始处理文件保存:', fileName);
					
					// 先尝试直接预览，如果文件是PDF等可预览的类型
					const isPdfOrExcel = /\.(pdf|xlsx|xls|csv)$/i.test(fileName);
					if (isPdfOrExcel) {
						console.log('尝试直接预览文件内容');
						this.previewFileFromBase64(fileName, base64Data, mimeType);
						return;
					}
					
					// 接下来尝试保存文件
					this.saveFileToLocalStorage(fileName, base64Data, mimeType);
				} catch (error) {
					console.error('处理文件保存时出错', error);
					uni.showModal({
						title: '保存文件出错',
						content: error.message || '未知错误',
						showCancel: false
					});
				}
			},
			
			// 尝试直接预览文件内容，跳过保存步骤
			previewFileFromBase64(fileName, base64Data, mimeType) {
				try {
					// 获取文件系统管理器
					const fs = uni.getFileSystemManager();
					const tempFilePath = `${uni.env.USER_DATA_PATH}/temp_preview_${fileName}`;
					
					// 转换Base64为ArrayBuffer
					let arrayBuffer = this.convertBase64ToArrayBuffer(base64Data);
					
					// 写入临时文件
					try {
						// 检查并创建目录
						const dirPath = tempFilePath.substring(0, tempFilePath.lastIndexOf('/'));
						try {
							fs.accessSync(dirPath);
						} catch(e) {
							console.log('创建预览临时目录');
							fs.mkdirSync(dirPath, true);
						}
						
						// 尝试删除已存在的临时文件
						try {
							fs.accessSync(tempFilePath);
							fs.unlinkSync(tempFilePath);
							console.log('删除已存在的预览临时文件');
						} catch(e) {
							// 文件不存在，不需要操作
						}
						
						// 写入新临时文件
						fs.writeFileSync(tempFilePath, arrayBuffer, 'binary');
						console.log('预览临时文件写入成功:', tempFilePath);
						
						// 直接使用uni.openDocument预览
						uni.openDocument({
							filePath: tempFilePath,
							showMenu: true,
							success: () => {
								console.log('成功打开预览文档');
								uni.showToast({
									title: '文件已打开',
									icon: 'success'
								});
								
								// 提示用户可以保存
								setTimeout(() => {
									uni.showModal({
										title: '文件已打开',
										content: '您可以使用右上角的"更多"选项保存文件',
										confirmText: '我知道了',
										showCancel: false
									});
								}, 1000);
							},
							fail: (err) => {
								console.error('预览文档失败', err);
								// 预览失败，回退到保存
								uni.showModal({
									title: '预览失败',
									content: '无法直接预览，将尝试保存文件',
									showCancel: false,
									success: () => {
										this.saveFileToLocalStorage(fileName, base64Data, mimeType);
									}
								});
							}
						});
					} catch (writeError) {
						console.error('写入预览临时文件失败', writeError);
						throw new Error(`写入预览临时文件失败: ${writeError.message || '未知错误'}`);
					}
				} catch (error) {
					console.error('预览文件失败', error);
					// 回退到保存
					this.saveFileToLocalStorage(fileName, base64Data, mimeType);
				}
			},
			
			// 将文件保存到本地存储
			saveFileToLocalStorage(fileName, base64Data, mimeType) {
				try {
					console.log('尝试保存文件到本地存储');
					// 获取文件系统管理器
					const fs = uni.getFileSystemManager();
					const tempFilePath = `${uni.env.USER_DATA_PATH}/temp_${fileName}`;
					
					// 转换Base64为ArrayBuffer
					let arrayBuffer = this.convertBase64ToArrayBuffer(base64Data);
					
					// 确保目录存在
					try {
						const dirPath = tempFilePath.substring(0, tempFilePath.lastIndexOf('/'));
						try {
							fs.accessSync(dirPath);
						} catch(e) {
							fs.mkdirSync(dirPath, true);
							console.log('创建保存目录');
						}
					} catch (dirError) {
						console.error('创建目录失败', dirError);
					}
					
					// 尝试删除同名文件
					try {
						fs.accessSync(tempFilePath);
						fs.unlinkSync(tempFilePath);
						console.log('删除同名文件');
					} catch(e) {
						// 文件不存在，不需要操作
					}
					
					// 写入临时文件
					fs.writeFileSync(tempFilePath, arrayBuffer, 'binary');
					console.log('文件写入成功:', tempFilePath);
					
					// 使用uni.saveFile保存(这是跨平台的)
					uni.saveFile({
						tempFilePath: tempFilePath,
						success: (res) => {
							console.log('文件保存成功:', res.savedFilePath);
							
							// 打开保存的文件
							uni.openDocument({
								filePath: res.savedFilePath,
								showMenu: true,
								success: () => {
									console.log('打开保存的文件成功');
									uni.showToast({
										title: '文件已保存并打开',
										icon: 'success'
									});
								},
								fail: (openErr) => {
									console.error('打开文件失败', openErr);
									uni.showModal({
										title: '保存成功',
										content: '文件已保存，但无法自动打开',
										showCancel: false
									});
								}
							});
						},
						fail: (saveErr) => {
							console.error('保存文件失败', saveErr);
							
							// 如果是小程序环境，提示用户长按图片或使用右上角菜单保存
							if (typeof wx !== 'undefined') {
								uni.showModal({
									title: '保存失败',
									content: '请使用右上角"..."菜单中的"复制链接"或"分享给朋友"功能来保存文件',
									confirmText: '我知道了',
									showCancel: false
								});
							} else {
								uni.showModal({
									title: '保存失败',
									content: `保存文件失败: ${saveErr.errMsg || '未知错误'}`,
									showCancel: false
								});
							}
						}
					});
				} catch (error) {
					console.error('保存到本地存储失败', error);
					uni.showModal({
						title: '保存失败',
						content: error.message || '未知错误',
						showCancel: false
					});
				}
			},
			
			// 转换Base64为ArrayBuffer - 统一处理各种环境
			convertBase64ToArrayBuffer(base64Data) {
				try {
					// 处理Base64字符串，去掉可能的前缀
					let base64Str = base64Data;
					if (base64Str.includes(',')) {
						base64Str = base64Str.split(',')[1];
					}
					// 确保结尾没有换行符等特殊字符
					base64Str = base64Str.replace(/[\r\n]/g, '');
					
					let arrayBuffer;
					
					// 首先尝试使用wx的API(微信小程序环境)
					if (typeof wx !== 'undefined' && wx.base64ToArrayBuffer) {
						try {
							arrayBuffer = wx.base64ToArrayBuffer(base64Str);
							console.log('使用wx.base64ToArrayBuffer成功');
						} catch (wxError) {
							console.warn('wx.base64ToArrayBuffer失败', wxError);
						}
					}
					
					// 如果wx的API失败，尝试使用uni的API
					if (!arrayBuffer && uni.base64ToArrayBuffer) {
						try {
							arrayBuffer = uni.base64ToArrayBuffer(base64Str);
							console.log('使用uni.base64ToArrayBuffer成功');
						} catch (uniError) {
							console.warn('uni.base64ToArrayBuffer失败', uniError);
						}
					}
					
					// 如果上面的方法都失败，使用通用的JavaScript方法
					if (!arrayBuffer) {
						console.log('使用通用JavaScript方法转换Base64');
						// 通用的JavaScript方法
						const binaryString = this.atob(base64Str);
						const bytes = new Uint8Array(binaryString.length);
						for (let i = 0; i < binaryString.length; i++) {
							bytes[i] = binaryString.charCodeAt(i);
						}
						arrayBuffer = bytes.buffer;
					}
					
					if (!arrayBuffer) {
						throw new Error('无法转换Base64到ArrayBuffer');
					}
					
					return arrayBuffer;
				} catch (error) {
					console.error('Base64转换失败', error);
					throw new Error(`Base64转换失败: ${error.message || '未知错误'}`);
				}
			},
			
			// 实现跨平台的atob函数
			atob(base64) {
				// 检查是否有原生atob
				if (typeof atob === 'function') {
					return atob(base64);
				}
				
				// 自己实现atob
				const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
				let output = '';
				for (
					let bc = 0, bs, buffer, idx = 0;
					(buffer = base64.charAt(idx++));
					~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4)
						? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
						: 0
				) {
					buffer = chars.indexOf(buffer);
				}
				return output;
			},
			
			// 网页端从Base64保存文件 (仅适用于H5环境)
			saveFileOnWebFromBase64(fileName, base64Data, mimeType) {
				try {
					// 检查是否在H5环境
					if (typeof window === 'undefined' || typeof document === 'undefined' ||
						typeof Blob === 'undefined' || typeof URL === 'undefined') {
						throw new Error('当前环境不支持网页下载方式');
					}
					
					// 创建Blob对象
					const byteCharacters = atob(base64Data);
					const byteNumbers = new Array(byteCharacters.length);
					for (let i = 0; i < byteCharacters.length; i++) {
						byteNumbers[i] = byteCharacters.charCodeAt(i);
					}
					const byteArray = new Uint8Array(byteNumbers);
					const blob = new Blob([byteArray], { type: mimeType });
					
					// 创建下载链接
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = fileName;
					
					// 触发下载
					document.body.appendChild(link);
					link.click();
					
					// 清理
					setTimeout(() => {
						document.body.removeChild(link);
						URL.revokeObjectURL(url);
					}, 0);
					
					uni.showToast({
						title: '文件下载成功',
						icon: 'success'
					});
				} catch (error) {
					console.error('网页下载方式失败', error);
					// 如果网页下载方式失败，尝试使用移动端方法
					this.saveFileOnMobileFromBase64(fileName, base64Data, mimeType);
				}
			},
			
			// 导出未填报名单
			exportMissingData() {
				const openid = uni.getStorageSync('openid');
				if (!openid) {
					uni.showToast({
						title: '登录状态已失效',
						icon: 'none'
					});
					return;
				}
				
				this.missingExportLoading = true;
				uni.showLoading({
					title: '导出中...'
				});
				
				// 获取文件格式
				const format = this.formats[this.formatIndex].toLowerCase().split(' ')[0];
				const formatType = format === 'excel' ? 'xlsx' : 'csv';
				
				// 调用云函数导出未填报名单
				uniCloud.callFunction({
					name: 'admin-service',
					data: {
						action: 'exportMissingRecords',
						params: {
							dateRange: {
								startDate: this.missingStartDate,
								endDate: this.missingEndDate
							},
							format: formatType
						}
					}
				}).then(res => {
					this.missingExportLoading = false;
					uni.hideLoading();
					
					if (res.result.code === 0) {
						// 接收云函数返回的文件内容（Base64格式）
						const fileData = res.result.data;
						
						try {
							// 检查文件数据是否存在
							if (!fileData.fileContent) {
								throw new Error('文件内容为空');
							}
							
							// 直接保存云函数生成好的文件
							this.saveFileFromBase64(fileData.fileName, fileData.fileContent, fileData.fileType);
							
							uni.showToast({
								title: '导出成功',
								icon: 'success'
							});
						} catch (error) {
							console.error('保存导出文件失败', error);
							uni.showModal({
								title: '导出失败',
								content: `处理数据时出错: ${error.message || '未知错误'}`,
								showCancel: false
							});
						}
					} else if (res.result.code === 403) {
						// 无权访问
						uni.showToast({
							title: '无权执行导出操作',
							icon: 'none'
						});
					} else {
						uni.showModal({
							title: '导出失败',
							content: res.result.message || '未知错误',
							showCancel: false
						});
					}
				}).catch(err => {
					this.missingExportLoading = false;
					uni.hideLoading();
					uni.showModal({
						title: '导出数据失败',
						content: err.message || '未知错误',
						showCancel: false
					});
					console.error('导出数据出错', err);
				});
			}
		}
	}
</script>

<style>
	.container {
		padding: 20px;
	}
	
	.header {
		margin-bottom: 20px;
	}
	
	.title {
		font-size: 24px;
		font-weight: bold;
		color: #4095E5;
	}
	
	.admin-container {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	
	.admin-panel {
		background-color: #fff;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	
	.panel-title {
		font-size: 18px;
		padding: 15px;
		background-color: #f8f8f8;
		border-bottom: 1px solid #eee;
		font-weight: bold;
	}
	
	.panel-content {
		padding: 15px;
	}
	
	.export-options {
		margin-bottom: 20px;
	}
	
	.export-option {
		display: flex;
		align-items: center;
		margin-bottom: 15px;
	}
	
	.option-label {
		width: 100px;
		flex-shrink: 0;
	}
	
	.picker-value {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 40px;
		border: 1px solid #ddd;
		border-radius: 5px;
		padding: 0 10px;
	}
	
	.picker-arrow {
		color: #999;
		font-size: 12px;
	}
	
	.export-button {
		width: 100%;
	}
	
	/* 添加管理员按钮样式 */
	.admin-button {
		display: block;
		width: 100%;
		background-color: #4095E5;
		color: #fff;
		padding: 12px 0;
		text-align: center;
		border-radius: 5px;
		font-size: 16px;
		margin-bottom: 10px;
	}
	
	.stats-grid {
		display: flex;
		flex-wrap: wrap;
	}
	
	.stats-item {
		width: 50%;
		padding: 15px;
		text-align: center;
	}
	
	.stats-value {
		font-size: 24px;
		font-weight: bold;
		color: #4095E5;
		display: block;
		margin-bottom: 5px;
	}
	
	.stats-label {
		color: #666;
	}
	
	/* QR码弹窗样式 */
	.qr-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
	}
	
	.qr-content {
		background-color: #fff;
		border-radius: 10px;
		padding: 20px;
		width: 80%;
		max-width: 320px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.qr-title {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 10px;
		color: #4095E5;
	}
	
	.qr-description {
		font-size: 14px;
		color: #666;
		margin-bottom: 20px;
		text-align: center;
	}
	
	.qr-image {
		width: 200px;
		height: 200px;
		margin-bottom: 20px;
	}
	
	.qr-close {
		width: 80%;
		margin-top: 10px;
		background-color: #4095E5;
		color: #fff;
	}
	
	.export-missing-section {
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid #eee;
	}
	
	.export-missing-button {
		background-color: #67C23A;
	}
</style> 