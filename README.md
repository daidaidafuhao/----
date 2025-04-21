# 血糖监测应用

## 项目概述

**项目名称**：血糖监测

**项目目标**：用于记录用户血糖长期的变化情况。

**开发平台**：基于uni-app框架的跨平台应用，支持Android、iOS、H5以及各类小程序平台。

## 功能需求

### 1. 血糖数据填报（界面一）
- 用户可填报当日血糖数据（2个数据：空腹血糖及餐后两个小时血糖）
- 当日多次填报采用最后一个值
- 提供简洁直观的数据输入界面
- 数据输入后进行有效性验证

### 2. 用户信息管理（界面二）
- 用户可录入基本信息，如：姓名、年龄、性别等
- 信息可进行后续修改
- 提供友好的信息编辑界面
- 支持必要的信息验证

### 3. 历史记录查询（界面三）
- 用户可对自己历史血糖记录进行查询
- 支持按时间范围筛选历史记录
- 提供折线图直观展示血糖变化趋势
- 允许用户分析自己的血糖状况

### 4. 数据管理功能（管理员）
- 管理员可导出所有用户数据用于分析
- 导出表格横轴前几列为基础信息，其余为日期对应两个数据
- 提供数据分析工具和报表功能
- 保护用户隐私和数据安全

## 技术架构

### 前端
- 使用Vue 3 + uni-app框架
- UI组件采用uni-ui
- 图表可视化使用u-charts
- 状态管理使用Pinia

### 后端
- 采用uniCloud-aliyun云开发
- 数据存储使用云数据库
- 业务逻辑通过云函数实现
- 权限管理确保数据安全

## 数据模型设计

### 用户信息表
```json
{
  "user_id": "用户唯一标识",
  "name": "用户姓名",
  "age": "年龄",
  "gender": "性别",
  "create_time": "创建时间",
  "update_time": "更新时间"
}
```

### 血糖记录表
```json
{
  "record_id": "记录唯一标识",
  "user_id": "用户唯一标识",
  "date": "记录日期",
  "fasting_glucose": "空腹血糖值",
  "postprandial_glucose": "餐后两小时血糖值",
  "create_time": "创建时间",
  "update_time": "更新时间"
}
```

## 界面设计建议

### 血糖填报界面
- 简洁的日期选择器
- 明确的空腹/餐后血糖输入区分
- 数值输入控件（支持数字键盘）
- 提交按钮及操作反馈

### 用户信息界面
- 表单式布局
- 适当的输入控件（文本框、选择器等）
- 保存按钮及状态提示
- 个人信息安全提示

### 历史记录界面
- 时间范围筛选器
- 记录列表展示（分页或虚拟列表）
- 折线图展示区域（可切换空腹/餐后数据）
- 数据分析简报

## 实现计划

### 第一阶段：项目初始化与基础设置
1. 清理hello-uniapp示例代码
2. 配置项目基本信息
3. 设计数据模型和云数据库

### 第二阶段：核心功能开发
1. 开发用户信息管理功能
2. 实现血糖数据填报功能
3. 开发历史记录查询功能
4. 实现数据可视化展示

### 第三阶段：管理功能与优化
1. 开发管理员数据导出功能
2. 实现数据分析报表
3. 优化用户界面和体验
4. 进行性能测试和优化

### 第四阶段：测试与发布
1. 进行功能测试和bug修复
2. 用户体验测试和改进
3. 应用打包和发布准备
4. 部署上线并监控运行状态

## 安全与合规

1. 确保用户健康数据的安全存储
2. 实现必要的数据加密措施
3. 明确的隐私政策说明
4. 符合相关医疗健康应用的法规要求

## 未来拓展可能

1. 添加血糖异常提醒功能
2. 支持与医疗设备的蓝牙连接
3. 增加营养建议和健康管理功能
4. 开发医患互动平台，支持远程咨询

# hello-uniapp

