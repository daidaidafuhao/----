<template>
	<view class="container">
		<view v-if="!isPageVisible" class="disabled-message">
			<text class="disabled-text">个人信息功能已废弃</text>
		</view>
		<view v-else>
			<view class="header">
				<text class="title">个人信息</text>
			</view>
			
			<!-- 未登录时显示登录界面 -->
			<view v-if="!isLoggedIn" class="login-container">
				<view class="avatar-placeholder">
					<image src="/static/icons/user-avatar-placeholder.png" mode="aspectFill"></image>
				</view>
				<view class="login-text">未登录，请先登录</view>
				<button type="primary" class="login-button" @click="handleWechatLogin">微信登录</button>
			</view>
			
			<!-- 已登录时显示用户信息 -->
			<view v-else>
				<!-- 用户基本信息 -->
				<view class="user-info-card">
					<view class="user-avatar">
						<image :src="userInfo.avatarUrl || '/static/icons/user-avatar-placeholder.png'" mode="aspectFill"></image>
					</view>
					<view class="user-basic-info">
						<view class="user-nickname">{{userInfo.nickName || '微信用户'}}</view>
					</view>
				</view>
				
				<!-- 个人信息表单 -->
				<view class="form-container">
					<uni-forms :modelValue="formData" ref="form">
						<uni-forms-item label="姓名" required>
							<uni-easyinput type="text" v-model="formData.name" placeholder="请输入姓名" />
						</uni-forms-item>
						
						<uni-forms-item label="联系方式">
							<uni-easyinput type="text" v-model="formData.contactMethod" placeholder="请输入联系方式" />
						</uni-forms-item>
						
						<uni-forms-item label="联系人">
							<uni-easyinput type="text" v-model="formData.contactPerson" placeholder="请输入联系人姓名" />
						</uni-forms-item>
						
						<uni-forms-item label="备注">
							<uni-easyinput type="textarea" v-model="formData.notes" placeholder="请输入备注信息" />
						</uni-forms-item>
						
						<uni-forms-item label="性别" required>
							<uni-data-checkbox v-model="formData.gender" :localdata="genderOptions" />
						</uni-forms-item>
						
						<uni-forms-item label="电话">
							<uni-easyinput type="number" v-model="formData.phone" placeholder="请输入电话号码" />
						</uni-forms-item>
						
						<uni-forms-item label="身高(cm)">
							<uni-easyinput type="number" v-model="formData.height" placeholder="请输入身高(cm)" />
						</uni-forms-item>
						
						<uni-forms-item label="体重(kg)">
							<uni-easyinput type="digit" v-model="formData.weight" placeholder="请输入体重(kg)" @input="calculateBMI" />
						</uni-forms-item>
						
						<uni-forms-item label="BMI">
							<uni-easyinput type="text" v-model="formData.bmi" disabled />
						</uni-forms-item>
						
						<uni-forms-item label="血压(mmHg)">
							<uni-easyinput type="text" v-model="formData.bloodPressure" placeholder="例如: 120/80" />
						</uni-forms-item>
						
						<uni-forms-item label="基础疾病">
							<uni-easyinput type="textarea" v-model="formData.basicDisease" placeholder="请输入基础疾病信息" />
						</uni-forms-item>
						
						<view class="form-button">
							<button type="primary" @click="submitForm">保存</button>
						</view>
					</uni-forms>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getWechatLoginState, wechatLogin, isWechatMP } from '../../common/api/wechat.js';
	import { checkLoginAndRedirect } from '../../common/api/login.js';
	
	export default {
		data() {
			return {
				isPageVisible: false, // 控制页面显示/隐藏
				isLoggedIn: false,
				userInfo: null,
				openid: '',
				formData: {
					name: '',
					contactMethod: '',
					contactPerson: '',
					notes: '',
					gender: '男',
					phone: '',
					height: '',
					weight: '',
					bmi: '',
					bloodPressure: '',
					basicDisease: ''
				},
				genderOptions: [
					{text: '男', value: '男'},
					{text: '女', value: '女'}
				]
			}
		},
		onLoad() {
			// 获取页面配置
			this.getPageConfig();
			
			// 检查登录状态，如果未登录则重定向到登录页面
			if (!checkLoginAndRedirect()) {
				return; // 用户未登录，已重定向到登录页面
			}
			
			// 用户已登录，初始化页面数据
			this.initPageData();
		},
		onShow() {
			// 获取页面配置
			this.getPageConfig();
			
			// 每次页面显示时检查登录状态
			if (!checkLoginAndRedirect()) {
				return; // 用户未登录，已重定向到登录页面
			}
			
			// 用户已登录，刷新页面数据
			this.initPageData();
		},
		methods: {
			// 获取页面配置
			async getPageConfig() {
				try {
					const result = await uniCloud.callFunction({
						name: 'page-config',
						data: {
							action: 'getConfig',
							params: {
								pageId: 'user-info'
							}
						}
					});
					
					if(result.result.code === 0) {
						console.log( "页面配置",result.result.data.isVisible);
						
						this.isPageVisible = result.result.data.isVisible;
					} else {
						console.error('获取页面配置失败:', result.result.message);
						this.isPageVisible = false; // 默认隐藏
					}
				} catch(error) {
					console.error('获取页面配置出错:', error);
					this.isPageVisible = false; // 默认隐藏
				}
			},
			
			// 初始化页面数据
			initPageData() {
				const loginState = getWechatLoginState();
				this.isLoggedIn = loginState.isLoggedIn;
				this.openid = loginState.openid;
				this.userInfo = loginState.userInfo;
				
				// 获取用户详细信息
				this.getUserInfo();
			},
			
			// 微信登录处理
			handleWechatLogin() {
				try {
					if(!isWechatMP()) {
						uni.showToast({
							title: '仅支持微信小程序登录',
							icon: 'none'
						});
						return;
					}
					
					uni.showLoading({
						title: '登录中...'
					});
					
					wechatLogin()
						.then(res => {
							uni.hideLoading();
							this.isLoggedIn = true;
							this.openid = res.openid;
							this.userInfo = res.userInfo;
							
							// 获取用户详细信息
							this.getUserInfo();
							
							uni.showToast({
								title: '登录成功',
								icon: 'success'
							});
						})
						.catch(err => {
							uni.hideLoading();
							console.error('登录失败', err);
							uni.showToast({
								title: '登录失败，请重试',
								icon: 'none'
							});
						});
				} catch (error) {
					uni.hideLoading();
					console.error('登录过程出错:', error);
					uni.showToast({
						title: '登录出错，请重试',
						icon: 'none'
					});
				}
			},
			
			// 获取用户详细信息
			getUserInfo() {
				if(!this.openid) return;
				
				uni.showLoading({
					title: '加载中...'
				});
				
				// 调用云函数获取用户信息
				uniCloud.callFunction({
					name: 'user-service',
					data: {
						action: 'getUserByOpenid',
						params: {
							openid: this.openid
						}
					},
					success: (res) => {
						uni.hideLoading();
						if(res.result.code === 0 && res.result.data) {
							// 填充表单数据
							const userData = res.result.data;
							this.formData = {
								name: userData.name || '',
								contactMethod: userData.contactMethod || '',
								contactPerson: userData.contactPerson || '',
								notes: userData.notes || '',
								gender: userData.gender || '男',
								phone: userData.phone || '',
								height: userData.height ? String(userData.height) : '',
								weight: userData.weight ? String(userData.weight) : '',
								bmi: userData.bmi || '',
								bloodPressure: userData.bloodPressure || '',
								basicDisease: userData.basicDisease || ''
							};
							
							// 如果有身高和体重但没有BMI，计算BMI
							if (this.formData.height && this.formData.weight && !this.formData.bmi) {
								this.calculateBMI();
							}
						} else {
							// 使用微信昵称作为默认名称
							if(this.userInfo && this.userInfo.nickName) {
								this.formData.name = this.userInfo.nickName;
							}
							
							// 使用微信性别作为默认性别
							if(this.userInfo && this.userInfo.gender !== undefined) {
								this.formData.gender = this.userInfo.gender === 1 ? '男' : '女';
							}
						}
					},
					fail: (err) => {
						uni.hideLoading();
						console.error('获取用户信息失败', err);
					}
				});
			},
			
			// 计算BMI
			calculateBMI() {
				const height = parseFloat(this.formData.height);
				const weight = parseFloat(this.formData.weight);
				
				if (height && weight && height > 0) {
					// BMI = 体重(kg) / (身高(m) * 身高(m))
					const heightInMeters = height / 100;
					const bmi = weight / (heightInMeters * heightInMeters);
					this.formData.bmi = bmi.toFixed(2);
				} else {
					this.formData.bmi = '';
				}
			},
			
			// 提交表单
			submitForm() {
				this.$refs.form.validate().then(res => {
					if (res) {
						uni.showLoading({
							title: '保存中...'
						});
						
						// 先计算BMI确保最新值
						if (this.formData.height && this.formData.weight) {
							this.calculateBMI();
						}
						
						// 调用云函数保存用户信息
						uniCloud.callFunction({
							name: 'user-service',
							data: {
								action: 'updateUserInfo',
								params: {
									openid: this.openid,
									name: this.formData.name,
									contactMethod: this.formData.contactMethod,
									contactPerson: this.formData.contactPerson,
									notes: this.formData.notes,
									gender: this.formData.gender,
									phone: this.formData.phone,
									height: this.formData.height ? parseFloat(this.formData.height) : null,
									weight: this.formData.weight ? parseFloat(this.formData.weight) : null,
									bmi: this.formData.bmi,
									bloodPressure: this.formData.bloodPressure,
									basicDisease: this.formData.basicDisease
								}
							},
							success: (res) => {
								uni.hideLoading();
								if(res.result.code === 0) {
									uni.showToast({
										title: '保存成功',
										icon: 'success'
									});
								} else {
									uni.showToast({
										title: res.result.message || '保存失败',
										icon: 'none'
									});
								}
							},
							fail: (err) => {
								uni.hideLoading();
								console.error('保存用户信息失败', err);
								uni.showToast({
									title: '保存失败，请重试',
									icon: 'none'
								});
							}
						});
					}
				});
			}
		}
	}
