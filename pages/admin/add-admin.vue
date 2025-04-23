<template>
	<view class="container">
		<view class="header">
			<text class="title">管理员授权</text>
		</view>
		
		<view class="content">
			<view class="message-box">
				<text class="loading-text" v-if="loading">正在处理中...</text>
				<text class="success-icon" v-else-if="success">✓</text>
				<text class="message-text" v-else>{{message}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { addAdmin } from '../../common/api/admin.js';
	
	export default {
		data() {
			return {
				loading: true,
				message: '正在添加管理员权限...',
				success: false
			}
		},
		onLoad() {
			// 在页面加载时自动获取当前用户的openid并添加为管理员
			this.addCurrentUserAsAdmin();
		},
		methods: {
			addCurrentUserAsAdmin() {
				// 获取当前登录用户的openid
				const openid = uni.getStorageSync('openid');
				if (!openid) {
					this.loading = false;
					this.message = '获取用户信息失败，请先登录';
					
					// 跳转到登录页
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/login/index'
						});
					}, 1500);
					return;
				}
				
				// 调用添加管理员API添加自己为管理员
				// 注意：此处使用自己的openid作为调用者和目标，实际应用中可能需要额外的验证或授权
				addAdmin(openid, openid)
					.then(res => {
						this.loading = false;
						
						if (res.code === 0) {
							this.success = true;
							this.message = '已成功添加为管理员！';
							
							// 添加成功后3秒跳转到管理页面
							setTimeout(() => {
								uni.redirectTo({
									url: '/pages/admin/index'
								});
							}, 3000);
						} else if (res.code === 403) {
							this.message = '无权执行此操作';
							
							// 跳转回普通用户页面
							setTimeout(() => {
								uni.switchTab({
									url: '/pages/data-entry/index'
								});
							}, 1500);
						} else {
							this.message = res.message || '添加管理员失败';
						}
					})
					.catch(err => {
						this.loading = false;
						this.message = '操作失败: ' + (err.message || '未知错误');
						console.error('添加管理员出错', err);
					});
			}
		}
	}
</script>

<style>
	.container {
		padding: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}
	
	.header {
		margin-bottom: 40px;
		text-align: center;
	}
	
	.title {
		font-size: 24px;
		font-weight: bold;
		color: #4095E5;
	}
	
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}
	
	.message-box {
		background-color: #fff;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
		padding: 30px;
		width: 80%;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.loading-text {
		font-size: 18px;
		color: #666;
	}
	
	.message-text {
		font-size: 18px;
		color: #4095E5;
		font-weight: bold;
	}
	
	.success-icon {
		font-size: 60px;
		color: #4CAF50;
		margin-bottom: 20px;
	}
</style> 