// TEST DATA ONLY. Isolated lifecycle harness: no real Google requests or stored reviews.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = fs.readFileSync('src/features/landing/hooks/useGoogleReviews.ts', 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const results = []
const fixture = (average = 4.7, total = 37, count = 2) => ({
  source: 'google_business_profile', average, total, sourceUrl: 'https://www.google.com/maps?cid=123',
  reviews: Array.from({ length: count }, (_, index) => ({ id: `TEST-DATA-${index}`, author: `TEST DATA ${index}`,
    rating: index ? 4 : 5, comment: 'TEST DATA ONLY — isolated fixture.', dateLabel: '20 de out. de 2026',
    sourceUrl: 'https://www.google.com/maps?cid=123' })),
})

function createHarness({ intersection = false } = {}) {
  let now = 1_800_000_000_000, nextTimer = 1, cursor = 0, mounted = false, queued = false, latest
  const timers = new Map(), hooks = [], calls = [], observers = []
  const events = () => {
    const listeners = new Map()
    return { addEventListener: (name, fn) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn) },
      removeEventListener: (name, fn) => listeners.get(name)?.delete(fn),
      emit: name => [...listeners.get(name) ?? []].forEach(fn => fn()) }
  }
  const win = events(), doc = { ...events(), visibilityState: 'visible' }
  if (intersection) win.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe() {} disconnect() { this.disconnected = true }
  }
  const scheduleRender = () => {
    if (!queued && mounted) { queued = true; queueMicrotask(() => { queued = false; if (mounted) render() }) }
  }
  const react = {
    useRef(initial) { const index = cursor++; return (hooks[index] ??= { current: initial ?? {} }) },
    useState(initial) { const index = cursor++; hooks[index] ??= { value: initial }; return [hooks[index].value, value => { hooks[index].value = value; scheduleRender() }] },
    useEffect(setup, deps) {
      const index = cursor++, previous = hooks[index]
      if (!previous || !deps.every((value, at) => Object.is(value, previous.deps[at]))) {
        hooks[index] = { deps, setup, pending: true, cleanup: previous?.cleanup }
      }
    },
  }
  class FakeDate extends Date { constructor(...args) { super(...(args.length ? args : [now])) } static now() { return now } }
  const context = vm.createContext({ exports: {}, require: name => { assert.equal(name, 'react'); return react },
    Date: FakeDate, URL, TextDecoder, AbortController, window: win, document: doc,
    ...(intersection ? { IntersectionObserver: win.IntersectionObserver } : {}),
    setTimeout: (fn, delay = 0) => { const id = nextTimer++; timers.set(id, { fn, at: now + delay }); return id },
    clearTimeout: id => timers.delete(id),
    fetch: (url, options) => new Promise((resolve, reject) => {
      const call = { url, options, resolve, reject }; calls.push(call)
      options.signal.addEventListener('abort', () => { call.aborted = true; reject(new Error('aborted')) })
    }),
  })
  vm.runInContext(compiled, context)
  function render() {
    cursor = 0; latest = context.exports.useGoogleReviews()
    latest.ref.current = {}
    hooks.forEach(hook => { if (hook.pending) { hook.pending = false; hook.cleanup?.(); hook.cleanup = hook.setup() } })
  }
  const flush = async () => { for (let index = 0; index < 15; index++) await new Promise(resolve => setImmediate(resolve)) }
  const advance = async ms => {
    const end = now + ms
    while (true) {
      const due = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0]
      if (!due) break
      timers.delete(due[0]); now = due[1].at; due[1].fn(); await flush()
    }
    now = end; await flush()
  }
  return {
    get state() { return latest }, calls, win, doc, flush, advance, normalize: context.exports.normalizeGoogleReviews,
    mount() { mounted = true; render() },
    unmount() { mounted = false; hooks.forEach(hook => hook.cleanup?.()); hooks.length = 0 },
    intersect(near) { observers.filter(observer => !observer.disconnected).forEach(observer => observer.callback([{ isIntersecting: near }])) },
    async respond(body, status = 200, headers = {}, index = calls.length - 1) {
      calls[index].resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })); await flush()
    },
  }
}