</script>

<style>
	.container {
		padding: 20px;
	}
	
	.disabled-message {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background-color: #f5f5f5;
	}
	
	.disabled-text {
		font-size: 18px;
		color: #999;
		text-align: center;
	}
	
	.header {
		margin-bottom: 30px;
	}
	
	.title {
		font-size: 24px;
		font-weight: bold;
		color: #4095E5;
	}
	
	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fff;
		border-radius: 10px;
		padding: 40px 15px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	
	.avatar-placeholder {
		width: 100px;
		height: 100px;
		border-radius: 50px;
		overflow: hidden;
		margin-bottom: 20px;
	}
	
	.avatar-placeholder image {
		width: 100%;
		height: 100%;
	}
	
	.login-text {
		font-size: 16px;
		color: #666;
		margin-bottom: 30px;
	}
	
	.login-button {
		width: 80%;
	}
	
	.user-info-card {
		display: flex;
		align-items: center;
		background-color: #fff;
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 20px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	
	.user-avatar {
		width: 80px;
		height: 80px;
		border-radius: 40px;
		overflow: hidden;
		margin-right: 20px;
	}
	
	.user-avatar image {
		width: 100%;
		height: 100%;
	}
	
	.user-basic-info {
		flex: 1;
	}
	
	.user-nickname {
		font-size: 18px;
		font-weight: bold;
		color: #333;
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