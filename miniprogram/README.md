# 白鸽在线 AI 电子名片微信小程序

这是现有 React/Vite 原型对应的原生微信小程序版本。工程不依赖 npm 小程序组件库，可直接使用微信开发者工具导入。

## 导入方式

1. 打开微信开发者工具，选择“导入项目”。
2. 项目目录选择本仓库根目录，而不是单独选择 `miniprogram/`。
3. 开发者工具会读取根目录的 `project.config.json`，并自动使用 `miniprogram/` 作为小程序源码目录。
4. 当前 `appid` 为 `touristappid`，用于本地演示；准备真机调试或发布时，将它替换为白鸽在线小程序的正式 AppID。
5. 开发阶段如需播放当前远程宣传视频或打开 PDF，在“详情 → 本地设置”中勾选“不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书”。

无需执行 `npm install`。仓库根目录可执行以下检查：

```bash
npm run check:miniprogram
npm run test:miniprogram
```

## 演示账号

验证码统一使用 `123456`：

- 管理员：`18059880224`
- 员工：`18650111999`
- 经纪人：`13800138000`

员工账号来自完整的 186 人员工清单；不在员工清单中的手机号默认进入经纪人流程。

## 已实现页面

- 手机号 + 验证码登录
- 名片首页、名片编辑、多个公司地址、默认头像与头像上传
- 微信原生 `open-type="share"` 分享面板
- 微信原生 `wx.addPhoneContact` 添加至通讯录
- 个人简介、公司风采、企业咨询、企业介绍长图
- 消息通知、审核结果、拒绝原因与到期提醒
- 访客统计、近 7 天趋势、普通访客记录
- 企业管理首页
- 企业配置、视频和封面上传、企业咨询拖拽排序、PDF选择、发布前预览
- 审批中心、全部状态筛选、有效期设置、通过和必填拒绝原因
- 成员模糊搜索、角色调整、登录手机号更新、有效期和账号状态维护
- “我的”个人信息卡片与退出登录
- 对外只读分享名片页

访客模块保留数据统计和普通访客记录，不包含“重点关注”名单，也不包含访客详情页。

## 包体与远程资源

微信小程序主包限制为 2MB。本工程只内置：

- 涂锦波头像
- 企业介绍 WebP 长图
- 页面代码和完整员工清单

41MB 企业宣传视频和 13MB PDF 没有打入小程序包，当前演示地址为：

- `https://vytp9dfhk5-glitch.github.io/baige/ai-card/company-promo-2026.mp4`
- `https://vytp9dfhk5-glitch.github.io/baige/ai-card/company-introduction-2026.pdf`

正式发布前应迁移到白鸽在线对象存储/CDN，并在微信公众平台配置 `downloadFile`、视频和图片合法域名。

## 当前原型边界

当前版本用于产品验收与微信开发者工具交互演示，数据使用 `wx.setStorageSync` 保存在当前设备：

- 验证码为演示验证码，不是真实短信服务。
- 角色判断、审批、成员资料和有效期仍是前端本地数据，不是安全边界。
- 分享路径携带姓名、职位、手机号等最小展示字段；完整跨设备名片需要后端按名片 ID 查询。
- 访客数据是演示数据；对外名片页仅预留打开时间和停留时长采集位置。
- PDF 上传后需要后端转成长图；小程序端只负责选择文件和预览已生成的长图。
- 企业视频、封面、头像和 PDF 正式版必须上传对象存储，不能依赖临时文件路径。

## 正式接口建议

| 模块 | 建议接口 |
|---|---|
| 登录 | `POST /auth/wechat/login`、`POST /auth/sms/send`、`POST /auth/sms/verify` |
| 员工身份 | `GET /me`、`GET /members`、`PATCH /members/:id` |
| 个人名片 | `GET /cards/me`、`PUT /cards/me`、`GET /cards/:shareId` |
| 企业配置 | `GET /enterprise/card-config`、`PUT /enterprise/card-config` |
| 审批 | `GET /approvals`、`POST /approvals/:id/approve`、`POST /approvals/:id/reject` |
| 续期 | `POST /cards/me/renewals` |
| 上传 | `POST /uploads/presign`、`POST /documents/pdf-to-images` |
| 访客 | `POST /card-events`、`POST /card-events/heartbeat`、`GET /cards/me/analytics` |
| 通知 | `GET /notifications`、`POST /notifications/read` |

生产环境必须由服务端校验角色、审批状态和名片有效期，并对分享链接使用不可枚举的 `shareId` 或签名短链。
