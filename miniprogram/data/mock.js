const PRIMARY_ADMIN_PHONE = '18059880224'

const DEFAULT_ENTERPRISE = {
  company: '白鸽在线（厦门）数字科技股份有限公司',
  address: '厦门市湖里区高林中路491号白鸽天地金融（保险）科技产业园24层',
  introImage: '/assets/company-introduction-2026.webp',
  pdfName: '【企业简介】白鸽在线（2026版）.pdf',
  pdfUrl: 'https://vytp9dfhk5-glitch.github.io/baige/ai-card/company-introduction-2026.pdf',
  videoUrl: 'https://vytp9dfhk5-glitch.github.io/baige/ai-card/company-promo-2026.mp4',
  videoName: '白鸽在线企业宣传视频',
  videoPoster: '',
  news: [
    { id: 'listing', title: '白鸽在线正式在香港联交所主板挂牌上市', url: 'https://mp.weixin.qq.com/s/N1YPtMQt3mjCe_W4BTTZwQ' },
    { id: 'association', title: '厦门市数据发展协会正式成立 白鸽在线为主要发起单位', url: 'https://mp.weixin.qq.com/s/HJ9TK02aa2VSAaJN7GSOIA' },
  ],
}

const PUBLIC_CARD = {
  avatar: '/assets/tu-jinbo.jpg',
  name: '涂锦波',
  title: '创始人 / 董事长 / CEO',
  phone: '18650111999',
  email: 'tjb@baigebao.com',
  wechat: '',
  intro: '白鸽在线创始人、董事长、执行董事兼首席执行官，拥有超过24年保险行业及企业管理经验，负责集团整体战略规划、业务方向及经营管理，推动白鸽在线向AI风控基础设施提供商和全球化数字风险管理解决方案商迈进。',
  addresses: [],
}

const VISITORS = [
  { id: 1, name: '陈志远', authorized: true, avatar: '陈', color: '#3478f6', openTime: '今天 10:42', duration: '8分24秒', content: '公司介绍' },
  { id: 2, name: '刘雯', authorized: true, avatar: '刘', color: '#8b5cf6', openTime: '今天 09:18', duration: '5分06秒', content: '公司风采' },
  { id: 3, name: '匿名访客', authorized: false, avatar: '访', color: '#12b981', openTime: '昨天 16:20', duration: '2分18秒', content: '个人简介' },
  { id: 4, name: '孙晓琳', authorized: true, avatar: '孙', color: '#f59e0b', openTime: '昨天 11:36', duration: '6分45秒', content: '企业咨询' },
  { id: 5, name: '匿名访客', authorized: false, avatar: '访', color: '#94a3b8', openTime: '周三 14:08', duration: '0分46秒', content: '名片首页' },
]

const ADDRESSES = [
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

const AVATAR_COLORS = ['#3478f6', '#8b5cf6', '#12b981', '#f59e0b', '#ef6676', '#0ea5a4']

module.exports = {
  PRIMARY_ADMIN_PHONE,
  DEFAULT_ENTERPRISE,
  PUBLIC_CARD,
  VISITORS,
  ADDRESSES,
  AVATAR_COLORS,
}
