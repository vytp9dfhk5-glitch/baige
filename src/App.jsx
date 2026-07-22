import React, { useEffect, useRef, useState } from 'react'
import {
  Activity, ArrowLeft, BarChart3, Bell, CalendarDays, Check, ChevronRight,
  Clock3, ContactRound, Copy, Edit3, Eye, Flame, Home, ImageIcon,
  GripVertical, Lightbulb, LockKeyhole, LogOut, Mail, MapPin, MessageCircle,
  MoreHorizontal, Newspaper, Phone, Plus, Share2, ShieldCheck,
  Settings2, Smartphone, Sparkles, Trash2, TrendingUp, Upload,
  UserCog, UserRound, UsersRound, Video, X
} from './icons'
import { employeeDirectory } from './employeeData'
import { addToContacts } from './vcard'

const SESSION_KEY = 'baige-card-session-v2'
const FIXED_CONTENT_KEY = 'baige-card-fixed-content-v3'
const MEMBERS_KEY = 'baige-card-members-v3'
const REQUESTS_KEY = 'baige-card-requests-v2'
const NOTIFICATION_READ_PREFIX = 'baige-card-notification-read-v1:'
const PRIMARY_ADMIN_PHONE = '18059880224'

const emptyCard = {
  avatar: '', name: '', title: '', company: '', addresses: [], phone: '',
  email: '', wechat: '', intro: '', videoUrl: '', news: []
}

const defaultAvatars = Array.from({length: 6}, (_, index) => `./default-avatar-${index + 1}.svg`)

const addressCandidates = [
  '厦门市湖里区高林中路491号白鸽天地金融（保险）科技产业园24层',
  '厦门市思明区软件园二期观日路',
  '厦门市集美区软件园三期诚毅北大街',
  '福州市鼓楼区五四路金融中心',
  '上海市浦东新区陆家嘴环路',
  '北京市朝阳区建国路CBD商务区',
  '深圳市南山区粤海街道科技园',
  '杭州市滨江区江南大道',
  '广州市天河区珠江新城',
]

const defaultNews = [
  {
    id: 'baige-hk-listing',
    title: '白鸽在线正式在香港联交所主板挂牌上市',
    url: 'https://mp.weixin.qq.com/s/N1YPtMQt3mjCe_W4BTTZwQ',
  },
  {
    id: 'xiamen-data-association',
    title: '厦门市数据发展协会正式成立 白鸽在线为主要发起单位',
    url: 'https://mp.weixin.qq.com/s/HJ9TK02aa2VSAaJN7GSOIA',
  },
]

const publicCard = {
  avatar: './tu-jinbo.jpg',
  name: '涂锦波',
  title: '创始人 / 董事长 / CEO',
  company: '白鸽在线（厦门）数字科技股份有限公司',
  companyAddress: '厦门市湖里区高林中路491号白鸽天地金融（保险）科技产业园24层',
  addresses: [],
  phone: '18650111999',
  email: 'tjb@baigebao.com',
  wechat: '',
  intro: '白鸽在线创始人、董事长、执行董事兼首席执行官，拥有超过24年保险行业及企业管理经验，负责集团整体战略规划、业务方向及经营管理，推动白鸽在线向AI风控基础设施提供商和全球化数字风险管理解决方案商迈进。',
  slogan: '算法的终点不是效率，而是人的安心；技术的价值不是替代，而是更好地守护。',
  companyIntroductionImage: './company-introduction-2026.webp',
  companyPdfName: '【企业简介】白鸽在线（2026版）.pdf',
  companyPdfUrl: './company-introduction-2026.pdf',
  videoUrl: './company-promo-2026.mp4',
  videoName: '白鸽在线企业宣传视频',
  news: defaultNews,
}

const defaultFixedContent = {
  company: publicCard.company,
  address: publicCard.companyAddress,
  companyIntroductionImage: './company-introduction-2026.webp',
  companyPdfName: '【企业简介】白鸽在线（2026版）.pdf',
  companyPdfUrl: './company-introduction-2026.pdf',
  videoUrl: './company-promo-2026.mp4',
  videoName: '白鸽在线企业宣传视频',
  videoPoster: '',
  news: defaultNews,
}

const defaultMembers = employeeDirectory.map(employee => ({
  ...employee,
  id: employee.phone === PRIMARY_ADMIN_PHONE ? 'primary-admin' : `directory-${employee.phone}`,
  email: '',
  role: employee.phone === PRIMARY_ADMIN_PHONE ? 'admin' : 'employee',
  status: 'active',
  cardValidUntil: defaultValidUntil(),
  cardApprovalStatus: 'approved',
}))

const visitors = [
  { id: 1, wechatAuthorized: true, wechatName: '陈志远', avatar: '陈', color: '#3478f6', openTime: '今天 10:42', duration: '8分24秒', score: 92, visits: 4, content: '公司介绍', status: '重点关注', path: ['打开电子名片', '查看个人简介', '浏览公司介绍 4分12秒', '查看企业资讯'] },
  { id: 2, wechatAuthorized: true, wechatName: '刘雯', avatar: '刘', color: '#8b5cf6', openTime: '今天 09:18', duration: '5分06秒', score: 81, visits: 2, content: '公司风采', status: '持续关注', path: ['微信分享进入', '查看公司介绍', '播放企业宣传视频 2分03秒', '再次打开名片'] },
  { id: 3, wechatAuthorized: false, wechatName: '', avatar: '访', color: '#12b981', openTime: '昨天 16:20', duration: '2分18秒', score: 56, visits: 1, content: '个人简介', status: '待了解', path: ['微信分享进入', '查看个人信息', '浏览个人简介'] },
  { id: 4, wechatAuthorized: true, wechatName: '孙晓琳', avatar: '孙', color: '#f59e0b', openTime: '昨天 11:36', duration: '6分45秒', score: 87, visits: 3, content: '企业资讯', status: '重点关注', path: ['好友分享进入', '浏览公司介绍 3分08秒', '查看企业资讯', '返回名片首页'] },
  { id: 5, wechatAuthorized: false, wechatName: '', avatar: '访', color: '#94a3b8', openTime: '周三 14:08', duration: '0分46秒', score: 28, visits: 1, content: '名片首页', status: '快速浏览', path: ['微信分享进入', '查看名片首页', '离开'] },
]

function visitorDisplayName(visitor) {
  return visitor.wechatAuthorized && visitor.wechatName ? visitor.wechatName : '匿名访客'
}

const trend = [23, 35, 29, 48, 45, 67, 72]

function loadLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch { return fallback }
}

function cardKey(phone) { return `baige-card-v2:${phone}` }

function defaultValidUntil() {
  return validUntilAfterMonths(12)
}

function validUntilAfterMonths(months) {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date.toISOString().slice(0, 10)
}

function normalizeMember(member) {
  const role = member.role || 'employee'
  const normalized = {
    email: '',
    title: '',
    role,
    status: 'active',
    ...member,
  }
  return {
    ...normalized,
    cardValidUntil: role === 'broker' ? (normalized.cardValidUntil || '') : (normalized.cardValidUntil || defaultValidUntil()),
    cardApprovalStatus: role === 'broker' ? (normalized.cardApprovalStatus || 'draft') : 'approved',
    renewalStatus: normalized.renewalStatus || 'idle',
  }
}

function roleLabel(role) {
  if (role === 'admin') return '管理员'
  if (role === 'broker') return '经纪人'
  return '员工'
}

