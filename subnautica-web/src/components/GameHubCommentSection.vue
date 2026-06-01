<template>
  <div class="gh-comments">
    <div class="gh-head">
      <p class="gh-eyebrow">Community</p>
      <h2 :id="headingId" class="gh-section-title">Comments</h2>
      <p class="gh-section-intro">
        Text-only thread for this title (no ratings). Be kind and avoid unmarked spoilers.
      </p>
    </div>

    <div v-if="!keyOk" class="gh-comments__banner gh-comments__banner--warn" role="status">
      Comments are disabled until <code class="gh-comments__code">VITE_COMMENT_API_KEY</code> is set (see
      <code class="gh-comments__code">.env.example</code> in the project root).
    </div>

    <div v-else-if="bannerError" class="gh-comments__banner gh-comments__banner--err" role="alert">
      {{ bannerError }}
    </div>

    <form class="gh-comments__form" @submit.prevent="onSubmit">
      <label class="gh-comments__label" for="comment-author">Display name <span class="gh-comments__opt">(optional)</span></label>
      <input
        id="comment-author"
        v-model.trim="authorDisplayName"
        class="gh-comments__input"
        type="text"
        maxlength="120"
        autocomplete="nickname"
        placeholder="Visitor"
      />

      <label class="gh-comments__label" :for="bodyFieldId">Message</label>
      <textarea
        :id="bodyFieldId"
        v-model="body"
        class="gh-comments__textarea"
        rows="4"
        maxlength="2000"
        required
        placeholder="1–2000 characters"
      />
      <p class="gh-comments__meta">{{ bodyTrimmed.length }} / 2000</p>

      <p v-if="formError" class="gh-comments__form-err" role="alert">{{ formError }}</p>

      <button type="submit" class="gh-comments__submit" :disabled="submitting || !canSubmit">
        {{ submitting ? 'Posting…' : 'Post comment' }}
      </button>
    </form>

    <div v-if="keyOk && loading" class="gh-comments__loading" role="status">Loading comments…</div>

    <ul v-else-if="keyOk && reviews.length" class="gh-comments__list" aria-label="Comments">
      <li v-for="r in reviews" :key="r.id" class="gh-comments__card">
        <div class="gh-comments__card-head">
          <span class="gh-comments__author">{{ r.authorDisplayName || 'Anonymous' }}</span>
          <time class="gh-comments__time" :datetime="r.createdAt">{{ formatTime(r.createdAt) }}</time>
        </div>
        <p class="gh-comments__body">{{ r.body }}</p>
      </li>
    </ul>

    <p v-else-if="keyOk && !loading && !listError" class="gh-comments__empty">No comments yet — start the thread.</p>

    <div v-if="keyOk && hasMore" class="gh-comments__more-wrap">
      <button type="button" class="gh-comments__more" :disabled="loadingMore" @click="loadMore">
        {{ loadingMore ? 'Loading…' : 'Load more' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchSectionReviews, isCommentApiKeyConfigured, postSectionReview } from '@/api/commentReviews.js'

const props = defineProps({
  /** 管理后台版块 slug，如 subnautica */
  sectionSlug: {
    type: String,
    required: true,
  },
  /** 页内标题 id，供 TOC / aria 使用 */
  headingId: {
    type: String,
    required: true,
  },
})

const bodyFieldId = computed(() => `comment-body-${props.sectionSlug}`)

const keyOk = ref(isCommentApiKeyConfigured())
const reviews = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const loadingMore = ref(false)
const submitting = ref(false)
const listError = ref('')
const formError = ref('')
const authorDisplayName = ref('')
const body = ref('')

const bodyTrimmed = computed(() => body.value.trim())
const canSubmit = computed(() => bodyTrimmed.value.length >= 1 && bodyTrimmed.value.length <= 2000)

const bannerError = computed(() => {
  if (!keyOk.value) return ''
  if (listError.value && reviews.value.length === 0 && !loading.value) return listError.value
  return ''
})

const hasMore = computed(() => keyOk.value && reviews.value.length < total.value)

function formatTime(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return String(iso)
    return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return String(iso)
  }
}

function mapSubmitError(err) {
  if (err?.code === 'MISSING_API_KEY' || err?.message === 'MISSING_API_KEY') {
    return 'API key is not configured.'
  }
  if (err?.status === 429) return 'You are posting too quickly. Please wait a moment and try again.'
  if (err?.status === 403) {
    return `${err.message || 'Forbidden'} If this is production, confirm the site origin is allowlisted in the comment admin.`
  }
  return err?.message || 'Something went wrong.'
}

async function loadPage(targetPage, append) {
  const json = await fetchSectionReviews(props.sectionSlug, {
    page: targetPage,
    pageSize,
    sort: 'createdAt_desc',
  })
  const rows = Array.isArray(json.data) ? json.data : []
  const t = typeof json.total === 'number' ? json.total : rows.length
  if (append) reviews.value = reviews.value.concat(rows)
  else reviews.value = rows
  total.value = t
  page.value = targetPage
  listError.value = ''
}

