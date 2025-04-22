<template>
	<view class="container">
		<view class="header">
			<text class="title">血糖历史记录</text>
		</view>
		
		<view class="filter-container">
			<view class="date-filter">
				<text class="filter-label">日期范围：</text>
				<view class="date-pickers">
					<uni-datetime-picker type="date" v-model="startDate" />
					<text class="date-separator">至</text>
					<uni-datetime-picker type="date" v-model="endDate" />
				</view>
			</view>
			<button class="filter-button" type="primary" @click="searchRecords">筛选</button>
		</view>
		
		<view class="chart-container" v-if="hasRecords">
			<view class="chart-title">血糖变化趋势</view>
			<view class="chart-legend">
				<view class="legend-item">
					<view class="legend-color" style="background-color: #4095E5;"></view>
					<text class="legend-text">空腹血糖</text>
				</view>
				<view class="legend-item">
					<view class="legend-color" style="background-color: #FF6B6B;"></view>
					<text class="legend-text">餐后血糖</text>
				</view>
			</view>
			<!-- 图表区域 -->
			<canvas canvas-id="glucoseChart" id="glucoseChart" class="glucose-chart" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend"></canvas>
		</view>
		
		<view class="list-container">
			<view class="list-header">
				<text class="list-header-item">日期</text>
				<text class="list-header-item">空腹血糖</text>
				<text class="list-header-item">餐后血糖</text>
			</view>
			
			<view class="no-data" v-if="!hasRecords">
				<text>暂无记录</text>
			</view>
			
			<scroll-view class="record-list" scroll-y v-else>
				<view class="record-item" v-for="(item, index) in records" :key="index">
					<text class="record-date">{{item.date}}</text>
					<text class="record-value">{{item.fastingGlucose}}</text>
					<text class="record-value">{{item.postprandialGlucose}}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>

	import { checkLoginAndRedirect } from '../../common/api/login.js';
	import { getWechatLoginState } from '../../common/api/wechat.js';

	import uCharts  from './zujian/u-charts.js';

	export default {
		data() {
			return {
				startDate: this.getLastMonthDate(),
				endDate: this.getCurrentDate(),
				records: [],
				loading: false,
				page: 1,
				pageSize: 20,
				total: 0,
				hasMore: false,
				cWidth: 0,
				cHeight: 0,
				pixelRatio: 1,
				glucoseChart: null
			}
		},
		computed: {
			hasRecords() {
				return this.records && this.records.length > 0;
			}
		},
		methods: {
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
			// 格式化日期显示 - 简化为MM-DD格式
			formatShortDate(dateString) {
				if (!dateString) return '';
				
				const date = new Date(dateString);
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${month}-${day}`;
			},
			// 从云函数加载数据
			loadRecordsFromCloud() {
				this.loading = true;
				
				// 获取用户ID
				const loginState = getWechatLoginState();
				if (!loginState.isLoggedIn) {
					uni.showToast({
						title: '您尚未登录',
						icon: 'none'
					});
					setTimeout(() => {
						checkLoginAndRedirect();
					}, 1500);
					return;
				}
				
				// 调用云函数获取血糖记录列表
				uniCloud.callFunction({
					name: 'glucose-service',
					data: {
						action: 'list',
						params: {
							userId: loginState.userInfo._id || loginState.openid,
							startDate: this.startDate,
							endDate: this.endDate,
							page: this.page,
							pageSize: this.pageSize
						}
					}
				}).then(res => {
					this.loading = false;
					if (res.result && res.result.code === 0) {
						// 格式化数据
						const formattedRecords = (res.result.data.list || []).map(item => {
							return {
								id: item._id,
								date: this.formatShortDate(item.date),
								fastingGlucose: item.fasting_glucose.toFixed(1),
								postprandialGlucose: item.postprandial_glucose.toFixed(1)
							};
						});
						
						if (this.page === 1) {
							// 第一页，直接替换数据
							this.records = formattedRecords;
							// 更新图表
							if (formattedRecords.length > 0) {
								this.drawGlucoseChart();
							}
						} else {
							// 不是第一页，追加数据
							this.records = [...this.records, ...formattedRecords];
						}
						
						// 更新分页信息
						this.total = res.result.data.total || 0;
						this.hasMore = this.records.length < this.total;
						
						if (this.records.length === 0) {
							uni.showToast({
								title: '暂无记录',
								icon: 'none'
							});
						}
					} else {
						uni.showToast({
							title: (res.result && res.result.message) || '获取记录失败',
							icon: 'none'
						});
					}
				}).catch(err => {
					this.loading = false;
					uni.showToast({
						title: '网络错误，请稍后重试',
						icon: 'none'
					});
					console.error('获取血糖记录失败', err);
				});
			},
			// 搜索记录
			searchRecords() {
				// 重置页码
				this.page = 1;
				this.loadRecordsFromCloud();
			},
			// 加载更多
			loadMore() {
				if (this.loading || !this.hasMore) return;
				
				this.page++;
				this.loadRecordsFromCloud();
			},
			// 绘制血糖趋势图表
			drawGlucoseChart() {
				try {
					// 检查是否有足够的数据
					if (!this.records || this.records.length === 0) {
						console.log('没有足够的数据来绘制图表');
						return;
					}
					
					// 处理数据，按日期倒序排列，最多显示7个点
					const displayRecords = [...this.records].reverse().slice(0, 7);
					
					// 准备图表数据
					const categories = displayRecords.map(item => item.date);
					const fastingData = displayRecords.map(item => parseFloat(item.fastingGlucose));
					const postprandialData = displayRecords.map(item => parseFloat(item.postprandialGlucose));
					
					console.log('图表数据:', { categories, fastingData, postprandialData });
					
					// 计算Y轴最小值和最大值，留出足够空间
					const allValues = [...fastingData, ...postprandialData].filter(val => !isNaN(val));
					if (allValues.length === 0) {
						console.log('没有有效的数据点');
						return;
					}
					
					const minValue = Math.min(...allValues);
					const maxValue = Math.max(...allValues);
					// 扩大Y轴范围，确保数据不挤在一起
					const range = Math.max(maxValue - minValue, 1); // 防止range为0
					const yAxisMin = Math.max(0, minValue - range * 0.2);
					const yAxisMax = maxValue + range * 0.2;
					 
					// 获取canvas上下文
					const ctx = uni.createCanvasContext('glucoseChart', this);
					
					// 确保Canvas尺寸正确设置
					this.cWidth = Math.max(this.cWidth, 300); // 确保最小宽度
					this.cHeight = Math.max(this.cHeight, 280); // 确保最小高度
					
					// 简化图表配置，确保数据显示正确
					const options = {
						$this: this,
						canvasId: 'glucoseChart',
						type: 'line',
						categories: categories,
						series: [{
							name: '空腹血糖',
							data: fastingData,
							color: '#4095E5',
							pointShape: 'circle',
							pointStyle: 'fill',    // 实心点
							pointSize: 8,          // 增大点大小
							format: (val) => val.toFixed(1)
						}, {
							name: '餐后血糖',
							data: postprandialData,
							color: '#FF6B6B',
							pointShape: 'circle',
							pointStyle: 'fill',    // 实心点
							pointSize: 8,          // 增大点大小
							format: (val) => val.toFixed(1)
						}],
						width: this.cWidth,
						height: this.cHeight,
						pixelRatio: this.pixelRatio,
						animation: false,        // 关闭动画
						background: '#FFFFFF',
						padding: [30, 15, 50, 20], // [上, 右, 下, 左] 进一步减小左右边距
						dataLabel: true,         // 显示数据标签
						dataPointShape: true,     // 显示数据点
						enableScroll: false,      // 禁用滚动
						legend: {
							show: false           // 图例已在外部显示
						},
						xAxis: {
							type: 'category',     // 类别轴
							boundaryGap: false,    // 减少两端留白
							disableGrid: true,     // 不显示网格线
							fontColor: '#666666',
							fontSize: 10,          // 减小字体大小
							itemCount: categories.length, // 显示所有类别
							axisLine: true,        // 显示轴线
							margin: 3              // 进一步减小X轴边距
						},
						yAxis: {
							position: 'left',     // 轴位置
							type: 'value',        // 数值轴
							disabled: false,      // 显示Y轴
							disableGrid: false,   // 显示网格线
							splitNumber: 5,       // Y轴分段数
							gridType: 'dash',     // 网格线类型
							gridColor: '#CCCCCC', // 网格线颜色
							min: yAxisMin,        // 最小值
							max: yAxisMax,        // 最大值
							format: (val) => val.toFixed(1), // 格式化
							axisLine: true,       // 显示轴线
							fontColor: '#666666',
							fontSize: 10,
							title: '血糖值',       // Y轴标题
							titleFontColor: '#666666',
							width: 10            // 进一步减小Y轴宽度
						},
						extra: {
							line: {
								type: 'straight',   // 直线
								width: 3,           // 线宽
								activeType: 'hollow', // 点击后突出显示点
								activeColor: '#000000', // 点击激活颜色
								activeRadius: 10     // 点击激活半径
							},
							tooltip: {
								showBox: true,
								showArrow: true,
								borderWidth: 1,
								borderRadius: 3,
								borderColor: '#CCCCCC',
								bgColor: '#FFFFFF',
								fontColor: '#666666',
								fontSize: 12
							}
						},
						context: ctx
					};
					
					// 先绘制背景，确保画布已清空
					ctx.setFillStyle('#FFFFFF');
					ctx.fillRect(0, 0, this.cWidth, this.cHeight);
					
					// 创建图表实例并立即绘制
					this.glucoseChart = new uCharts(options);
					
					// 强制绘制图表 - 关键修复
					ctx.draw(true, () => {
						console.log('Canvas绘制完成');
						// 200ms后再次更新，确保图表显示
						setTimeout(() => {
							if (this.glucoseChart) {
								try {
									console.log('执行更新...');
									// 重新创建图表实例
									this.glucoseChart = new uCharts(options);
									// 立即重绘
									ctx.draw(true);
								} catch (err) {
									console.error('更新图表失败', err);
								}
							}
						}, 200);
					});
					
				} catch (error) {
					console.error('绘制图表过程中出错', error);
					uni.showToast({
						title: '图表绘制失败',
						icon: 'none'
					});
				}
			},
			// 图表触摸事件处理
			touchstart(e) {
				try {
					if (this.glucoseChart) {
						this.glucoseChart.touchLegend(e);
						this.glucoseChart.showToolTip(e, {
							format: function(item, category) {
								return category + ' ' + item.name + ': ' + item.data + ' mmol/L';
							},
							fontSize: 13,
							lineHeight: 22
						});
					}
				} catch (error) {
					console.error('处理触摸事件失败', error);
				}
			},
			touchmove(e) {
				try {
					if (this.glucoseChart) {
						this.glucoseChart.showToolTip(e, {
							format: function(item, category) {
								return category + ' ' + item.name + ': ' + item.data + ' mmol/L';
							},
							fontSize: 13,
							lineHeight: 22
						});
					}
				} catch (error) {
					console.error('处理移动事件失败', error);
				}
			},
			touchend(e) {
				try {
					if (this.glucoseChart) {
						this.glucoseChart.touchLegend(e);
					}
				} catch (error) {
					console.error('处理触摸结束事件失败', error);
				}
			}
		},
		onLoad() {
			console.log('onLoad');
			
			// 检查登录状态，如果未登录则重定向到登录页面
			if (!checkLoginAndRedirect()) {
				return; // 用户未登录，已重定向到登录页面
			}
			// 加载数据
			this.loadRecordsFromCloud();
		},
		onShow() {
			console.log('onShow');
			
			// 每次页面显示时检查登录状态
			if (!checkLoginAndRedirect()) {
				return; // 用户未登录，已重定向到登录页面
			}
		},
		onReady() {
			// 页面渲染完成后如果有数据则绘制图表
			// 添加延迟，确保页面完全加载
			setTimeout(() => {
				if (this.hasRecords) {
					console.log('onReady开始绘制图表');
					this.drawGlucoseChart();
				}
			}, 300);
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.page = 1;
			this.loadRecordsFromCloud();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		// 触底加载更多
		onReachBottom() {
			this.loadMore();
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
	
	.filter-container {
		background-color: #fff;
		border-radius: 10px;
		padding: 15px;
		margin-bottom: 20px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	
	.date-filter {
		display: flex;
		flex-direction: column;
		margin-bottom: 10px;
	}
	
	.filter-label {
		margin-bottom: 5px;
		font-weight: bold;
	}
	
	.date-pickers {
		display: flex;
		align-items: center;
	}
	
	.date-separator {
		margin: 0 10px;
	}
	
	.filter-button {
		width: 100%;
	}
	
	.chart-container {
		background-color: #fff;
		border-radius: 10px;
		padding: 15px;
		padding-bottom: 25px;
		margin-bottom: 20px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	
	.chart-title {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 10px;
	}
	
	.chart-legend {
		display: flex;
		margin-bottom: 15px;
	}
	
	.legend-item {
		display: flex;
		align-items: center;
		margin-right: 20px;
	}
	
	.legend-color {
		width: 15px;
		height: 15px;
		border-radius: 3px;
		margin-right: 5px;
	}
	
	.glucose-chart {
		width: 100%;
		height: 280px;
		/* 确保Canvas有正确的边距和布局 */
		display: block;
		margin: 0 auto;
		box-sizing: border-box;
	}
	
	.list-container {
		background-color: #fff;
		border-radius: 10px;
		padding: 15px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	
	.list-header {
		display: flex;
		padding: 10px 0;
		border-bottom: 1px solid #eee;
		font-weight: bold;
	}
	
	.list-header-item {
		flex: 1;
		text-align: center;
	}
	
	.no-data {
		padding: 30px 0;
		text-align: center;
		color: #999;
	}
	
	.record-list {
		height: 300px;
	}
	
	.record-item {
		display: flex;
		padding: 12px 0;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.record-date {
		flex: 1;
		text-align: center;
	}
	
	.record-value {
		flex: 1;
		text-align: center;
	}
</style>