function isCardExpired(value) {
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

function requestTypeLabel(type) {
  if (type === 'title_change') return '职位变更'
  if (type === 'broker_initial') return '创建名片'
  return '名片续期'
}

function cardStatusOf(member, { pendingTitle = false, pendingRenewal = false } = {}) {
  if (!member) return { key: 'normal', label: '正常' }
  if (member.status === 'disabled' || member.renewalStatus === 'rejected' || member.role === 'broker' && member.cardApprovalStatus === 'rejected') return { key: 'disabled', label: '已禁用' }
  if (isCardExpired(member.cardValidUntil)) return { key: 'expired', label: '已过期' }
  if (pendingTitle || pendingRenewal || member.role === 'broker' && member.cardApprovalStatus === 'pending') return { key: 'pending', label: '待审核' }
  return { key: 'normal', label: '正常' }
}

function expiryNotification(member) {
  const days = daysUntilExpiry(member?.cardValidUntil)
  if (days === null || days > 7 || member.renewalStatus === 'rejected') return null
  if (days < 0) return {
    id: `expiry:${member.cardValidUntil}:expired`,
    tone: 'danger',
    title: '名片已过期',
    detail: `名片有效期已于 ${member.cardValidUntil} 结束，请提交续期申请。`,
    time: new Date(`${member.cardValidUntil}T23:59:59`).getTime(),
  }
  const threshold = days <= 1 ? 1 : days <= 3 ? 3 : 7
  return {
    id: `expiry:${member.cardValidUntil}:${threshold}`,
    tone: threshold === 1 ? 'danger' : 'warning',
    title: threshold === 1 ? '名片即将到期' : `名片有效期不足 ${threshold} 天`,
    detail: days === 0 ? '名片将在今天到期，可立即提交续期申请。' : `名片还剩 ${days} 天到期，可提前提交续期申请。`,
    time: Date.now(),
  }
}

function buildNotifications(requests, member) {
  if (!member) return []
  const reviewed = requests
    .filter(item => item.phone === member.phone && item.status !== 'pending' && item.reviewedAt)
    .map(item => ({
      id: `request:${item.id}:${item.status}`,
      tone: item.status === 'approved' ? 'success' : 'danger',
      title: `${requestTypeLabel(item.type)}审核${item.status === 'approved' ? '通过' : '拒绝'}`,
      detail: item.status === 'approved'
        ? `${requestTypeLabel(item.type)}已生效${item.validUntil ? `，新有效期至 ${item.validUntil}` : ''}。`
        : `申请未通过。${item.rejectionReason ? `拒绝原因：${item.rejectionReason}` : ''}`,
      time: item.reviewedAt,
    }))
  const expiry = expiryNotification(member)
  const actual = [...(expiry ? [expiry] : []), ...reviewed].sort((a, b) => b.time - a.time)
  if (actual.length > 0) return actual
  return [
    {
      id: `demo:${member.phone}:approval`,
      tone: 'success',
      title: '职位变更审核已通过',
      detail: '您提交的职位变更申请已通过，名片信息已同步更新。',
      time: Date.now() - 12 * 60000,
    },
    {
      id: `demo:${member.phone}:expiry`,
      tone: 'warning',
      title: '名片即将到期',
      detail: '您的名片将在 7 天后到期，请及时提交续期申请。',
      time: Date.now() - 26 * 3600000,
    },
  ]
}

function formatDateTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function mergeCard(personal, fixedContent, member) {
  if (!personal) return null
  return {
    ...personal,
    company: fixedContent.company,
    companyAddress: fixedContent.address,
    companyIntroductionImage: fixedContent.companyIntroductionImage,
    companyPdfName: fixedContent.companyPdfName,
    companyPdfUrl: fixedContent.companyPdfUrl,
    videoUrl: fixedContent.videoUrl,
    videoName: fixedContent.videoName,
    videoPoster: fixedContent.videoPoster,
    news: fixedContent.news,
    cardValidUntil: member?.cardValidUntil || personal.cardValidUntil || '',
  }
}

function encodeShareCard(card) {
  const payload = {
    ...card,
    avatar: card.avatar?.startsWith('data:') || card.avatar?.startsWith('blob:') ? '' : card.avatar,
    videoUrl: card.videoUrl?.startsWith('blob:') ? '' : card.videoUrl,
    videoPoster: card.videoPoster?.startsWith('blob:') ? '' : card.videoPoster,
  }
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  let binary = ''
  bytes.forEach(byte => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeShareCard(value) {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch { return null }
}

function buildShareUrl(card) {
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set('view', 'shared')
  url.searchParams.set('card', encodeShareCard(card))
  return url.toString()
}

function App() {
  const params = new URLSearchParams(window.location.search)
  const view = params.get('view')
  if (view === 'visitor') return <PublicCardView card={publicCard} />
  if (view === 'shared') return <PublicCardView card={decodeShareCard(params.get('card') || '') || publicCard} shared />
  return <OwnerApp />
}

function OwnerApp() {
  const initialMembers = loadLocal(MEMBERS_KEY, defaultMembers).map(normalizeMember)
  const storedSession = loadLocal(SESSION_KEY, null)
  const initialSession = storedSession && initialMembers.some(item => item.phone === storedSession.phone) ? storedSession : null
  const [session, setSession] = useState(initialSession)
  const [card, setCard] = useState(() => initialSession ? loadLocal(cardKey(initialSession.phone), null) : null)
  const [fixedContent, setFixedContent] = useState(() => ({...defaultFixedContent, ...loadLocal(FIXED_CONTENT_KEY, {})}))
  const [members, setMembers] = useState(initialMembers)
  const [requests, setRequests] = useState(() => loadLocal(REQUESTS_KEY, []))
  const [tab, setTab] = useState('card')
  const [editorOpen, setEditorOpen] = useState(false)
  const [fixedEditorOpen, setFixedEditorOpen] = useState(false)
  const [memberEditor, setMemberEditor] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationRead, setNotificationRead] = useState(() => initialSession ? loadLocal(`${NOTIFICATION_READ_PREFIX}${initialSession.phone}`, []) : [])
  const [visitor, setVisitor] = useState(null)
  const [toast, setToast] = useState('')

  const currentMember = session ? members.find(item => item.phone === session.phone) : null
  const isAdmin = currentMember?.role === 'admin'
  const isEmployee = currentMember?.role === 'employee'
  const isBroker = currentMember?.role === 'broker'
  const displayCard = mergeCard(card, fixedContent, currentMember)
  const pendingTitleRequest = requests.find(item => item.phone === session?.phone && item.type === 'title_change' && item.status === 'pending')
  const pendingRenewalRequest = requests.find(item => item.phone === session?.phone && item.type === 'renewal' && item.status === 'pending')
  const brokerApprovalState = isBroker ? (currentMember.cardApprovalStatus || 'draft') : 'approved'
  const cardStatus = cardStatusOf(currentMember, { pendingTitle: Boolean(pendingTitleRequest), pendingRenewal: Boolean(pendingRenewalRequest) })
  const renewalDays = daysUntilExpiry(currentMember?.cardValidUntil)
  const renewalEligible = renewalDays !== null && renewalDays <= 7
  const notifications = buildNotifications(requests, currentMember)
  const unreadNotifications = notifications.filter(item => !notificationRead.includes(item.id))
  const shareBlocked = Boolean(pendingTitleRequest || isBroker && brokerApprovalState !== 'approved' || cardStatus.key === 'expired' || cardStatus.key === 'disabled')
  const editorInitial = currentMember ? {
    ...emptyCard,
    ...(card || {}),
    name: card?.name || currentMember.name || '',
    title: pendingTitleRequest?.requestedTitle || card?.title || currentMember.title || '',
    phone: card?.phone || currentMember.phone || '',
    email: card?.email || currentMember.email || '',
  } : emptyCard

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  const notify = text => setToast(text)
  const openNotifications = () => {
    const readIds = [...new Set([...notificationRead, ...notifications.map(item => item.id)])]
    localStorage.setItem(`${NOTIFICATION_READ_PREFIX}${session.phone}`, JSON.stringify(readIds))
    setNotificationRead(readIds)
    setNotificationOpen(true)
  }
  const openShare = () => {
    if (cardStatus.key === 'disabled') {
      notify('名片已禁用，续期审核通过后才能重新使用')
      return
    }
    if (cardStatus.key === 'expired') {
      notify('名片已过期，请先提交续期申请')
      return
    }
    if (pendingTitleRequest) {
      notify('职位变更审核中，管理员通过后才可对外分享')
      return
    }
    if (isBroker && brokerApprovalState !== 'approved') {
      notify(brokerApprovalState === 'rejected' ? '名片申请未通过，请修改后重新提交' : '经纪人名片审核通过后才可使用')
      return
    }
    setShareOpen(true)
  }

  const login = phone => {
    let existing = members.find(item => item.phone === phone)
    if (existing?.status === 'disabled') {
      notify('该账号已停用，请联系管理员')
      return
    }
    if (!existing) {
      existing = normalizeMember({
        id: `broker-${phone}`,
        phone,
        name: '',
        title: '',
        email: '',
        role: 'broker',
        status: 'active',
        cardValidUntil: '',
        cardApprovalStatus: 'draft',
      })
      const nextMembers = [...members, existing]
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(nextMembers))
      setMembers(nextMembers)
    }
    const next = { phone, loginAt: Date.now() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
    setNotificationRead(loadLocal(`${NOTIFICATION_READ_PREFIX}${phone}`, []))
    const savedCard = loadLocal(cardKey(phone), null)
    const hydratedCard = savedCard && existing ? {
      ...savedCard,
      name: savedCard.name || existing.name,
      title: existing.role === 'employee' ? (existing.title || savedCard.title) : (savedCard.title || existing.title),
      phone: savedCard.phone || existing.phone,
      email: existing.email || savedCard.email,
    } : savedCard
    if (hydratedCard) localStorage.setItem(cardKey(phone), JSON.stringify(hydratedCard))
    setCard(hydratedCard)
    setTab('card')
    notify(existing.role === 'broker' && !savedCard ? '经纪人登录成功，请先完善个人信息' : '登录成功')
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setCard(null)
    setNotificationOpen(false)
    setNotificationRead([])
    setTab('card')
  }

  const saveCard = nextCard => {
    const titleChanged = isEmployee && nextCard.title.trim() !== (currentMember.title || '').trim()
    const brokerNeedsInitialApproval = isBroker && brokerApprovalState !== 'approved'
    const savedCard = {
      ...nextCard,
      title: titleChanged ? currentMember.title : nextCard.title,
      cardValidUntil: currentMember.cardValidUntil,
    }
    localStorage.setItem(cardKey(session.phone), JSON.stringify(savedCard))
    setCard(savedCard)
    const nextMembers = members.map(item => item.phone === session.phone ? {
      ...item,
      name: nextCard.name,
      email: nextCard.email,
      title: isAdmin || isBroker ? nextCard.title : item.title,
      cardApprovalStatus: brokerNeedsInitialApproval ? 'pending' : item.cardApprovalStatus,
    } : item)
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(nextMembers))
    setMembers(nextMembers)
    if (titleChanged) {
      const existingRequest = requests.find(item => item.phone === session.phone && item.type === 'title_change' && item.status === 'pending')
      const request = {
        id: existingRequest?.id || `title-${Date.now()}`,
        type: 'title_change',
        phone: session.phone,
        memberId: currentMember.id,
        name: nextCard.name,
        currentTitle: currentMember.title || '未设置',
        requestedTitle: nextCard.title.trim(),
        submittedAt: Date.now(),
        status: 'pending',
      }
      const nextRequests = existingRequest
        ? requests.map(item => item.id === existingRequest.id ? request : item)
        : [request, ...requests]
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(nextRequests))
      setRequests(nextRequests)
    }
    if (brokerNeedsInitialApproval) {
      const existingRequest = requests.find(item => item.phone === session.phone && item.type === 'broker_initial' && item.status === 'pending')
      const request = {
        id: existingRequest?.id || `broker-initial-${Date.now()}`,
        type: 'broker_initial',
        phone: session.phone,
        memberId: currentMember.id,
        role: 'broker',
        name: nextCard.name,
        requestedTitle: nextCard.title.trim(),
        contactPhone: nextCard.phone.trim(),
        submittedAt: Date.now(),
        status: 'pending',
      }
      const nextRequests = existingRequest
        ? requests.map(item => item.id === existingRequest.id ? request : item)
        : [request, ...requests]
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(nextRequests))
      setRequests(nextRequests)
    }
    setEditorOpen(false)
    setTab('card')
    notify(brokerNeedsInitialApproval ? '个人信息已保存，名片已提交管理员审核' : titleChanged ? '个人信息已保存，职位变更已提交管理员审批' : '名片生成成功')
  }

  const saveFixedContent = nextContent => {
    localStorage.setItem(FIXED_CONTENT_KEY, JSON.stringify(nextContent))
    setFixedContent(nextContent)
    setFixedEditorOpen(false)
    notify('企业配置已更新')
  }

  const saveMember = nextMember => {
    if (nextMember.phone === session.phone && (nextMember.role !== 'admin' || nextMember.status === 'disabled')) {
      notify('不能降级或停用当前管理员账号')
      return
    }
    const previousMember = members.find(item => item.id === nextMember.id)
    if (previousMember?.phone === session.phone && nextMember.phone !== session.phone) {
      notify('不能在当前登录状态修改自己的登录手机号')
      return
    }
    const normalized = normalizeMember({ ...nextMember, id: nextMember.id || `employee-${Date.now()}` })
    const nextMembers = members.some(item => item.id === normalized.id)
      ? members.map(item => item.id === normalized.id ? normalized : item)
      : [...members, normalized]
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(nextMembers))
    setMembers(nextMembers)
    const previousPhone = previousMember?.phone || normalized.phone
    const savedCard = loadLocal(cardKey(previousPhone), null)
    if (savedCard) {
      const syncedCard = {
        ...savedCard,
        name: normalized.name || savedCard.name,
        title: normalized.role === 'employee' || normalized.role === 'admin' ? normalized.title : savedCard.title,
        email: normalized.email || savedCard.email,
        cardValidUntil: normalized.cardValidUntil,
      }
      localStorage.setItem(cardKey(normalized.phone), JSON.stringify(syncedCard))
      if (previousPhone !== normalized.phone) localStorage.removeItem(cardKey(previousPhone))
      if (normalized.phone === session.phone) setCard(syncedCard)
    }
    if (previousPhone !== normalized.phone) {
      const nextRequests = requests.map(item => item.memberId === normalized.id || item.phone === previousPhone ? {...item, phone: normalized.phone} : item)
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(nextRequests))
      setRequests(nextRequests)
    }
    setMemberEditor(null)
    notify(nextMember.id ? '成员信息已更新' : '成员已添加')
  }

  const requestRenewal = () => {
    if (pendingRenewalRequest || !renewalEligible) return
    const request = {
      id: `renewal-${Date.now()}`,
      type: 'renewal',
      phone: session.phone,
      memberId: currentMember.id,
      role: currentMember.role,
      name: card?.name || currentMember.name || roleLabel(currentMember.role),
      currentTitle: currentMember.title || '',
      currentValidUntil: currentMember.cardValidUntil || '',
      submittedAt: Date.now(),
      status: 'pending',
    }
    const nextRequests = [request, ...requests]
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(nextRequests))
    setRequests(nextRequests)
    const nextMembers = members.map(item => item.phone === session.phone ? {...item, renewalStatus: 'pending'} : item)
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(nextMembers))
    setMembers(nextMembers)
    notify('名片续期申请已提交，请等待管理员审核')
  }

  const reviewRequest = (requestId, decision, validUntil, rejectionReason = '') => {
    const request = requests.find(item => item.id === requestId)
    if (!request) return
    if (decision === 'rejected' && !rejectionReason.trim()) {
      notify('拒绝申请前必须填写拒绝原因')
      return
    }
    const reviewedAt = Date.now()
    const nextRequests = requests.map(item => item.id === requestId ? {
      ...item,
      status: decision,
      validUntil: decision === 'approved' ? validUntil : item.validUntil,
      rejectionReason: decision === 'rejected' ? rejectionReason.trim() : '',
      reviewedAt,
    } : item)
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(nextRequests))
    setRequests(nextRequests)
    if (decision === 'approved') {
      const nextMembers = members.map(item => item.phone === request.phone ? {
        ...item,
        title: request.type === 'title_change' || request.type === 'broker_initial' ? request.requestedTitle : item.title,
        cardValidUntil: validUntil,
        cardApprovalStatus: request.type === 'broker_initial' ? 'approved' : item.cardApprovalStatus,
        renewalStatus: request.type === 'renewal' ? 'idle' : item.renewalStatus,
      } : item)
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(nextMembers))
      setMembers(nextMembers)
      const savedCard = loadLocal(cardKey(request.phone), null)
      if (savedCard) {
        localStorage.setItem(cardKey(request.phone), JSON.stringify({
          ...savedCard,
          title: request.type === 'title_change' || request.type === 'broker_initial' ? request.requestedTitle : savedCard.title,
          cardValidUntil: validUntil,
        }))
      }
    } else if (request.type === 'broker_initial') {
      const nextMembers = members.map(item => item.phone === request.phone ? {
        ...item,
        cardApprovalStatus: 'rejected',
        cardValidUntil: '',
      } : item)
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(nextMembers))
      setMembers(nextMembers)
    } else if (request.type === 'renewal') {
      const nextMembers = members.map(item => item.phone === request.phone ? {
        ...item,
        renewalStatus: 'rejected',
      } : item)
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(nextMembers))
      setMembers(nextMembers)
    }
    notify(decision === 'approved' ? '申请已通过，名片已按设置的有效期生效' : '申请已拒绝')
  }

  if (!session) {
    return <div className="app-shell login-shell">
      <main className="phone-stage login-stage"><LoginPage onLogin={login} />{toast && <div className="toast"><Check size={17}/>{toast}</div>}</main>
    </div>
  }

  return <div className="app-shell">
    <main className="phone-stage">
      <TopBar tab={tab} card={displayCard} shareBlocked={shareBlocked} unreadCount={unreadNotifications.length} onNotifications={openNotifications} onEdit={() => setEditorOpen(true)} onShare={openShare} />
      <div className="screen">
        {tab === 'card' && <CardPage card={displayCard} status={cardStatus} renewalDays={renewalDays} renewalEligible={renewalEligible} pendingRenewal={pendingRenewalRequest} pendingTitle={pendingTitleRequest} brokerApprovalState={brokerApprovalState} member={currentMember} requests={requests} notify={notify} onCreate={() => setEditorOpen(true)} onEdit={() => setEditorOpen(true)} onRenew={requestRenewal} />}
        {tab === 'visitors' && <VisitorPage card={cardStatus.key === 'expired' || cardStatus.key === 'disabled' || isBroker && brokerApprovalState !== 'approved' ? null : displayCard} onSelect={setVisitor} />}
        {tab === 'admin' && isAdmin && <AdminPage fixedContent={fixedContent} members={members} requests={requests} onReview={reviewRequest} onEditFixed={() => setFixedEditorOpen(true)} onAddMember={() => setMemberEditor({ id: '', phone: '', name: '', title: '', email: '', cardValidUntil: defaultValidUntil(), cardApprovalStatus: 'approved', role: 'employee', status: 'active' })} onEditMember={setMemberEditor} />}
        {tab === 'me' && <MePage session={session} card={card} member={currentMember} requests={requests} onLogout={logout} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} isAdmin={isAdmin} />
      {editorOpen && <CardEditor initial={editorInitial} titleApprovalRequired={isEmployee} initialApprovalRequired={isBroker && brokerApprovalState !== 'approved'} approvalStatus={brokerApprovalState} loginPhone={session.phone} approvedTitle={currentMember.title || ''} pendingTitle={pendingTitleRequest?.requestedTitle || ''} onClose={() => setEditorOpen(false)} onSave={saveCard} />}
      {fixedEditorOpen && isAdmin && <FixedContentEditor initial={fixedContent} onClose={() => setFixedEditorOpen(false)} onSave={saveFixedContent} />}
      {memberEditor && isAdmin && <MemberEditor initial={memberEditor} members={members} onClose={() => setMemberEditor(null)} onSave={saveMember} />}
      {shareOpen && displayCard && !shareBlocked && <ShareSheet card={displayCard} onClose={() => setShareOpen(false)} notify={notify} />}
      {notificationOpen && <NotificationCenter notifications={notifications} onClose={() => setNotificationOpen(false)} />}
      {visitor && <VisitorDetail visitor={visitor} onClose={() => setVisitor(null)} notify={notify} />}
      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </main>
  </div>
}

