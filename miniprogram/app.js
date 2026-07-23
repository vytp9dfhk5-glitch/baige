const store = require('./utils/store')

App({
  globalData: {
    session: null,
    member: null,
  },

  onLaunch() {
    store.initializeStorage()
    this.refreshSession()
    wx.login({
      success: ({ code }) => {
        this.globalData.wxLoginCode = code
      },
    })
  },

  refreshSession() {
    const session = store.getSession()
    this.globalData.session = session
    this.globalData.member = session ? store.getMember(session.phone) : null
    return this.globalData.member
  },
})
