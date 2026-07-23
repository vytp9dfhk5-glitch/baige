Component({
  data: {
    selected: 0,
    role: 'employee',
    list: [
      { pagePath: '/pages/card/index', text: '名片', icon: '▣', role: 'all' },
      { pagePath: '/pages/visitors/index', text: '访客', icon: '⌁', role: 'all' },
      { pagePath: '/pages/admin/index', text: '管理', icon: '⚙', role: 'admin' },
      { pagePath: '/pages/me/index', text: '我的', icon: '○', role: 'all' }
    ]
  },
  lifetimes: {
    attached() {
      const app = getApp()
      const member = app.refreshSession ? app.refreshSession() : app.globalData.member
      this.setData({ role: member ? member.role : 'employee' })
    }
  },
  methods: {
    switchTab(event) {
      const url = event.currentTarget.dataset.path
      wx.switchTab({ url })
    }
  }
})
