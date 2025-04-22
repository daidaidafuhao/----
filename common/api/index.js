/**
 * API服务统一导出
 */
import userApi from './user.js';
import glucoseApi from './glucose.js';
import adminApi from './admin.js';

export const user = userApi;
export const glucose = glucoseApi;
export const admin = adminApi;

export default {
	user,
	glucose,
	admin
}; 