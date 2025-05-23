import App from './App'
import store from './store'

// #ifndef VUE3
import Vue from 'vue'
import { install as installXLSX } from './common/plugins/weex-xlsx'

Vue.config.productionTip = false
Vue.prototype.$store = store
Vue.prototype.$adpid = "1111111111"
Vue.prototype.$backgroundAudioData = {
	playing: false,
	playTime: 0,
	formatedPlayTime: '00:00:00'
}

// 安装XLSX插件
installXLSX(Vue)

App.mpType = 'app'
const app = new Vue({
	store,
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import * as Pinia from 'pinia';
import Vuex from "vuex";
import { install as installXLSX } from './common/plugins/weex-xlsx'

export function createApp() {
	const app = createSSRApp(App)
	app.use(store)
	app.use(Pinia.createPinia());
	
	// 安装XLSX插件
	installXLSX(app)
	
	app.config.globalProperties.$adpid = "1111111111"
	app.config.globalProperties.$backgroundAudioData = {
		playing: false,
		playTime: 0,
		formatedPlayTime: '00:00:00'
	}
	return {
		app,
		Vuex, // 如果 nvue 使用 vuex 的各种map工具方法时，必须 return Vuex
		Pinia // 此处必须将 Pinia 返回
	}
}
// #endif
