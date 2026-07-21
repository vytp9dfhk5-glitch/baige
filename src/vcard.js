function escapeVCard(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,')
}

export function buildVCard(card) {
  const address = (card.addresses || []).find(Boolean) || card.companyAddress || ''
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N;CHARSET=UTF-8:;${escapeVCard(card.name)};;;`,
    `FN;CHARSET=UTF-8:${escapeVCard(card.name)}`,
    card.company && `ORG;CHARSET=UTF-8:${escapeVCard(card.company)}`,
    card.title && `TITLE;CHARSET=UTF-8:${escapeVCard(card.title)}`,
    card.phone && `TEL;TYPE=CELL:${escapeVCard(card.phone)}`,
    card.email && `EMAIL;TYPE=INTERNET:${escapeVCard(card.email)}`,
    address && `ADR;TYPE=WORK;CHARSET=UTF-8:;;${escapeVCard(address)};;;;`,
    card.wechat && `NOTE;CHARSET=UTF-8:${escapeVCard(`微信号：${card.wechat}`)}`,
    'END:VCARD',
  ].filter(Boolean).join('\r\n')
}

export function addToContacts(card, notify) {
  const blob = new Blob([buildVCard(card)], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${card.name || '联系人'}.vcf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
  notify('联系人信息已准备，请在系统页面确认添加')
}
