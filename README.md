# 血糖监测应用

# 血糖监测小程序部署说明

## 项目简介

这是一个基于 uni-app 开发的血糖监测小程序，使用 uniCloud 作为后端服务。主要功能包括：
- 用户血糖数据记录
- 数据统计和分析
- 管理员数据导出
- 未填报名单导出

## 环境要求

- HBuilderX 3.0+
- 微信开发者工具
- Node.js 12.0+
- 微信小程序账号

## 部署步骤

### 1. 克隆项目

```bash
git clone [项目地址]
cd [项目目录]
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置微信小程序信息

#### 3.1 配置云函数

1. 进入 `uniCloud-aliyun/cloudfunctions/wx-login` 目录
2. 打开 `index.js` 文件
3. 修改以下配置：
```javascript
const appid = 'your_appid_here';  // 替换为您的微信小程序 AppID
const secret = 'your_secret_here'; // 替换为您的微信小程序 AppSecret
```

#### 3.2 配置项目

1. 打开 `manifest.json` 文件
2. 在"微信小程序配置"中填入您的 AppID

### 4. 获取微信小程序配置信息

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入您的小程序后台
3. 点击左侧菜单"开发"->"开发设置"
4. 获取以下信息：
   - AppID(小程序ID)
   - AppSecret(小程序密钥)

### 5. 部署云函数

1. 在 HBuilderX 中打开项目
2. 右键点击 `uniCloud-aliyun` 目录
3. 选择"上传所有云函数、公共模块及actions"
4. 等待部署完成

### 6. 初始化数据库

1. 在 uniCloud 控制台创建以下数据表：
   - users（用户表）
   - glucose_records（血糖记录表）
   - admin_config（管理员配置表）

2. 设置数据表权限：
   - users: 仅创建者可读写
   - glucose_records: 仅创建者可读写
   - admin_config: 仅管理员可读写

### 7. 编译运行

1. 在 HBuilderX 中点击"运行"->"运行到小程序模拟器"
2. 或使用微信开发者工具打开项目

## 目录结构

```
├── uniCloud-aliyun/          # 云开发目录
│   ├── cloudfunctions/      # 云函数
│   │   ├── wx-login/       # 登录云函数
│   │   └── admin-service/  # 管理员服务云函数
│   └── database/           # 数据库
├── pages/                   # 页面文件
├── components/             # 组件
├── static/                 # 静态资源
└── manifest.json          # 项目配置文件
```

## 注意事项

1. 安全配置
   - 妥善保管 AppSecret，不要泄露
   - 定期更换 AppSecret
   - 使用环境变量管理敏感信息

2. 数据库安全
   - 定期备份数据
   - 设置适当的访问权限
   - 监控异常访问

3. 云函数安全
   - 限制云函数访问权限
   - 定期检查云函数日志
   - 及时更新依赖包

## 常见问题

1. 登录失败
   - 检查 AppID 和 AppSecret 是否正确
   - 确认云函数是否已正确部署
   - 检查微信小程序是否已开通云开发

2. 数据导出失败
   - 检查管理员权限配置
   - 确认云函数是否正常运行
   - 验证文件格式是否正确

3. 权限问题
   - 检查微信小程序后台的服务器域名配置
   - 确认云函数的访问权限设置
   - 验证用户权限配置

## 技术支持

如果您在部署过程中遇到问题：

1. 查看项目文档
2. 参考 uniCloud 官方文档
3. 在项目 Issues 中提交问题

## 更新日志

请查看 `changelog.md` 文件了解项目更新历史。

## 许可证

本项目采用 MIT 许可证，详见 `LICENSE` 文件。

