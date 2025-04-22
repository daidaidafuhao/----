<template>
	<view class="container">
		<view class="header">
			<text class="title">血糖数据填报</text>
			<view class="title-underline"></view>
		</view>
		
		<view class="form-card">
			<uni-forms :modelValue="formData" ref="form" :rules="rules" validateTrigger="bind">
				<view class="grid-row">
					<view class="grid-col" :class="{ 'full-width': isNarrowScreen }">
						<uni-forms-item label="日期" required class="label-right">
							<view class="date-picker-container">
								<uni-icons type="left" size="20" color="#666" @click="changeDate(-1)" class="date-nav-icon" />
								<uni-datetime-picker type="date" v-model="formData.date" class="date-picker" />
								<uni-icons type="right" size="20" color="#666" @click="changeDate(1)" class="date-nav-icon" />
							</view>
						</uni-forms-item>
					</view>
					
					<view class="grid-col" :class="{ 'full-width': isNarrowScreen }">
						<uni-forms-item label="空腹血糖值" required class="label-right">
							<view class="input-container">
								<uni-easyinput type="digit" v-model="formData.fastingGlucose" 
									placeholder="请输入" 
									class="glucose-input" 
									:input-border="false"
									@blur="validateGlucose('fastingGlucose')" />
								<text class="unit-text">mmol/L</text>
							</view>
							<text v-if="glucoseErrors.fastingGlucose" class="error-text">{{glucoseErrors.fastingGlucose}}</text>
						</uni-forms-item>
					</view>
					
					<view class="grid-col" :class="{ 'full-width': isNarrowScreen }">
						<uni-forms-item label="餐后两小时血糖值" required class="label-right">
							<view class="input-container">
								<uni-easyinput type="digit" v-model="formData.postprandialGlucose" 
									placeholder="请输入" 
									class="glucose-input" 
									:input-border="false"
									@blur="validateGlucose('postprandialGlucose')" />
								<text class="unit-text">mmol/L</text>
							</view>
							<text v-if="glucoseErrors.postprandialGlucose" class="error-text">{{glucoseErrors.postprandialGlucose}}</text>
						</uni-forms-item>
					</view>
				</view>
				
				<view class="form-button">
					<button :type="isFormValid ? 'primary' : 'default'" 
						@click="submitForm" 
						:disabled="!isFormValid" 
						:class="{ 'btn-disabled': !isFormValid, 'btn-enabled': isFormValid }">
						提交
					</button>
				</view>
			</uni-forms>
		</view>
	</view>
</template>

