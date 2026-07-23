const store = require('../../utils/store')
const { VISITORS } = require('../../data/mock')

Page({
  data: {
    available: false,
    visitors: VISITORS,
    trend: [46, 70, 58, 96, 90, 134, 144],
    labels: ['周六', '周日', '周一', '周二', '周三', '周四', '今天']
  },
  onShow() {
    const session = store.getSession()
    if (!session) return wx.reLaunch({ url: '/pages/login/index' })
    const member = store.getMember(session.phone)
    const status = store.cardStatus(member)
    const card = store.getCard(session.phone)
    const available = Boolean(card && status.key !== 'expired' && status.key !== 'disabled' && !(member.role === 'broker' && member.cardApprovalStatus !== 'approved'))
    this.setData({ available })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 1, role: member.role })
    wx.stopPullDownRefresh()
  },
  onPullDownRefresh() { this.onShow() },
  createCard() { wx.switchTab({ url: '/pages/card/index' }) },
  filter() { wx.showToast({ title: '正式版接入日期与访客类型筛选', icon: 'none' }) }
})
