import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const miniRoot = path.join(root, 'miniprogram')
const appConfig = JSON.parse(fs.readFileSync(path.join(miniRoot, 'app.json'), 'utf8'))
const errors = []
const allowedTags = new Set(['block', 'view', 'text', 'image', 'button', 'input', 'textarea', 'scroll-view', 'video', 'picker', 'label', 'card-view'])

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  })
}

for (const page of appConfig.pages) {
  for (const extension of ['js', 'json', 'wxml', 'wxss']) {
    const target = path.join(miniRoot, `${page}.${extension}`)
    if (!fs.existsSync(target)) errors.push(`缺少页面文件：${path.relative(root, target)}`)
  }
}

const files = walk(miniRoot)
const jsonFiles = files.filter((file) => file.endsWith('.json'))
const jsFiles = files.filter((file) => file.endsWith('.js'))
const wxmlFiles = files.filter((file) => file.endsWith('.wxml'))

for (const file of jsonFiles) {
  try { JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch (error) { errors.push(`${path.relative(root, file)} JSON 无效：${error.message}`) }
}

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  if (result.status !== 0) errors.push(`${path.relative(root, file)} JS 语法错误：${result.stderr.trim()}`)
}

for (const file of wxmlFiles) {
  const source = fs.readFileSync(file, 'utf8')
  const tags = [...source.matchAll(/<\/?([a-zA-Z][\w-]*)\b/g)].map((match) => match[1])
  const unknown = [...new Set(tags.filter((tag) => !allowedTags.has(tag)))]
  if (unknown.length) errors.push(`${path.relative(root, file)} 包含未登记组件：${unknown.join(', ')}`)
  const stack = []
  for (const match of source.matchAll(/<(\/)?([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g)) {
    const [, closing, tag, selfClosing] = match
    if (selfClosing) continue
    if (closing) {
      const expected = stack.pop()
      if (expected !== tag) errors.push(`${path.relative(root, file)} 标签闭合异常：期望 ${expected || '无'}，实际 ${tag}`)
    } else if (!['input', 'image'].includes(tag)) stack.push(tag)
  }
  if (stack.length) errors.push(`${path.relative(root, file)} 存在未闭合标签：${stack.join(', ')}`)

  const siblingJs = file.replace(/\.wxml$/, '.js')
  if (fs.existsSync(siblingJs)) {
    const script = fs.readFileSync(siblingJs, 'utf8')
    const handlers = [...new Set([...source.matchAll(/\s(?:bind|catch)[\w:-]*="([a-zA-Z_$][\w$]*)"/g)].map((match) => match[1]))]
    for (const handler of handlers) {
      if (!new RegExp(`\\b${handler}\\s*\\(`).test(script)) errors.push(`${path.relative(root, file)} 绑定了未实现的方法：${handler}`)
    }
  }
}

const packageBytes = files.reduce((total, file) => total + fs.statSync(file).size, 0)
const packageLimit = 2 * 1024 * 1024
if (packageBytes > packageLimit) errors.push(`小程序主包 ${Math.ceil(packageBytes / 1024)}KB，超过 2MB 限制`)

const forbiddenLargeMedia = files.filter((file) => /\.(mp4|mov|pdf)$/i.test(file) && fs.statSync(file).size > 512 * 1024)
if (forbiddenLargeMedia.length) errors.push(`不应内置的大文件：${forbiddenLargeMedia.map((file) => path.relative(root, file)).join(', ')}`)

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'))
  process.exit(1)
}

console.log(`微信小程序检查通过：${appConfig.pages.length} 个页面，${files.length} 个文件，主包约 ${Math.ceil(packageBytes / 1024)}KB。`)
