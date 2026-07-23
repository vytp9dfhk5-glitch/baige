const assert = require('node:assert/strict')

const storage = new Map()
global.wx = {
  getStorageSync(key) { return storage.has(key) ? storage.get(key) : '' },
  setStorageSync(key, value) { storage.set(key, JSON.parse(JSON.stringify(value))) },
  removeStorageSync(key) { storage.delete(key) },
}

const store = require('../miniprogram/utils/store.js')

store.initializeStorage()
assert.equal(store.getMembers().length, 186, '应载入完整员工清单')

const admin = store.login('18059880224')
assert.equal(admin.member.role, 'admin', '主管理员手机号应识别为管理员')

const employeeLogin = store.login('18650111999')
assert.equal(employeeLogin.member.role, 'employee', '员工清单手机号应识别为员工')
const employeeTitle = employeeLogin.member.title

const regularSave = store.saveCard('18650111999', {
  avatar: '', avatarColor: '#3478f6', name: employeeLogin.member.name, title: employeeTitle,
  phone: '18650000000', email: 'employee@baigebao.com', wechat: '', intro: '个人简介', addresses: [],
})
assert.equal(regularSave.pending, '', '员工不修改默认职位时不应进入审核')
assert.equal(store.getCard('18650111999').phone, '18650000000', '展示手机号应允许员工自行修改')
assert.equal(store.getSession().phone, '18650111999', '展示手机号不能改变登录手机号')

const titleSave = store.saveCard('18650111999', {
  avatar: '', avatarColor: '#3478f6', name: employeeLogin.member.name, title: '集团战略负责人',
  phone: '18650000000', email: 'employee@baigebao.com', wechat: '', intro: '个人简介', addresses: [],
})
assert.equal(titleSave.pending, 'title_change', '员工修改默认职位应进入审核')
assert.equal(store.getCard('18650111999').title, employeeTitle, '审核前名片应继续使用原职位')
const titleRequest = store.getRequests().find((item) => item.type === 'title_change')
store.reviewRequest(titleRequest.id, 'approved', store.addMonths(12), '')
assert.equal(store.getCard('18650111999').title, '集团战略负责人', '职位审核通过后应更新名片')

const brokerLogin = store.login('13800138000')
assert.equal(brokerLogin.member.role, 'broker', '清单外手机号应识别为经纪人')
const brokerSave = store.saveCard('13800138000', {
  avatar: '', avatarColor: '#8b5cf6', name: '经纪人演示', title: '业务顾问',
  phone: '13800138000', email: '', wechat: '', intro: '', addresses: [],
})
assert.equal(brokerSave.pending, 'broker_initial', '经纪人首次创建名片应进入审核')
assert.equal(store.cardStatus(store.getMember('13800138000')).key, 'pending', '经纪人首审期间应为待审核')
const brokerRequest = store.getRequests().find((item) => item.phone === '13800138000' && item.type === 'broker_initial')
store.reviewRequest(brokerRequest.id, 'approved', store.addMonths(3), '')
assert.equal(store.getMember('13800138000').cardApprovalStatus, 'approved', '经纪人审核通过后应可用')

const renewal = store.requestRenewal('13800138000')
store.reviewRequest(renewal.id, 'rejected', '', '合作资质已到期')
assert.equal(store.cardStatus(store.getMember('13800138000')).key, 'disabled', '续期拒绝后名片应禁用')
assert.equal(store.getNotifications('13800138000')[0].detail.includes('合作资质已到期'), true, '拒绝原因应进入个人消息通知')

console.log('微信小程序业务规则测试通过：员工、经纪人、职位审批、续期和通知逻辑正常。')
