Component({
  data: { initial: '名', displayAddresses: [], hasNews: false },
  properties: {
    card: { type: Object, value: null },
    showContactAction: { type: Boolean, value: true }
  },
  observers: {
    card(card) {
      if (!card) return
      this.setData({
        initial: card.name ? card.name.substring(0, 1) : '名',
        displayAddresses: card.addresses && card.addresses.length ? card.addresses : card.companyAddress ? [card.companyAddress] : [],
        hasNews: Boolean(card.news && card.news.length)
      })
    }
  },
  methods: {
    addContact() { this.triggerEvent('addcontact') },
    openNews(event) { this.triggerEvent('opennews', event.currentTarget.dataset.item) },
    openPdf() { this.triggerEvent('openpdf') }
  }
})
