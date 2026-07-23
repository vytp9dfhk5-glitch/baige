const store = require('../../utils/store')
const { PUBLIC_CARD } = require('../../data/mock')

Page({
  data: { card: null, owner: '' },

  onLoad(options) {
    const owner = options.owner || ''
    let card = owner ? store.getDisplayCard(owner) : null
    if (!card && options.name) {
      card = store.mergeCard(Object.assign({}, PUBLIC_CARD, {
        avatar: '',
        name: decodeURIComponent(options.name || ''),
        title: decodeURIComponent(options.title || ''),
        phone: decodeURIComponent(options.phone || ''),
        email: '',
        intro: '',
      }), store.getEnterprise(), null)
    }
    if (!card) card = store.mergeCard(PUBLIC_CARD, store.getEnterprise(), null)
    this.openedAt = Date.now()
    this.setData({ card, owner })
  },

  onHide() {
    const duration = Math.max(1, Math.round((Date.now() - this.openedAt) / 1000))
    console.info('visitor-duration-seconds', duration)
  },

  addContact() {
    const card = this.data.card
    wx.addPhoneContact({
      firstName: card.name,
      mobilePhoneNumber: card.phone || '',
      organization: card.company || '',
      title: card.title || '',
      email: card.email || '',
      workAddressStreet: (card.addresses && card.addresses[0]) || card.companyAddress || '',
      fail: () => wx.showToast({ title: '未能打开通讯录，请检查系统授权', icon: 'none' })
    })
  },

  openNews(event) {
    wx.setClipboardData({ data: event.detail.url, success: () => wx.showToast({ title: '资讯链接已复制', icon: 'none' }) })
  },

  openPdf() {
    wx.showLoading({ title: '正在打开' })
    wx.downloadFile({
      url: this.data.card.companyPdfUrl,
      success: ({ tempFilePath }) => wx.openDocument({ filePath: tempFilePath, fileType: 'pdf', showMenu: true }),
      fail: () => wx.showToast({ title: '请配置PDF下载合法域名', icon: 'none' }),
      complete: () => wx.hideLoading()
    })
  },

  onShareAppMessage() {
    const card = this.data.card
    return { title: `${card.name}｜${card.title}`, path: `/pages/public-card/index?owner=${this.data.owner}&name=${encodeURIComponent(card.name)}&title=${encodeURIComponent(card.title)}&phone=${encodeURIComponent(card.phone || '')}`, imageUrl: card.avatar || '' }
  }
})
