/** 浏览器标签标题右侧品牌段（与路由 meta.title 拼接） */
const SITE_TITLE_SUFFIX = 'Subnautica Map'

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const TRAIL_SUFFIX_RE = new RegExp(`\\s*\\|\\s*${escapeRe(SITE_TITLE_SUFFIX)}\\s*$`, 'i')

/** 去掉已存在的「| Subnautica Map」后缀，避免重复拼接 */
function normalizeTitleSegment(raw) {
  if (!raw || typeof raw !== 'string') return ''
  return raw.trim().replace(TRAIL_SUFFIX_RE, '').trim()
}

/**
 * 文档标题：`{主题段} | Subnautica Map`；主题为空时仅品牌名。
 * @param {string} [segment]
 */
export function buildDocumentTitle(segment) {
  const clean = normalizeTitleSegment(segment)
  return clean ? `${clean} | ${SITE_TITLE_SUFFIX}` : SITE_TITLE_SUFFIX
}
