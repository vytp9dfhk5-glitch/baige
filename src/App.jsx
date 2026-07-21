import React, { useEffect, useRef, useState } from 'react'
import {
  Activity, ArrowLeft, BarChart3, CalendarDays, Check, ChevronRight,
  Clock3, Copy, Edit3, ExternalLink, Eye, Flame, Home, ImageIcon,
  Lightbulb, LockKeyhole, LogOut, Mail, MapPin, MessageCircle,
  MoreHorizontal, Newspaper, Phone, Plus, Share2, ShieldCheck,
  Smartphone, Sparkles, Trash2, TrendingUp, Upload, UserRound, Video, X
} from './icons'

const SESSION_KEY = 'baige-card-session-v2'

const emptyCard = {
  avatar: '', name: '', title: '', company: '', address: '', phone: '',
  email: '', wechat: '', intro: '', videoUrl: '', businesses: [], news: []
}

const visitors = [
  { id: 1, name: '陈志远', company: '海辰保险科技', role: '采购总监', avatar: '陈', color: '#3478f6', time: '10:42', duration: '8分24秒', score: 92, visits: 4, content: '风险治理平台', status: '重点关注', path: ['打开电子名片', '查看个人简介', '浏览风险治理平台 4分12秒', '点击联系电话'] },
  { id: 2, name: '刘雯', company: '启明金融科技', role: '运营负责人', avatar: '刘', color: '#8b5cf6', time: '09:18', duration: '5分06秒', score: 81, visits: 2, content: 'MaaS 模型平台', status: '持续关注', path: ['微信分享进入', '查看 MaaS 模型平台', '浏览介绍视频 2分03秒', '再次打开名片'] },
  { id: 3, name: '王先生', company: '某保险机构', role: '新访客', avatar: '王', color: '#12b981', time: '昨天', duration: '2分18秒', score: 56, visits: 1, content: '个人简介', status: '待了解', path: ['扫码进入', '查看个人信息', '浏览个人简介'] },
  { id: 4, name: '孙晓琳', company: '嘉禾产业集团', role: '副总经理', avatar: '孙', color: '#f59e0b', time: '昨天', duration: '6分45秒', score: 87, visits: 3, content: 'SaaS 应用平台', status: '重点关注', path: ['好友分享进入', '浏览核心业务 3分08秒', '查看相关资讯', '复制邮箱'] },
  { id: 5, name: '匿名访客', company: '福建 · 厦门', role: '微信访客', avatar: '访', color: '#94a3b8', time: '周三', duration: '0分46秒', score: 28, visits: 1, content: '名片首页', status: '快速浏览', path: ['微信进入', '查看名片首页', '离开'] },
]

const trend = [23, 35, 29, 48, 45, 67, 72]

function loadLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch { return fallback }
}

function cardKey(phone) { return `baige-card-v2:${phone}` }

