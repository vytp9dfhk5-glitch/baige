# 白鸽在线 AI 电子名片产品需求文档（PRD）

- 产品名称：白鸽在线 AI 电子名片
- 文档状态：Ready for Agent
- 目标平台：微信小程序优先，配套管理后台；H5/网页作为公开查看和产品原型补充
- 主要使用对象：白鸽在线老板及高管、全体员工、企业管理员、名片访客
- 需求基线：截至 2026-07-21 的全部需求沟通、现有交互原型及员工清单

## Problem Statement

白鸽在线的老板、高管和员工需要一套统一、可信、便于通过微信传播的电子名片。现有纸质名片和普通电子名片无法持续更新个人与企业内容，也无法知道访客是谁、何时打开、浏览了多久、重点关注了什么。企业还需要保证员工对外展示的公司信息一致，员工职位不能未经审批自行修改，离职、停用或名片到期后应立即停止使用。

从员工视角，使用员工清单中的登录手机号进入系统后，应直接获得企业预置的姓名、邮箱、登录手机号和默认职位。员工可以自行填写或修改与经纪人一致的个人字段，包括名片展示手机号；只要不修改预设职位，其他个人信息保存后无需管理员审核。员工修改预设职位时，在管理员审核通过前，名片继续展示原职位，并禁止产生新的对外分享。员工名片首次生成后默认有效期为一年。

从经纪人视角，手机号登录后没有员工预设资料，需要自行填写与员工相同的全部个人字段，系统再拼接管理员维护的企业配置。经纪人首次生成名片必须提交管理员审核，审核通过并由管理员设置有效期后才能查看、分享和对外使用；审核拒绝、尚未审核或超过有效期时均不可使用。

从管理员视角，需要能够导入和维护员工目录、维护经纪人账号、进行企业配置、管理角色、更新员工登录手机号、审批员工职位变更、经纪人首次名片和名片续期，并设置名片有效期。审批中心默认只展示按提交时间倒序排列的最新五条待审核申请；点击底部“更多”后进入独立全部申请页，查看并筛选全部状态申请。员工清单或 OA 数据应成为员工身份、登录手机号和默认职位的事实来源。

从访客视角，打开分享名片后应直接看到完整、清晰、可信的个人和企业介绍，无需登录；可将联系人信息添加到系统通讯录；如果授权微信身份，名片所有者可以看到微信名，否则以匿名访客记录，但两种情况都必须统计打开时间和浏览时长。

当前 React/Vite + GitHub Pages 版本是交互原型，使用浏览器本地存储模拟角色、审批和有效期，不能满足跨设备同步、服务端权限控制、真实短信验证、微信身份授权、分享链接实时失效和生产级数据安全。因此正式产品需要微信小程序、管理后台和服务端共同实现。

## Solution

建设一套“员工和经纪人维护个人信息、企业配置由管理员统一、关键申请与有效期由管理员审核、访问行为可追踪”的智能电子名片系统。

员工通过员工清单中的登录手机号完成验证码登录，系统自动匹配姓名、邮箱、登录手机号和默认职位。员工名片中的展示手机号是独立个人字段，可以自行修改，不会改变登录手机号；登录手机号如需变更，员工必须联系管理员在后台更新。员工未修改预设职位时，保存其他个人字段无需审批，名片默认有效期为一年。经纪人手机号登录后没有预设信息，自行填写与员工相同的个人字段。企业名称、公司介绍、宣传视频、企业资讯和其他企业配置由管理员维护，并自动合并到所有有效员工和经纪人名片中；未填写字段和空模块不展示。

员工修改职位时，系统创建职位变更申请，公开名片继续使用原批准职位，分享入口进入锁定状态。管理员可查看申请人、原职位、申请职位、申请时间，选择拒绝或通过，并在通过时设置新的名片有效期。审核通过后，新职位生效并恢复分享；拒绝后保持原职位。名片到期后，员工和访客均不能继续使用名片，员工必须提交续期申请，管理员重新设置有效期后才能恢复。

访客通过微信分享或公开链接进入独立只读名片页。名片页支持微信小程序原生添加联系人能力，自动填写姓名、公司、职位、手机号、邮箱和公司地址。访客访问事件由服务端记录，并根据微信授权状态显示授权微信名或匿名访客，同时记录打开时间、浏览时长、浏览轨迹和重点内容。

管理员通过管理后台维护员工目录、经纪人账号、角色、账号状态、企业配置、员工登录手机号、员工职位申请、经纪人首次名片申请、续期申请和有效期。正式系统以成员目录数据库和服务端鉴权为安全边界；Excel 员工清单和 OA 接口是员工数据的批量导入与同步来源。

## User Stories

