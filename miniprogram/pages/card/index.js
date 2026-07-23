const store = require('../../utils/store')

Page({
  data: {
    member: null,
    card: null,
    status: { key: 'normal', label: '正常' },
    unread: 0,
    shareBlocked: false,
    renewalEligible: false,
    renewalPending: false,
    canShare: false,
    showBlockedShare: false,
    showStatus: false,
    showRenewAction: false,
    showRenewBanner: false,
  },

  onShow() {
    const session = store.getSession()
    if (!session) return wx.reLaunch({ url: '/pages/login/index' })
    const member = store.getMember(session.phone)
    const requests = store.getRequests()
    const card = store.getDisplayCard(session.phone)
    const status = store.cardStatus(member, requests)
    const pendingTitle = requests.some((item) => item.phone === session.phone && item.type === 'title_change' && item.status === 'pending')
    const renewalPending = requests.some((item) => item.phone === session.phone && item.type === 'renewal' && item.status === 'pending')
    const renewalDays = store.daysUntilExpiry(member.cardValidUntil)
    const shareBlocked = status.key === 'expired' || status.key === 'disabled' || pendingTitle || member.role === 'broker' && member.cardApprovalStatus !== 'approved'
    this.setData({
      member,
      card,
      status,
      unread: store.unreadNotificationCount(session.phone),
      shareBlocked,
      renewalEligible: renewalDays !== null && renewalDays <= 7,
      renewalPending,
      canShare: Boolean(card && !shareBlocked),
      showBlockedShare: Boolean(card && shareBlocked),
      showStatus: Boolean(card && status.key !== 'normal'),
      showRenewAction: Boolean(renewalDays !== null && renewalDays <= 7 && !renewalPending),
      showRenewBanner: Boolean(card && status.key === 'normal' && renewalDays !== null && renewalDays <= 7),
    })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 0, role: member.role })
    wx.stopPullDownRefresh()
  },

  onPullDownRefresh() { this.onShow() },
  editCard() { wx.navigateTo({ url: '/pages/edit-card/index' }) },
  openNotifications() { wx.navigateTo({ url: '/pages/notifications/index' }) },

  addContact() {
    const card = this.data.card
    if (!card) return
    wx.addPhoneContact({
      firstName: card.name,
      mobilePhoneNumber: card.phone || '',
      organization: card.company || '',
      title: card.title || '',
      email: card.email || '',
      workAddressStreet: (card.addresses && card.addresses[0]) || card.companyAddress || '',
      fail: () => wx.showToast({ title: '未能打开通讯录，请检查系统授权', icon: 'none' }),
    })
  },

  openNews(event) {
    const item = event.detail
    wx.setClipboardData({ data: item.url, success: () => wx.showToast({ title: '资讯链接已复制', icon: 'none' }) })
  },

  openPdf() {
    const card = this.data.card
    wx.showLoading({ title: '正在打开' })
    wx.downloadFile({
      url: card.companyPdfUrl,
      success: ({ tempFilePath }) => wx.openDocument({ filePath: tempFilePath, fileType: 'pdf', showMenu: true }),
      fail: () => wx.showToast({ title: '请配置PDF下载合法域名', icon: 'none' }),
      complete: () => wx.hideLoading(),
    })
  },

  renew() {
    if (this.data.renewalPending) return
    store.requestRenewal(this.data.member.phone)
    wx.showToast({ title: '续期申请已提交', icon: 'success' })
    this.onShow()
  },

  blockedShare() {
    const message = this.data.status.key === 'expired' ? '名片已过期，请先续期' : this.data.status.key === 'disabled' ? '名片已禁用' : '审核通过后才可分享'
    wx.showToast({ title: message, icon: 'none' })
  },

  onShareAppMessage() {
    if (this.data.shareBlocked || !this.data.card) return { title: '白鸽在线电子名片', path: '/pages/login/index' }
    return {
      title: `${this.data.card.name}｜${this.data.card.title}`,
      path: `/pages/public-card/index?owner=${this.data.member.phone}&name=${encodeURIComponent(this.data.card.name)}&title=${encodeURIComponent(this.data.card.title)}&phone=${encodeURIComponent(this.data.card.phone || '')}`,
      imageUrl: this.data.card.avatar || '',
    }
  }
})
