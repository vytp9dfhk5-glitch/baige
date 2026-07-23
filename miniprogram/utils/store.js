const { employeeDirectory } = require('../data/employees')
const { PRIMARY_ADMIN_PHONE, DEFAULT_ENTERPRISE } = require('../data/mock')

const KEYS = {
  session: 'baige-mp-session-v1',
  members: 'baige-mp-members-v1',
  cards: 'baige-mp-cards-v1',
  enterprise: 'baige-mp-enterprise-v1',
  requests: 'baige-mp-requests-v1',
  notificationRead: 'baige-mp-notification-read-v1',
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function read(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined || value === null ? clone(fallback) : value
  } catch (error) {
    return clone(fallback)
  }
}

function write(key, value) {
  wx.setStorageSync(key, value)
  return value
}

function addMonths(months) {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return formatDate(date)
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function defaultMembers() {
  return employeeDirectory.map((employee) => ({
    id: employee.phone === PRIMARY_ADMIN_PHONE ? 'primary-admin' : `directory-${employee.phone}`,
    phone: employee.phone,
    name: employee.name,
    title: employee.title,
    email: '',
    role: employee.phone === PRIMARY_ADMIN_PHONE ? 'admin' : 'employee',
    status: 'active',
    cardValidUntil: addMonths(12),
    cardApprovalStatus: 'approved',
    renewalStatus: 'idle',
  }))
}

function initializeStorage() {
  if (!wx.getStorageSync(KEYS.members)) write(KEYS.members, defaultMembers())
  if (!wx.getStorageSync(KEYS.cards)) write(KEYS.cards, {})
  if (!wx.getStorageSync(KEYS.enterprise)) write(KEYS.enterprise, clone(DEFAULT_ENTERPRISE))
  if (!wx.getStorageSync(KEYS.requests)) write(KEYS.requests, [])
  if (!wx.getStorageSync(KEYS.notificationRead)) write(KEYS.notificationRead, {})
}

function getSession() { return read(KEYS.session, null) }
function getMembers() { return read(KEYS.members, defaultMembers()) }
function setMembers(members) { return write(KEYS.members, members) }
function getMember(phone) { return getMembers().find((item) => item.phone === phone) || null }
function getCards() { return read(KEYS.cards, {}) }
function getCard(phone) { return getCards()[phone] || null }
function getEnterprise() { return read(KEYS.enterprise, DEFAULT_ENTERPRISE) }
function setEnterprise(value) { return write(KEYS.enterprise, value) }
function getRequests() { return read(KEYS.requests, []) }
function setRequests(value) { return write(KEYS.requests, value) }

function login(phone) {
  let members = getMembers()
  let member = members.find((item) => item.phone === phone)
  if (member && member.status === 'disabled') return { error: '该账号已停用，请联系管理员' }
  if (!member) {
    member = {
      id: `broker-${phone}`,
      phone,
      name: '',
      title: '',
      email: '',
      role: 'broker',
      status: 'active',
      cardValidUntil: '',
      cardApprovalStatus: 'draft',
      renewalStatus: 'idle',
    }
    members.push(member)
    setMembers(members)
  }
  const session = { phone, loginAt: Date.now() }
  write(KEYS.session, session)
  return { session, member }
}

function logout() {
  wx.removeStorageSync(KEYS.session)
}

function mergeCard(personal, enterprise, member) {
  if (!personal) return null
  return Object.assign({}, personal, {
    company: enterprise.company,
    companyAddress: enterprise.address,
    companyIntroductionImage: enterprise.introImage,
    companyPdfName: enterprise.pdfName,
    companyPdfUrl: enterprise.pdfUrl,
    videoUrl: enterprise.videoUrl,
    videoName: enterprise.videoName,
    videoPoster: enterprise.videoPoster,
    news: enterprise.news || [],
    cardValidUntil: member && member.cardValidUntil ? member.cardValidUntil : personal.cardValidUntil || '',
  })
}

function getDisplayCard(phone) {
  return mergeCard(getCard(phone), getEnterprise(), getMember(phone))
}

function upsertRequest(request) {
  const requests = getRequests()
  const existingIndex = requests.findIndex((item) => item.phone === request.phone && item.type === request.type && item.status === 'pending')
  if (existingIndex >= 0) requests[existingIndex] = Object.assign({}, requests[existingIndex], request)
  else requests.unshift(request)
  setRequests(requests)
  return request
}

function saveCard(phone, form) {
  const cards = getCards()
  const members = getMembers()
  const memberIndex = members.findIndex((item) => item.phone === phone)
  if (memberIndex < 0) return { error: '账号信息不存在，请重新登录' }
  const member = members[memberIndex]
  const currentCard = cards[phone]
  const titleChanged = member.role === 'employee' && String(form.title || '').trim() !== String(member.title || '').trim()
  const brokerNeedsApproval = member.role === 'broker' && member.cardApprovalStatus !== 'approved'
  const requestedTitle = String(form.title || '').trim()
  const savedCard = Object.assign({}, form, {
    name: String(form.name || '').trim(),
    title: titleChanged ? member.title : requestedTitle,
    phone: String(form.phone || '').trim(),
    email: String(form.email || '').trim(),
    cardValidUntil: member.cardValidUntil || '',
  })
  cards[phone] = savedCard
  write(KEYS.cards, cards)

  members[memberIndex] = Object.assign({}, member, {
    name: savedCard.name,
    email: savedCard.email,
    title: member.role === 'admin' || member.role === 'broker' ? requestedTitle : member.title,
    cardApprovalStatus: brokerNeedsApproval ? 'pending' : member.cardApprovalStatus,
  })
  setMembers(members)

  if (titleChanged) {
    upsertRequest({
      id: `title-${Date.now()}`,
      type: 'title_change',
      phone,
      name: savedCard.name,
      currentTitle: member.title || '未设置',
      requestedTitle,
      submittedAt: Date.now(),
      status: 'pending',
    })
    return { card: savedCard, pending: 'title_change', wasNew: !currentCard }
  }
  if (brokerNeedsApproval) {
    upsertRequest({
      id: `broker-${Date.now()}`,
      type: 'broker_initial',
      phone,
      name: savedCard.name,
      requestedTitle,
      submittedAt: Date.now(),
      status: 'pending',
    })
    return { card: savedCard, pending: 'broker_initial', wasNew: !currentCard }
  }
  return { card: savedCard, pending: '', wasNew: !currentCard }
}

function requestRenewal(phone) {
  const member = getMember(phone)
  if (!member) return null
  return upsertRequest({
    id: `renewal-${Date.now()}`,
    type: 'renewal',
    phone,
    name: member.name,
    currentValidUntil: member.cardValidUntil,
    submittedAt: Date.now(),
    status: 'pending',
  })
}

function reviewRequest(id, status, validUntil, rejectionReason) {
  const requests = getRequests()
  const requestIndex = requests.findIndex((item) => item.id === id)
  if (requestIndex < 0) return null
  const request = requests[requestIndex]
  const members = getMembers()
  const memberIndex = members.findIndex((item) => item.phone === request.phone)
  const cards = getCards()
  const member = members[memberIndex]
  const reviewed = Object.assign({}, request, {
    status,
    validUntil: status === 'approved' ? validUntil : request.validUntil || '',
    rejectionReason: status === 'rejected' ? String(rejectionReason || '').trim() : '',
    reviewedAt: Date.now(),
  })
  requests[requestIndex] = reviewed

  if (member) {
    if (request.type === 'title_change' && status === 'approved') {
      member.title = request.requestedTitle
      if (cards[request.phone]) cards[request.phone].title = request.requestedTitle
    }
    if (request.type === 'broker_initial') {
      member.cardApprovalStatus = status === 'approved' ? 'approved' : 'rejected'
      if (status === 'approved') member.cardValidUntil = validUntil
    }
    if (request.type === 'renewal') {
      member.renewalStatus = status === 'approved' ? 'approved' : 'rejected'
      if (status === 'approved') member.cardValidUntil = validUntil
    }
    members[memberIndex] = member
    setMembers(members)
    write(KEYS.cards, cards)
  }
  setRequests(requests)
  return reviewed
}

function updateMember(originalPhone, updated) {
  const members = getMembers()
  const index = members.findIndex((item) => item.phone === originalPhone)
  if (index < 0) return { error: '成员不存在' }
  if (members.some((item, memberIndex) => memberIndex !== index && item.phone === updated.phone)) return { error: '该手机号已被其他成员使用' }
  const primary = originalPhone === PRIMARY_ADMIN_PHONE
  const original = members[index]
  const next = Object.assign({}, original, updated, {
    role: primary ? 'admin' : updated.role,
    status: primary ? 'active' : updated.status,
    cardApprovalStatus: updated.role === 'broker' ? (original.role === 'broker' ? original.cardApprovalStatus : 'draft') : 'approved',
  })
  members[index] = next
  setMembers(members)
  if (originalPhone !== updated.phone) {
    const cards = getCards()
    if (cards[originalPhone]) {
      cards[updated.phone] = cards[originalPhone]
      delete cards[originalPhone]
      write(KEYS.cards, cards)
    }
    const requests = getRequests().map((item) => item.phone === originalPhone ? Object.assign({}, item, { phone: updated.phone }) : item)
    setRequests(requests)
    const session = getSession()
    if (session && session.phone === originalPhone) write(KEYS.session, Object.assign({}, session, { phone: updated.phone }))
  }
  return { member: next }
}

function isExpired(value) {
  if (!value) return false
  return Date.now() > new Date(`${value}T23:59:59`).getTime()
}

function daysUntilExpiry(value) {
  if (!value) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(`${value}T00:00:00`)
  return Math.round((expiry.getTime() - today.getTime()) / 86400000)
}

function cardStatus(member, requests) {
  if (!member) return { key: 'normal', label: '正常' }
  const pending = (requests || getRequests()).some((item) => item.phone === member.phone && item.status === 'pending')
  if (member.status === 'disabled' || member.renewalStatus === 'rejected' || member.role === 'broker' && member.cardApprovalStatus === 'rejected') return { key: 'disabled', label: '已禁用' }
  if (isExpired(member.cardValidUntil)) return { key: 'expired', label: '已过期' }
  if (pending || member.role === 'broker' && member.cardApprovalStatus === 'pending') return { key: 'pending', label: '待审核' }
  return { key: 'normal', label: '正常' }
}

function roleLabel(role) {
  return role === 'admin' ? '管理员' : role === 'broker' ? '经纪人' : '员工'
}

function requestTypeLabel(type) {
  return type === 'title_change' ? '职位变更' : type === 'broker_initial' ? '创建名片' : '名片续期'
}

function maskPhone(phone) {
  return String(phone || '').replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function getNotifications(phone) {
  const member = getMember(phone)
  if (!member) return []
  const reviewed = getRequests()
    .filter((item) => item.phone === phone && item.status !== 'pending' && item.reviewedAt)
    .map((item) => ({
      id: `request:${item.id}:${item.status}`,
      tone: item.status === 'approved' ? 'success' : 'danger',
      title: `${requestTypeLabel(item.type)}审核${item.status === 'approved' ? '通过' : '拒绝'}`,
      detail: item.status === 'approved' ? `${requestTypeLabel(item.type)}已生效${item.validUntil ? `，新有效期至 ${item.validUntil}` : ''}。` : `申请未通过。${item.rejectionReason ? `拒绝原因：${item.rejectionReason}` : ''}`,
      time: item.reviewedAt,
    }))
  const days = daysUntilExpiry(member.cardValidUntil)
  const expiry = []
  if (days !== null && days <= 7 && member.renewalStatus !== 'rejected') {
    expiry.push({
      id: `expiry:${member.cardValidUntil}:${days < 0 ? 'expired' : days <= 1 ? 1 : days <= 3 ? 3 : 7}`,
      tone: days <= 1 ? 'danger' : 'warning',
      title: days < 0 ? '名片已过期' : '名片即将到期',
      detail: days < 0 ? `名片有效期已于 ${member.cardValidUntil} 结束，请提交续期申请。` : `名片还剩 ${days} 天到期，可提前提交续期申请。`,
      time: Date.now(),
    })
  }
  const result = expiry.concat(reviewed).sort((a, b) => b.time - a.time)
  if (result.length) return result
  return [
    { id: `demo-${phone}-1`, tone: 'success', title: '职位变更审核已通过', detail: '您提交的职位变更申请已通过，名片信息已同步更新。', time: Date.now() - 12 * 60000 },
    { id: `demo-${phone}-2`, tone: 'warning', title: '名片到期提醒', detail: '名片将在最后 7 天、3 天和 1 天提醒您及时续期。', time: Date.now() - 26 * 3600000 },
  ]
}

function markNotificationsRead(phone, ids) {
  const all = read(KEYS.notificationRead, {})
  all[phone] = Array.from(new Set((all[phone] || []).concat(ids)))
  write(KEYS.notificationRead, all)
}

function unreadNotificationCount(phone) {
  const all = read(KEYS.notificationRead, {})
  const readIds = all[phone] || []
  return getNotifications(phone).filter((item) => !readIds.includes(item.id)).length
}

module.exports = {
  KEYS,
  PRIMARY_ADMIN_PHONE,
  initializeStorage,
  getSession,
  getMembers,
  getMember,
  getCard,
  getDisplayCard,
  getEnterprise,
  setEnterprise,
  getRequests,
  login,
  logout,
  saveCard,
  requestRenewal,
  reviewRequest,
  updateMember,
  mergeCard,
  cardStatus,
  daysUntilExpiry,
  isExpired,
  roleLabel,
  requestTypeLabel,
  maskPhone,
  formatDateTime,
  addMonths,
  getNotifications,
  markNotificationsRead,
  unreadNotificationCount,
}