1. As an employee, I want to log in with my mobile phone number and verification code, so that I can enter my own electronic business card without remembering a password.
2. As an employee, I want the system to match my login phone number against the employee directory, so that my official preset information and employee role are loaded automatically.
3. As a broker whose phone number is not in the employee directory, I want to enter as a broker without employee presets, so that I can fill in my own information and apply for a business card.
4. As an administrator, I want the primary administrator account to be fixed to the designated phone number, so that the organization always has a recoverable top-level administrator.
5. As an administrator, I want to assign administrator, employee, or broker roles to members, so that permissions and approval requirements match each identity.
6. As an administrator, I want to enable or disable an account, so that departed or suspended employees cannot continue using company business cards.
7. As an employee, I want my name to be automatically filled from the employee directory after login, so that I do not need to re-enter official information.
8. As an employee, I want my directory phone number to identify my login account while the phone shown on my card remains editable, so that account identity and public contact information can differ safely.
9. As an employee, I want my default position to be automatically filled from the employee directory, so that the first generated card uses the company-approved title.
10. As an employee, I want my email to be automatically filled when the administrator has configured it, so that my contact information is complete.
11. As an administrator, I want to import an Excel employee list containing phone number, name, and position, so that employee accounts can be created in bulk.
12. As an administrator, I want the import process to report invalid phone numbers, duplicate phone numbers, blank names, and blank positions, so that bad data does not enter the production directory.
13. As an administrator, I want all valid rows from the approved employee list to be imported without silent filtering, so that the system matches the source of truth.
14. As an administrator, I want to add an employee manually, so that newly hired employees can be onboarded between bulk imports.
15. As an administrator, I want to edit an employee's preset name, login phone, default position, email, role, account status, and card validity, so that directory information and login identity can be corrected.
16. As a system owner, I want the employee directory to support scheduled OA synchronization, so that active and departed employee data stays current without repeated manual uploads.
17. As an employee, I want to see an empty-card state on first use, so that I understand I still need to complete my personal business card.
18. As an employee, I want the empty-card state to avoid unnecessary multi-step marketing text, so that the onboarding screen is direct and concise.
19. As an employee, I want to select one of six default avatars or upload my own avatar in one unified area, so that avatar configuration feels like one task.
20. As an employee, I want uploaded avatars to be compressed before storage, so that the card loads quickly and does not exceed storage limits.
21. As an employee, I want name and position to be visibly marked as required with an asterisk, so that required fields are clear without extra explanatory labels.
22. As an employee, I want optional and multi-value fields to have no redundant “optional” text, so that the editor remains clean.
23. As an employee, I want to edit my card phone, email, WeChat ID, personal introduction, and company addresses, so that the card contains current personal contact details without changing my login phone.
24. As an employee, I want to add multiple company addresses, so that I can show offices or work locations relevant to me.
25. As an employee, I want company address input to support fuzzy search, so that I can find and enter addresses quickly.
26. As an employee, I want the editor labels to use “个人信息、手机号、邮箱、微信号、公司地址”, so that the language is concise and consistent.
27. As an employee, I want empty fields to be omitted from the generated card, so that visitors never see blank rows or empty modules.
28. As an employee, I want enterprise content to merge automatically into my personal card, so that I do not need to maintain company information.
29. As an employee, I want to edit my personal card from the card module, so that the “My” module stays lightweight.
30. As an employee, I want the “My” module to contain only my account information card and logout, so that it does not duplicate editing or privacy functions.
31. As an employee, I want my account information card to show my role, masked login phone number, completion status, and validity, so that I understand my account state.
32. As an employee, I want to log out explicitly, so that I can safely switch accounts on a shared device.
33. As an employee, I want my approved position displayed on the card, so that the information I share is trusted by the company.
34. As an employee, I want to request a position change from the card editor, so that legitimate organizational changes can be reflected.
35. As an employee, I want the editor to explain that position changes require administrator confirmation, so that I know why the new title is not immediately visible.
36. As an employee, I want the card to keep showing my previous approved position while a request is pending, so that unapproved information is never published.
37. As an employee, I want to see the requested position and current approved position while approval is pending, so that I can confirm what is under review.
38. As an employee, I want repeated edits during a pending request to update the same pending request, so that administrators do not receive duplicate requests.
39. As an employee, I want new sharing to be blocked while my position change is pending, so that I cannot distribute an unapproved business card.
40. As an employee, I want the share button to visually indicate that sharing is blocked, so that the restriction is understandable before I click.
41. As an employee, I want a clear toast when I try to share during approval, so that I know administrator approval is required.
42. As an employee, I want sharing to recover automatically after approval, so that I do not need to recreate the card.
43. As an employee, I want a rejected position request to leave my approved position unchanged, so that rejected data never appears publicly.
44. As an administrator, I want to see a pending request count on the management dashboard, so that outstanding work is visible immediately.
45. As an administrator, I want to see the applicant, masked phone number, submission time, current position, and requested position, so that I have enough context to decide.
46. As an administrator, I want to reject a position request, so that inaccurate or unauthorized titles do not become public.
47. As an administrator, I want to approve a position request, so that an employee's official title can be updated.
48. As an administrator, I want approval and rejection history to remain visible, so that decisions can be audited.
49. As an administrator, I want to set an exact card expiration date during approval, so that card usage is time-bounded.
50. As an administrator, I want quick validity presets for three months, one year, and two years, so that common validity periods are fast to configure.
51. As an employee, I want my card page to show the expiration date, so that I know when renewal will be required.
52. As an employee, I want an expired card to stop showing the normal card and sharing actions, so that I cannot continue using an unauthorized card.
53. As an employee, I want to submit a renewal request after expiration, so that I can regain access through the proper process.
54. As an employee, I want a submitted renewal request to become non-repeatable while pending, so that duplicate requests are avoided.
55. As an administrator, I want renewal requests to appear in the same approval center, so that position and validity workflows are managed consistently.
56. As an administrator, I want to approve a renewal and set a new expiration date, so that an expired card can be reactivated.
57. As an administrator, I want to reject a renewal, so that an employee cannot resume card use without authorization.
58. As a visitor, I want an expired shared card to show only an unavailable message, so that I do not rely on obsolete contact information.
59. As a visitor, I want expired cards to hide contact information, enterprise content, and add-to-contacts actions, so that expired identity data cannot be reused.
60. As a card owner, I want my name, position, company, phone number, email, and WeChat ID displayed only when available, so that the card is complete without clutter.
61. As a card owner, I want no direct “call”, “add WeChat”, or “send email” action buttons, so that the public card remains restrained and privacy-aware.
62. As a visitor, I want an “添加至通讯录” action in the top-right corner of the card, so that I can save the contact quickly.
63. As a visitor, I want the system contact form to be prefilled with name, company, position, mobile number, email, and work address, so that I do not need to type the information manually.
64. As a visitor using the production WeChat mini program, I want the native add-contact interface, so that the experience is reliable inside WeChat.
65. As a visitor using H5, I want a standards-based vCard fallback, so that supported mobile browsers can still add the contact.
66. As a visitor, I want the public card to be an independent read-only window, so that I never see editing, analytics, administration, or account navigation.
67. As a card owner, I want the share action in the top-right corner, so that I can distribute the card quickly.
68. As a card owner using the production mini program, I want the native WeChat share panel, so that I can choose a real contact or group.
69. As a card owner using the web prototype, I want a clearly labeled share prototype, so that product reviews do not mistake simulated contacts for real WeChat access.
70. As a visitor, I want shared links to identify the correct card owner, so that the right employee information is displayed.
71. As a security owner, I want shared links to be signed and validated by the server, so that users cannot forge card payloads or bypass validity controls.
72. As an administrator, I want to revoke or suspend previously shared links when a card becomes invalid, so that old links do not remain active.
73. As a card owner, I want the personal introduction module labeled “个人简介”, so that the card speaks naturally from the owner’s perspective.
74. As a card owner, I want no “关于某某” phrasing, so that the card does not sound like a third-party profile page.
75. As a visitor, I want the content order to be personal introduction, company style, enterprise news, and company introduction, so that the story flows from person to current company activity and then full company detail.
76. As a visitor, I want company style to play the administrator-configured promotional video, so that I can understand the organization visually.
77. As a visitor, I want enterprise news to show administrator-configured titles and links, so that I can read current company developments.
78. As a visitor, I want the company introduction PDF rendered as a long image, so that I can read it continuously in the card without downloading a document.
79. As an administrator, I want to upload or replace the company introduction PDF, so that the corporate profile can be updated centrally.
80. As an administrator, I want the system to generate and preview a long image from the PDF, so that the shared card displays the latest document consistently.
81. As an administrator, I want to configure company name and company address centrally, so that all employee cards use official company data.
82. As an administrator, I want to upload or configure the company promotional video centrally, so that all employee cards share the approved media.
83. As an administrator, I want to add, edit, order, and remove enterprise news items, so that corporate updates remain current.
84. As an administrator, I want to upload company qualification images when required, so that approved qualifications can be displayed as optional enterprise content.
85. As a visitor, I want company modules with no configured content to be omitted, so that the card never shows placeholder blocks.
86. As a visitor, I want no standalone “核心业务统一配置” label, so that internal configuration language is not exposed.
87. As a visitor, I want no standalone “90亿+电子保单” statistics block unless it is part of approved company introduction content, so that the card stays aligned with administrator-managed materials.
88. As a visitor, I want no enterprise certification wording on the personal card, so that unapproved claims are not implied.
89. As a visitor, I want no appointment function, so that the card focuses on identity, content, and sharing.
90. As a visitor, I want no AI assistant or AI avatar conversation entry, so that the product does not promise an unsupported conversational feature.
91. As a visitor, I want no “preview what visitors see” control on the public card, so that owner-only controls never leak into the visitor experience.
92. As an employee or broker, I want a separate visitor module, so that analytics are not mixed into the card editing page.
93. As a card owner, I want to see today's visitor count, so that I understand current interest.
94. As a card owner, I want to see total browsing duration, so that I understand engagement depth.
95. As a card owner, I want to see key-contact count and material-share count, so that I can prioritize follow-up.
96. As a card owner, I want a seven-day access trend, so that I can observe changes over time.
97. As a card owner, I want authorized visitors to display their authorized WeChat name, so that I can identify them when consent exists.
98. As a card owner, I want visitors without WeChat authorization to display as anonymous, so that the UI does not fabricate an identity.
99. As a card owner, I want both authorized and anonymous visitor records to show opening time, so that every visit has useful timing context.
100. As a card owner, I want both authorized and anonymous visitor records to show browsing duration, so that engagement is measured consistently.
101. As a card owner, I want visitor details to show visit count, viewed content, and browsing path, so that I know what interested the visitor.
102. As a card owner, I want visitor details to show timestamps for key actions, so that I can reconstruct the visit sequence.
103. As a card owner, I want a visitor attention score and plain-language judgment, so that I can prioritize follow-up without interpreting raw events.
104. As a card owner, I want recommended communication directions based on viewed content, so that follow-up is relevant.
105. As a card owner, I want to copy the communication suggestion, so that I can reuse it in a real conversation.
106. As a privacy owner, I want anonymous visitor data to remain anonymous, so that the system does not exceed the user's authorization.
107. As a privacy owner, I want configurable data retention and deletion policies, so that visitor data complies with privacy requirements.
108. As a system owner, I want page-open, module-exposure, content-click, video-play, share, add-contact, and exit events collected, so that analytics reflect actual behavior.
109. As a system owner, I want page visibility and heartbeat events used to calculate browsing duration, so that background time is not counted as active reading.
110. As a system owner, I want event deduplication and idempotency, so that retries do not inflate metrics.
111. As a product reviewer, I want the prototype screen centered without a left-side explanatory rail, so that the presentation focuses on the mobile product.
112. As a mobile user, I want every modal contained and centered inside the software screen, so that dialogs never appear outside the simulated device.
113. As a mobile user, I want layouts to respect safe areas and viewport height, so that controls remain usable on modern phones.
114. As a visitor, I want videos, long images, and avatars to load progressively, so that the first screen remains responsive.
115. As a system owner, I want large media stored in object storage/CDN rather than the application bundle, so that production deployment stays efficient.
116. As a security owner, I want role and card-validity checks enforced by the server, so that local data manipulation cannot bypass policy.
117. As a security owner, I want administrator actions and approval decisions audited, so that changes can be traced.
118. As a security owner, I want personal data encrypted in transit and protected at rest, so that employee and visitor information remains confidential.
119. As an administrator, I want import and approval failures to return actionable messages, so that I can resolve data issues without technical support.
120. As a system owner, I want the product to preserve the approved Baige Online brand, terminology, and official content, so that every card is consistent with the corporate identity.
121. As an employee, I want changes to personal fields other than the preset position to save without approval, so that routine profile updates take effect immediately.
122. As an employee, I want my first card validity to default to one year, so that normal employee cards have a consistent initial authorization period.
123. As an administrator, I want to update an employee's login phone in member management, so that the employee can log in with the corrected directory phone.
124. As a broker, I want the same personal-information fields as an employee and no preset values, so that I provide my own accurate details in a consistent card structure.
125. As a broker, I want my saved personal information merged with enterprise configuration, so that my approved card uses official company content.
126. As a broker, I want my first generated card submitted for administrator approval, so that it cannot be used before review.
127. As a broker, I want a pending or rejected state instead of a usable card, so that I understand whether to wait or edit and resubmit.
128. As an administrator, I want to set a broker card's validity when approving its initial application, so that broker authorization follows the approved period.
129. As a broker, I want an expired card to become unusable, so that I cannot continue sharing after the approved period.
130. As an administrator, I want the approval center to show only the latest five pending requests by default, so that the most urgent work stays concise.
131. As an administrator, I want “更多” to open an all-requests view containing every status, so that approved and rejected history remains available without cluttering the default view.
132. As a user, I want administrator-maintained corporate content labeled “企业配置”, so that the interface uses the approved product terminology.
133. As a card owner, I want a notification icon in the top-right corner of the card page, so that personal alerts are visible without entering administrator management.
134. As a card owner, I want position-change approval and rejection results in my notification center, so that I immediately know whether the requested position is effective.
135. As a broker, I want first-card approval and rejection results in my notification center, so that I know whether the card can be used or must be revised.
136. As a card owner, I want renewal approval and rejection results in my notification center, so that I know the new validity or the reason the card remains unavailable.
137. As a card owner, I want expiration reminders in the final seven, three, and one days and after expiration, so that I can renew before access is interrupted.
138. As a user, I want personal notifications kept separate from the administrator approval center, so that incoming decisions are not confused with work waiting for administrator action.
139. As a card owner, I want to submit a renewal request from the final seven days through the expired period, so that I can extend authorization at the appropriate time.
140. As a card owner, I want duplicate renewal submission disabled while one renewal is pending, so that the approval center does not receive duplicate requests.
141. As an administrator, I want to set a new card-validity date when approving renewal, so that the renewed authorization period is explicit.
142. As a card owner, I want a rejected renewal to disable the card immediately, so that an unapproved card cannot remain externally usable.
143. As a card owner, I want the card home page to show Normal, Pending Review, Expired, or Disabled, so that the current operating state is unambiguous.
144. As an administrator, I want enterprise news items to support drag-and-drop ordering, so that the shared card follows the intended editorial sequence.
145. As an administrator, I want promotional video uploads to accept MP4, MOV, M4V, and WebM, so that common source files can be configured directly.
146. As an administrator, I want to upload a promotional-video poster image, so that the card has an approved visual before playback begins.
147. As an administrator, I want to preview a complete card assembled from the enterprise-configuration draft, so that I can catch content or ordering errors before publication.
148. As an administrator, I want enterprise configuration to remain unpublished until I confirm from the preview, so that accidental edits do not affect every card.
149. As an administrator, I want the approval-center home view to show exactly the newest five pending requests ordered by application time descending, so that urgent work remains concise.
150. As an administrator, I want each pending row to show applicant name, full phone, application type, application time, and pending status, so that I can review identity and context without opening another screen.
151. As an administrator, I want position-change rows to show both the original and requested positions, so that the requested change is explicit.
152. As an administrator, I want the More action at the bottom of the default list to open a separate all-requests page, so that history is available without expanding the dashboard in place.
153. As an administrator, I want the all-requests page to include pending, approved, and rejected records, so that approval history is complete.
154. As an administrator, I want to filter all requests by application type and status, so that I can locate the relevant workflow quickly.
155. As an administrator, I want rejection to require a written reason, so that the applicant receives actionable feedback in personal notifications.

