import React, { useEffect, useRef, useState } from 'react'
import {
  Activity, ArrowLeft, BarChart3, CalendarDays, Check, ChevronRight,
  Clock3, Copy, Edit3, Eye, Flame, Home, ImageIcon,
  Lightbulb, LockKeyhole, LogOut, Mail, MapPin, MessageCircle,
  MoreHorizontal, Newspaper, Phone, Plus, Share2, ShieldCheck,
  Settings2, Smartphone, Sparkles, Trash2, TrendingUp, Upload,
  UserCog, UserRound, UsersRound, Video, X
} from './icons'

const SESSION_KEY = 'baige-card-session-v2'
const FIXED_CONTENT_KEY = 'baige-card-fixed-content-v3'
const MEMBERS_KEY = 'baige-card-members-v2'
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
  news: defaultNews,
}

const defaultMembers = [
  { id: 'primary-admin', phone: PRIMARY_ADMIN_PHONE, name: '系统管理员', title: '', role: 'admin', status: 'active' },
]

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

function mergeCard(personal, fixedContent) {
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
    news: fixedContent.news,
  }
}

function encodeShareCard(card) {
  const payload = {
    ...card,
    avatar: card.avatar?.startsWith('data:') || card.avatar?.startsWith('blob:') ? '' : card.avatar,
    videoUrl: card.videoUrl?.startsWith('blob:') ? '' : card.videoUrl,
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
  const initialSession = loadLocal(SESSION_KEY, null)
  const [session, setSession] = useState(initialSession)
  const [card, setCard] = useState(() => initialSession ? loadLocal(cardKey(initialSession.phone), null) : null)
  const [fixedContent, setFixedContent] = useState(() => ({...defaultFixedContent, ...loadLocal(FIXED_CONTENT_KEY, {})}))
  const [members, setMembers] = useState(() => loadLocal(MEMBERS_KEY, defaultMembers))
  const [tab, setTab] = useState('card')
  const [editorOpen, setEditorOpen] = useState(false)
  const [fixedEditorOpen, setFixedEditorOpen] = useState(false)
  const [memberEditor, setMemberEditor] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [visitor, setVisitor] = useState(null)
  const [toast, setToast] = useState('')

  const currentMember = session ? members.find(item => item.phone === session.phone) || {
    id: `employee-${session.phone}`, phone: session.phone, name: card?.name || '', title: card?.title || '', role: session.phone === PRIMARY_ADMIN_PHONE ? 'admin' : 'employee', status: 'active'
  } : null
  const isAdmin = currentMember?.role === 'admin'
  const displayCard = mergeCard(card, fixedContent)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  const notify = text => setToast(text)

  const login = phone => {
    const existing = members.find(item => item.phone === phone)
    if (existing?.status === 'disabled') {
      notify('该账号已停用，请联系管理员')
      return
    }
    if (!existing) {
      const nextMembers = [...members, { id: `employee-${Date.now()}`, phone, name: '', title: '', role: phone === PRIMARY_ADMIN_PHONE ? 'admin' : 'employee', status: 'active' }]
      setMembers(nextMembers)
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(nextMembers))
    }
    const next = { phone, loginAt: Date.now() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
    setCard(loadLocal(cardKey(phone), null))
    setTab('card')
    notify('登录成功')
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setCard(null)
    setTab('card')
  }

  const saveCard = nextCard => {
    localStorage.setItem(cardKey(session.phone), JSON.stringify(nextCard))
    setCard(nextCard)
    const nextMembers = members.map(item => item.phone === session.phone ? {...item, name: nextCard.name, title: nextCard.title} : item)
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(nextMembers))
    setMembers(nextMembers)
    setEditorOpen(false)
    setTab('card')
    notify('名片生成成功')
  }

  const saveFixedContent = nextContent => {
    localStorage.setItem(FIXED_CONTENT_KEY, JSON.stringify(nextContent))
    setFixedContent(nextContent)
    setFixedEditorOpen(false)
    notify('企业介绍已更新')
  }

  const saveMember = nextMember => {
    if (nextMember.phone === session.phone && (nextMember.role !== 'admin' || nextMember.status === 'disabled')) {
      notify('不能降级或停用当前管理员账号')
      return
    }
    const normalized = { ...nextMember, id: nextMember.id || `employee-${Date.now()}` }
    const nextMembers = members.some(item => item.id === normalized.id)
      ? members.map(item => item.id === normalized.id ? normalized : item)
      : [...members, normalized]
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(nextMembers))
    setMembers(nextMembers)
    setMemberEditor(null)
    notify(nextMember.id ? '员工信息已更新' : '员工已添加')
  }

  if (!session) {
    return <div className="app-shell login-shell">
      <main className="phone-stage login-stage"><LoginPage onLogin={login} />{toast && <div className="toast"><Check size={17}/>{toast}</div>}</main>
    </div>
  }

  return <div className="app-shell">
    <main className="phone-stage">
      <TopBar tab={tab} card={displayCard} onEdit={() => setEditorOpen(true)} onShare={() => setShareOpen(true)} />
      <div className="screen">
        {tab === 'card' && <CardPage card={displayCard} notify={notify} onCreate={() => setEditorOpen(true)} onEdit={() => setEditorOpen(true)} onShare={() => setShareOpen(true)} />}
        {tab === 'visitors' && <VisitorPage card={displayCard} onSelect={setVisitor} />}
        {tab === 'admin' && isAdmin && <AdminPage fixedContent={fixedContent} members={members} onEditFixed={() => setFixedEditorOpen(true)} onAddMember={() => setMemberEditor({ id: '', phone: '', name: '', title: '', role: 'employee', status: 'active' })} onEditMember={setMemberEditor} />}
        {tab === 'me' && <MePage session={session} card={card} member={currentMember} onLogout={logout} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} isAdmin={isAdmin} />
      {editorOpen && <CardEditor initial={card || {...emptyCard, name: currentMember.name || '', title: currentMember.title || ''}} onClose={() => setEditorOpen(false)} onSave={saveCard} />}
      {fixedEditorOpen && isAdmin && <FixedContentEditor initial={fixedContent} onClose={() => setFixedEditorOpen(false)} onSave={saveFixedContent} />}
      {memberEditor && isAdmin && <MemberEditor initial={memberEditor} members={members} onClose={() => setMemberEditor(null)} onSave={saveMember} />}
      {shareOpen && displayCard && <ShareSheet card={displayCard} onClose={() => setShareOpen(false)} notify={notify} />}
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
        <div className="card-page page-pad">
          <GeneratedCard card={card} notify={setToast} readonly />
        </div>
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
    <div className="rail-stat"><strong>{role === 'admin' ? '管理员' : '员工'}</strong><span>当前账号角色</span></div>
    <div className="rail-tip"><Sparkles size={20}/><b>使用建议</b><span>{role === 'admin' ? '统一维护企业介绍和员工角色，员工只需完善个人资料。' : card ? '企业介绍由管理员维护，你只需及时更新个人信息。' : '先完成个人资料，即可生成第一张电子名片。'}</span></div>
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
      <p>手机号验证后进入你的专属电子名片</p>
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