`uni-app`框架示例，一套代码，同时发行到iOS、Android、H5、小程序等多个平台，请使用手机在下方扫码快速体验`uni-app`的强大功能。[官方文档](https://uniapp.dcloud.net.cn/)

## 快速上手
hello-uniapp 示例工程可以通过两种方式创建， 一种是 HBuilderX, 配套 IDE，集成开发；另一种是 CLI 创建；推荐前者。
### 通过 HBuilderX 可视化界面创建（推荐）

可视化的方式比较简单，HBuilderX内置相关环境，开箱即用，无需配置nodejs。

开始之前，开发者需先下载安装如下工具：

- HBuilderX：[官方IDE下载地址](https://www.dcloud.io/hbuilderx.html)

HBuilderX是通用的前端开发工具，但为`uni-app`做了特别强化，请下载App开发版。

由于截图在 github 不便浏览，参见官方文档 [HBuilderX 可视化界面创建](https://uniapp.dcloud.net.cn/quickstart?id=_1-%e9%80%9a%e8%bf%87-hbuilderx-%e5%8f%af%e8%a7%86%e5%8c%96%e7%95%8c%e9%9d%a2)

### 通过 vue-cli 创建

```
npm install -g @vue/cli
```

#### 创建uni-app

**使用正式版**（对应HBuilderX最新正式版）

```
vue create -p dcloudio/uni-preset-vue my-project
```

**使用alpha版**（对应HBuilderX最新alpha版）

```
vue create -p dcloudio/uni-preset-vue#alpha my-alpha-project
```

此时，会提示选择项目模板，选择 `hello uni-app` 项目模板，如下所示：

<div>
<img src="https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/h5-cli-01.png" width="300">
</div>

创建好后，进入项目目录
```
cd my-project
```

执行该命令运行到 h5 端
```
npm run dev:h5
```

欢迎提 issues，推荐到[官方社区](https://ask.dcloud.net.cn/explore/)提问。

## 扫码体验

<div class="quick">
    <p>一套代码编到10个平台，这不是梦想。眼见为实，扫描10个二维码，亲自体验最全面的跨平台效果！</p>
    <div style="display: flex;">
      <a href="//m3w.cn/uniapp" target="_blank" class="clear-style barcode-view">
        <div class="barcode-img-box">
          <img src="https://web-assets.dcloud.net.cn/unidoc/zh/uni-android.png" width="160" />
        </div>
        <b>Android版</b>
      </a>
      <a href="https://itunes.apple.com/cn/app/hello-uni-app/id1417078253?mt=8" target="_blank" class="clear-style barcode-view">
        <div class="barcode-img-box">
          <img src="https://web-assets.dcloud.net.cn/unidoc/zh/uni-h5.png" width="160" />
        </div>
        <b>iOS版</b>
      </a>
      <a href="https://hellouniapp.dcloud.net.cn/" target="_blank" class="clear-style barcode-view">
        <div class="barcode-img-box">
          <img src="https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/uni-h5-hosting-qr.png" width="160" />
        </div>
        <b>H5版</b>
      </a>
      <a href="//m3w.cn/uniapp" target="_blank" class="clear-style barcode-view">
        <div class="barcode-img-box"><img src="//img.cdn.aliyun.dcloud.net.cn/guide/uniapp/gh_33446d7f7a26_430.jpg" width="160" /></div>
        <b>微信小程序版</b>
      </a>
      <a href="//m3w.cn/uniapp" target="_blank" class="clear-style barcode-view">
        <div class="barcode-img-box"><img src="https://web-assets.dcloud.net.cn/unidoc/zh/alipay1.png" width="160" /></div>
        <b>支付宝小程序版</b>
      </a>
    </div>
    <div class="flex-img-group-view" style="margin-top: 20px;">
      <a href="//m3w.cn/uniapp" target="_blank" class="clear-style barcode-view">
        <div class="barcode-img-box"><img src="https://web-assets.dcloud.net.cn/unidoc/zh/baidu-uniapp.png" width="160" /></div>
        <b>百度小程序版</b>
      </a>
      <a href="//m3w.cn/uniapp" target="_blank" class="clear-style barcode-view">
        <div class="barcode-img-box">
          <img src="https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/mp-toutiao.png" width="160" />
        </div>
        <b>字节跳动小程序版</b>
      </a>
      <a href="//m3w.cn/uniapp" target="_blank" class="clear-style barcode-view">
        <div class="barcode-img-box">
          <img src="https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/hello-uni-qq.png" width="160" />
        </div>
        <b>QQ小程序版</b>
      </a>
      <a href="//m3w.cn/uniapp" target="_blank" class="clear-style barcode-view">
        <div class="barcode-img-box">
          <img src="https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/hello-uni-qa-union.png" width="160" />
        </div>
        <b>快应用</b>
      </a>
      <a href="https://so.mp.360.cn/mp.html?appid=qh4j181qqtru354st6" target="_blank" class="clear-style barcode-view">
        <div class="barcode-img-box">
          <img src="https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/hello-uni-mp-360-qr.png" width="160" />
        </div>
        <b>360小程序</b>
      </a>
    </div>
    <p>
        <em>注：某些平台不能提交简单demo，故补充了一些其他功能；hello uni-app示例代码可从[github](https://github.com/dcloudio/hello-uniapp)获取</em></br>
        <em>快应用仅支持 vivo 、oppo、华为</em></br>
        <em>360小程序仅 windows平台支持，需要在360浏览器中打开</em></br>
    </p>
</div>

`uni-app`官网文档详见[https://uniapp.dcloud.io](https://uniapp.dcloud.io)

更多uni-app的模板、示例详见[插件市场](https://ext.dcloud.net.cn/)

