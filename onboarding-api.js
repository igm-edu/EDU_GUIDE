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
    const tasks = (st.tasks || []).map((t, j) => migrateTask(t, dtasks[j], legacyUrl));

    // 카드 하단 CTA: 없으면 링크가 켜진 첫 항목에서 승계
    let cta = st.cta ? { label: st.cta.label || '', url: st.cta.url || '' } : null;
    if (!cta) {
      const t = tasks.find(x => x.link && x.link.enabled && x.link.url);
      cta = t ? { label: t.link.label || '바로가기', url: t.link.url } : { label: '', url: '' };
    }
    return {
      title: st.title || '',
      shortTitle: st.shortTitle || st.title || '',
      description: st.description || '',
      image: st.image || '',
      illust: st.illust || '',
      cta: cta,
      tasks: tasks
    };
  }

  function normRow(r) {
    r = r || {};
    return {
      icon: r.icon || '',
      label: r.label || '',
      value: r.value || '',
      linkLabel: r.linkLabel || '',
      linkUrl: r.linkUrl || ''
    };
  }

  /* 교육 안내 — 그룹 구조 (v3)
     info = { groups:[{icon,title,rows:[row],note}] }
     구버전(rows + supplies 평면 구조)은 자동으로 그룹으로 변환 */
  function normInfo(info) {
    info = info || {};

    if (Array.isArray(info.groups)) {
      return {
        groups: info.groups.map(g => ({
          icon: (g && g.icon) || 'info',
          title: (g && g.title) || '',
          rows: (Array.isArray(g && g.rows) ? g.rows : []).map(normRow),
          note: (g && g.note) || ''
        }))
      };
    }

    // ── 구버전 변환 ──
    const groups = [];
    const rows = (Array.isArray(info.rows) ? info.rows : []).map(normRow);
    if (rows.length) {
      groups.push({ icon: 'calendar', title: info.title || '교육 안내', rows: rows, note: '' });
    }
    const sup = (Array.isArray(info.supplies) ? info.supplies : []).filter(s => String(s || '').trim());
    if (sup.length) {
      groups.push({
        icon: 'clipboard',
        title: info.suppliesTitle || '준비물',
        rows: sup.map(s => ({ icon: 'check', label: '', value: String(s), linkLabel: '', linkUrl: '' })),
        note: ''
      });
    }
    return { groups: groups };
  }

  /* HERO — 메인 상단 영역 */
  function normHero(h, courseName) {
    h = h || {};
    const lines = Array.isArray(h.titleLines) ? h.titleLines.filter(x => x !== undefined && x !== null).map(String) : null;
    return {
      badge: h.badge !== undefined ? h.badge : '교육 안내',
      titleLines: (lines && lines.length) ? lines : [String(courseName || '교육') + ' 과정에', '오신 것을', '환영합니다!'],
      highlightLast: h.highlightLast !== undefined ? !!h.highlightLast : true,
      description: h.description !== undefined ? h.description
        : '과정 시작에 앞서 아래의 교육 일정, 장소, 준비물을 확인해 주세요.\n원활한 학습을 위해 필요한 정보를 미리 준비했습니다.',
      illust: h.illust || 'graduation'
    };
  }

  /* 커리큘럼 — 열 이름과 행을 자유롭게 구성 */
  function normCurriculum(c) {
    c = c || {};
    let cols = Array.isArray(c.columns) ? c.columns.map(x => String(x || '')) : [];
    if (!cols.length) cols = ['시간', '모듈', '내용'];
    const rows = (Array.isArray(c.rows) ? c.rows : []).map(r => {
      const arr = Array.isArray(r) ? r.map(x => String(x || '')) : [];
      while (arr.length < cols.length) arr.push('');   // 열 개수에 맞춰 보정
      return arr.slice(0, cols.length);
    });
    return {
      enabled: c.enabled !== undefined ? !!c.enabled : false,
      title: c.title || '커리큘럼',
      columns: cols,
      rows: rows,
      note: c.note || ''
    };
  }

  /* 오시는 길 */
  function normDirections(d) {
    d = d || {};
    return {
      enabled: d.enabled !== undefined ? !!d.enabled : false,
      title: d.title || '오시는 길',
      placeName: d.placeName || '',
      placeDetail: d.placeDetail || '',
      address: d.address || '',
      lat: (typeof d.lat === 'number') ? d.lat : (parseFloat(d.lat) || null),
      lng: (typeof d.lng === 'number') ? d.lng : (parseFloat(d.lng) || null),
      mapLink: d.mapLink || '',
      mapImage: d.mapImage || '',
      transit: (Array.isArray(d.transit) ? d.transit : []).map(t => ({
        icon: (t && t.icon) || 'subway',
        label: (t && t.label) || '',
        value: (t && t.value) || ''
      })),
      note: d.note || ''
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
    // 일러스트 기본 배정 (미지정 시 순서대로)
    const fallbackIllust = ['install', 'chat', 'survey', 'laptop', 'calendar', 'graduation'];
    steps.forEach((s, i) => { if (!s.illust) s.illust = fallbackIllust[i % fallbackIllust.length]; });

    return {
      slug: course.slug || '',
      courseName: course.courseName || '',
      tag: course.tag || '',
      active: course.active !== false,
      archived: course.archived === true,   // 종료된 과정 보관 (허브 목록에서 감춤)
      themeColor: (window.OnboardingAssets && OnboardingAssets.normHex(course.themeColor)) || '#2563EB',
      previewUrl: course.previewUrl || '',
      autoUrl: course.autoUrl || '',
      startUrl: course.startUrl || '',
      hero: normHero(course.hero, course.courseName),
      info: normInfo(course.info),
      directions: normDirections(course.directions),
      curriculum: normCurriculum(course.curriculum),
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
      illust: s.illust || '',
      cta: { label: (s.cta && s.cta.label) || '', url: (s.cta && s.cta.url) || '' },
      tasks: (s.tasks || []).map(t => ({ title: t.title || '', desc: t.desc || '', link: normLink(t.link) }))
    }));
  }

  // 편집기용 빈 항목/단계
  function blankTask() { return { title: '', desc: '', link: { enabled: false, label: '', url: '' } }; }
  function blankInfoRow() { return { icon: '', label: '', value: '', linkLabel: '', linkUrl: '' }; }
  function blankInfoGroup() { return { icon: 'info', title: '새 그룹', rows: [blankInfoRow()], note: '' }; }
  function blankTransit() { return { icon: 'subway', label: '', value: '' }; }
  function sampleCurriculum() {
    return {
      enabled: true, title: '커리큘럼', note: '',
      columns: ['시간', '모듈', '내용'],
      rows: [
        ['08:30 ~ 09:00', '등록',        '입실 및 좌석 배정'],
        ['09:00 ~ 10:30', '오리엔테이션', '과정 소개와 학습 목표 확인'],
        ['10:45 ~ 12:00', '모듈 1',      '클로드 기본 사용법 실습'],
        ['13:00 ~ 15:00', '모듈 2',      '업무 자동화 사례 실습'],
        ['15:15 ~ 17:30', '모듈 3',      '내 업무에 적용하기 워크숍']
      ]
    };
  }

  // 예시 불러오기용 기본 안내 서식 (그룹 구조)
  function sampleInfo() {
    return {
      groups: [
        { icon: 'calendar', title: '교육 일정', note: '', rows: [
          { icon: 'calendar', label: '교육 기간', value: '2026년 0월 0일(요일)', linkLabel: '', linkUrl: '' },
          { icon: 'clock',    label: '교육 시간', value: '00:00 ~ 00:00\n(점심시간 00:00 ~ 00:00)', linkLabel: '', linkUrl: '' },
          { icon: 'users',    label: '모집 인원', value: '00명', linkLabel: '', linkUrl: '' }
        ]},
        { icon: 'pin', title: '장소', note: '', rows: [
          { icon: 'building', label: '교육 장소', value: 'IGM세계경영연구원 2층 더블린', linkLabel: '', linkUrl: '' },
          { icon: 'pin',      label: '주소', value: '서울 중구 장충단로 8길 11-16', linkLabel: '지도', linkUrl: '' },
          { icon: 'car',      label: '주차', value: '본원 1층 (사전 설문에 차량 번호를 기재해주세요)', linkLabel: '', linkUrl: '' }
        ]},
        { icon: 'clipboard', title: '준비물', note: '보다 원활한 학습을 위해 준비물을 꼭 확인해 주세요.', rows: [
          { icon: 'laptop', label: '노트북', value: '사내 보안 상 AI 사용이 가능한지 점검', linkLabel: '', linkUrl: '' },
          { icon: 'check',  label: '계정',   value: '클로드 회원가입이 완료된 계정', linkLabel: '', linkUrl: '' },
          { icon: 'card',   label: '명함',   value: '동료 원우님들과 네트워크를 만들어가세요', linkLabel: '', linkUrl: '' }
        ]}
      ]
    };
  }
  function sampleDirections() {
    return {
      enabled: true, title: '오시는 길',
      placeName: 'IGM세계경영연구원 2층 더블린', placeDetail: '',
      address: '서울 중구 장충단로 8길 11-16',
      lat: null, lng: null, mapLink: '', mapImage: '',
      transit: [
        { icon: 'subway', label: '지하철', value: '' },
        { icon: 'bus',    label: '버스',   value: '' },
        { icon: 'car',    label: '자가용', value: '' }
      ],
      note: '주차 공간이 혼잡할 수 있으니 가급적 대중교통 이용을 권장드립니다.'
    };
  }
  function blankStep() { return { title: '새 단계', shortTitle: '', description: '', image: '', illust: 'laptop', cta: { label: '', url: '' }, tasks: [blankTask()] }; }

  function seedStore() { return migrateStore(JSON.parse(JSON.stringify(SEED))); }

  // 사실상 비어 있는 데이터인지 (새로 만든 빈 시트 등)
  function isEmptyStore(s) {
    if (!s || !Array.isArray(s.courses)) return true;
    return s.courses.length === 0;
  }

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

  /* 로드 우선순위
       1) 시트에 실제 데이터가 있으면 그것을 사용 (캐시 갱신)
       2) 시트가 비어 있으면(=아직 초기화 안 됨) 캐시 → 시드 순으로 사용하고
          remoteEmpty 로 알림. 이때 빈 시트 내용으로 캐시를 덮어쓰지 않는다.  */
  async function load() {
    const remote = await fetchRemote();

    if (remote && !isEmptyStore(remote)) {
      const st = migrateStore(remote);
      writeCache(st);
      return { store: st, source: 'remote', remoteEmpty: false };
    }

    const remoteEmpty = !!CFG.apiUrl;   // 연동은 켜져 있는데 시트가 비었음
    const cache = readCache();
    if (cache && !isEmptyStore(cache)) {
      return { store: migrateStore(cache), source: 'cache', remoteEmpty };
    }
    return { store: seedStore(), source: 'seed', remoteEmpty };
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
    blankStep, blankTask, blankInfoRow, blankInfoGroup, blankTransit,
    sampleInfo, sampleDirections, sampleCurriculum,
    normInfo, normHero, normDirections, normCurriculum,
    readCache, writeCache, seedStore, exportDataJs, isEmptyStore,
    isRemote: !!CFG.apiUrl, config: CFG, seed: SEED
  };
})();
