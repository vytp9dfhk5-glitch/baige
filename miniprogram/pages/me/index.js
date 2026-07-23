const store = require('../../utils/store')

Page({
  data: { member: null, card: null, maskedPhone: '', stateText: '', initial: '我' },
  onShow() {
    const session = store.getSession()
    if (!session) return wx.reLaunch({ url: '/pages/login/index' })
    const member = store.getMember(session.phone)
    const card = store.getCard(session.phone)
    const status = store.cardStatus(member)
    const stateText = !card ? '等待完善个人信息' : status.key === 'normal' ? `个人信息已完善${member.cardValidUntil ? ` · 有效期至 ${member.cardValidUntil}` : ''}` : `当前名片状态：${status.label}`
    const displayName = card && card.name || member.name || ''
    this.setData({ member, card, maskedPhone: store.maskPhone(session.phone), stateText, initial: displayName ? displayName.substring(0, 1) : '我' })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 3, role: member.role })
  },
  logout() {
    wx.showModal({ title: '退出登录', content: '确定退出当前账号吗？', success: ({ confirm }) => { if (confirm) { store.logout(); getApp().refreshSession(); wx.reLaunch({ url: '/pages/login/index' }) } } })
  }
})
