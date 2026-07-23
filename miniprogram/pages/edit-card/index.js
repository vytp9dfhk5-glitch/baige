const store = require('../../utils/store')
const { ADDRESSES, AVATAR_COLORS } = require('../../data/mock')

Page({
  data: {
    form: { avatar: '', avatarColor: '#3478f6', name: '', title: '', phone: '', email: '', wechat: '', intro: '', addresses: [] },
    avatarColors: AVATAR_COLORS,
    avatarInitial: '名',
    addressQuery: '',
    addressSuggestions: [],
    role: 'employee',
  },

  onLoad() {
    const session = store.getSession()
    if (!session) return wx.reLaunch({ url: '/pages/login/index' })
    const member = store.getMember(session.phone)
    const card = store.getCard(session.phone) || {}
    const form = Object.assign({ avatar: '', avatarColor: '#3478f6', name: '', title: '', phone: '', email: '', wechat: '', intro: '', addresses: [] }, card, {
      name: card.name || member.name || '',
      title: card.title || member.title || '',
      phone: card.phone || member.phone || '',
      email: card.email || member.email || '',
      addresses: card.addresses || [],
    })
    this.setData({ form, role: member.role, avatarInitial: form.name ? form.name.substring(0, 1) : '名' })
  },

  setField(event) {
    const field = event.currentTarget.dataset.field
    const value = event.detail.value
    const patch = {}
    patch[`form.${field}`] = value
    if (field === 'name') patch.avatarInitial = value ? value.substring(0, 1) : '名'
    this.setData(patch)
  },

  chooseDefaultAvatar(event) {
    this.setData({ 'form.avatar': '', 'form.avatarColor': event.currentTarget.dataset.color })
  },

  uploadAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: ({ tempFiles }) => {
        const tempFilePath = tempFiles[0].tempFilePath
        wx.saveFile({
          tempFilePath,
          success: ({ savedFilePath }) => this.setData({ 'form.avatar': savedFilePath }),
          fail: () => this.setData({ 'form.avatar': tempFilePath })
        })
      }
    })
  },

  onAddressQuery(event) {
    const value = event.detail.value
    const normalized = value.trim().toLowerCase()
    const suggestions = normalized ? ADDRESSES.filter((item) => item.toLowerCase().includes(normalized)).slice(0, 5) : []
    this.setData({ addressQuery: value, addressSuggestions: suggestions })
  },

  chooseAddress(event) {
    this.addAddressValue(event.currentTarget.dataset.value)
  },

  addAddress() {
    this.addAddressValue(this.data.addressQuery)
  },

  addAddressValue(value) {
    const address = String(value || '').trim()
    if (!address) return wx.showToast({ title: '请输入公司地址', icon: 'none' })
    if (this.data.form.addresses.includes(address)) return wx.showToast({ title: '该地址已经添加', icon: 'none' })
    this.setData({ 'form.addresses': this.data.form.addresses.concat(address), addressQuery: '', addressSuggestions: [] })
  },

  removeAddress(event) {
    const index = Number(event.currentTarget.dataset.index)
    this.setData({ 'form.addresses': this.data.form.addresses.filter((item, current) => current !== index) })
  },

  save() {
    const form = this.data.form
    if (!form.name.trim()) return wx.showToast({ title: '请填写姓名', icon: 'none' })
    if (!form.title.trim()) return wx.showToast({ title: '请填写职位', icon: 'none' })
    if (form.phone && !/^1\d{10}$/.test(form.phone)) return wx.showToast({ title: '请填写正确手机号', icon: 'none' })
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return wx.showToast({ title: '请填写正确邮箱', icon: 'none' })
    const session = store.getSession()
    const result = store.saveCard(session.phone, form)
    if (result.error) return wx.showToast({ title: result.error, icon: 'none' })
    getApp().refreshSession()
    const content = result.pending === 'title_change' ? '职位变更已提交管理员审核，审核通过前不可对外分享。' : result.pending === 'broker_initial' ? '名片创建申请已提交，管理员审核并设置有效期后方可使用。' : '个人名片已保存并自动拼接企业配置。'
    wx.showModal({ title: result.pending ? '已提交审核' : '保存成功', content, showCancel: false, success: () => wx.navigateBack() })
  }
})