<script>
	import { checkLoginAndRedirect } from '../../common/api/login.js';
	import { getWechatLoginState } from '../../common/api/wechat.js';
	
	export default {
		data() {
			return {
				formData: {
					date: this.getCurrentDate(),
					fastingGlucose: '',
					postprandialGlucose: ''
				},
				glucoseErrors: {
					fastingGlucose: '',
					postprandialGlucose: ''
				},
				rules: {
					date: {
						rules: [{
							required: true,
							errorMessage: '请选择日期'
						}]
					},
					fastingGlucose: {
						rules: [{
							required: true,
							errorMessage: '请输入空腹血糖值'
						}]
					},
					postprandialGlucose: {
						rules: [{
							required: true,
							errorMessage: '请输入餐后两小时血糖值'
						}]
					}
				},
				isNarrowScreen: false
			}
		},
		computed: {
			isFormValid() {
				return this.formData.date && 
					this.formData.fastingGlucose && 
					this.formData.postprandialGlucose;
			}
		},
		onLoad() {
			// 检查登录状态，如果未登录则重定向到登录页面
			if (!checkLoginAndRedirect()) {
				return; // 用户未登录，已重定向到登录页面
			}
			
			// 检测屏幕宽度，决定布局
			this.checkScreenWidth();
			
			// 原有的onLoad逻辑
			// ... existing code ...
		},
		onShow() {
			// 每次页面显示时检查登录状态
			if (!checkLoginAndRedirect()) {
				return; // 用户未登录，已重定向到登录页面
			}
			
			// 原有的onShow逻辑
			// ... existing code ...
		},
		methods: {
			checkScreenWidth() {
				const info = uni.getSystemInfoSync();
				this.isNarrowScreen = info.windowWidth < 600; // 小于600px认为是窄屏
			},
			getCurrentDate() {
				const date = new Date();
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${year}-${month}-${day}`;
			},
			changeDate(days) {
				const currentDate = new Date(this.formData.date);
				currentDate.setDate(currentDate.getDate() + days);
				const year = currentDate.getFullYear();
				const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
				const day = currentDate.getDate().toString().padStart(2, '0');
				this.formData.date = `${year}-${month}-${day}`;
			},
			validateGlucose(field) {
				const value = parseFloat(this.formData[field]);
				
				// 清除之前的错误
				this.glucoseErrors[field] = '';
				
				// 检查是否为空
				if (!this.formData[field]) {
					return;
				}
				
				// 检查范围
				if (isNaN(value)) {
					this.glucoseErrors[field] = '请输入有效数值';
					return;
				}
				
				// 空腹血糖范围检查（一般3.9-6.1为正常）
				if (field === 'fastingGlucose') {
					if (value < 3.0) {
						this.glucoseErrors[field] = '血糖值过低，请确认是否正确';
					} else if (value > 7.0) {
						this.glucoseErrors[field] = '血糖值偏高，请注意控制';
					}
				}
				
				// 餐后血糖范围检查（一般<7.8为正常）
				if (field === 'postprandialGlucose') {
					if (value < 3.0) {
						this.glucoseErrors[field] = '血糖值过低，请确认是否正确';
					} else if (value > 11.1) {
						this.glucoseErrors[field] = '血糖值过高，请及时就医';
					} else if (value > 7.8) {
						this.glucoseErrors[field] = '血糖值偏高，请注意控制';
					}
				}
			},
			submitForm() {
				if (!this.isFormValid) {
					return;
				}
				
				this.$refs.form.validate().then(res => {
					if (res) {
						// 额外验证血糖值
						this.validateGlucose('fastingGlucose');
						this.validateGlucose('postprandialGlucose');
						
						// 如果有异常血糖值，只显示提示，但不阻止提交
						if (this.glucoseErrors.fastingGlucose || this.glucoseErrors.postprandialGlucose) {
							uni.showToast({
								title: '血糖值异常，但仍可提交',
								icon: 'none',
								duration: 2000
							});
						}
						
						// 显示加载提示
						uni.showLoading({
							title: '提交中...'
						});
						
						// 获取用户ID
						const loginState = getWechatLoginState();
						if (!loginState.isLoggedIn) {
							uni.hideLoading();
							uni.showToast({
								title: '您尚未登录',
								icon: 'none'
							});
							setTimeout(() => {
								checkLoginAndRedirect();
							}, 1500);
							return;
						}
						
						// 调用云函数添加血糖记录
						uniCloud.callFunction({
							name: 'glucose-service',
							data: {
								action: 'add',
								params: {
									userId: loginState.userInfo._id || loginState.openid,
									date: this.formData.date,
									fastingGlucose: this.formData.fastingGlucose,
									postprandialGlucose: this.formData.postprandialGlucose
								}
							}
						}).then(res => {
							// 请求成功
							uni.hideLoading();
							if (res.result && res.result.code === 0) {
								uni.showToast({
									title: res.result.message || '提交成功',
									icon: 'success'
								});
								
								// 重置表单
								this.formData = {
									date: this.getCurrentDate(),
									fastingGlucose: '',
									postprandialGlucose: ''
								};
								this.glucoseErrors = {
									fastingGlucose: '',
									postprandialGlucose: ''
								};
							} else {
								uni.showToast({
									title: (res.result && res.result.message) || '提交失败',
									icon: 'none'
								});
							}
						}).catch(err => {
							// 请求失败
							uni.hideLoading();
							uni.showToast({
								title: '网络错误，请稍后重试',
								icon: 'none'
							});
							console.error('提交血糖数据失败', err);
						});
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
	
	.title-underline {
		height: 4px;
		width: 80px;
		background-color: #4095E5;
		margin-top: 8px;
		border-radius: 2px;
	}
	
	.form-card {
		background-color: #FAFAFA;
		border-radius: 10px;
		padding: 20px 15px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	
	.grid-row {
		display: flex;
		flex-wrap: wrap;
		margin: 0 -10px;
	}
	
	.grid-col {
		flex: 1;
		min-width: 200px;
		padding: 0 10px;
		margin-bottom: 15px;
	}
	
	.full-width {
		width: 100%;
	}
	
	.label-right :deep(.uni-forms-item__label) {
		justify-content: flex-end;
	}
	
	.input-container {
		display: flex;
		align-items: center;
		background-color: #FFFFFF;
		border-radius: 4px;
		border: 1px solid #EAEAEA;
		padding: 0 10px;
		transition: all 0.3s;
	}
	
	.input-container:focus-within {
		border-color: #4095E5;
		box-shadow: 0 0 5px rgba(64, 149, 229, 0.3);
	}
	
	.glucose-input {
		flex: 1;
	}
	
	.unit-text {
		color: #999;
		margin-left: 5px;
		font-size: 14px;
	}
	
	.date-picker-container {
		display: flex;
		align-items: center;
	}
	
	.date-picker {
		flex: 1;
	}
	
	.date-nav-icon {
		padding: 5px;
	}
	
	.form-button {
		margin-top: 30px;
		display: flex;
		justify-content: center;
	}
	
	.btn-disabled {
		background-color: #CCCCCC !important;
		color: #FFFFFF !important;
	}
	
	.btn-enabled {
		background-color: #07C160 !important;
	}
	
	.error-text {
		color: #FF5151;
		font-size: 12px;
		margin-top: 4px;
	}
	
	/* 输入框聚焦态样式 */
	:deep(.uni-easyinput__content-input:focus) {
		background-color: rgba(64, 149, 229, 0.05);
	}
</style> 