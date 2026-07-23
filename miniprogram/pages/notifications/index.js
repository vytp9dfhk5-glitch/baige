const store = require('../../utils/store')

Page({
  data: { notifications: [] },
  onShow() {
    const session = store.getSession()
    if (!session) return wx.reLaunch({ url: '/pages/login/index' })
    const notifications = store.getNotifications(session.phone).map((item) => Object.assign({}, item, { timeText: store.formatDateTime(item.time) }))
    store.markNotificationsRead(session.phone, notifications.map((item) => item.id))
    this.setData({ notifications })
  }
})
