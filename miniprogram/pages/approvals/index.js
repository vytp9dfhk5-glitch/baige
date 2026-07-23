const store = require('../../utils/store')

Page({
  data: {
    typeFilter: 'all',
    statusFilter: 'all',
    requests: [],
    shown: [],
    rejectOpen: false,
    rejectingId: '',
    rejectionReason: '',
  },

  onLoad() { this.load() },
  onPullDownRefresh() { this.load(); wx.stopPullDownRefresh() },

  load() {
    const session = store.getSession()
    const member = session && store.getMember(session.phone)
    if (!member || member.role !== 'admin') return wx.navigateBack()
    const requests = store.getRequests().sort((a, b) => b.submittedAt - a.submittedAt).map((item) => Object.assign({}, item, {
      initial: item.name ? item.name.substring(0, 1) : '申',
      typeText: store.requestTypeLabel(item.type),
      statusText: item.status === 'approved' ? '已通过' : item.status === 'rejected' ? '已拒绝' : '待审核',
      timeText: store.formatDateTime(item.submittedAt),
      validUntil: item.validUntil || store.addMonths(12),
      showRejection: item.status === 'rejected' && Boolean(item.rejectionReason),
    }))
    this.setData({ requests }, () => this.applyFilters())
  },

  setTypeFilter(event) { this.setData({ typeFilter: event.currentTarget.dataset.value }, () => this.applyFilters()) },
  setStatusFilter(event) { this.setData({ statusFilter: event.currentTarget.dataset.value }, () => this.applyFilters()) },
  applyFilters() {
    const shown = this.data.requests.filter((item) => (this.data.typeFilter === 'all' || item.type === this.data.typeFilter) && (this.data.statusFilter === 'all' || item.status === this.data.statusFilter))
    this.setData({ shown })
  },

  changeValidity(event) {
    const id = event.currentTarget.dataset.id
    const value = event.detail.value
    const requests = this.data.requests.map((item) => item.id === id ? Object.assign({}, item, { validUntil: value }) : item)
    this.setData({ requests }, () => this.applyFilters())
  },

  approve(event) {
    const id = event.currentTarget.dataset.id
    const request = this.data.requests.find((item) => item.id === id)
    store.reviewRequest(id, 'approved', request.validUntil, '')
    wx.showToast({ title: '审批已通过', icon: 'success' })
    this.load()
  },

  openReject(event) { this.setData({ rejectOpen: true, rejectingId: event.currentTarget.dataset.id, rejectionReason: '' }) },
  closeReject() { this.setData({ rejectOpen: false, rejectingId: '', rejectionReason: '' }) },
  onReason(event) { this.setData({ rejectionReason: event.detail.value }) },
  noop() {},
  confirmReject() {
    if (!this.data.rejectionReason.trim()) return wx.showToast({ title: '请填写拒绝原因', icon: 'none' })
    store.reviewRequest(this.data.rejectingId, 'rejected', '', this.data.rejectionReason)
    wx.showToast({ title: '已拒绝申请', icon: 'success' })
    this.closeReject()
    this.load()
  }
})