function PublicCardView({ card, shared = false }) {
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  return <div className="app-shell public-shell">
    <main className="phone-stage public-stage">
      <header className="topbar public-topbar"><Brand /><span>电子名片</span></header>
      <div className="screen public-screen">
        {isCardExpired(card.cardValidUntil) ? <ExpiredPublicCard /> : <div className="card-page page-pad"><GeneratedCard card={card} notify={setToast} readonly /></div>}
      </div>
      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </main>
  </div>
}

function Brand() {
  return <div className="brand"><img className="brand-logo" src="https://www.baigeonline.com.cn/images/head/img_logo.png" alt="白鸽在线"/></div>
}

function LoginRail() {
  return <aside className="desktop-rail login-rail">
    <Brand />
    <span className="eyebrow">AI DIGITAL CARD</span>
    <h1>让每一次介绍，<br/>都更完整、更有价值。</h1>
    <p>一张可自主编辑、持续更新，并能看见访客关注轨迹的智能电子名片。</p>
    <div className="login-feature"><ShieldCheck/><div><b>信息由本人维护</b><span>未填写的内容不会对外展示</span></div></div>
    <div className="login-feature"><Activity/><div><b>访客行为洞察</b><span>访问次数、内容偏好与浏览时长</span></div></div>
  </aside>
}

function DesktopRail({ card, role }) {
  return <aside className="desktop-rail">
    <Brand />
    <p>白鸽在线智能电子名片</p>
    <div className="rail-stat"><strong>{card ? '已生成' : '待创建'}</strong><span>当前名片状态</span></div>
    <div className="rail-stat"><strong>{roleLabel(role)}</strong><span>当前账号角色</span></div>
    <div className="rail-tip"><Sparkles size={20}/><b>使用建议</b><span>{role === 'admin' ? '维护企业配置、成员角色与名片审批。' : role === 'broker' ? '首次填写个人信息后，需等待管理员审核名片。' : card ? '企业配置由管理员维护，你只需及时更新个人信息。' : '预设资料已带入，完善个人信息即可生成名片。'}</span></div>
  </aside>
}