function TopBar({ tab, card, onEdit, onShare }) {
  const titles = { visitors: '访客雷达', admin: '角色与内容', me: '我的' }
  return <header className="topbar">
    {tab === 'card' ? <Brand /> : <div className="page-heading"><b>{titles[tab]}</b>{tab === 'visitors' && <span className="live"><i/>实时</span>}</div>}
    {tab === 'card' && card ? <div className="topbar-actions"><button className="icon-button" onClick={onEdit} aria-label="编辑名片"><Edit3 size={18}/></button><button className="icon-button share-top-button" onClick={onShare} aria-label="分享名片"><Share2 size={18}/></button></div> : <button className="icon-button passive" aria-label="更多"><MoreHorizontal size={22}/></button>}
  </header>
}

function CardPage({ card, notify, onCreate }) {
  if (!card) return <EmptyCard onCreate={onCreate}/>
  return <div className="card-page page-pad">
    <GeneratedCard card={card} notify={notify} />
  </div>
}

function EmptyCard({ onCreate }) {
  return <div className="empty-card-page page-pad">
    <section className="empty-card-hero">
      <div className="empty-card-art"><div/><UserRound size={44}/><Plus size={20}/></div>
      <span>还没有电子名片</span>
      <h1>完善你的个人信息</h1>
      <p>填写姓名和职位即可生成；企业介绍会由系统自动合并。</p>
      <button className="button primary create-card-button" onClick={onCreate}><Plus size={18}/>完善个人信息</button>
    </section>
  </div>
}

