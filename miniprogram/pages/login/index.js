const store = require('../../utils/store')

Page({
  data: {
    phone: '',
    code: '',
    agreed: true,
    sending: false,
    countdown: 0,
  },

  onShow() {
    const session = store.getSession()
    if (session) wx.switchTab({ url: '/pages/card/index' })
  },

  onPhone(event) { this.setData({ phone: event.detail.value.replace(/\D/g, '').slice(0, 11) }) },
  onCode(event) { this.setData({ code: event.detail.value.replace(/\D/g, '').slice(0, 6) }) },
  toggleAgreement() { this.setData({ agreed: !this.data.agreed }) },

  sendCode() {
    if (!/^1\d{10}$/.test(this.data.phone)) return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    this.setData({ sending: true, countdown: 60 })
    wx.showToast({ title: '演示验证码：123456', icon: 'none', duration: 2200 })
    this.timer = setInterval(() => {
      const countdown = this.data.countdown - 1
      this.setData({ countdown, sending: countdown > 0 })
      if (countdown <= 0) clearInterval(this.timer)
    }, 1000)
  },

  quickFill(event) {
    this.setData({ phone: event.currentTarget.dataset.phone, code: '123456', agreed: true })
  },

  login() {
    const { phone, code, agreed } = this.data
    if (!/^1\d{10}$/.test(phone)) return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    if (!/^\d{6}$/.test(code)) return wx.showToast({ title: '请输入6位验证码', icon: 'none' })
    if (!agreed) return wx.showToast({ title: '请先同意协议', icon: 'none' })
    const result = store.login(phone)
    if (result.error) return wx.showToast({ title: result.error, icon: 'none' })
    getApp().refreshSession()
    wx.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => wx.switchTab({ url: '/pages/card/index' }), 350)
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer)
  }
})