## Implementation Decisions

1. The production product will use a WeChat mini program as the primary employee and visitor experience, with a separate administrator web console and a backend service. The existing React/Vite application remains a design and interaction baseline, not the final security boundary.
2. The core domain modules are Identity and Access, Member Directory, Personal Card, Enterprise Configuration, Approval Workflow, Card Validity, Sharing, Add to Contacts, Visitor Analytics, Media, and Audit.
3. The employee directory is the source of truth for employee phone number, official name, and approved default position. The current baseline contains 186 unique employees imported from the approved workbook.
4. The designated primary administrator phone number maps to an administrator role even though its position remains the position supplied by the employee directory.
5. A phone found in the employee directory logs in as an employee and receives preset data. A phone not found in the employee directory enters the broker flow with no employee presets. New employees still enter the employee directory only through administrator import, manual creation, or OA synchronization.
6. Real login will use WeChat-authorized phone number or a production SMS verification service. The six-digit arbitrary-code behavior is prototype-only.
7. Account identity is keyed by immutable member ID plus login-phone binding. Login phone and card-display phone are separate fields and phone numbers are not permanent database primary keys.
8. Employee directory records include employee ID, phone, official name, approved position, optional email, role, account status, source, source version, last synchronization time, and card validity.
9. Personal card records include avatar, display name, approved position reference or broker-entered position, editable display phone, optional email, optional WeChat ID, personal introduction, multiple company addresses, publication status, approval status, and validity.
10. Enterprise content is versioned and administrator-controlled. It includes official company name, official company address, company introduction PDF and generated long image, promotional video, enterprise news, and optional qualification images.
11. The final card is assembled at read time from personal card data, the current approved employee-directory position, active enterprise-content version, role/status, and card-validity policy.
12. Empty personal or enterprise fields are filtered before rendering. The client must not create blank modules.
13. An employee's preset position is not directly mutable on the published card; changing it creates or updates a pending position-change request. Other employee personal fields save without approval. A broker supplies a position as part of the initial whole-card approval.
14. A position-change request contains applicant, employee ID, phone snapshot, approved position snapshot, requested position, submission time, status, reviewer, review time, rejection reason, and approved validity date.
15. Only one pending position-change request per employee is allowed. A subsequent edit updates the existing pending request rather than creating duplicates.
16. Approval states are pending, approved, and rejected. State transitions are server-controlled and audited.
17. While a position request is pending, the card continues to display the last approved position and the server rejects new share-token creation.
18. Approval atomically updates the approved position, card validity, approval record, share eligibility, and audit log.
19. Rejection leaves the approved position and shareable card unchanged, records the decision, and allows a future new request.
20. Card validity is stored server-side and checked on owner-card load, visitor-card load, share-token creation, add-contact generation, and analytics access. Employee cards receive a one-year default validity; broker validity is assigned during initial approval.
21. Expired cards enter an unavailable state. Employees may submit one pending renewal request; visitors receive no personal or enterprise content until renewal approval.
22. Renewal requests reuse the approval center but have a distinct request type. Approval assigns a new expiration date without changing position unless a separate position request is also approved.
23. Shared links use opaque, signed, revocable tokens that reference a server-side card ID. They must not contain an unsigned full card payload in production.
24. Existing shared links resolve current approved data and current validity, so revocation, expiration, position approval, and account disabling take effect without generating a new URL.
25. WeChat mini program sharing uses native share capabilities and a card-owner ID or signed short-link parameter. The application never reads or simulates the user's real contact list.
26. Add to Contacts uses the mini program native contact API in production. H5 uses a standards-compliant UTF-8 vCard fallback.
27. The contact payload includes name, organization, approved position, mobile number, optional email, work address, and optional WeChat ID as a note.
28. Visitor identity has two explicit modes: WeChat-authorized and anonymous. Anonymous records never display a fabricated name.
29. Visitor sessions are created server-side when a valid card is opened. Opening time is recorded immediately; browsing duration is derived from visibility-aware heartbeat events.
30. Analytics events use stable card ID, owner ID, visitor-session ID, event type, content/module ID, timestamp, duration delta, authorization state, and client metadata.
31. Visitor attention judgments and communication recommendations may use rules or AI, but the product exposes plain-language results and must retain the evidence events used to generate them.
32. The standalone “AI assistant”, “AI avatar”, appointment, direct-call, add-WeChat, and send-email actions are not part of the production scope defined by this PRD.
33. The visitor page has no owner navigation, editing controls, approval controls, analytics controls, or account controls.
34. The owner application has employee and broker navigation for Card, Visitors, and My. Administrators additionally see Management.
35. The My page remains limited to account information and logout. Personal editing stays in the Card module.
36. The card content order is fixed as Personal Introduction, Company Style, Enterprise News, and Company Introduction, with absent modules removed.
37. Company introduction PDF processing is asynchronous: upload, validation, virus scan, page rendering, long-image generation, optimization, version activation, and rollback.
38. Large videos, PDF files, long images, and avatars use object storage and CDN delivery. The current repository-hosted media is prototype-only.
39. Administrator imports support a dry-run validation report before commit. Invalid rows are rejected with row-level reasons; valid rows are imported idempotently by employee ID/phone mapping.
40. OA synchronization supports create, update, disable, and leave events. Destructive changes require audit records and an administrator-visible summary.
41. Existing employee cards are not deleted when directory data changes; approved directory fields are synchronized while employee-owned fields remain intact.
42. Personal data and visitor data have configurable retention, export, and deletion policies. Consent and authorization state are stored with the relevant event/session.
43. The backend enforces least-privilege role authorization for every administrator, employee, approval, content, visitor, and sharing API.
44. Administrator decisions, employee imports, enterprise-content publication, role changes, account disablement, and validity changes are written to an immutable audit trail.
45. The UI uses the centered single-mobile-screen design language from the prototype. All dialogs remain within the app viewport, including on desktop product-review screens.
46. Labels and terminology use the latest approved wording: 个人信息、手机号、邮箱、微信号、公司地址、个人简介、公司风采、企业资讯、公司介绍、企业配置、审批中心、名片有效期.
47. The system must support all 186 current employees and scale to at least several thousand directory records without rendering the entire list at once. The production management list uses server pagination, search, filtering, and virtualized rendering where appropriate.
48. Migration from the prototype must preserve approved content and media, but browser local-storage accounts, requests, visitor data, and permissions are not migrated as authoritative production data.
49. The member role model contains administrator, employee, and broker. Broker card-approval states are draft, pending, approved, and rejected.
50. Employee login phone is directory-controlled and can only be changed by an administrator. Editing the card-display phone never updates login credentials or the employee directory.
51. Employee changes to non-position personal fields do not create approval requests. Only a change from the approved preset position enters position approval.
52. Broker first save creates or updates one pending initial-card request. The card remains unavailable and non-shareable until approval.
53. Broker-initial approval marks the card approved and assigns the administrator-selected validity date. Rejection allows edited resubmission.
54. Both employee and broker cards become unavailable after their validity date; renewal continues through the shared approval center.
55. The approval-center default query returns the newest five pending requests. The bottom “更多” action opens an independent all-requests page ordered by submission time descending.
56. Enterprise Content is presented as “企业配置” and merged into every approved, active, non-expired card.
57. Changing an employee login phone migrates account binding and card ownership but does not overwrite the editable display phone.
58. Personal notification records are scoped to the card owner and are not mixed with administrator work queues. Approval-result notifications carry request type, decision time, new validity when approved, and rejection reason when rejected.
59. Expiration notifications use the configured business timezone and emit threshold reminders for the final seven, three, and one days plus an expired state. Delivery must be idempotent per card, validity version, and threshold.
60. Renewal eligibility begins seven calendar days before the end date and remains available after expiration or a rejected renewal. Only one pending renewal request per card is allowed.
61. A renewal rejection records the mandatory reason and immediately changes card availability to disabled. A later renewal approval clears the disabled renewal state and applies the new validity atomically.
62. Owner-card state has four display values with deterministic priority: account disablement or rejected renewal is Disabled; elapsed validity is Expired; pending initial, position, or renewal review is Pending Review; otherwise the card is Normal.
63. Enterprise-news order is stored as part of the enterprise-content version. Drag-and-drop changes only the draft until publication.
64. Promotional video accepts a production allowlist of MP4, MOV/QuickTime, M4V, and WebM. File extension, MIME type, signature, size, duration, malware status, and transcoding result must be validated server-side.
65. Promotional-video poster is stored as a separate media asset and referenced by the enterprise-content version. Production publication requires accessible CDN URLs rather than browser object URLs.
66. Enterprise configuration uses a draft-preview-publish lifecycle. Preview assembles the draft with representative personal information; Confirm Publish creates and activates a new version, while Return to Edit preserves the draft.
67. The approval dashboard query is `status=pending`, ordered by submission time descending, limited to five. The bottom More action navigates to a separate paginated all-requests view.
68. The all-requests view supports independent request-type and status filters, retains submission-time descending order, and includes applicant identity, phone snapshot, type, relevant position snapshots, submission time, status, validity decision, reviewer, review time, and rejection reason.
69. Rejecting any approval request requires a non-empty reason. The server validates the reason even if a client attempts to bypass the user-interface requirement.

