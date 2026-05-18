import { COMMENT_API_ORIGIN, COMMENT_PROJECT_SLUG } from '@/constants/commentApi.js'

function projectBase() {
  return `${COMMENT_API_ORIGIN}/api/v1/p/${COMMENT_PROJECT_SLUG}`
}

function apiKey() {
  const k = import.meta.env.VITE_COMMENT_API_KEY
  return typeof k === 'string' ? k.trim() : ''
}

export function isCommentApiKeyConfigured() {
  return Boolean(apiKey())
}

async function readErrorMessage(res) {
  try {
    const j = await res.json()
    if (j?.error?.message) return String(j.error.message)
  } catch {
    /* ignore */
  }
  return res.statusText || 'Request failed'
}

/**
 * @param {string} sectionSlug
 * @param {{ page?: number, pageSize?: number, sort?: string }} [opts]
 */
export async function fetchSectionReviews(sectionSlug, opts = {}) {
  const key = apiKey()
  if (!key) {
    const e = new Error('MISSING_API_KEY')
    e.code = 'MISSING_API_KEY'
    throw e
  }
  const page = opts.page ?? 1
  const pageSize = opts.pageSize ?? 20
  const sort = opts.sort ?? 'createdAt_desc'
  const u = new URL(`${projectBase()}/sections/${encodeURIComponent(sectionSlug)}/reviews`)
  u.searchParams.set('page', String(page))
  u.searchParams.set('pageSize', String(pageSize))
  u.searchParams.set('sort', sort)

  const res = await fetch(u.toString(), {
    headers: { 'X-API-Key': key },
  })
  if (!res.ok) {
    const msg = await readErrorMessage(res)
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return res.json()
}

/**
 * SINGLE 版块：不传 rating、不传 itemSlug。
 * @param {string} sectionSlug
 * @param {{ body: string, authorDisplayName?: string }} payload
 */
export async function postSectionReview(sectionSlug, payload) {
  const key = apiKey()
  if (!key) {
    const e = new Error('MISSING_API_KEY')
    e.code = 'MISSING_API_KEY'
    throw e
  }
  const body = { body: payload.body }
  const name = payload.authorDisplayName?.trim()
  if (name) body.authorDisplayName = name

  const res = await fetch(`${projectBase()}/sections/${encodeURIComponent(sectionSlug)}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': key,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await readErrorMessage(res)
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return res.json()
}
