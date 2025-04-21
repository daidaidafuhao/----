/**
 * 通用云函数请求模块
 */

/**
 * 调用云函数
 * @param {String} name 云函数名称
 * @param {Object} data 参数 
 */
function callCloudFunction(name, data = {}) {
	return new Promise((resolve, reject) => {
		uni.showLoading({
			title: '加载中'
		});
		
		uniCloud.callFunction({
			name,
			data
		}).then(res => {
			uni.hideLoading();
			
			// 请求成功，但业务状态异常
			if (res.result && res.result.code !== 0) {
				uni.showToast({
					title: res.result.message || '请求失败',
					icon: 'none'
				});
				reject(res.result);
				return;
			}
			
			// 正常返回结果
			resolve(res.result);
			
		}).catch(err => {
			uni.hideLoading();
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			});
			console.error(`调用云函数${name}出错:`, err);
			reject(err);
		});
	});
}

export default {
	callCloudFunction
}; 