## Testing Decisions

1. Tests will assert externally visible behavior and API contracts, not component internals, hook state, CSS class names, or local-storage implementation details.
2. The highest test seam for employee onboarding is: import employee directory → login with an imported phone → open card editor → verify official name, phone, and approved position are prefilled.
3. The broker-onboarding seam is: login with a phone absent from the employee directory → verify a broker account with no presets opens → complete personal information → verify the card enters pending approval and cannot be shared.
4. Directory-import contract tests cover 11-digit phone validation, duplicate phone detection, blank name, blank position, idempotent re-import, update, disable, and row-level error reporting.
5. Role tests cover primary administrator, promoted administrator, normal employee, broker, disabled member, employee-directory phone, and non-directory phone.
6. Card-generation tests cover required fields, optional-field filtering, six default avatars, uploaded-avatar handling, editable display phone, multiple addresses, fuzzy address search, and enterprise-configuration merging.
7. Content-order acceptance tests assert that rendered non-empty sections appear as Personal Introduction, Company Style, Enterprise News, and Company Introduction.
8. Position-workflow tests cover unchanged position, first change request, update to an existing pending request, approval, rejection, re-application after rejection, and audit history.
9. The critical end-to-end approval test is: approved position A → employee requests B → card still displays A → new sharing is blocked → administrator approves B and sets validity → card displays B → sharing is restored.
10. The rejection test is: approved position A → employee requests B → administrator rejects → card continues to display A → request is marked rejected → employee may submit a later request.
11. Sharing tests cover normal share eligibility, pending-position share lock, expired-card share lock, disabled-account share lock, server refusal to create a token, and restoration after approval.
12. Existing-link tests verify that a server-resolved link reflects current approved position, account status, and validity, and becomes unavailable immediately when revoked or expired.
13. Add-to-contacts contract tests assert exact mapping of name, organization, approved position, mobile number, email, work address, and WeChat note. Device tests cover supported iOS and Android versions.
14. Validity tests cover exact end-of-day boundary in the configured timezone, future validity, expiration, one pending renewal, approval with new validity, rejection, and visitor denial.
15. Public-card tests assert that owner/admin controls never render, empty modules are omitted, expired cards contain no personal information, and invalid share tokens reveal no card data.
16. Enterprise-content tests cover PDF validation, page rendering, long-image order, image readability, video playback, news link correctness, content version activation, and rollback.
17. Visitor-identity tests cover authorized WeChat name and anonymous visitor, ensuring both modes include opening time and browsing duration and anonymous mode never exposes unauthorized identity.
18. Duration tests simulate visible heartbeats, backgrounding, returning, closing, duplicate delivery, network retry, and clock skew.
19. Analytics tests reconcile visitor totals, total duration, visit count, module views, path order, and trend aggregation against raw events.
20. Privacy tests cover consent capture, anonymous data handling, retention expiration, deletion request, export, and administrator access control.
21. Security tests cover horizontal privilege escalation, administrator API authorization, employee ID tampering, forged share tokens, expired tokens, replay, upload validation, XSS in profile/news fields, and rate limiting.
22. Performance tests cover first-screen card load on mobile networks, long-image progressive rendering, video metadata loading, employee-directory search with thousands of records, and analytics aggregation.
23. Accessibility tests cover semantic labels, focus order, keyboard operation in the administrator console, visible disabled/share-lock state, contrast, and screen-reader descriptions for actions.
24. Visual regression tests cover login, employee and broker empty cards, editor, generated card, broker pending/rejected state, expired card, visitor views, approval center collapsed/expanded states, member directory, My page, and every modal at representative phone sizes.
25. Production smoke tests cover real SMS/WeChat login, one imported employee, one broker first-card approval, one employee position approval, one share, one public open, one add-contact action, and one visitor event before each release.
26. The existing prototype supplies prior-art acceptance flows for card rendering, centered modals, visitor authorized/anonymous display, video/news content, vCard generation, position approval, share locking, and expiration; production tests should preserve these observable outcomes while replacing local storage with APIs.
27. The employee no-approval seam is: directory employee changes non-position personal fields → save succeeds immediately → no request is created.
28. The phone-separation test verifies that changing the card-display phone does not change the employee login phone, and an administrator login-phone update retains the display phone.
29. The broker approval test covers no presets → complete fields → pending/share blocked → administrator approves with validity → usable card with enterprise configuration.
30. The broker rejection test covers rejected state → edit and resubmit → one new pending application.
31. The role-validity test asserts employee one-year default and broker administrator-selected validity.
32. The approval-list test creates more than five pending requests plus approved history → default shows five newest pending → bottom “更多” opens an independent page containing every request and status.
33. Terminology tests assert “企业配置” and no obsolete “企业统一内容管理” wording.
34. Notification tests cover unread badges, owner isolation, separation from administrator queues, approval-result content, rejection reason, approved validity, read state, and duplicate suppression.
35. Expiration-notification tests cover seven-day, three-day, one-day, end-date, and expired thresholds in the configured timezone, including a renewed card that receives a new reminder series.
36. Renewal eligibility tests cover eight days remaining, exactly seven days, exactly three days, exactly one day, the end date, expired, pending duplicate prevention, rejected re-application, approval restoration, and rejected disablement.
37. Card-state tests assert priority and visible labels for Normal, Pending Review, Expired, and Disabled across employee, broker, renewal, and account-disable scenarios.
38. Enterprise-news ordering tests drag items in the draft, preview the new sequence, cancel preview without publishing, then confirm publication and verify the same order on owner and public cards.
39. Video-upload tests cover accepted MP4, MOV, M4V, and WebM files; rejected unsupported formats; poster upload, poster replacement, poster rendering, and missing-poster fallback.
40. Enterprise-publication tests verify draft isolation, full-card preview, Return to Edit, Confirm Publish, version activation, and rollback after media or link errors.
41. Approval-dashboard tests create more than five pending requests with mixed timestamps and assert that only the newest five appear in descending order with the required row fields.
42. All-request-page tests verify independent navigation, all three statuses, type/status filter combinations, empty-filter results, descending order, and returning to the dashboard.
43. Rejection tests assert that the dialog opens inside the software viewport, blank reasons cannot be submitted, the reason persists in history, and the applicant receives the same reason in personal notifications.