function App() {
  const initialSession = loadLocal(SESSION_KEY, null)
  const [session, setSession] = useState(initialSession)
  const [card, setCard] = useState(() => initialSession ? loadLocal(cardKey(initialSession.phone), null) : null)
  const [tab, setTab] = useState('card')
  const [editorOpen, setEditorOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [visitor, setVisitor] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  const notify = text => setToast(text)

  const login = phone => {
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
    setEditorOpen(false)
    setTab('card')
    notify('名片生成成功')
  }

  if (!session) {
    return <div className="app-shell login-shell">
      <LoginRail />
      <main className="phone-stage login-stage"><LoginPage onLogin={login} /></main>
    </div>
  }

  return <div className="app-shell">
    <DesktopRail card={card} />
    <main className="phone-stage">
      <TopBar tab={tab} card={card} onEdit={() => setEditorOpen(true)} />
      <div className="screen">
        {tab === 'card' && <CardPage card={card} notify={notify} onCreate={() => setEditorOpen(true)} onEdit={() => setEditorOpen(true)} onShare={() => setShareOpen(true)} />}
        {tab === 'visitors' && <VisitorPage card={card} onSelect={setVisitor} />}
        {tab === 'me' && <MePage session={session} card={card} onEdit={() => setEditorOpen(true)} onShare={() => setShareOpen(true)} onLogout={logout} notify={notify} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </main>

    {editorOpen && <CardEditor initial={card || emptyCard} onClose={() => setEditorOpen(false)} onSave={saveCard} />}
    {shareOpen && card && <ShareSheet card={card} onClose={() => setShareOpen(false)} notify={notify} />}
    {visitor && <VisitorDetail visitor={visitor} onClose={() => setVisitor(null)} notify={notify} />}
    {toast && <div className="toast"><Check size={17}/>{toast}</div>}
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

function DesktopRail({ card }) {
  return <aside className="desktop-rail">
    <Brand />
    <p>白鸽在线智能电子名片</p>
    <div className="rail-stat"><strong>{card ? '已生成' : '待创建'}</strong><span>当前名片状态</span></div>
    <div className="rail-stat"><strong>24</strong><span>今日名片访问</span></div>
    <div className="rail-tip"><Sparkles size={20}/><b>使用建议</b><span>{card ? '保持个人信息与核心业务及时更新，让每次分享都传递准确内容。' : '先完成基础资料，即可生成第一张电子名片。'}</span></div>
  </aside>
}

function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)
  const digits = phone.replace(/\D/g, '').slice(0, 11)
  const valid = /^1\d{10}$/.test(digits)

  return <div className="login-page">
    <div className="login-brand"><Brand /><span>智能电子名片</span></div>
    <div className="login-visual">
      <div className="login-orb"><Smartphone size={34}/><i/></div>
      <span>一键登录 · 快速创建</span>
    </div>
    <section className="login-card">
      <h1>欢迎使用</h1>
      <p>登录后创建并管理你的专属电子名片</p>
      <label className="phone-input">
        <span>+86</span>
        <input inputMode="numeric" value={digits} onChange={e => setPhone(e.target.value)} placeholder="请输入手机号" aria-label="手机号" />
      </label>
      <button className="login-button" disabled={!valid || !agreed} onClick={() => onLogin(digits)}><Smartphone size={18}/>手机号快速登录</button>
      <label className="agreement"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}/><i>{agreed && <Check size={11}/>}</i><span>我已阅读并同意《用户协议》和《隐私政策》</span></label>
      <div className="secure-login"><LockKeyhole size={13}/>手机号仅用于账号登录和名片数据隔离</div>
    </section>
  </div>
}

function TopBar({ tab, card, onEdit }) {
  const titles = { visitors: '访客雷达', me: '我的' }
  return <header className="topbar">
    {tab === 'card' ? <Brand /> : <div className="page-heading"><b>{titles[tab]}</b>{tab === 'visitors' && <span className="live"><i/>实时</span>}</div>}
    {tab === 'card' && card ? <button className="icon-button" onClick={onEdit} aria-label="编辑名片"><Edit3 size={19}/></button> : <button className="icon-button passive" aria-label="更多"><MoreHorizontal size={22}/></button>}
  </header>
}

function CardPage({ card, notify, onCreate, onEdit, onShare }) {
  if (!card) return <EmptyCard onCreate={onCreate}/>
  return <div className="card-page page-pad">
    <GeneratedCard card={card} notify={notify} onEdit={onEdit} onShare={onShare}/>
  </div>
}

