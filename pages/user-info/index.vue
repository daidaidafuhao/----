<template>
	<view class="container">
		<view class="header">
			<text class="title">个人信息</text>
		</view>
		
		<view class="form-container">
			<uni-forms :modelValue="formData" ref="form">
				<uni-forms-item label="姓名" required>
					<uni-easyinput type="text" v-model="formData.name" placeholder="请输入姓名" />
				</uni-forms-item>
				
				<uni-forms-item label="年龄" required>
					<uni-easyinput type="number" v-model="formData.age" placeholder="请输入年龄" />
				</uni-forms-item>
				
				<uni-forms-item label="性别" required>
					<uni-data-checkbox v-model="formData.gender" :localdata="genderOptions" />
				</uni-forms-item>
                
				<uni-forms-item label="联系电话">
					<uni-easyinput type="number" v-model="formData.phone" placeholder="请输入联系电话" />
				</uni-forms-item>
				
				<uni-forms-item label="备注信息">
					<uni-easyinput type="textarea" v-model="formData.notes" placeholder="请输入备注信息" />
				</uni-forms-item>
				
				<view class="form-button">
					<button type="primary" @click="submitForm">保存</button>
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
					name: '',
					age: '',
					gender: '男',
					phone: '',
					notes: ''
				},
				genderOptions: [
					{text: '男', value: '男'},
					{text: '女', value: '女'}
				]
			}
		},
		onLoad() {
			// 这里将添加从服务器获取用户信息的代码
			// 暂时使用模拟数据
			setTimeout(() => {
				this.formData = {
					name: '张三',
					age: '45',
					gender: '男',
					phone: '13800138000',
					notes: '糖尿病2型，确诊时间：2020年'
				}
			}, 500);
		},
		methods: {
			submitForm() {
				this.$refs.form.validate().then(res => {
					if (res) {
						// 这里将添加提交到服务器的代码
						uni.showToast({
							title: '保存成功',
							icon: 'success'
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