function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [agreed, setAgreed] = useState(false)
  const digits = phone.replace(/\D/g, '').slice(0, 11)
  const phoneValid = /^1\d{10}$/.test(digits)
  const valid = phoneValid && /^\d{6}$/.test(code)

  useEffect(() => {
    if (!countdown) return
    const timer = setInterval(() => setCountdown(value => value > 1 ? value - 1 : 0), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  return <div className="login-page">
    <div className="login-brand"><Brand /><span>智能电子名片</span></div>
    <div className="login-visual">
      <div className="login-orb"><Smartphone size={34}/><i/></div>
      <span>一键登录 · 快速创建</span>
    </div>
    <section className="login-card">
      <h1>欢迎使用</h1>
      <p>员工自动匹配预设信息，经纪人可直接填写并申请名片</p>
      <label className="phone-input">
        <span>+86</span>
        <input inputMode="numeric" value={digits} onChange={e => setPhone(e.target.value)} placeholder="请输入手机号" aria-label="手机号" />
      </label>
      <label className="code-input">
        <input inputMode="numeric" value={code} onChange={event => setCode(event.target.value.replace(/\D/g,'').slice(0,6))} placeholder="请输入6位验证码" aria-label="验证码" />
        <button type="button" disabled={!phoneValid || countdown > 0} onClick={() => setCountdown(60)}>{countdown > 0 ? `${countdown}s` : '获取验证码'}</button>
      </label>
      <button className="login-button" disabled={!valid || !agreed} onClick={() => onLogin(digits)}><Smartphone size={18}/>手机号验证码登录</button>
      <label className="agreement"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}/><i>{agreed && <Check size={11}/>}</i><span>我已阅读并同意《用户协议》和《隐私政策》</span></label>
      <div className="secure-login"><LockKeyhole size={13}/>验证码原型输入任意6位数字即可登录</div>
    </section>
  </div>
}

function TopBar({ tab, card, shareBlocked = false, unreadCount = 0, onNotifications, onEdit, onShare }) {
  const titles = { visitors: '访客雷达', admin: '企业管理', me: '我的' }
  return <header className="topbar">
    {tab === 'card' ? <Brand /> : <div className="page-heading"><b>{titles[tab]}</b>{tab === 'visitors' && <span className="live"><i/>实时</span>}</div>}
    {tab === 'card' ? <div className="topbar-actions">
      <button className="icon-button notification-button" onClick={onNotifications} aria-label={`消息通知${unreadCount ? `，${unreadCount}条未读` : ''}`}><Bell size={18}/>{unreadCount > 0 && <i>{unreadCount > 9 ? '9+' : unreadCount}</i>}</button>
      {card && <button className="icon-button" onClick={onEdit} aria-label="编辑名片"><Edit3 size={18}/></button>}
      {card && <button className={`icon-button share-top-button ${shareBlocked ? 'blocked' : ''}`} onClick={onShare} aria-label={shareBlocked ? '名片当前不可分享' : '分享名片'}><Share2 size={18}/></button>}
    </div> : <button className="icon-button passive" aria-label="更多"><MoreHorizontal size={22}/></button>}
  </header>
}

function CardPage({ card, status, renewalDays, renewalEligible, pendingRenewal, pendingTitle, brokerApprovalState, member, requests, notify, onCreate, onEdit, onRenew }) {
  if (!card) return <EmptyCard role={member.role} onCreate={onCreate}/>
  if (member.role === 'broker' && brokerApprovalState !== 'approved') return <BrokerApprovalCard state={brokerApprovalState} onEdit={onEdit}/>
  if (status.key === 'disabled') {
    const rejectedRenewal = [...requests].filter(item => item.phone === member.phone && item.type === 'renewal' && item.status === 'rejected').sort((a, b) => b.reviewedAt - a.reviewedAt)[0]
    return <DisabledCard reason={rejectedRenewal?.rejectionReason} pending={pendingRenewal} onRenew={onRenew}/>
  }
  if (status.key === 'expired') return <ExpiredCard member={member} pending={pendingRenewal} onRenew={onRenew}/>
  return <div className="card-page page-pad">
    <GeneratedCard card={card} status={status} notify={notify} />
    {renewalEligible && <section className={`renewal-callout ${renewalDays <= 1 ? 'urgent' : ''}`}><Clock3 size={17}/><div><b>{renewalDays === 0 ? '名片今天到期' : `名片还剩 ${renewalDays} 天到期`}</b><p>可提前提交续期申请，由管理员审核并设置新的有效期。</p></div><button disabled={Boolean(pendingRenewal)} onClick={onRenew}>{pendingRenewal ? '审核中' : '申请续期'}</button></section>}
    {pendingTitle && <section className="share-review-lock"><LockKeyhole size={16}/><div><b>职位变更审核中，暂不可对外分享</b><p>当前名片继续展示“{pendingTitle.currentTitle}”；管理员通过“{pendingTitle.requestedTitle}”后，分享功能会自动恢复。</p></div></section>}
  </div>
}

function BrokerApprovalCard({ state, onEdit }) {
  const rejected = state === 'rejected'
  return <div className="expired-card-page page-pad"><section className={`expired-card-state broker-review-state ${rejected ? 'rejected' : ''}`}>
    <CardStatusBadge status={{ key: rejected ? 'disabled' : 'pending', label: rejected ? '已禁用' : '待审核' }}/>
    <span>{rejected ? <X size={31}/> : <Clock3 size={31}/>}</span>
    <small>{rejected ? '名片申请未通过' : '经纪人名片审核中'}</small>
    <h1>{rejected ? '修改后可以重新提交' : '等待管理员审核'}</h1>
    <p>{rejected ? '请检查并调整个人信息，重新保存后会再次进入审批中心。' : '管理员审核通过并设置有效期后，名片才可查看、分享和对外使用。'}</p>
    <button className="button primary" onClick={onEdit}>{rejected ? '修改并重新提交' : '修改个人信息'}</button>
  </section></div>
}

function ExpiredCard({ member, pending, onRenew }) {
  return <div className="expired-card-page page-pad"><section className="expired-card-state">
    <CardStatusBadge status={{ key: 'expired', label: '已过期' }}/>
    <span><Clock3 size={31}/></span>
    <small>名片有效期已结束</small>
    <h1>需要重新申请使用</h1>
    <p>本名片有效期至 {member.cardValidUntil}。续期申请通过前，访客无法继续查看和保存这张名片。</p>
    <button className="button primary" disabled={Boolean(pending)} onClick={onRenew}>{pending ? '续期申请审核中' : '申请续期'}</button>
  </section></div>
}

function DisabledCard({ reason, pending, onRenew }) {
  return <div className="expired-card-page page-pad"><section className="expired-card-state disabled-card-state">
    <CardStatusBadge status={{ key: pending ? 'pending' : 'disabled', label: pending ? '待审核' : '已禁用' }}/>
    <span><LockKeyhole size={31}/></span>
    <small>{pending ? '续期申请审核中' : '续期申请未通过'}</small>
    <h1>{pending ? '等待管理员处理' : '该名片暂不可用'}</h1>
    <p>{pending ? '管理员审核通过并设置新的有效期后，名片将自动恢复使用。' : reason ? `拒绝原因：${reason}` : '续期申请被拒绝后，名片不能继续查看或对外分享。'}</p>
    <button className="button primary" disabled={Boolean(pending)} onClick={onRenew}>{pending ? '续期申请审核中' : '重新申请续期'}</button>
  </section></div>
}

function ExpiredPublicCard() {
  return <div className="expired-card-page page-pad"><section className="expired-card-state public-expired-state">
    <span><LockKeyhole size={31}/></span>
    <small>名片暂不可用</small>
    <h1>该电子名片已过期</h1>
    <p>请联系名片本人重新申请使用后再查看。</p>
  </section></div>
}

function EmptyCard({ role, onCreate }) {
  const broker = role === 'broker'
  return <div className="empty-card-page page-pad">
    <section className="empty-card-hero">
      <div className="empty-card-art"><div/><UserRound size={44}/><Plus size={20}/></div>
      <span>还没有电子名片</span>
      <h1>完善你的个人信息</h1>
      <p>{broker ? '填写个人信息后提交管理员审核；通过后自动拼接企业配置并生效。' : '员工预设信息已自动带入；完善其他内容后会自动拼接企业配置。'}</p>
      <button className="button primary create-card-button" onClick={onCreate}><Plus size={18}/>{broker ? '填写并申请名片' : '完善个人信息'}</button>
    </section>
  </div>
}

function CardStatusBadge({ status }) {
  return <span className={`card-status-badge ${status.key}`}><i/>{status.label}</span>
}

function GeneratedCard({ card, status = { key: 'normal', label: '正常' }, notify, readonly = false }) {
  const news = (card.news || []).filter(x => x.title.trim())
  const addresses = (card.addresses || []).filter(Boolean)
  const hasIntro = card.intro || addresses.length > 0

  return <>
    <section className="business-card generated-business-card">
      <div className="card-glow glow-one"/><div className="card-glow glow-two"/>
      <div className="card-copy no-badge">
        <h1>{card.name}</h1>
        <p className="job">{card.title}</p>
        <p className="company">{card.company}</p>
        {card.phone && <div className="contact-line"><Phone size={15}/>{card.phone}</div>}
        {card.email && <div className="contact-line"><Mail size={15}/>{card.email}</div>}
        {card.wechat && <div className="contact-line"><MessageCircle size={15}/>{card.wechat}</div>}
      </div>
      {card.avatar ? <img className="portrait portrait-photo" src={card.avatar} alt={`${card.name}的头像`}/> : <div className="portrait-placeholder">{card.name.slice(0, 1)}</div>}
      <button className="card-contact-add" onClick={() => addToContacts(card, notify)} aria-label="添加至通讯录"><ContactRound size={16}/><span>添加至通讯录</span></button>
    </section>

    {!readonly && <section className="card-state-row"><CardStatusBadge status={status}/>{card.cardValidUntil && <span><ShieldCheck size={14}/>有效期至 {card.cardValidUntil}</span>}</section>}

    {hasIntro && <section className="section-card intro-card generated-section">
      <div className="section-head"><h2>个人简介</h2></div>
      {card.intro && <p>{card.intro}</p>}
      {card.slogan && <blockquote className="leader-quote">“{card.slogan}”</blockquote>}
      {addresses.length > 0 && <div className="personal-address-list">{addresses.map((address,index) => <div className="address" key={`${address}-${index}`}><MapPin size={16}/><span>{address}</span></div>)}</div>}
    </section>}

    {card.videoUrl && <section className="section-card media-section generated-section">
      <div className="section-head"><h2>公司风采</h2>{card.videoName && <span>{card.videoName}</span>}</div>
      <video className="company-video" src={normalMediaUrl(card.videoUrl)} poster={normalMediaUrl(card.videoPoster)} controls playsInline preload="metadata">你的浏览器暂不支持视频播放</video>
    </section>}

    {news.length > 0 && <section className="section-card news-section generated-section">
      <div className="section-head"><h2>企业资讯</h2><span>{news.length} 条</span></div>
      {news.map(item => <a key={item.id} className="news-row" href={normalUrl(item.url)} target="_blank" rel="noreferrer"><span><Newspaper size={16}/></span><b>{item.title}</b><ChevronRight size={15}/></a>)}
    </section>}

    {card.companyIntroductionImage && <section className="section-card company-profile-section generated-section">
      <div className="section-head"><h2>公司介绍</h2>{card.companyPdfName && <span>PDF · 15页</span>}</div>
      <img className="company-profile-long-image" src={card.companyIntroductionImage} alt="白鸽在线2026版企业介绍长图"/>
    </section>}

  </>
}

function normalUrl(value) {
  if (!value) return '#'
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function normalMediaUrl(value) {
  if (!value) return ''
  return /^(https?:|blob:|data:|\/|\.\/)/i.test(value) ? value : `https://${value}`
}

function CardEditor({ initial, titleApprovalRequired = false, initialApprovalRequired = false, approvalStatus = 'approved', loginPhone = '', approvedTitle = '', pendingTitle = '', onClose, onSave }) {
  const [form, setForm] = useState(() => ({...emptyCard, ...initial, addresses: initial.addresses || (initial.address ? [initial.address] : [])}))
  const [errors, setErrors] = useState({})
  const [activeAddress, setActiveAddress] = useState(null)
  const fileRef = useRef(null)

  const set = (key, value) => setForm(prev => ({...prev, [key]: value}))
  const addAddress = () => set('addresses', [...form.addresses, ''])
  const updateAddress = (index, value) => set('addresses', form.addresses.map((item, currentIndex) => currentIndex === index ? value : item))
  const suggestionsFor = value => {
    const keyword = value.replace(/\s/g, '').toLowerCase()
    if (!keyword) return addressCandidates.slice(0, 5)
    return addressCandidates.filter(address => {
      const target = address.replace(/\s/g, '').toLowerCase()
      return target.includes(keyword) || [...keyword].every(char => target.includes(char))
    }).slice(0, 5)
  }

  const uploadAvatar = file => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = event => {
      const img = new Image()
      img.onload = () => {
        const max = 900
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        set('avatar', canvas.toDataURL('image/jpeg', .84))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const submit = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = '请填写姓名'
    if (!form.title.trim()) nextErrors.title = '请填写职位'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave({
      avatar: form.avatar,
      name: form.name.trim(),
      title: form.title.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      wechat: form.wechat.trim(),
      intro: form.intro.trim(),
      addresses: form.addresses.map(item => item.trim()).filter(Boolean),
    })
  }

  return <div className="modal-layer editor-layer">
    <section className="modal-sheet card-editor-sheet">
      <header><button onClick={onClose}><ArrowLeft size={21}/></button><h2>{initial.name ? '编辑名片' : '添加名片'}</h2><button onClick={onClose}><X size={20}/></button></header>
      <div className="modal-body card-editor-body">
        <section className="editor-section avatar-config-card">
          <div className="avatar-editor">
            <div className="avatar-preview" onClick={() => fileRef.current?.click()}>{form.avatar ? <img src={form.avatar}/> : <><ImageIcon size={28}/><span>上传头像</span></>}</div>
            <div><b>个人头像</b><p>可选择默认头像，也可以上传 JPG、PNG 图片</p><button onClick={() => fileRef.current?.click()}><Upload size={15}/>{form.avatar ? '上传新头像' : '上传头像'}</button></div>
          </div>
          <input ref={fileRef} hidden type="file" accept="image/*" onChange={e => uploadAvatar(e.target.files?.[0])}/>
          <div className="default-avatar-picker">
            <span>选择默认头像</span>
            <div>{defaultAvatars.map((avatar,index) => <button className={form.avatar === avatar ? 'active' : ''} key={avatar} onClick={() => set('avatar',avatar)} aria-label={`默认头像 ${index + 1}`}><img src={avatar} alt=""/>{form.avatar === avatar && <Check size={13}/>}</button>)}</div>
          </div>
        </section>

        <EditorTitle title="个人信息" />
        <div className="form-grid editor-form">
          <Field label="姓名" required error={errors.name}><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="请输入姓名"/></Field>
          <Field label="职位" required error={errors.title}><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="例如：董事长 / CEO"/></Field>
        </div>
        {titleApprovalRequired && <section className={`title-approval-tip ${pendingTitle ? 'pending' : ''}`}><ShieldCheck size={15}/><div><b>{pendingTitle ? '职位变更正在审核' : '职位变更需要管理员确认'}</b><p>{pendingTitle ? `当前名片仍展示“${approvedTitle || '未设置'}”，申请职位为“${pendingTitle}”。` : `当前已通过职位：${approvedTitle || '未设置'}。修改后会生成审批申请，通过后才更新名片。`}</p></div></section>}
        {initialApprovalRequired && <section className={`title-approval-tip broker-approval-tip ${approvalStatus === 'pending' ? 'pending' : ''}`}><ShieldCheck size={15}/><div><b>{approvalStatus === 'rejected' ? '修改后将重新提交审核' : approvalStatus === 'pending' ? '经纪人名片正在审核' : '首次生成需要管理员审核'}</b><p>管理员通过并设置名片有效期后，才能查看、分享和对外使用。</p></div></section>}

        <EditorTitle title="联系方式" />
        <div className="form-grid editor-form">
          <Field label="手机号"><input inputMode="tel" value={form.phone} onChange={e => set('phone', e.target.value.replace(/[^\d+\-\s]/g, '').slice(0, 24))} placeholder="请输入名片展示手机号"/></Field>
          <Field label="邮箱"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="请输入邮箱"/></Field>
          <Field label="微信号" wide><input value={form.wechat} onChange={e => set('wechat', e.target.value)} placeholder="请输入微信号"/></Field>
        </div>
        <section className="login-phone-tip"><Smartphone size={15}/><div><b>名片手机号可自行修改</b><p>当前登录手机号为 {loginPhone}；登录手机号由账号资料决定，如需变更请联系管理员在后台更新。</p></div></section>

        <EditorTitle title="个人简介" />
        <label className="textarea-label editor-textarea"><textarea rows="5" value={form.intro} onChange={e => set('intro', e.target.value)} placeholder="介绍你的经历、专长或理念；未填写则不展示该模块"/><small>{form.intro.length}/500</small></label>

        <EditorTitle title="公司地址" action={<button onClick={addAddress}><Plus size={14}/>添加地址</button>} />
        {form.addresses.length === 0 ? <AddEmpty text="还没有公司地址" onClick={addAddress}/> : <div className="repeat-editor-list">{form.addresses.map((address, index) => <div className="address-editor-wrap" key={`${index}-${form.addresses.length}`}>
          <div className="repeat-editor address-editor-item"><span><MapPin size={15}/></span><div><input value={address} onFocus={() => setActiveAddress(index)} onChange={event => { updateAddress(index,event.target.value); setActiveAddress(index) }} placeholder={`搜索或输入地址 ${index + 1}`}/></div><button onClick={() => set('addresses', form.addresses.filter((_, currentIndex) => currentIndex !== index))}><Trash2 size={15}/></button></div>
          {activeAddress === index && <div className="address-suggestions">{suggestionsFor(address).map(suggestion => <button key={suggestion} onClick={() => { updateAddress(index,suggestion); setActiveAddress(null) }}><MapPin size={13}/><span>{suggestion}</span></button>)}</div>}
        </div>)}</div>}
      </div>
      <footer><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" onClick={submit}><Check size={17}/>{initialApprovalRequired ? '保存并提交审核' : '保存个人信息'}</button></footer>
    </section>
  </div>
}

function EditorTitle({ title, subtitle, action }) {
  return <div className="editor-title"><div><h3>{title}</h3>{subtitle && <span>{subtitle}</span>}</div>{action}</div>
}

function Field({ label, required, error, wide, children }) {
  return <label className={`${wide ? 'wide' : ''} ${error ? 'has-error' : ''}`}><span>{label}{required && <em>*</em>}</span>{children}{error && <small className="field-error">{error}</small>}</label>
}

function AddEmpty({ text, onClick }) {
  return <button className="add-empty" onClick={onClick}><Plus size={17}/><span>{text}，点击添加</span></button>
}

function FixedContentEditor({ initial, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...defaultFixedContent,
    ...initial,
    news: (initial.news || []).map(item => ({...item})),
  }))
  const [errors, setErrors] = useState({})
  const [videoError, setVideoError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const videoRef = useRef(null)
  const posterRef = useRef(null)
  const pdfRef = useRef(null)
  const set = (key, value) => setForm(prev => ({...prev, [key]: value}))
  const addNews = () => set('news', [...form.news, {id: Date.now(), title:'', url:''}])
  const updateNews = (id, key, value) => set('news', form.news.map(item => item.id === id ? {...item, [key]: value} : item))
  const uploadVideo = file => {
    if (!file) return
    const supported = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm'].includes(file.type) || /\.(mp4|mov|m4v|webm)$/i.test(file.name)
    if (!supported) {
      setVideoError('请选择 MP4、MOV、M4V 或 WebM 视频')
      return
    }
    setVideoError('')
    setForm(prev => ({...prev, videoUrl: URL.createObjectURL(file), videoName: file.name}))
  }
  const uploadPoster = file => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = event => set('videoPoster', event.target.result)
    reader.readAsDataURL(file)
  }
  const selectPdf = file => {
    if (!file || file.type !== 'application/pdf') return
    setForm(prev => ({...prev, companyPdfName: file.name, companyPdfUrl: URL.createObjectURL(file)}))
  }

  const moveNews = targetIndex => {
    if (draggingIndex === null || draggingIndex === targetIndex) return
    const next = [...form.news]
    const [moved] = next.splice(draggingIndex, 1)
    next.splice(targetIndex, 0, moved)
    set('news', next)
    setDraggingIndex(targetIndex)
  }

  const contentPayload = () => ({
    company: form.company.trim(),
    address: form.address.trim(),
    companyIntroductionImage: form.companyIntroductionImage,
    companyPdfName: form.companyPdfName,
    companyPdfUrl: form.companyPdfUrl,
    videoUrl: form.videoUrl.trim(),
    videoName: form.videoName?.trim() || '',
    videoPoster: form.videoPoster || '',
    news: form.news.filter(item => item.title.trim()).map(item => ({...item, title:item.title.trim(), url:item.url.trim()})),
  })

  const submit = () => {
    const nextErrors = {}
    if (!form.company.trim()) nextErrors.company = '请填写公司名称'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setPreviewOpen(true)
  }

  const previewCard = mergeCard(publicCard, contentPayload(), { cardValidUntil: defaultValidUntil() })

  return <div className="modal-layer editor-layer">
    <section className="modal-sheet card-editor-sheet">
      <header><button onClick={onClose}><ArrowLeft size={21}/></button><h2>企业配置</h2><button onClick={onClose}><X size={20}/></button></header>
      <div className="modal-body card-editor-body">
        <EditorTitle title="公司信息" />
        <div className="form-grid editor-form">
          <Field label="公司名称" required wide error={errors.company}><input value={form.company} onChange={event => set('company', event.target.value)} placeholder="请输入公司全称"/></Field>
          <Field label="公司地址" wide><input value={form.address} onChange={event => set('address', event.target.value)} placeholder="未填写则不展示地址"/></Field>
        </div>

        <EditorTitle title="公司介绍" />
        <section className="pdf-introduction-editor">
          <div className="pdf-file-row"><span><Newspaper size={19}/></span><div><b>{form.companyPdfName}</b><p>已生成15页企业介绍长图</p></div><div className="pdf-actions"><a href={form.companyPdfUrl} target="_blank" rel="noreferrer">查看PDF</a><button onClick={() => pdfRef.current?.click()}><Upload size={14}/>上传PDF</button></div></div>
          <input ref={pdfRef} hidden type="file" accept="application/pdf" onChange={event => selectPdf(event.target.files?.[0])}/>
          <img src={form.companyIntroductionImage} alt="公司介绍长图预览"/>
        </section>

        <EditorTitle title="企业宣传视频" />
        <div className="video-source-editor">
          <label className="single-editor-input"><Video size={17}/><input value={form.videoUrl.startsWith('blob:') ? '' : form.videoUrl} onChange={event => set('videoUrl', event.target.value)} placeholder="粘贴视频链接，或上传视频文件"/></label>
          <button onClick={() => videoRef.current?.click()}><Upload size={15}/>{form.videoName ? '更换视频' : '上传视频'}</button>
          <input ref={videoRef} hidden type="file" accept="video/mp4,video/quicktime,video/x-m4v,video/webm,.mp4,.mov,.m4v,.webm" onChange={event => uploadVideo(event.target.files?.[0])}/>
        </div>
        <p className="video-format-tip">支持 MP4、MOV、M4V、WebM 等常见视频格式</p>
        {videoError && <p className="upload-error">{videoError}</p>}
        {form.videoName && <div className="selected-video-name"><Video size={14}/><span>{form.videoName}</span><button onClick={() => setForm(prev => ({...prev,videoUrl:'',videoName:''}))}><X size={13}/></button></div>}
        <section className="video-poster-editor">
          <div className="video-poster-preview">{form.videoPoster ? <img src={normalMediaUrl(form.videoPoster)} alt="视频封面预览"/> : <><ImageIcon size={24}/><span>暂未设置封面</span></>}</div>
          <div><b>视频封面图</b><p>用于视频加载前展示，建议使用 16:9 图片</p><button onClick={() => posterRef.current?.click()}><Upload size={14}/>{form.videoPoster ? '更换封面' : '上传封面'}</button></div>
          <input ref={posterRef} hidden type="file" accept="image/*" onChange={event => uploadPoster(event.target.files?.[0])}/>
        </section>

        <EditorTitle title="企业资讯" action={<button onClick={addNews}><Plus size={14}/>添加资讯</button>} />
        {form.news.length > 1 && <p className="news-sort-tip"><GripVertical size={14}/>按住左侧排序图标拖拽，分享名片将按此顺序展示</p>}
        {form.news.length === 0 ? <AddEmpty text="还没有企业资讯" onClick={addNews}/> : <div className="repeat-editor-list sortable-news-list">{form.news.map((item, index) => <div className={`repeat-editor news-editor-item ${draggingIndex === index ? 'dragging' : ''}`} key={item.id} draggable onDragStart={() => setDraggingIndex(index)} onDragOver={event => { event.preventDefault(); moveNews(index) }} onDragEnd={() => setDraggingIndex(null)}>
          <button className="drag-handle" aria-label={`拖拽排序：${item.title || `资讯${index + 1}`}`}><GripVertical size={16}/></button><div><input value={item.title} onChange={event => updateNews(item.id,'title',event.target.value)} placeholder="资讯标题"/><input value={item.url} onChange={event => updateNews(item.id,'url',event.target.value)} placeholder="资讯链接"/></div><button onClick={() => set('news', form.news.filter(current => current.id !== item.id))}><Trash2 size={15}/></button>
        </div>)}</div>}
      </div>
      <footer><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" onClick={submit}><Eye size={17}/>预览效果</button></footer>
    </section>
    {previewOpen && <Modal title="发布前预览" onClose={() => setPreviewOpen(false)} footer={<><button className="button secondary" onClick={() => setPreviewOpen(false)}>返回修改</button><button className="button primary" onClick={() => onSave(contentPayload())}><Check size={17}/>确认发布</button></>}>
      <section className="enterprise-preview-note"><Eye size={18}/><div><b>完整名片效果预览</b><p>以下使用示例个人信息拼接当前企业配置草稿，确认无误后再发布到所有名片。</p></div></section>
      <div className="enterprise-card-preview"><GeneratedCard card={previewCard} notify={() => {}} readonly /></div>
    </Modal>}
  </div>
}

function MemberEditor({ initial, members, onClose, onSave }) {
  const [form, setForm] = useState(() => normalizeMember(initial))
  const [errors, setErrors] = useState({})
  const set = (key, value) => setForm(prev => ({...prev, [key]: value}))
  const primaryAdmin = form.phone === PRIMARY_ADMIN_PHONE
  const broker = form.role === 'broker'

  const submit = () => {
    const phone = form.phone.replace(/\D/g, '').slice(0, 11)
    const nextErrors = {}
    if (!/^1\d{10}$/.test(phone)) nextErrors.phone = '请输入正确的11位手机号'
    if (members.some(item => item.phone === phone && item.id !== form.id)) nextErrors.phone = '该手机号已经添加'
    if (!broker && !form.name.trim()) nextErrors.name = '请填写成员姓名'
    if (!broker && !form.title.trim()) nextErrors.title = '请填写默认职位'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = '请填写正确的邮箱'
    if (!broker && !form.cardValidUntil) nextErrors.cardValidUntil = '请设置名片有效期'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave({
      ...form,
      phone,
      name: form.name.trim(),
      title: form.title.trim(),
      email: form.email.trim(),
      cardValidUntil: form.cardValidUntil,
      role: primaryAdmin ? 'admin' : form.role,
      cardApprovalStatus: broker ? (form.cardApprovalStatus || 'draft') : 'approved',
    })
  }

  return <Modal title={initial.id ? '编辑成员资料' : '添加成员'} onClose={onClose} footer={<><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" onClick={submit}><Check size={17}/>保存成员</button></>}>
    <section className="member-editor-note"><UserCog size={20}/><div><b>{broker ? '经纪人账号' : '员工预置信息'}</b><p>{broker ? '经纪人没有姓名和职位预设，首次填写个人信息并生成名片后进入管理员审核。' : '姓名、默认职位和登录手机号会在员工登录时自动带入；修改登录手机号只能由管理员在此更新。'}</p></div></section>
    <div className="form-grid editor-form member-form">
      <Field label="登录手机号" required wide error={errors.phone}><input inputMode="numeric" value={form.phone} onChange={event => set('phone', event.target.value.replace(/\D/g, '').slice(0,11))} placeholder="用于登录和识别账号"/></Field>
      <Field label="姓名" required={!broker} error={errors.name}><input value={form.name} onChange={event => set('name', event.target.value)} placeholder={broker ? '由经纪人自行填写' : '请输入员工姓名'}/></Field>
      <Field label="默认职位" required={!broker} error={errors.title}><input value={form.title} onChange={event => set('title', event.target.value)} placeholder={broker ? '由经纪人自行填写' : '员工名片默认职位'}/></Field>
      <Field label="邮箱" wide error={errors.email}><input type="email" value={form.email} onChange={event => set('email', event.target.value)} placeholder={broker ? '由经纪人自行填写' : '员工企业邮箱'}/></Field>
      <Field label="名片有效期" required={!broker} wide error={errors.cardValidUntil}><input type="date" value={form.cardValidUntil} onChange={event => set('cardValidUntil', event.target.value)}/></Field>
      <Field label="角色"><select value={primaryAdmin ? 'admin' : form.role} disabled={primaryAdmin} onChange={event => { const role = event.target.value; setForm(prev => ({...prev, role, cardValidUntil: role === 'broker' && !prev.id ? '' : prev.cardValidUntil || defaultValidUntil(), cardApprovalStatus: role === 'broker' ? (prev.role === 'broker' ? prev.cardApprovalStatus : 'draft') : 'approved'})) }}><option value="employee">员工</option><option value="broker">经纪人</option><option value="admin">管理员</option></select></Field>
      <Field label="账号状态"><select value={form.status} onChange={event => set('status', event.target.value)}><option value="active">正常</option><option value="disabled">已停用</option></select></Field>
    </div>
    {broker && <p className="primary-admin-tip"><Clock3 size={13}/>经纪人有效期由管理员在首次名片审批时设置</p>}
    {primaryAdmin && <p className="primary-admin-tip"><LockKeyhole size={13}/>主管理员角色不可降级</p>}
  </Modal>
}

function AdminPage({ fixedContent, members, requests, onReview, onEditFixed, onAddMember, onEditMember }) {
  const [requestPage, setRequestPage] = useState('latest')
  const pendingRequests = requests.filter(item => item.status === 'pending')
  const latestPendingRequests = [...pendingRequests].sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 5)
  if (requestPage === 'all') return <AllRequestsPage requests={requests} onReview={onReview} onBack={() => setRequestPage('latest')}/>
  return <div className="admin-page page-pad">
    <section className="admin-hero">
      <div><h1>企业管理</h1><p>统一维护企业内容、成员身份、申请状态与名片有效期。</p></div>
    </section>

    <section className="section-card fixed-control-card">
      <div className="fixed-control-head"><span><Settings2 size={20}/></span><div><b>企业配置</b><p>自动拼接到管理员、员工和经纪人名片</p></div><button onClick={onEditFixed}>配置</button></div>
      <div className="fixed-content-preview"><div><span>公司名称</span><b>{fixedContent.company}</b></div><div><span>公司介绍</span><b>{fixedContent.companyPdfName ? 'PDF已设置' : '未设置'}</b></div><div><span>宣传视频</span><b>{fixedContent.videoUrl ? '已上传' : '待上传'}</b></div></div>
    </section>

    <div className="member-list-title approval-list-title"><div><h2>审批中心</h2><span>最新 {Math.min(pendingRequests.length, 5)} / {pendingRequests.length} 条待审核申请</span></div></div>
    <section className="approval-list">
      {latestPendingRequests.length === 0 ? <div className="approval-empty"><ShieldCheck size={24}/><b>{requests.length > 0 ? '暂无待审核申请' : '暂无申请信息'}</b><span>{requests.length > 0 ? '已处理记录可从下方“更多”进入全部申请查看。' : '职位变更、经纪人首次名片或续期申请会出现在这里。'}</span></div> : latestPendingRequests.map(request => <ApprovalRow key={request.id} request={request} onReview={onReview}/>) }
    </section>
    {requests.length > 0 && <button className="approval-more-button" onClick={() => setRequestPage('all')}><span>更多</span><small>查看全部状态的申请记录</small><ChevronRight size={17}/></button>}

    <div className="member-list-title"><div><h2>成员与角色</h2><span>登录手机号对应唯一账号</span></div><button onClick={onAddMember}><Plus size={15}/>添加成员</button></div>
    <section className="member-list section-card">
      {members.map(member => <button className="member-row" key={member.id} onClick={() => onEditMember(member)}>
        <span className={`member-avatar ${member.role}`}>{member.name ? member.name.slice(0,1) : <UserRound size={18}/>}</span>
        <div><b>{member.name || '待完善姓名'}<em className={`role-chip ${member.role}`}>{roleLabel(member.role)}</em></b><p>{member.phone.replace(/(\d{3})\d{4}(\d{4})/,'$1****$2')}{member.title ? ` · ${member.title}` : ''}</p><small>{member.cardValidUntil ? `有效期至 ${member.cardValidUntil}` : member.role === 'broker' ? '名片待首次审核' : '待设置有效期'}</small></div>
        <span className={`status-dot ${member.status === 'disabled' || member.renewalStatus === 'rejected' || isCardExpired(member.cardValidUntil) || member.role === 'broker' && member.cardApprovalStatus !== 'approved' ? 'disabled' : 'active'}`}>{member.status === 'disabled' ? '停用' : member.renewalStatus === 'rejected' ? '已禁用' : member.renewalStatus === 'pending' ? '续期审核中' : member.role === 'broker' && member.cardApprovalStatus === 'pending' ? '审核中' : member.role === 'broker' && member.cardApprovalStatus === 'rejected' ? '未通过' : member.role === 'broker' && member.cardApprovalStatus !== 'approved' ? '待申请' : isCardExpired(member.cardValidUntil) ? '已过期' : '正常'}</span><ChevronRight size={16}/>
      </button>)}
    </section>
    <section className="role-rule-note"><LockKeyhole size={17}/><div><b>权限边界</b><p>员工使用清单预设信息，只有修改默认职位才需审批；经纪人无预设信息，首次生成名片必须审核，所有名片到期后均不可使用。</p></div></section>
  </div>
}

function AllRequestsPage({ requests, onReview, onBack }) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const sorted = [...requests].sort((a, b) => b.submittedAt - a.submittedAt)
  const shown = sorted.filter(item => (typeFilter === 'all' || item.type === typeFilter) && (statusFilter === 'all' || item.status === statusFilter))
  return <div className="all-requests-page page-pad">
    <button className="subpage-back" onClick={onBack}><ArrowLeft size={17}/><span>返回审批中心</span></button>
    <section className="all-requests-hero"><div><span>审批记录</span><h1>全部申请</h1><p>按申请时间倒序展示待审核、已通过和已拒绝记录。</p></div><strong>{shown.length}<small>条结果</small></strong></section>
    <div className="request-filters">
      <label><span>申请类型</span><select value={typeFilter} onChange={event => setTypeFilter(event.target.value)}><option value="all">全部类型</option><option value="title_change">职位变更</option><option value="broker_initial">创建名片</option><option value="renewal">名片续期</option></select></label>
      <label><span>申请状态</span><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="all">全部状态</option><option value="pending">待审核</option><option value="approved">已通过</option><option value="rejected">已拒绝</option></select></label>
    </div>
    <section className="approval-list all-approval-list">
      {shown.length === 0 ? <div className="approval-empty"><ShieldCheck size={24}/><b>没有符合条件的申请</b><span>调整申请类型或状态筛选后再查看。</span></div> : shown.map(request => <ApprovalRow key={request.id} request={request} onReview={onReview}/>) }
    </section>
  </div>
}

