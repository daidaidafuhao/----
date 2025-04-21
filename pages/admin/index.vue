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
						
						<view class="export-option" v-if="dateRangeIndex === 3">
							<text class="option-label">开始日期：</text>
							<uni-datetime-picker type="date" v-model="customStartDate" />
						</view>
						
						<view class="export-option" v-if="dateRangeIndex === 3">
							<text class="option-label">结束日期：</text>
							<uni-datetime-picker type="date" v-model="customEndDate" />
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
					
					<button class="export-button" type="primary" @click="exportData">导出数据</button>
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
	</view>
</template>

<script>
	export default {
		data() {
			return {
				dateRanges: ['最近一周', '最近一个月', '最近三个月', '自定义'],
				dateRangeIndex: 1,
				customStartDate: this.getLastMonthDate(),
				customEndDate: this.getCurrentDate(),
				formats: ['Excel (.xlsx)', 'CSV (.csv)'],
				formatIndex: 0,
				// 模拟统计数据
				userCount: 56,
				recordCount: 421,
				lastWeekCount: 35,
				activeUserCount: 28
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
			handleDateRangeChange(e) {
				this.dateRangeIndex = e.detail.value;
			},
			handleFormatChange(e) {
				this.formatIndex = e.detail.value;
			},
			exportData() {
				// 这里将添加导出数据的代码
				uni.showToast({
					title: '数据导出成功',
					icon: 'success'
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
</style> 