try {
  const h = createHarness({ intersection: true })
  h.mount(); await h.flush(); assert.equal(h.calls.length, 0)
  h.intersect(true); await h.flush(); assert.equal(h.calls.length, 1)
  await h.respond({ error: { category: 'configuration' } }, 503)
  assert.equal(h.state.status, 'unavailable'); assert.equal(h.state.data, null); assert.equal(h.state.retryable, true)
  h.state.refresh(); assert.equal(h.calls.length, 1)
  await h.advance(60000)
  h.win.emit('focus'); h.doc.emit('visibilitychange'); h.intersect(false); h.intersect(true)
  assert.equal(h.calls.length, 1)
  results.push('A: lazy unavailable configuration; manual 60 s cooldown; no automatic permanent-error storm PASS')
  h.state.retry(); await h.flush(); assert.equal(h.calls.length, 2)
  await h.respond(fixture()); assert.equal(h.state.status, 'verified'); assert.equal(h.state.data.average, 4.7)
  assert.equal(h.state.data.total, 37); assert.equal(h.state.data.reviews.length, 2)
  results.push('B: backend activation via same mounted hook; no React edits/reload/build PASS')
  h.win.emit('focus'); h.state.refresh(); assert.equal(h.calls.length, 2)
  await h.advance(5 * 60000)
  h.win.emit('focus'); h.doc.emit('visibilitychange'); h.intersect(false); h.intersect(true); await h.flush()
  assert.equal(h.calls.length, 3); assert.equal(h.state.refreshing, true); assert.equal(h.state.status, 'verified'); assert.equal(h.state.data.average, 4.7)
  await h.respond(fixture(4.2, 38, 1)); assert.equal(h.state.data.average, 4.2); assert.equal(h.state.data.total, 38)
  assert.equal(h.state.data.reviews.length, 1); assert.equal(h.state.refreshing, false)
  results.push('C: 5 min controlled revalidation, focus/visibility/reentry dedup, stable old data, changed rating/count/cards PASS')
  await h.advance(5 * 60000); h.state.refresh(); await h.flush(); await h.respond({ error: { category: 'upstream' } }, 500)
  assert.equal(h.state.status, 'verified'); assert.equal(h.state.refreshError, true); assert.equal(h.state.data.average, 4.2)
  await h.advance(2000); h.state.retry(); await h.respond(fixture(4.9, 39, 3))
  assert.equal(h.state.refreshError, false); assert.equal(h.state.data.average, 4.9); assert.equal(h.state.data.reviews.length, 3)
  results.push('D: temporary refresh failure disclosed; bounded old data retained; same-page recovery PASS')
  const beforeExpiry = h.calls.length
  await h.advance(15 * 60000)
  assert.equal(h.state.data, null); assert.equal(h.state.status, 'unavailable'); assert.equal(h.calls.length, beforeExpiry)
  results.push('Hard 15 min expiry; no interval request polling PASS')

  const strict = createHarness(); strict.mount(); strict.unmount(); strict.mount(); await strict.flush()
  assert.equal(strict.calls.length, 1)
  strict.unmount(); await strict.advance(0); assert.equal(strict.calls[0].aborted, true)
  strict.mount(); await strict.flush(); assert.equal(strict.calls.length, 2)
  await strict.respond(fixture(), 200, {}, 1)
  await strict.respond(fixture(1, 3, 1), 200, {}, 0)
  assert.equal(strict.state.data.average, 4.7)
  strict.unmount(); strict.mount(); await strict.flush(); assert.equal(strict.calls.length, 2)
  results.push('StrictMode dedup, true unmount abort, old response isolation, fresh remount reuse PASS')

  for (const [status, category, wait] of [[401, 'authentication', 60000], [403, 'permission', 60000], [429, 'rate_limit', 90000], [500, 'upstream', 2000]]) {
    const error = createHarness(); error.mount(); await error.respond({ error: { category } }, status, status === 429 ? { 'retry-after': '90' } : {})
    assert.equal(error.state.status, 'unavailable'); assert.equal(error.state.data, null)
    error.state.retry(); assert.equal(error.calls.length, 1)
    await error.advance(wait); error.state.retry(); await error.respond(fixture())
    assert.equal(error.state.status, 'verified')
  }
  results.push('HTTP 401/403/429 Retry-After/500 cooldown and recovery PASS')
  const timeout = createHarness(); timeout.mount(); await timeout.advance(10000)
  assert.equal(timeout.calls[0].aborted, true); assert.equal(timeout.state.status, 'unavailable')
  await timeout.advance(2000); timeout.state.retry(); await timeout.respond(fixture()); assert.equal(timeout.state.status, 'verified')
  results.push('10 s timeout abort, temporary failure and recovery PASS')

  const normalize = h.normalize
  for (const data of [fixture(5, 200, 3), fixture(4.7, 37, 2), fixture(4.2, 9, 1), fixture(4.1, 8, 0), fixture(null, 0, 0)]) assert.ok(normalize(data))
  const long = fixture(); long.reviews[0].comment = 'TEST DATA ONLY '.repeat(2000); assert.ok(normalize(long))
  const emptyComment = fixture(); emptyComment.reviews[0].comment = ''; assert.ok(normalize(emptyComment))
  for (const mutate of [data => delete data.reviews[0].author, data => { data.reviews[0].dateLabel = '' }, data => { data.reviews[0].sourceUrl = 'javascript:alert(1)' },
    data => { data.sourceUrl = 'https://evil.example/maps' }, data => { data.average = 5.1 }, data => { data.reviews[1].id = data.reviews[0].id }]) {
    const data = fixture(); mutate(data); assert.equal(normalize(data), null)
  }
  const authorLink = fixture(); authorLink.reviews[0].authorUrl = 'https://evil.example/profile'
  assert.equal(normalize(authorLink).reviews[0].authorUrl, undefined)
  results.push('Typed normalized contract: 5/4.7/4.2, snippets absent, empty, long/empty comments, absent author, blank date, unsafe links, duplicate IDs PASS')
  console.log(results.join('\n'))
} finally {
  fs.writeFileSync('.nox/evidence/ZE-09.1/hook-lifecycle.json', JSON.stringify({ label: 'TEST DATA ONLY — isolated lifecycle, no real Google validation', source: 'src/features/landing/hooks/useGoogleReviews.ts', results }, null, 2))
}