function ApprovalRow({ request, onReview }) {
  const [validUntil, setValidUntil] = useState(request.validUntil || defaultValidUntil())
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const pending = request.status === 'pending'
  const statusText = request.status === 'approved' ? '已通过' : request.status === 'rejected' ? '已拒绝' : '待审核'
  const typeText = requestTypeLabel(request.type)
  const submitReject = () => {
    if (!rejectionReason.trim()) {
      setReasonError('请填写拒绝原因')
      return
    }
    onReview(request.id, 'rejected', validUntil, rejectionReason)
    setRejectOpen(false)
  }
  return <article className={`approval-row ${request.status}`}>
    <header><span className="approval-avatar">{request.name?.slice(0, 1) || (request.role === 'broker' ? '经' : '员')}</span><div><b>{request.name || roleLabel(request.role)}<em>{typeText}</em></b><p>{request.phone} · 申请时间 {formatDateTime(request.submittedAt)}</p></div><strong>{statusText}</strong></header>
    {request.type === 'title_change' ? <div className="title-change-line labeled"><span><small>原职位</small>{request.currentTitle || '未设置'}</span><ChevronRight size={14}/><b><small>申请职位</small>{request.requestedTitle}</b></div> : request.type === 'broker_initial' ? <p className="renewal-copy">申请职位：{request.requestedTitle || '未填写职位'}{request.contactPhone ? ` · 名片手机号：${request.contactPhone}` : ''}</p> : <p className="renewal-copy">当前有效期：{request.currentValidUntil || '已结束'} · 申请续期并重新启用电子名片。</p>}
    <label className="approval-validity"><span>名片有效期</span><input type="date" value={validUntil} disabled={!pending} onChange={event => setValidUntil(event.target.value)}/></label>
    {pending && <div className="validity-presets"><span>快捷设置</span>{[[3,'3个月'],[12,'1年'],[24,'2年']].map(([months,label]) => <button key={months} onClick={() => setValidUntil(validUntilAfterMonths(months))}>{label}</button>)}</div>}
    {request.status === 'rejected' && request.rejectionReason && <p className="rejection-reason"><b>拒绝原因</b>{request.rejectionReason}</p>}
    {pending && <div className="approval-actions"><button onClick={() => { setRejectOpen(true); setReasonError('') }}><X size={14}/>拒绝</button><button onClick={() => onReview(request.id, 'approved', validUntil)} disabled={!validUntil}><Check size={14}/>通过并生效</button></div>}
    {rejectOpen && <Modal title="拒绝申请" onClose={() => setRejectOpen(false)} footer={<><button className="button secondary" onClick={() => setRejectOpen(false)}>取消</button><button className="button danger" onClick={submitReject}><X size={16}/>确认拒绝</button></>}>
      <section className="reject-request-summary"><span>{request.name || roleLabel(request.role)}</span><b>{typeText}</b><p>{request.phone} · {formatDateTime(request.submittedAt)}</p></section>
      <label className={`reject-reason-field ${reasonError ? 'has-error' : ''}`}><span>拒绝原因<em>*</em></span><textarea rows="5" value={rejectionReason} onChange={event => { setRejectionReason(event.target.value); setReasonError('') }} placeholder="请填写明确的拒绝原因，申请人将在消息通知中看到"/>{reasonError && <small>{reasonError}</small>}</label>
    </Modal>}
  </article>
}