function EmptyCard({ onCreate }) {
  return <div className="empty-card-page page-pad">
    <section className="empty-card-hero">
      <div className="empty-card-art"><div/><UserRound size={44}/><Plus size={20}/></div>
      <span>还没有电子名片</span>
      <h1>创建你的第一张名片</h1>
      <p>填写基础信息即可生成；没有填写的内容将自动隐藏，不会出现空模块。</p>
      <button className="button primary create-card-button" onClick={onCreate}><Plus size={18}/>添加名片</button>
    </section>
    <section className="creation-guide">
      <h2>三步完成</h2>
      <div><i>1</i><span><b>填写身份信息</b><small>姓名、职位、公司名称</small></span></div>
      <div><i>2</i><span><b>丰富名片内容</b><small>头像、联系方式、业务、视频与资讯</small></span></div>
      <div><i>3</i><span><b>生成并发送</b><small>一键分享给微信联系人</small></span></div>
    </section>
  </div>
}

function GeneratedCard({ card, notify, onEdit, onShare }) {
  const actions = [
    card.phone && { key: 'phone', icon: <Phone/>, label: '打电话', tone: 'amber', action: () => { window.location.href = `tel:${card.phone}` } },
    card.wechat && { key: 'wechat', icon: <MessageCircle/>, label: '加微信', tone: 'green', action: () => notify(`微信号：${card.wechat}`) },
    card.email && { key: 'email', icon: <Mail/>, label: '发邮件', tone: 'violet', action: () => { window.location.href = `mailto:${card.email}` } },
  ].filter(Boolean)
  const businesses = (card.businesses || []).filter(x => x.title.trim())
  const news = (card.news || []).filter(x => x.title.trim())
  const hasIntro = card.intro || card.address

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
    </section>

    <div className="social-proof simple-proof"><span><Eye size={14}/>访客数据在“访客”模块单独查看</span></div>

    {actions.length > 0 && <section className="quick-actions dynamic-actions" style={{gridTemplateColumns:`repeat(${actions.length}, 1fr)`}}>
      {actions.map(x => <Action key={x.key} {...x} onClick={x.action}/>) }
    </section>}

    {hasIntro && <section className="section-card intro-card generated-section">
      <div className="section-head"><h2>个人简介</h2></div>
      {card.intro && <p>{card.intro}</p>}
      {card.address && <div className="address"><MapPin size={16}/><span>{card.address}</span></div>}
    </section>}

    {businesses.length > 0 && <section className="section-card content-section generated-section">
      <div className="section-head"><h2>公司核心业务</h2><button className="manage-content" onClick={onEdit}><Edit3 size={13}/>编辑</button></div>
      <div className="content-grid">{businesses.map((item, index) => <BusinessCard key={item.id} item={item} index={index}/>)}</div>
    </section>}

    {card.videoUrl && <section className="section-card media-section generated-section">
      <div className="section-head"><h2>相关视频</h2></div>
      <a className="video-link-card" href={normalUrl(card.videoUrl)} target="_blank" rel="noreferrer"><span><Video size={24}/></span><div><b>查看视频介绍</b><p>{card.videoUrl}</p></div><ExternalLink size={16}/></a>
    </section>}

    {news.length > 0 && <section className="section-card news-section generated-section">
      <div className="section-head"><h2>相关资讯</h2><span>{news.length} 条</span></div>
      {news.map(item => <a key={item.id} className="news-row" href={normalUrl(item.url)} target="_blank" rel="noreferrer"><span><Newspaper size={16}/></span><b>{item.title}</b><ChevronRight size={15}/></a>)}
    </section>}

    <button className="share-card-button" onClick={onShare}><Share2 size={18}/>分享名片</button>
    <p className="privacy-note"><ShieldCheck size={13}/>仅展示你主动填写并保存的内容</p>
  </>
}

