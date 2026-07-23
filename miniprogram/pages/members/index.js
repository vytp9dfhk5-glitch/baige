const store = require('../../utils/store')

const ROLE_OPTIONS = [
  { value: 'employee', label: '员工' },
  { value: 'broker', label: '经纪人' },
  { value: 'admin', label: '管理员' },
]

Page({
  data: {
    query: '',
    members: [],
    shown: [],
    editing: null,
    originalPhone: '',
    roleOptions: ROLE_OPTIONS,
    roleIndex: 0,
    statusOptions: ['正常', '停用'],
    statusIndex: 0,
  },

  onLoad() { this.load() },
  onPullDownRefresh() { this.load(); wx.stopPullDownRefresh() },

  load() {
    const session = store.getSession()
    const current = session && store.getMember(session.phone)
    if (!current || current.role !== 'admin') return wx.navigateBack()
    const order = { admin: 0, employee: 1, broker: 2 }
    const members = store.getMembers().sort((a, b) => {
      const roleDiff = order[a.role] - order[b.role]
      if (roleDiff) return roleDiff
      if (a.phone === store.PRIMARY_ADMIN_PHONE) return -1
      if (b.phone === store.PRIMARY_ADMIN_PHONE) return 1
      return String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN') || a.phone.localeCompare(b.phone)
    }).map((item) => Object.assign({}, item, {
      initial: item.name ? item.name.substring(0, 1) : '员',
      roleText: store.roleLabel(item.role),
      maskedPhone: store.maskPhone(item.phone),
      stateText: item.status === 'disabled' ? '停用' : store.cardStatus(item).label,
    }))
    this.setData({ members }, () => this.applySearch())
  },

  onSearch(event) { this.setData({ query: event.detail.value }, () => this.applySearch()) },
  clearSearch() { this.setData({ query: '' }, () => this.applySearch()) },
  applySearch() {
    const query = this.data.query.trim().toLowerCase().replace(/\s+/g, '')
    const shown = query ? this.data.members.filter((item) => `${item.name}${item.phone}${item.title}${item.roleText}`.toLowerCase().replace(/\s+/g, '').includes(query)) : this.data.members
    this.setData({ shown })
  },

  editMember(event) {
    const phone = event.currentTarget.dataset.phone
    const source = store.getMember(phone)
    const editing = Object.assign({}, source)
    const roleIndex = Math.max(0, ROLE_OPTIONS.findIndex((item) => item.value === editing.role))
    this.setData({ editing, originalPhone: phone, roleIndex, statusIndex: editing.status === 'disabled' ? 1 : 0 })
  },

  closeEditor() { this.setData({ editing: null, originalPhone: '' }) },
  noop() {},
  setEditingField(event) {
    const patch = {}
    patch[`editing.${event.currentTarget.dataset.field}`] = event.detail.value
    this.setData(patch)
  },
  changeRole(event) {
    const roleIndex = Number(event.detail.value)
    this.setData({ roleIndex, 'editing.role': ROLE_OPTIONS[roleIndex].value })
  },
  changeStatus(event) {
    const statusIndex = Number(event.detail.value)
    this.setData({ statusIndex, 'editing.status': statusIndex === 1 ? 'disabled' : 'active' })
  },
  changeValidity(event) { this.setData({ 'editing.cardValidUntil': event.detail.value }) },

  saveMember() {
    const editing = this.data.editing
    if (!/^1\d{10}$/.test(editing.phone)) return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    if (editing.role !== 'broker' && !String(editing.name || '').trim()) return wx.showToast({ title: '请填写姓名', icon: 'none' })
    if (editing.role !== 'broker' && !String(editing.title || '').trim()) return wx.showToast({ title: '请填写默认职位', icon: 'none' })
    const result = store.updateMember(this.data.originalPhone, Object.assign({}, editing, { name: String(editing.name || '').trim(), title: String(editing.title || '').trim(), email: String(editing.email || '').trim() }))
    if (result.error) return wx.showToast({ title: result.error, icon: 'none' })
    getApp().refreshSession()
    wx.showToast({ title: '成员资料已更新', icon: 'success' })
    this.closeEditor()
    this.load()
  }
})