function NotificationCenter({ notifications, onClose }) {
  return <Modal title="消息通知" onClose={onClose}>
    <section className="notification-list">
      {notifications.length === 0 ? <div className="notification-empty"><Bell size={25}/><b>暂无新消息</b><span>审核结果和名片到期提醒会出现在这里。</span></div> : notifications.map(item => <article className={`notification-item ${item.tone}`} key={item.id}>
        <span><Bell size={15}/></span>
        <div><b>{item.title}</b><p>{item.detail}</p><time>{formatDateTime(item.time)}</time></div>
      </article>)}
    </section>
  </Modal>
}

function ShareSheet({ card, onClose, notify }) {
  const contacts = [
    { name: '文件传输助手', avatar: '文', color: '#16a34a' },
    { name: '张总', avatar: '张', color: '#3478f6' },
    { name: '李经理', avatar: '李', color: '#8b5cf6' },
    { name: '王老师', avatar: '王', color: '#f59e0b' },
    { name: '陈总', avatar: '陈', color: '#0ea5a4' },
    { name: '我的电脑', avatar: '电', color: '#64748b' },
  ]
  const shareText = `${card.name}｜${card.title}｜${card.company}`
  const shareUrl = buildShareUrl(card)
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`); notify('员工专属名片链接已复制') }
    catch { notify('请长按复制名片链接') }
  }
  const sendTo = async contact => {
    await copy()
    notify(`已发送给 ${contact.name}`)
    onClose()
  }
  return <div className="modal-layer" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="modal-sheet share-sheet wechat-picker-sheet">
      <header><button onClick={onClose}><ArrowLeft size={21}/></button><h2>选择微信联系人</h2><button onClick={onClose}><X size={20}/></button></header>
      <div className="modal-body">
        <div className="share-preview"><div className="share-avatar">{card.avatar ? <img src={card.avatar}/> : card.name.slice(0,1)}</div><div><b>{card.name}</b><p>{card.title}</p><span>{card.company}</span></div></div>
        <div className="wechat-picker-title"><MessageCircle size={18}/><b>最近联系人</b><span>点击直接发送</span></div>
        <div className="wechat-contact-grid">{contacts.map(contact => <button key={contact.name} onClick={() => sendTo(contact)}><span style={{background:contact.color}}>{contact.avatar}</span><b>{contact.name}</b></button>)}</div>
        <button className="copy-link-button" onClick={copy}><Copy size={17}/>复制名片链接</button>
        <p className="share-limit">当前为微信联系人选择原型；正式小程序将调用微信原生联系人分享面板。</p>
      </div>
    </section>
  </div>
}

function VisitorPage({ card, onSelect }) {
  const [filter, setFilter] = useState('全部')
  if (!card) return <div className="page-pad no-visitor-state"><div><BarChart3 size={38}/><h2>创建名片后查看访客</h2><p>名片产生访问后，这里会展示访问次数、浏览时长和内容偏好。</p></div></div>
  const shown = filter === '重点关注' ? visitors.filter(v => v.score >= 80) : visitors
  return <div className="visitor-page page-pad">
    <section className="radar-hero"><div><span>今日名片访客</span><strong>24</strong><em><TrendingUp size={14}/>较昨日 +26%</em></div><div className="radar-visual"><i/><i/><i/><span><Activity size={22}/></span></div></section>
    <div className="metric-grid"><Metric label="浏览总时长" value="2.8h" icon={<Clock3/>}/><Metric label="重点联系人" value="6" icon={<Flame/>}/><Metric label="资料转发" value="12" icon={<Share2/>}/></div>
    <section className="section-card chart-card"><SectionHead title="近 7 天访问趋势" link="136 次"/><TrendChart/><div className="chart-labels"><span>周六</span><span>周日</span><span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>今天</span></div></section>
    <div className="filter-row">{['全部','重点关注'].map(x => <button key={x} onClick={() => setFilter(x)} className={filter===x?'active':''}>{x}{x==='全部'?' 24':' 6'}</button>)}<button><CalendarDays size={15}/>筛选</button></div>
    <section className="visitor-list">{shown.map(v => <VisitorRow key={v.id} visitor={v} onClick={() => onSelect(v)}/>)}</section>
  </div>
}

function SectionHead({ title, link }) { return <div className="section-head"><h2>{title}</h2><span>{link}<ChevronRight size={15}/></span></div> }
function Metric({ label, value, icon }) { return <div className="metric"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div> }

function TrendChart() {
  const points = trend.map((v,i)=>`${12+i*55},${100-v}`).join(' ')
  const area = `12,102 ${points} 342,102`
  return <svg className="trend-chart" viewBox="0 0 354 112" role="img" aria-label="近七天访问趋势折线图"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3478f6" stopOpacity=".28"/><stop offset="1" stopColor="#3478f6" stopOpacity="0"/></linearGradient></defs><line x1="8" y1="28" x2="346" y2="28"/><line x1="8" y1="65" x2="346" y2="65"/><line x1="8" y1="102" x2="346" y2="102"/><polygon points={area} fill="url(#area)" stroke="none"/><polyline points={points} fill="none" stroke="#3478f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{trend.map((v,i)=><circle key={i} cx={12+i*55} cy={100-v} r={i===6?5:3} fill={i===6?'#fff':'#3478f6'} stroke="#3478f6" strokeWidth={i===6?3:0}/>)}</svg>
}

function VisitorRow({ visitor, onClick }) {
  const displayName = visitorDisplayName(visitor)
  return <button className="visitor-row" onClick={onClick}><span className="visitor-avatar" style={{background:visitor.color}}>{visitor.avatar}</span><div className="visitor-main"><div><b>{displayName}</b><span className={`visitor-auth ${visitor.wechatAuthorized ? 'authorized' : 'anonymous'}`}>{visitor.wechatAuthorized ? '微信已授权' : '未授权'}</span></div><p><Clock3 size={12}/>打开时间：{visitor.openTime}</p><small><Eye size={13}/>查看了「{visitor.content}」</small></div><div className="visitor-side"><span>浏览时长</span><b>{visitor.duration}</b><ChevronRight size={16}/></div></button>
}

function MePage({ session, card, member, requests, onLogout }) {
  const brokerState = member.role === 'broker' ? member.cardApprovalStatus || 'draft' : 'approved'
  const pendingRenewal = requests.some(item => item.phone === member.phone && item.type === 'renewal' && item.status === 'pending')
  const cardStateText = member.renewalStatus === 'rejected'
    ? '名片已禁用，续期审核通过后可恢复使用'
    : pendingRenewal
      ? '续期申请审核中'
      : member.role === 'broker' && brokerState !== 'approved'
    ? brokerState === 'pending' ? '名片审核中，审核通过后可使用' : brokerState === 'rejected' ? '名片申请未通过，请修改后重新提交' : '等待填写个人信息并申请名片'
    : isCardExpired(member.cardValidUntil) ? '名片已过期，请申请续期' : card ? `个人信息已完善 · 有效期至 ${member.cardValidUntil}` : `等待完善个人信息 · 有效期至 ${member.cardValidUntil}`
  return <div className="me-page page-pad">
    <section className="account-panel"><div className="account-avatar">{card?.avatar ? <img src={card.avatar}/> : <UserRound size={25}/>}</div><div><h2>{card?.name || member.name || '未创建名片'}<em className={`account-role ${member.role}`}>{roleLabel(member.role)}</em></h2><p>登录手机号：{session.phone.replace(/(\d{3})\d{4}(\d{4})/,'$1****$2')}</p><span>{cardStateText}</span></div></section>
    <button className="logout-button" onClick={onLogout}><LogOut size={17}/>退出登录</button>
  </div>
}

function BottomNav({ tab, setTab, isAdmin }) {
  const items = [['card',<Home/>,'名片'],['visitors',<BarChart3/>,'访客'],...(isAdmin ? [['admin',<UsersRound/>,'管理']] : []),['me',<UserRound/>,'我的']]
  return <nav className={`bottom-nav ${isAdmin ? 'four-tabs' : 'three-tabs'}`}>{items.map(([id,icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><span>{icon}{id==='visitors'&&<i/>}</span><b>{label}</b></button>)}</nav>
}

function VisitorDetail({ visitor, onClose, notify }) {
  const displayName = visitorDisplayName(visitor)
  return <Modal title="访客详情" onClose={onClose} footer={<button className="button primary" onClick={()=>notify('已复制沟通建议')}><Copy size={17}/>复制沟通建议</button>}>
    <section className="visitor-profile"><span className="visitor-avatar large" style={{background:visitor.color}}>{visitor.avatar}</span><div><h2>{displayName}<span className={`visitor-auth ${visitor.wechatAuthorized ? 'authorized' : 'anonymous'}`}>{visitor.wechatAuthorized ? '微信已授权' : '匿名'}</span></h2><p>{visitor.wechatAuthorized ? `授权微信名：${visitor.wechatName}` : '访客未授权微信信息'}</p></div><div className="score-ring" style={{'--score':`${visitor.score*3.6}deg`}}><span><b>{visitor.score}</b><small>关注度</small></span></div></section>
    <div className="detail-metrics visitor-time-metrics"><div><b>{visitor.openTime}</b><span>打开时间</span></div><div><b>{visitor.duration}</b><span>浏览时长</span></div><div><b>{visitor.visits}</b><span>访问次数</span></div></div>
    <section className="ai-judgement"><Sparkles size={20}/><div><b>访客关注判断</b><p>{visitor.score>=80?'近期多次深入浏览名片内容，建议及时建立联系。':visitor.score>=50?'已产生初步兴趣，可发送相关资料继续沟通。':'当前互动较浅，建议先通过内容建立认知。'}</p></div></section>
    <h3 className="timeline-title">本次浏览轨迹</h3><div className="timeline">{visitor.path.map((x,i)=><div key={x}><i className={i===visitor.path.length-1?'last':''}/><span>{x}</span><time>{i===0?'10:42':`10:${43+i}`}</time></div>)}</div>
    <section className="follow-tip"><Lightbulb size={18}/><div><b>推荐沟通方向</b><p>从「{visitor.content}」切入，了解对方当前关注点。</p></div></section>
  </Modal>
}

function Modal({ title, onClose, children, footer }) {
  return <div className="modal-layer" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="modal-sheet"><header><button onClick={onClose}><ArrowLeft size={21}/></button><h2>{title}</h2><button onClick={onClose}><X size={20}/></button></header><div className="modal-body">{children}</div>{footer&&<footer>{footer}</footer>}</section></div>
}

export default App
