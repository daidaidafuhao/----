<template>
	<view class="container">
		<view class="header">
			<text class="title">用户登录</text>
		</view>
		
		<view class="login-container">
			<view class="avatar-placeholder">
				<image src="/static/icons/user-avatar-placeholder.png" mode="aspectFill"></image>
			</view>
			<view class="login-text">请使用微信账号登录</view>
			<button type="primary" class="login-button" open-type="getUserInfo" @getuserinfo="onGetUserInfo">微信登录</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loading: false
			}
		},
		methods: {
			onGetUserInfo(e) {
				// 如果用户拒绝授权
				if (!e.detail.userInfo) {
					uni.showToast({
						title: '需要授权才能使用',
						icon: 'none'
					});
					return;
				}
				
				if (this.loading) return;
				this.loading = true;
				
				uni.showLoading({
					title: '登录中...'
				});
				
				// 获取用户信息
				const userInfo = e.detail.userInfo;
				
				// 微信登录获取code
				uni.login({
					provider: 'weixin',
					success: (res) => {
						const code = res.code;
						console.log('获取到登录code:', code);
						
						// 调用云函数获取openid
						uniCloud.callFunction({
							name: 'wx-login',
							data: {
								code: code
							},
							success: (res) => {
								console.log('云函数调用成功:', res);
								
								if (res.result && res.result.code === 0) {
									// 保存openid到本地
									uni.setStorageSync('openid', res.result.data.openid);
									// 保存用户信息到本地
									uni.setStorageSync('userInfo', userInfo);
									
									// 显示成功提示
									uni.hideLoading();
									uni.showToast({
										title: '登录成功',
										icon: 'success'
									});
									
									// 获取是否为管理员（从云函数返回）
									const isAdmin = res.result.data.isAdmin;
									
									// 根据用户类型跳转到不同页面
									setTimeout(() => {
										if (isAdmin) {
											// 管理员用户跳转到管理页面
											uni.reLaunch({
												url: '/pages/admin/index'
											});
										} else {
											// 普通用户跳转到填报页面
											uni.switchTab({
												url: '/pages/data-entry/index'
											});
										}
									}, 1500);
								} else {
									// 处理错误情况
									uni.hideLoading();
									console.error('获取openid失败', res.result);
									uni.showToast({
										title: '登录失败: ' + (res.result?.msg || '未知错误'),
										icon: 'none'
									});
									this.loading = false;
								}
							},
							fail: (err) => {
								uni.hideLoading();
								console.error('云函数调用失败', err);
								uni.showToast({
									title: '登录失败，请检查网络',
									icon: 'none'
								});
								this.loading = false;
							}
						});
					},
					fail: (err) => {
						uni.hideLoading();
						console.error('微信登录失败', err);
						uni.showToast({
							title: '登录失败，请重试',
							icon: 'none'
						});
						this.loading = false;
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
</style> 