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
						<uni-forms-item label="日期" class="label-right">
							<view class="date-picker-container">
								<uni-icons type="left" size="20" color="#666" @click="changeDate(-1)" class="date-nav-icon" />
								<uni-datetime-picker type="date" v-model="formData.date" class="date-picker" @change="checkExistingRecord" />
								<uni-icons type="right" size="20" color="#666" @click="changeDate(1)" class="date-nav-icon" />
							</view>
						</uni-forms-item>
					</view>
					
					<view class="grid-col" :class="{ 'full-width': isNarrowScreen }">
						<uni-forms-item label="空腹血糖值" class="label-right">
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
						<uni-forms-item label="餐后两小时血糖值" class="label-right">
							<view class="input-container">
								<uni-easyinput type="digit" v-model="formData.postprandialGlucose" 
									placeholder="请输入" 
									class="glucose-input" 
									:input-border="false"
									@blur="validateGlucose('postprandialGlucose')" />
								<text class="unit-text">mmol/L</text>
							</view>
							<text v-if="glucoseErrors.postprandialGlucose" class="error-text">{{glucoseErrors.postprandialGlucose}}</text>
							<text v-if="!formData.postprandialGlucose && formData.fastingGlucose" class="tip-text">餐后血糖可稍后填写</text>
						</uni-forms-item>
					</view>
					
					<!-- 新增血压输入框 -->
					<view class="grid-col" :class="{ 'full-width': isNarrowScreen }">
						<uni-forms-item label="血压" class="label-right">
							<view class="input-container">
								<uni-easyinput type="text" v-model="formData.bloodPressure" 
									placeholder="请输入(例如:120/80)" 
									class="glucose-input" 
									:input-border="false" />
								<text class="unit-text">mmHg</text>
							</view>
							<text class="tip-text">选填项，格式如:120/80</text>
						</uni-forms-item>
					</view>
				</view>
				
				<view class="form-button">
					<button :type="canSubmit ? 'primary' : 'default'" 
						@click="submitForm" 
						:disabled="!canSubmit" 
						:class="{ 'btn-disabled': !canSubmit, 'btn-enabled': canSubmit }">
						{{ submitButtonText }}
					</button>
				</view>
				
				<view v-if="existingRecord" class="record-info">
					<text class="record-info-text">{{ getRecordInfoText() }}</text>
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
					postprandialGlucose: '',
					bloodPressure: '' // 新增血压字段
				},
				glucoseErrors: {
					fastingGlucose: '',
					postprandialGlucose: ''
				},
				rules: {
					date: {
						rules: []
					},
					fastingGlucose: {
						rules: []
					},
					postprandialGlucose: {
						rules: []
					}
					// 血压为选填项，不添加验证规则
				},
				isNarrowScreen: false,
				existingRecord: null, // 存储当前日期已有的记录
				recordId: null // 已有记录的ID
			}
		},
		computed: {
			canSubmit() {
				// 新逻辑：至少填写一项血糖值即可提交
				return this.formData.date && 
					(this.formData.fastingGlucose || this.formData.postprandialGlucose ||
					 (this.existingRecord && (this.existingRecord.fastingGlucose || this.existingRecord.postprandialGlucose)));
			},
			submitButtonText() {
				if (this.existingRecord) {
					return '更新记录';
				}
				return '提交';
			}
		},
		onLoad() {
			// 检查登录状态，如果未登录则重定向到登录页面
			if (!checkLoginAndRedirect()) {
				return; // 用户未登录，已重定向到登录页面
			}
			
			// 检测屏幕宽度，决定布局
			this.checkScreenWidth();
			
			// 检查当天是否已有记录
			this.checkExistingRecord();
		},
		onShow() {
			// 每次页面显示时检查登录状态
			if (!checkLoginAndRedirect()) {
				return; // 用户未登录，已重定向到登录页面
			}
			
			// 检查当天是否已有记录
			this.checkExistingRecord();
		},
		methods: {
			getRecordInfoText() {
				let text = "当前日期已有记录: ";
				if (this.existingRecord.fastingGlucose && this.existingRecord.postprandialGlucose) {
					text += `空腹 ${this.existingRecord.fastingGlucose}mmol/L，餐后 ${this.existingRecord.postprandialGlucose}mmol/L`;
				} else if (this.existingRecord.fastingGlucose) {
					text += `空腹 ${this.existingRecord.fastingGlucose}mmol/L`;
				} else if (this.existingRecord.postprandialGlucose) {
					text += `餐后 ${this.existingRecord.postprandialGlucose}mmol/L`;
				}
				return text;
			},
			checkExistingRecord() {
				const loginState = getWechatLoginState();
				if (!loginState.isLoggedIn) {
					return;
				}
				
				// 重置现有记录
				this.existingRecord = null;
				this.recordId = null;
				
				// 显示加载提示
				uni.showLoading({
					title: '查询记录...'
				});
				
				// 调用云函数查询当前日期是否已有记录
				uniCloud.callFunction({
					name: 'glucose-service',
					data: {
						action: 'getByDate',
						params: {
							userId: loginState.userInfo._id || loginState.openid,
							date: this.formData.date
						}
					}
				}).then(res => {
					uni.hideLoading();
					if (res.result && res.result.code === 0 && res.result.data) {
						// 找到了已有记录
						this.existingRecord = res.result.data;
						this.recordId = res.result.data._id;
						
						// 移除自动跳转到下一天的逻辑，始终显示当前日期的记录
						// 即使记录已经完整，也允许用户查看和修改
						
						// 预填已有数据
						if (!this.formData.fastingGlucose && this.existingRecord.fastingGlucose) {
							this.formData.fastingGlucose = this.existingRecord.fastingGlucose;
						}
						if (!this.formData.postprandialGlucose && this.existingRecord.postprandialGlucose) {
							this.formData.postprandialGlucose = this.existingRecord.postprandialGlucose;
						}
						if (!this.formData.bloodPressure && this.existingRecord.bloodPressure) {
							this.formData.bloodPressure = this.existingRecord.bloodPressure;
						}
					} else {
						// 没有找到记录
						this.existingRecord = null;
						this.recordId = null;
					}
				}).catch(err => {
					uni.hideLoading();
					console.error('查询记录失败', err);
				});
			},
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
				
				// 日期变更时检查是否有记录
				this.checkExistingRecord();
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
				if (!this.canSubmit) {
					return;
				}
				
				// 如果没有填写任何血糖值，提示用户
				if (!this.formData.fastingGlucose && !this.formData.postprandialGlucose &&
					!this.existingRecord) {
					uni.showToast({
						title: '请至少填写一项血糖值',
						icon: 'none'
					});
					return;
				}
				
				// 直接执行提交，无需调用表单验证
				// 额外验证血糖值
				if (this.formData.fastingGlucose) {
					this.validateGlucose('fastingGlucose');
				}
				if (this.formData.postprandialGlucose) {
					this.validateGlucose('postprandialGlucose');
				}
				
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
					title: this.existingRecord ? '更新中...' : '提交中...'
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
				
				// 处理提交数据，保留已有数据不被空值覆盖
				const submitData = {
					userId: loginState.userInfo._id || loginState.openid,
					date: this.formData.date,
					bloodPressure: this.formData.bloodPressure || (this.existingRecord ? this.existingRecord.bloodPressure || '' : '')
				};
				
				// 只有当值不为空时才更新，否则保留已有的值
				if (this.formData.fastingGlucose) {
					submitData.fastingGlucose = this.formData.fastingGlucose;
				} else if (this.existingRecord && this.existingRecord.fastingGlucose) {
					submitData.fastingGlucose = this.existingRecord.fastingGlucose;
				}
				
				if (this.formData.postprandialGlucose) {
					submitData.postprandialGlucose = this.formData.postprandialGlucose;
				} else if (this.existingRecord && this.existingRecord.postprandialGlucose) {
					submitData.postprandialGlucose = this.existingRecord.postprandialGlucose;
				}
				
				// 根据是否有现有记录决定是更新还是新增
				const action = this.existingRecord ? 'update' : 'add';
				if (action === 'update') {
					submitData.recordId = this.recordId;
				}
				
				// 调用云函数添加或更新血糖记录
				uniCloud.callFunction({
					name: 'glucose-service',
					data: {
						action: action,
						params: submitData
					}
				}).then(res => {
					// 请求成功
					uni.hideLoading();
					if (res.result && res.result.code === 0) {
						uni.showToast({
							title: res.result.message || (action === 'update' ? '更新成功' : '提交成功'),
							icon: 'success'
						});
						
						// 更新本地记录状态
						if (action === 'add') {
							this.recordId = res.result.data && res.result.data.id;
							this.existingRecord = {...submitData, _id: this.recordId};
						} else {
							this.existingRecord = {...this.existingRecord, ...submitData};
						}
						
						// 不管是否填写完两项，都不自动重置表单
						// 这样用户可以看到他们已经提交的数据
						// 让用户随时可以查看或修改已填写的记录
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
	
	.tip-text {
		color: #999999;
		font-size: 12px;
		margin-top: 4px;
	}
	
	.record-info {
		margin-top: 20px;
		padding: 10px;
		background-color: #E6F7FF;
		border-radius: 5px;
		text-align: center;
	}
	
	.record-info-text {
		color: #4095E5;
		font-size: 14px;
	}
	
	/* 输入框聚焦态样式 */
	:deep(.uni-easyinput__content-input:focus) {
		background-color: rgba(64, 149, 229, 0.05);
	}
</style> 