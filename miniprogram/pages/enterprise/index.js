const store = require('../../utils/store')
const { PUBLIC_CARD } = require('../../data/mock')

Page({
  data: {
    form: null,
    previewCard: null,
    previewing: false,
    draggingIndex: -1,
  },

  onLoad() {
    const session = store.getSession()
    const member = session && store.getMember(session.phone)
    if (!member || member.role !== 'admin') return wx.navigateBack()
    this.setData({ form: JSON.parse(JSON.stringify(store.getEnterprise())) })
  },

  setField(event) {
    const field = event.currentTarget.dataset.field
    const patch = {}
    patch[`form.${field}`] = event.detail.value
    this.setData(patch)
  },

  chooseVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      success: ({ tempFiles }) => {
        const file = tempFiles[0]
        const name = file.tempFilePath.split('/').pop()
        wx.saveFile({
          tempFilePath: file.tempFilePath,
          success: ({ savedFilePath }) => this.setData({ 'form.videoUrl': savedFilePath, 'form.videoName': name }),
          fail: () => this.setData({ 'form.videoUrl': file.tempFilePath, 'form.videoName': name })
        })
      }
    })
  },

  choosePoster() {
    wx.chooseMedia({ count: 1, mediaType: ['image'], sizeType: ['compressed'], success: ({ tempFiles }) => this.setData({ 'form.videoPoster': tempFiles[0].tempFilePath }) })
  },

  addNews() {
    const news = this.data.form.news.concat({ id: `news-${Date.now()}`, title: '', url: '' })
    this.setData({ 'form.news': news })
  },

  setNewsField(event) {
    const index = Number(event.currentTarget.dataset.index)
    const field = event.currentTarget.dataset.field
    const news = this.data.form.news.slice()
    news[index][field] = event.detail.value
    this.setData({ 'form.news': news })
  },

  removeNews(event) {
    const index = Number(event.currentTarget.dataset.index)
    this.setData({ 'form.news': this.data.form.news.filter((item, current) => current !== index) })
  },

  dragStart(event) {
    const index = Number(event.currentTarget.dataset.index)
    wx.createSelectorQuery().select('.news-list').boundingClientRect((rect) => {
      this.dragRect = rect
      this.setData({ draggingIndex: index })
    }).exec()
  },

  dragMove(event) {
    if (!this.dragRect || this.data.draggingIndex < 0 || !event.touches.length) return
    const rowHeight = this.dragRect.height / Math.max(this.data.form.news.length, 1)
    const target = Math.max(0, Math.min(this.data.form.news.length - 1, Math.floor((event.touches[0].clientY - this.dragRect.top) / rowHeight)))
    const current = this.data.draggingIndex
    if (target === current) return
    const news = this.data.form.news.slice()
    const moved = news.splice(current, 1)[0]
    news.splice(target, 0, moved)
    this.setData({ 'form.news': news, draggingIndex: target })
  },

  dragEnd() {
    this.dragRect = null
    this.setData({ draggingIndex: -1 })
  },

  choosePdf() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf'],
      success: ({ tempFiles }) => {
        const file = tempFiles[0]
        this.setData({ 'form.pdfName': file.name, 'form.pdfUrl': file.path })
        wx.showToast({ title: 'PDF长图转换正式版由服务端完成', icon: 'none', duration: 2600 })
      }
    })
  },

  preview() {
    if (!this.data.form.company.trim()) return wx.showToast({ title: '请填写公司名称', icon: 'none' })
    const form = Object.assign({}, this.data.form, {
      news: this.data.form.news.filter((item) => item.title.trim()).map((item) => Object.assign({}, item, { title: item.title.trim(), url: item.url.trim() }))
    })
    const previewCard = store.mergeCard(PUBLIC_CARD, form, { cardValidUntil: store.addMonths(12) })
    this.setData({ form, previewCard, previewing: true })
  },

  closePreview() { this.setData({ previewing: false }) },

  publish() {
    store.setEnterprise(this.data.form)
    wx.showToast({ title: '企业配置已发布', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 400)
  },

  addContact() { wx.showToast({ title: '预览中不执行通讯录操作', icon: 'none' }) },
  openNews() { wx.showToast({ title: '预览中不打开外部资讯', icon: 'none' }) },
  openPdf() { wx.showToast({ title: '预览中不打开PDF', icon: 'none' }) }
})