async function refreshList() {
  if (!keyOk.value) return
  loading.value = true
  listError.value = ''
  try {
    await loadPage(1, false)
  } catch (e) {
    listError.value = mapSubmitError(e)
    reviews.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true
  formError.value = ''
  try {
    await loadPage(page.value + 1, true)
  } catch (e) {
    formError.value = mapSubmitError(e)
  } finally {
    loadingMore.value = false
  }
}

async function onSubmit() {
  formError.value = ''
  const text = bodyTrimmed.value
  if (text.length < 1 || text.length > 2000) {
    formError.value = 'Message must be between 1 and 2000 characters.'
    return
  }
  if (!keyOk.value) return
  submitting.value = true
  try {
    await postSectionReview(props.sectionSlug, {
      body: text,
      authorDisplayName: authorDisplayName.value,
    })
    body.value = ''
    await refreshList()
  } catch (e) {
    formError.value = mapSubmitError(e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  keyOk.value = isCommentApiKeyConfigured()
  refreshList()
})

watch(
  () => props.sectionSlug,
  () => {
    keyOk.value = isCommentApiKeyConfigured()
    page.value = 1
    reviews.value = []
    total.value = 0
    refreshList()
  },
)
</script>

<style scoped>
.gh-comments {
  padding-block: 0.25rem 0.5rem;
}

.gh-head {
  margin-bottom: 1.25rem;
}

.gh-eyebrow {
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 0 0 0.35rem;
}

.gh-section-title {
  font-size: 1.85rem;
  letter-spacing: 0.02em;
  margin: 0 0 0.45rem;
}

.gh-section-intro {
  margin: 0;
  max-width: 52rem;
  color: var(--color-muted);
  line-height: 1.55;
}

.gh-comments__banner {
  padding: 0.85rem 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-line);
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.gh-comments__banner--warn {
  background: rgba(245, 255, 138, 0.08);
  border-color: rgba(245, 255, 138, 0.35);
}

.gh-comments__banner--err {
  background: rgba(255, 122, 92, 0.1);
  border-color: rgba(255, 122, 92, 0.45);
}

.gh-comments__code {
  font-size: 0.88em;
  padding: 0.1em 0.35em;
  border-radius: 6px;
  background: rgba(5, 14, 26, 0.85);
  border: 1px solid var(--color-line);
}

.gh-comments__form {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.75rem;
  padding: 1.1rem 1.15rem;
  border-radius: var(--radius-lg);
  background: rgba(5, 14, 26, 0.88);
  border: 1px solid var(--color-line);
}

.gh-comments__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-muted);
  margin-top: 0.35rem;
}

.gh-comments__label:first-of-type {
  margin-top: 0;
}

.gh-comments__opt {
  font-weight: 400;
  opacity: 0.85;
}

.gh-comments__input,
.gh-comments__textarea {
  font: inherit;
  color: var(--color-text);
  background: rgba(3, 6, 13, 0.75);
  border: 1px solid var(--color-line);
  border-radius: 12px;
  padding: 0.55rem 0.7rem;
  width: 100%;
  max-width: 100%;
}

.gh-comments__input:focus-visible,
.gh-comments__textarea:focus-visible {
  outline: 2px solid var(--accent, var(--color-aqua));
  outline-offset: 2px;
}

.gh-comments__textarea {
  resize: vertical;
  min-height: 6.5rem;
  line-height: 1.5;
}

.gh-comments__meta {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-muted);
}

.gh-comments__form-err {
  margin: 0.25rem 0 0;
  color: var(--color-coral);
  font-size: 0.92rem;
}

.gh-comments__submit {
  align-self: flex-start;
  margin-top: 0.5rem;
  cursor: pointer;
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.78rem;
  padding: 0.65rem 1.25rem;
  border-radius: 999px;
  border: 1px solid rgba(46, 243, 217, 0.55);
  color: var(--color-void);
  background: linear-gradient(135deg, var(--color-aqua), var(--color-aqua-dim));
  box-shadow: 0 6px 20px rgba(46, 243, 217, 0.25);
}

.gh-comments__submit:hover:not(:disabled) {
  filter: brightness(1.06);
}

.gh-comments__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.gh-comments__loading,
.gh-comments__empty {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.98rem;
}

.gh-comments__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gh-comments__card {
  padding: 1rem 1.1rem;
  border-radius: 16px;
  background: rgba(5, 14, 26, 0.75);
  border: 1px solid var(--color-line);
}

.gh-comments__card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-bottom: 0.55rem;
}

.gh-comments__author {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-text);
}

.gh-comments__time {
  font-size: 0.82rem;
  color: var(--color-muted);
}

.gh-comments__body {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.55;
}

.gh-comments__more-wrap {
  margin-top: 1.25rem;
}

.gh-comments__more {
  cursor: pointer;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-line);
}

.gh-comments__more:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.35);
}

.gh-comments__more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