function normalUrl(value) {
  if (!value) return '#'
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function Action({ icon, label, tone, onClick }) {
  return <button className="quick-action" onClick={onClick}><span className={`action-icon ${tone}`}>{icon}</span><b>{label}</b></button>
}

function BusinessCard({ item, index }) {
  const colors = ['cyan', 'blue', 'violet', 'orange']
  return <article className="content-card business-content-card">
    <div className={`content-cover ${colors[index % colors.length]}`}><span>{item.short || `${index + 1}`}</span><small>核心业务</small></div>
    <b>{item.title}</b>{item.desc && <p>{item.desc}</p>}
  </article>
}

function CardEditor({ initial, onClose, onSave }) {
  const [form, setForm] = useState(() => ({...emptyCard, ...initial, businesses: initial.businesses || [], news: initial.news || []}))
  const [errors, setErrors] = useState({})
  const fileRef = useRef(null)

  const set = (key, value) => setForm(prev => ({...prev, [key]: value}))
  const addBusiness = () => set('businesses', [...form.businesses, {id: Date.now(), title:'', desc:'', short:''}])
  const updateBusiness = (id, key, value) => set('businesses', form.businesses.map(x => x.id === id ? {...x, [key]: value} : x))
  const addNews = () => set('news', [...form.news, {id: Date.now(), title:'', url:''}])
  const updateNews = (id, key, value) => set('news', form.news.map(x => x.id === id ? {...x, [key]: value} : x))

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
    if (!form.company.trim()) nextErrors.company = '请填写公司名称'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave({
      ...form,
      name: form.name.trim(), title: form.title.trim(), company: form.company.trim(),
      businesses: form.businesses.filter(x => x.title.trim()),
      news: form.news.filter(x => x.title.trim())
    })
  }

  return <div className="modal-layer editor-layer">
    <section className="modal-sheet card-editor-sheet">
      <header><button onClick={onClose}><ArrowLeft size={21}/></button><h2>{initial.name ? '编辑名片' : '添加名片'}</h2><button onClick={onClose}><X size={20}/></button></header>
      <div className="modal-body card-editor-body">
        <section className="editor-section avatar-editor">
          <div className="avatar-preview" onClick={() => fileRef.current?.click()}>{form.avatar ? <img src={form.avatar}/> : <><ImageIcon size={28}/><span>上传头像</span></>}</div>
          <div><b>个人头像</b><p>建议上传清晰的正面照片，支持 JPG、PNG</p><button onClick={() => fileRef.current?.click()}><Upload size={15}/>{form.avatar ? '更换头像' : '选择图片'}</button></div>
          <input ref={fileRef} hidden type="file" accept="image/*" onChange={e => uploadAvatar(e.target.files?.[0])}/>
        </section>

        <EditorTitle title="基础信息" />
        <div className="form-grid editor-form">
          <Field label="姓名" required error={errors.name}><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="请输入姓名"/></Field>
          <Field label="职位" required error={errors.title}><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="例如：董事长 / CEO"/></Field>
          <Field label="公司名称" required wide error={errors.company}><input value={form.company} onChange={e => set('company', e.target.value)} placeholder="请输入公司全称"/></Field>
          <Field label="公司地址" wide><input value={form.address} onChange={e => set('address', e.target.value)} placeholder="未填写则不展示地址"/></Field>
        </div>

        <EditorTitle title="联系方式" />
        <div className="form-grid editor-form">
          <Field label="个人电话"><input inputMode="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="请输入电话"/></Field>
          <Field label="个人邮箱"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="请输入邮箱"/></Field>
          <Field label="个人微信" wide><input value={form.wechat} onChange={e => set('wechat', e.target.value)} placeholder="请输入微信号"/></Field>
        </div>

        <EditorTitle title="个人简介" />
        <label className="textarea-label editor-textarea"><textarea rows="5" value={form.intro} onChange={e => set('intro', e.target.value)} placeholder="介绍你的经历、专长或理念；未填写则不展示该模块"/><small>{form.intro.length}/500</small></label>

        <EditorTitle title="公司核心业务" action={<button onClick={addBusiness}><Plus size={14}/>添加业务</button>} />
        {form.businesses.length === 0 ? <AddEmpty text="还没有业务内容" onClick={addBusiness}/> : <div className="repeat-editor-list">{form.businesses.map((item, i) => <div className="repeat-editor business-editor" key={item.id}>
          <i>{i + 1}</i><div><input value={item.title} onChange={e => updateBusiness(item.id,'title',e.target.value)} placeholder="业务名称"/><input value={item.desc} onChange={e => updateBusiness(item.id,'desc',e.target.value)} placeholder="业务简介"/></div><button onClick={() => set('businesses', form.businesses.filter(x => x.id !== item.id))}><Trash2 size={15}/></button>
        </div>)}</div>}

        <EditorTitle title="视频链接" />
        <label className="single-editor-input"><Video size={17}/><input value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="粘贴视频链接，未填写则不展示"/></label>

        <EditorTitle title="相关资讯" action={<button onClick={addNews}><Plus size={14}/>添加资讯</button>} />
        {form.news.length === 0 ? <AddEmpty text="还没有相关资讯" onClick={addNews}/> : <div className="repeat-editor-list">{form.news.map((item, i) => <div className="repeat-editor news-editor-item" key={item.id}>
          <span><Newspaper size={15}/></span><div><input value={item.title} onChange={e => updateNews(item.id,'title',e.target.value)} placeholder="资讯标题"/><input value={item.url} onChange={e => updateNews(item.id,'url',e.target.value)} placeholder="资讯链接"/></div><button onClick={() => set('news', form.news.filter(x => x.id !== item.id))}><Trash2 size={15}/></button>
        </div>)}</div>}
      </div>
      <footer><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" onClick={submit}><Check size={17}/>生成名片</button></footer>
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

function ShareSheet({ card, onClose, notify }) {
  const shareText = `${card.name}｜${card.title}｜${card.company}`
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`); notify('名片链接已复制') }
    catch { notify('请长按复制名片链接') }
  }
  const openWechat = async () => {
    await copy()
    window.location.href = 'weixin://'
  }
  return <div className="modal-layer" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="modal-sheet share-sheet">
      <header><button onClick={onClose}><ArrowLeft size={21}/></button><h2>分享名片</h2><button onClick={onClose}><X size={20}/></button></header>
      <div className="modal-body">
        <div className="share-preview"><div className="share-avatar">{card.avatar ? <img src={card.avatar}/> : card.name.slice(0,1)}</div><div><b>{card.name}</b><p>{card.title}</p><span>{card.company}</span></div></div>
        <div className="share-tip"><MessageCircle size={20}/><div><b>发送给微信联系人</b><p>点击发送后复制名片链接，并尝试唤起微信联系人窗口。</p></div></div>
        <button className="wechat-send-button" onClick={openWechat}><MessageCircle size={19}/>发送给微信联系人</button>
        <button className="copy-link-button" onClick={copy}><Copy size={17}/>仅复制名片链接</button>
        <p className="share-limit">正式微信小程序将使用微信原生分享面板；出于隐私限制，微信不允许应用自动替用户选择具体联系人。</p>
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
  return <button className="visitor-row" onClick={onClick}><span className="visitor-avatar" style={{background:visitor.color}}>{visitor.avatar}</span><div className="visitor-main"><div><b>{visitor.name}</b><span className={`intent intent-${visitor.score>=80?'hot':visitor.score>=50?'warm':'cold'}`}>{visitor.status}</span></div><p>{visitor.company} · {visitor.role}</p><small><Eye size={13}/>查看了「{visitor.content}」</small></div><div className="visitor-side"><time>{visitor.time}</time><b>{visitor.duration}</b><ChevronRight size={16}/></div></button>
}

function MePage({ session, card, onEdit, onShare, onLogout, notify }) {
  return <div className="me-page page-pad">
    <section className="account-panel"><div className="account-avatar">{card?.avatar ? <img src={card.avatar}/> : <UserRound size={25}/>}</div><div><h2>{card?.name || '未创建名片'}</h2><p>登录手机号：{session.phone.replace(/(\d{3})\d{4}(\d{4})/,'$1****$2')}</p><span>{card ? '名片已生成' : '等待添加名片'}</span></div></section>
    <section className="my-actions section-card">
      <button onClick={onEdit}><span className="mg-icon blue"><Edit3/></span><div><b>{card?'编辑名片':'添加名片'}</b><small>{card?'更新个人资料和展示内容':'填写资料并生成电子名片'}</small></div><ChevronRight/></button>
      {card && <button onClick={onShare}><span className="mg-icon green"><Share2/></span><div><b>分享名片</b><small>发送给微信联系人</small></div><ChevronRight/></button>}
      <button onClick={() => notify('隐私设置已打开')}><span className="mg-icon violet"><ShieldCheck/></span><div><b>隐私与数据</b><small>管理访客数据和内容展示范围</small></div><ChevronRight/></button>
    </section>
    <section className="account-note"><LockKeyhole size={17}/><div><b>数据按手机号独立保存</b><p>不同手机号登录后拥有各自独立的名片与访客数据。</p></div></section>
    <button className="logout-button" onClick={onLogout}><LogOut size={17}/>退出登录</button>
    <p className="version">白鸽在线智能电子名片 · Prototype 2.0</p>
  </div>
}

function BottomNav({ tab, setTab }) {
  const items = [['card',<Home/>,'名片'],['visitors',<BarChart3/>,'访客'],['me',<UserRound/>,'我的']]
  return <nav className="bottom-nav three-tabs">{items.map(([id,icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><span>{icon}{id==='visitors'&&<i/>}</span><b>{label}</b></button>)}</nav>
}

function VisitorDetail({ visitor, onClose, notify }) {
  return <Modal title="访客详情" onClose={onClose} footer={<><button className="button secondary" onClick={()=>notify('已复制沟通建议')}><Copy size={17}/>沟通建议</button><button className="button primary" onClick={()=>notify(`正在联系 ${visitor.name}`)}><MessageCircle size={17}/>发起联系</button></>}>
    <section className="visitor-profile"><span className="visitor-avatar large" style={{background:visitor.color}}>{visitor.avatar}</span><div><h2>{visitor.name}<span className="intent intent-hot">{visitor.status}</span></h2><p>{visitor.company} · {visitor.role}</p></div><div className="score-ring" style={{'--score':`${visitor.score*3.6}deg`}}><span><b>{visitor.score}</b><small>关注度</small></span></div></section>
    <div className="detail-metrics"><div><b>{visitor.visits}</b><span>访问次数</span></div><div><b>{visitor.duration}</b><span>浏览时长</span></div><div><b>{visitor.content}</b><span>最关注内容</span></div></div>
    <section className="ai-judgement"><Sparkles size={20}/><div><b>访客关注判断</b><p>{visitor.score>=80?'近期多次深入浏览名片内容，建议及时建立联系。':visitor.score>=50?'已产生初步兴趣，可发送相关资料继续沟通。':'当前互动较浅，建议先通过内容建立认知。'}</p></div></section>
    <h3 className="timeline-title">本次浏览轨迹</h3><div className="timeline">{visitor.path.map((x,i)=><div key={x}><i className={i===visitor.path.length-1?'last':''}/><span>{x}</span><time>{i===0?'10:42':`10:${43+i}`}</time></div>)}</div>
    <section className="follow-tip"><Lightbulb size={18}/><div><b>推荐沟通方向</b><p>从「{visitor.content}」切入，了解对方当前关注点。</p></div></section>
  </Modal>
}

function Modal({ title, onClose, children, footer }) {
  return <div className="modal-layer" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="modal-sheet"><header><button onClick={onClose}><ArrowLeft size={21}/></button><h2>{title}</h2><button onClick={onClose}><X size={20}/></button></header><div className="modal-body">{children}</div>{footer&&<footer>{footer}</footer>}</section></div>
}

export default App
