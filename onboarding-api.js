/* ============================================================================
   OnboardingAPI — 데이터 로드/저장 + 구조 마이그레이션 (index.html, course.html 공용)
   ----------------------------------------------------------------------------
   데이터 구조 (v3):
     course = {
       slug, courseName, tag, active,
       previewUrl, autoUrl, startUrl,
       steps: [ { title, shortTitle, description, image,
                  tasks: [ { title, desc, link:{ enabled, label, url } } ] } ],
       faq: [ { q, a } ]
     }
   구버전(단계 3개 고정 + step1~3Url + task.hasLink)은 load 시 자동 변환됩니다.
   ============================================================================ */
(function () {
  const CFG  = window.ONBOARDING_CONFIG || {};
  const SEED = window.ONBOARDING || {};
  const LS_KEY = 'onboarding_store_v2';

  function normalizeImg(v) {
    v = (v || '').trim();
    if (!v) return '';
    return /^(https?:\/\/|\.?\/|data:)/i.test(v) ? v : './images/' + v;
  }

  function normLink(l) {
    l = l || {};
    return { enabled: !!l.enabled, label: l.label || '', url: (l.url || '').trim() };
  }

  // ── 구조 마이그레이션 ──
  function migrateTask(t, dtask, legacyUrl) {
    t = t || {};
    if (t.link && typeof t.link === 'object') {
      return { title: t.title || '', desc: t.desc || '', link: normLink(t.link) };
    }
    // 구버전: task.hasLink(또는 defaultSteps 의 hasLink) + step URL
    const d = dtask || {};
    const hasLink = (t.hasLink !== undefined) ? !!t.hasLink : !!d.hasLink;
    const label = t.linkLabel || d.linkLabel || (hasLink ? '링크 열기' : '');
    return { title: t.title || '', desc: t.desc || '', link: { enabled: hasLink, label: label, url: hasLink ? (legacyUrl || '') : '' } };
  }

  function migrateStep(st, dstep, legacyUrl) {
    st = st || {};
    const dtasks = (dstep && dstep.tasks) || [];
    return {
      title: st.title || '',
      shortTitle: st.shortTitle || st.title || '',
      description: st.description || '',
      image: st.image || '',
      tasks: (st.tasks || []).map((t, j) => migrateTask(t, dtasks[j], legacyUrl))
    };
  }

  function migrateCourse(course, rawDefaultSteps) {
    const ds = rawDefaultSteps || [];
    let steps;
    if (Array.isArray(course.steps) && course.steps.length) {
      steps = course.steps.map((st, i) => migrateStep(st, ds[i], course['step' + (i + 1) + 'Url'] || ''));
    } else {
      steps = ds.map((dstep, i) => migrateStep(dstep, dstep, course['step' + (i + 1) + 'Url'] || ''));
    }
    return {
      slug: course.slug || '',
      courseName: course.courseName || '',
      tag: course.tag || '',
      active: course.active !== false,
      previewUrl: course.previewUrl || '',
      autoUrl: course.autoUrl || '',
      startUrl: course.startUrl || '',
      steps: steps,
      faq: Array.isArray(course.faq) ? course.faq.map(f => ({ q: f.q || '', a: f.a || '' })) : []
    };
  }

  function migrateStore(s) {
    s = s || {};
    const rawDefaults = Array.isArray(s.defaultSteps) ? s.defaultSteps : [];
    return {
      hub: s.hub || {},
      defaultSteps: rawDefaults.map(ds => migrateStep(ds, ds, '')),
      defaultFaq: Array.isArray(s.defaultFaq) ? s.defaultFaq : [],
      courses: (Array.isArray(s.courses) ? s.courses : []).map(c => migrateCourse(c, rawDefaults))
    };
  }

  // 렌더용: id 부여 + 이미지 경로 정규화
  function buildSteps(course) {
    return (course.steps || []).map((s, i) => ({
      id: i + 1,
      title: s.title || '',
      shortTitle: s.shortTitle || s.title || '',
      description: s.description || '',
      image: normalizeImg(s.image || ''),
      tasks: (s.tasks || []).map(t => ({ title: t.title || '', desc: t.desc || '', link: normLink(t.link) }))
    }));
  }

  // 편집기용 빈 항목/단계
  function blankTask() { return { title: '', desc: '', link: { enabled: false, label: '', url: '' } }; }
  function blankStep() { return { title: '새 단계', shortTitle: '', description: '', image: '', tasks: [blankTask()] }; }

  function seedStore() { return migrateStore(JSON.parse(JSON.stringify(SEED))); }

  function readCache() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      return (s && Array.isArray(s.courses)) ? s : null;
    } catch (e) { return null; }
  }
  function writeCache(store) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch (e) {}
  }

  async function fetchRemote() {
    if (!CFG.apiUrl) return null;
    try {
      const url = CFG.apiUrl + (CFG.apiUrl.includes('?') ? '&' : '?') + 'action=get&t=' + Date.now();
      const r = await fetch(url, { method: 'GET' });
      if (!r.ok) return null;
      const j = await r.json();
      const data = (j && j.data) ? j.data : j;
      if (data && Array.isArray(data.courses)) return data;
      return null;
    } catch (e) { return null; }
  }

  async function load() {
    const remote = await fetchRemote();
    if (remote) { const st = migrateStore(remote); writeCache(st); return { store: st, source: 'remote' }; }
    const cache = readCache();
    if (cache) return { store: migrateStore(cache), source: 'cache' };
    return { store: seedStore(), source: 'seed' };
  }

  // 공통 POST
  async function post_(payload) {
    try {
      const r = await fetch(CFG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ token: CFG.apiToken || '' }, payload))
      });
      const j = await r.json().catch(() => null);
      if (j && j.ok) return { ok: true, remote: true, mode: j.mode };
      return { ok: false, remote: true, error: (j && j.error) || '시트 저장 응답 오류' };
    } catch (e) {
      return { ok: false, remote: true, error: String(e) };
    }
  }

  // 전체 저장 (구조 이관·일괄 저장용)
  async function save(store) {
    writeCache(store);
    if (!CFG.apiUrl) return { ok: true, remote: false };
    return post_({ action: 'saveAll', data: store });
  }

  // 과정 하나만 저장 — 다른 과정 데이터를 건드리지 않음
  async function saveCourse(store, course) {
    writeCache(store);
    if (!CFG.apiUrl) return { ok: true, remote: false };
    return post_({ action: 'saveCourse', course: course });
  }

  // 과정 하나만 삭제
  async function deleteCourse(store, slug) {
    writeCache(store);
    if (!CFG.apiUrl) return { ok: true, remote: false };
    return post_({ action: 'deleteCourse', slug: slug });
  }

  function exportDataJs(store) {
    const json = JSON.stringify(store, null, 2);
    return '/* onboarding-data.js — 허브에서 내보낸 데이터 (' +
           new Date().toISOString().slice(0, 10) + ') */\n' +
           'window.ONBOARDING = ' + json + ';\n';
  }

  window.OnboardingAPI = {
    load, save, saveCourse, deleteCourse, buildSteps, normalizeImg, migrateStore, migrateCourse,
    blankStep, blankTask, readCache, writeCache, seedStore, exportDataJs,
    isRemote: !!CFG.apiUrl, config: CFG, seed: SEED
  };
})();
