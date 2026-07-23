const store = require('../../utils/store')

Page({
  data: { pending: [], pendingCount: 0, memberCount: 0 },
  onShow() {
    const session = store.getSession()
    if (!session) return wx.reLaunch({ url: '/pages/login/index' })
    const member = store.getMember(session.phone)
    if (!member || member.role !== 'admin') return wx.switchTab({ url: '/pages/card/index' })
    const pending = store.getRequests()
      .filter((item) => item.status === 'pending')
      .sort((a, b) => b.submittedAt - a.submittedAt)
      .slice(0, 5)
      .map((item) => Object.assign({}, item, { initial: item.name ? item.name.substring(0, 1) : '申', typeText: store.requestTypeLabel(item.type), timeText: store.formatDateTime(item.submittedAt) }))
    const pendingCount = store.getRequests().filter((item) => item.status === 'pending').length
    this.setData({ pending, pendingCount, memberCount: store.getMembers().length })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 2, role: 'admin' })
    wx.stopPullDownRefresh()
  },
  onPullDownRefresh() { this.onShow() },
  openEnterprise() { wx.navigateTo({ url: '/pages/enterprise/index' }) },
  openApprovals() { wx.navigateTo({ url: '/pages/approvals/index' }) },
  openMembers() { wx.navigateTo({ url: '/pages/members/index' }) }
})