function GeneratedCard({ card, notify, readonly = false }) {
  const news = (card.news || []).filter(x => x.title.trim())
  const addresses = (card.addresses || []).filter(Boolean)
  const hasIntro = card.intro || addresses.length > 0

  const copyKeyInfo = async () => {
    const text = [`姓名：${card.name}`, `公司：${card.company}`, `职位：${card.title}`, card.phone ? `电话：${card.phone}` : ''].filter(Boolean).join('\n')
    try { await navigator.clipboard.writeText(text); notify('姓名、公司、职位和电话已复制') }
    catch { notify('复制失败，请长按选择关键信息') }
  }

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
      <button className="card-quick-copy" onClick={copyKeyInfo} aria-label="一键复制名片信息"><Copy size={16}/><span>复制</span></button>
    </section>

    {hasIntro && <section className="section-card intro-card generated-section">
      <div className="section-head"><h2>个人简介</h2></div>
      {card.intro && <p>{card.intro}</p>}
      {card.slogan && <blockquote className="leader-quote">“{card.slogan}”</blockquote>}
      {addresses.length > 0 && <div className="personal-address-list">{addresses.map((address,index) => <div className="address" key={`${address}-${index}`}><MapPin size={16}/><span>{address}</span></div>)}</div>}
    </section>}

    {card.videoUrl && <section className="section-card media-section generated-section">
      <div className="section-head"><h2>公司风采</h2>{card.videoName && <span>{card.videoName}</span>}</div>
      <video className="company-video" src={normalMediaUrl(card.videoUrl)} controls playsInline preload="metadata">你的浏览器暂不支持视频播放</video>
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

function CardEditor({ initial, onClose, onSave }) {
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

        <EditorTitle title="联系方式" />
        <div className="form-grid editor-form">
          <Field label="手机号"><input inputMode="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="请输入手机号"/></Field>
          <Field label="邮箱"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="请输入邮箱"/></Field>
          <Field label="微信号" wide><input value={form.wechat} onChange={e => set('wechat', e.target.value)} placeholder="请输入微信号"/></Field>
        </div>

        <EditorTitle title="个人简介" />
        <label className="textarea-label editor-textarea"><textarea rows="5" value={form.intro} onChange={e => set('intro', e.target.value)} placeholder="介绍你的经历、专长或理念；未填写则不展示该模块"/><small>{form.intro.length}/500</small></label>

        <EditorTitle title="公司地址" action={<button onClick={addAddress}><Plus size={14}/>添加地址</button>} />
        {form.addresses.length === 0 ? <AddEmpty text="还没有公司地址" onClick={addAddress}/> : <div className="repeat-editor-list">{form.addresses.map((address, index) => <div className="address-editor-wrap" key={`${index}-${form.addresses.length}`}>
          <div className="repeat-editor address-editor-item"><span><MapPin size={15}/></span><div><input value={address} onFocus={() => setActiveAddress(index)} onChange={event => { updateAddress(index,event.target.value); setActiveAddress(index) }} placeholder={`搜索或输入地址 ${index + 1}`}/></div><button onClick={() => set('addresses', form.addresses.filter((_, currentIndex) => currentIndex !== index))}><Trash2 size={15}/></button></div>
          {activeAddress === index && <div className="address-suggestions">{suggestionsFor(address).map(suggestion => <button key={suggestion} onClick={() => { updateAddress(index,suggestion); setActiveAddress(null) }}><MapPin size={13}/><span>{suggestion}</span></button>)}</div>}
        </div>)}</div>}
      </div>
      <footer><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" onClick={submit}><Check size={17}/>保存个人信息</button></footer>
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
  const videoRef = useRef(null)
  const pdfRef = useRef(null)
  const set = (key, value) => setForm(prev => ({...prev, [key]: value}))
  const addNews = () => set('news', [...form.news, {id: Date.now(), title:'', url:''}])
  const updateNews = (id, key, value) => set('news', form.news.map(item => item.id === id ? {...item, [key]: value} : item))
  const uploadVideo = file => {
    if (!file || !file.type.startsWith('video/')) return
    setForm(prev => ({...prev, videoUrl: URL.createObjectURL(file), videoName: file.name}))
  }
  const selectPdf = file => {
    if (!file || file.type !== 'application/pdf') return
    setForm(prev => ({...prev, companyPdfName: file.name, companyPdfUrl: URL.createObjectURL(file)}))
  }

  const submit = () => {
    const nextErrors = {}
    if (!form.company.trim()) nextErrors.company = '请填写公司名称'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave({
      company: form.company.trim(),
      address: form.address.trim(),
      companyIntroductionImage: form.companyIntroductionImage,
      companyPdfName: form.companyPdfName,
      companyPdfUrl: form.companyPdfUrl,
      videoUrl: form.videoUrl.trim(),
      videoName: form.videoName?.trim() || '',
      news: form.news.filter(item => item.title.trim()).map(item => ({...item, title:item.title.trim(), url:item.url.trim()})),
    })
  }

  return <div className="modal-layer editor-layer">
    <section className="modal-sheet card-editor-sheet">
      <header><button onClick={onClose}><ArrowLeft size={21}/></button><h2>企业介绍配置</h2><button onClick={onClose}><X size={20}/></button></header>
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
          <input ref={videoRef} hidden type="file" accept="video/*" onChange={event => uploadVideo(event.target.files?.[0])}/>
        </div>
        {form.videoName && <div className="selected-video-name"><Video size={14}/><span>{form.videoName}</span><button onClick={() => setForm(prev => ({...prev,videoUrl:'',videoName:''}))}><X size={13}/></button></div>}

        <EditorTitle title="企业资讯" action={<button onClick={addNews}><Plus size={14}/>添加资讯</button>} />
        {form.news.length === 0 ? <AddEmpty text="还没有企业资讯" onClick={addNews}/> : <div className="repeat-editor-list">{form.news.map(item => <div className="repeat-editor news-editor-item" key={item.id}>
          <span><Newspaper size={15}/></span><div><input value={item.title} onChange={event => updateNews(item.id,'title',event.target.value)} placeholder="资讯标题"/><input value={item.url} onChange={event => updateNews(item.id,'url',event.target.value)} placeholder="资讯链接"/></div><button onClick={() => set('news', form.news.filter(current => current.id !== item.id))}><Trash2 size={15}/></button>
        </div>)}</div>}
      </div>
      <footer><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" onClick={submit}><Check size={17}/>应用到所有名片</button></footer>
    </section>
  </div>
}

function MemberEditor({ initial, members, onClose, onSave }) {
  const [form, setForm] = useState({...initial})
  const [errors, setErrors] = useState({})
  const set = (key, value) => setForm(prev => ({...prev, [key]: value}))
  const primaryAdmin = form.phone === PRIMARY_ADMIN_PHONE

  const submit = () => {
    const phone = form.phone.replace(/\D/g, '').slice(0, 11)
    const nextErrors = {}
    if (!/^1\d{10}$/.test(phone)) nextErrors.phone = '请输入正确的11位手机号'
    if (members.some(item => item.phone === phone && item.id !== form.id)) nextErrors.phone = '该手机号已经添加'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave({
      ...form,
      phone,
      name: form.name.trim(),
      title: form.title.trim(),
      role: primaryAdmin ? 'admin' : form.role,
    })
  }

  return <Modal title={initial.id ? '编辑员工' : '添加员工'} onClose={onClose} footer={<><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" onClick={submit}><Check size={17}/>保存员工</button></>}>
    <section className="member-editor-note"><UserCog size={20}/><div><b>员工权限</b><p>管理员维护企业介绍和角色；员工只维护自己的个人信息。</p></div></section>
    <div className="form-grid editor-form member-form">
      <Field label="手机号" required wide error={errors.phone}><input inputMode="numeric" value={form.phone} onChange={event => set('phone', event.target.value.replace(/\D/g, '').slice(0,11))} placeholder="员工登录手机号"/></Field>
      <Field label="员工姓名"><input value={form.name} onChange={event => set('name', event.target.value)} placeholder="可由员工完善"/></Field>
      <Field label="职位"><input value={form.title} onChange={event => set('title', event.target.value)} placeholder="可由员工完善"/></Field>
      <Field label="角色"><select value={primaryAdmin ? 'admin' : form.role} disabled={primaryAdmin} onChange={event => set('role', event.target.value)}><option value="employee">员工</option><option value="admin">管理员</option></select></Field>
      <Field label="账号状态"><select value={form.status} onChange={event => set('status', event.target.value)}><option value="active">正常</option><option value="disabled">已停用</option></select></Field>
    </div>
    {primaryAdmin && <p className="primary-admin-tip"><LockKeyhole size={13}/>主管理员角色不可降级</p>}
  </Modal>
}

function AdminPage({ fixedContent, members, onEditFixed, onAddMember, onEditMember }) {
  const adminCount = members.filter(item => item.role === 'admin').length
  const activeCount = members.filter(item => item.status === 'active').length
  return <div className="admin-page page-pad">
    <section className="admin-hero">
      <div><span><ShieldCheck size={16}/>管理员控制台</span><h1>企业统一配置，员工各自维护</h1><p>企业介绍由管理员配置，个人资料由员工自行完善。</p></div>
      <div className="admin-summary"><div><b>{members.length}</b><span>全部账号</span></div><div><b>{adminCount}</b><span>管理员</span></div><div><b>{activeCount}</b><span>正常账号</span></div></div>
    </section>

    <section className="section-card fixed-control-card">
      <div className="fixed-control-head"><span><Settings2 size={20}/></span><div><b>企业介绍配置</b><p>应用到所有管理员和员工名片</p></div><button onClick={onEditFixed}>配置</button></div>
      <div className="fixed-content-preview"><div><span>公司名称</span><b>{fixedContent.company}</b></div><div><span>公司介绍</span><b>{fixedContent.companyPdfName ? 'PDF已设置' : '未设置'}</b></div><div><span>公司风采</span><b>{fixedContent.videoUrl ? '已配置' : '待上传'}</b></div></div>
    </section>

    <div className="member-list-title"><div><h2>员工与角色</h2><span>手机号对应唯一账号</span></div><button onClick={onAddMember}><Plus size={15}/>添加员工</button></div>
    <section className="member-list section-card">
      {members.map(member => <button className="member-row" key={member.id} onClick={() => onEditMember(member)}>
        <span className={`member-avatar ${member.role}`}>{member.name ? member.name.slice(0,1) : <UserRound size={18}/>}</span>
        <div><b>{member.name || '待完善姓名'}<em className={`role-chip ${member.role}`}>{member.role === 'admin' ? '管理员' : '员工'}</em></b><p>{member.phone.replace(/(\d{3})\d{4}(\d{4})/,'$1****$2')}{member.title ? ` · ${member.title}` : ''}</p></div>
        <span className={`status-dot ${member.status}`}>{member.status === 'active' ? '正常' : '停用'}</span><ChevronRight size={16}/>
      </button>)}
    </section>
    <section className="role-rule-note"><LockKeyhole size={17}/><div><b>权限边界</b><p>管理员：企业介绍、员工和角色；员工：仅个人信息、分享和访客查看。</p></div></section>
  </div>
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

function MePage({ session, card, member, onLogout }) {
  return <div className="me-page page-pad">
    <section className="account-panel"><div className="account-avatar">{card?.avatar ? <img src={card.avatar}/> : <UserRound size={25}/>}</div><div><h2>{card?.name || member.name || '未创建名片'}<em className={`account-role ${member.role}`}>{member.role === 'admin' ? '管理员' : '员工'}</em></h2><p>登录手机号：{session.phone.replace(/(\d{3})\d{4}(\d{4})/,'$1****$2')}</p><span>{card ? '个人信息已完善' : '等待完善个人信息'}</span></div></section>
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
