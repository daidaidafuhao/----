<template>
	<view class="container">
		<view class="header">
			<text class="title">血糖数据填报</text>
		</view>
		
		<view class="form-container">
			<uni-forms :modelValue="formData" ref="form">
				<uni-forms-item label="日期" required>
					<uni-datetime-picker type="date" v-model="formData.date" />
				</uni-forms-item>
				
				<uni-forms-item label="空腹血糖值 (mmol/L)" required>
					<uni-easyinput type="number" v-model="formData.fastingGlucose" placeholder="请输入空腹血糖值" />
				</uni-forms-item>
				
				<uni-forms-item label="餐后两小时血糖值 (mmol/L)" required>
					<uni-easyinput type="number" v-model="formData.postprandialGlucose" placeholder="请输入餐后两小时血糖值" />
				</uni-forms-item>
				
				<view class="form-button">
					<button type="primary" @click="submitForm">提交</button>
				</view>
			</uni-forms>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				formData: {
					date: this.getCurrentDate(),
					fastingGlucose: '',
					postprandialGlucose: ''
				}
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
			submitForm() {
				this.$refs.form.validate().then(res => {
					if (res) {
						// 这里将添加提交到服务器的代码
						uni.showToast({
							title: '提交成功',
							icon: 'success'
						});
						// 重置表单
						this.formData = {
							date: this.getCurrentDate(),
							fastingGlucose: '',
							postprandialGlucose: ''
						};
					} else {
						uni.showToast({
							title: '请填写完整信息',
							icon: 'none'
						});
					}
				}).catch(err => {
					console.log('表单错误：', err);
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
		margin-bottom: 30px;
	}
	
	.title {
		font-size: 24px;
		font-weight: bold;
		color: #4095E5;
	}
	
	.form-container {
		background-color: #fff;
		border-radius: 10px;
		padding: 15px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	
	.form-button {
		margin-top: 30px;
	}
</style> 