## Out of Scope

1. A conversational AI assistant, AI avatar, or “ask my AI double” experience.
2. Appointment scheduling or meeting-booking functions.
3. Direct call, direct email, and direct add-WeChat action buttons on the public card.
4. Reading or displaying a real WeChat contact list inside an H5 page.
5. A web prototype pretending that simulated recent contacts are a production WeChat integration.
6. A standalone core-business module or internal “统一配置” wording on the public card.
7. Standalone “90亿+电子保单” statistics outside approved company-introduction content.
8. Enterprise-certification claims or badges that are not explicitly approved and configured.
9. Owner-only visitor-preview controls inside the public visitor card.
10. Using GitHub Pages, browser local storage, or client-side role checks as the production backend or security boundary.
11. Treating the prototype’s arbitrary six-digit verification code as real authentication.
12. Treating current demonstration visitor records as production analytics.
13. Migrating prototype-local test employees, test requests, or test visitor data into production as authoritative records.
14. Native iOS/Android standalone applications in the first production release unless separately approved; the first priority is WeChat mini program plus administrator web console.

## Further Notes

1. The official reference site is Baige Online’s corporate website. Brand, company name, official descriptions, media, and news should follow administrator-approved sources.
2. The initial public executive card is for Tu Jinbo to share directly. It uses his approved avatar, name, title, phone, email, personal introduction, company promotional video, enterprise news, and company-introduction long image.
3. The approved company promotional video currently has a duration of approximately 4 minutes 49 seconds. Production delivery should move it to object storage/CDN and provide poster images and adaptive encoding if necessary.
4. The approved company introduction source is a 15-page PDF rendered as a mobile-readable long image. The production pipeline must avoid clipped pages, incorrect order, excessive memory usage, and unreadable text.
5. The initial enterprise-news baseline contains the Hong Kong listing article and the Xiamen Data Development Association article, but news must be administrator-editable rather than hardcoded in production.
6. The employee workbook baseline contains 186 valid unique employee rows. It also contains rows whose names or positions indicate testing; they remain in scope because the supplied list is the current source of truth. Removal or filtering requires a corrected source list or explicit administrator action.
7. The current prototype proves the interaction model but not cross-device behavior. Production acceptance requires an employee device and an administrator device to observe the same request, decision, validity, and share state through the backend.
8. “审核通过后才可对外分享” means the server must refuse new share-token creation while a position request is pending. For complete revocation, previously issued links must also resolve current server state rather than embedding a permanent unsigned snapshot.
9. The test seams above are the assumed acceptance boundaries derived from the full requirement history: identity and role, directory import, card assembly, position approval, share eligibility, validity, public viewing, enterprise content, and visitor analytics.
10. Release readiness requires backend APIs, database migrations, object storage, real authentication, WeChat mini program integration, privacy review, security review, analytics validation, audit logging, and operational monitoring in addition to UI completion.
11. The latest role baseline overrides earlier assumptions: employee-directory phones become employees with presets; non-directory phones enter the broker flow without presets; card-display phone is editable, while employee login-phone changes require administrator maintenance.
