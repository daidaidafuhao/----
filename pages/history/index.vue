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
			<!-- 这里将集成图表组件 -->
			<view class="chart-placeholder">
				<text>图表区域 - 将使用u-charts实现</text>
			</view>
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
	export default {
		data() {
			return {
				startDate: this.getLastMonthDate(),
				endDate: this.getCurrentDate(),
				records: [
					// 模拟数据
					{date: '2023-04-21', fastingGlucose: '5.6', postprandialGlucose: '7.8'},
					{date: '2023-04-20', fastingGlucose: '5.5', postprandialGlucose: '7.6'},
					{date: '2023-04-19', fastingGlucose: '5.7', postprandialGlucose: '8.0'},
					{date: '2023-04-18', fastingGlucose: '5.4', postprandialGlucose: '7.5'},
					{date: '2023-04-17', fastingGlucose: '5.8', postprandialGlucose: '8.2'}
				]
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
			searchRecords() {
				// 这里将添加从服务器获取记录的代码
				uni.showToast({
					title: '加载数据成功',
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
	
	.chart-placeholder {
		height: 200px;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px dashed #ccc;
		color: #999;
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