/* ============================================================================
   OnboardingAssets — 일러스트 · 아이콘 세트 (index.html, course.html 공용)
   ----------------------------------------------------------------------------
   · ILLUST : 카드 상단 일러스트. 허브 편집기에서 이름으로 고릅니다.
   · ICON   : 안내 항목·교통편 행 앞에 붙는 작은 아이콘.
   수정할 일이 거의 없는 파일입니다.
   ============================================================================ */
(function () {

  /* ════════════════════════════════════════════════════════════════
     테마 색상 — 기준색 1개로 밝기 단계(50~800)를 자동 생성합니다.
     과정마다 다른 색을 쓸 수 있고, 일러스트·버튼·아이콘이 함께 따라갑니다.
     ════════════════════════════════════════════════════════════════ */
  const THEME_PRESETS = [
    { key: 'blue',    label: '블루',   hex: '#2563EB' },
    { key: 'indigo',  label: '인디고', hex: '#4F46E5' },
    { key: 'violet',  label: '바이올렛', hex: '#7C3AED' },
    { key: 'teal',    label: '틸',     hex: '#0D9488' },
    { key: 'emerald', label: '그린',   hex: '#059669' },
    { key: 'amber',   label: '앰버',   hex: '#D97706' },
    { key: 'rose',    label: '로즈',   hex: '#E11D48' },
    { key: 'slate',   label: '네이비', hex: '#334E68' }
  ];
  const DEFAULT_THEME = '#2563EB';

  function normHex(hex) {
    hex = String(hex || '').trim();
    if (/^[0-9a-f]{6}$/i.test(hex)) hex = '#' + hex;
    if (/^#[0-9a-f]{3}$/i.test(hex)) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toUpperCase() : '';
  }
  function toRgb(hex) {
    const h = normHex(hex) || DEFAULT_THEME;
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  }
  function toHex(rgb) {
    return '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  // t>0 : 흰색과 섞기(밝게) / t<0 : 검정과 섞기(어둡게)
  function mix(rgb, t) {
    const target = t >= 0 ? 255 : 0, k = Math.abs(t);
    return rgb.map(v => v + (target - v) * k);
  }

  // 기준색(600 위치)에서 전체 단계 생성
  function makeRamp(hex) {
    const base = toRgb(hex);
    return {
      '--b50':  toHex(mix(base, 0.94)),
      '--b100': toHex(mix(base, 0.86)),
      '--b200': toHex(mix(base, 0.72)),
      '--b300': toHex(mix(base, 0.52)),
      '--b400': toHex(mix(base, 0.28)),
      '--b500': toHex(mix(base, 0.12)),
      '--b600': toHex(base),
      '--b700': toHex(mix(base, -0.14)),
      '--b800': toHex(mix(base, -0.32)),
      '--b-shadow': 'rgba(' + base.map(v => Math.round(v)).join(',') + ',.26)'
    };
  }

  // 지정 요소(기본: :root)에 테마 적용
  function applyTheme(hex, el) {
    const ramp = makeRamp(normHex(hex) || DEFAULT_THEME);
    const target = el || document.documentElement;
    Object.keys(ramp).forEach(k => target.style.setProperty(k, ramp[k]));
    return ramp;
  }

  /* ── 일러스트 (약 200x120 기준, 테마 색상을 따름) ── */
  const ILLUST = {
    install: {
      label: '설치 · 다운로드',
      svg: `<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="108" rx="62" ry="7" fill="var(--b50)"/>
        <path d="M62 44a20 20 0 0 1 38-8 16 16 0 0 1 26 10 15 15 0 0 1-3 30H70a18 18 0 0 1-8-32z" fill="var(--b100)"/>
        <rect x="58" y="52" width="84" height="52" rx="8" fill="#fff" stroke="var(--b200)" stroke-width="2"/>
        <rect x="68" y="63" width="34" height="5" rx="2.5" fill="var(--b100)"/>
        <rect x="68" y="74" width="52" height="5" rx="2.5" fill="var(--b50)"/>
        <rect x="68" y="85" width="26" height="5" rx="2.5" fill="var(--b50)"/>
        <circle cx="128" cy="86" r="15" fill="var(--b600)"/>
        <path d="M128 79v13m0 0 5-5m-5 5-5-5" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="47" cy="40" r="4" fill="var(--b200)"/><circle cx="158" cy="34" r="3" fill="var(--b100)"/>
      </svg>`
    },
    chat: {
      label: '채팅 · 커뮤니티',
      svg: `<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="108" rx="62" ry="7" fill="var(--b50)"/>
        <path d="M52 34h74a10 10 0 0 1 10 10v30a10 10 0 0 1-10 10H82l-18 15V84h-12a10 10 0 0 1-10-10V44a10 10 0 0 1 10-10z" fill="var(--b600)"/>
        <circle cx="76" cy="59" r="5" fill="#fff"/><circle cx="94" cy="59" r="5" fill="#fff"/><circle cx="112" cy="59" r="5" fill="#fff"/>
        <circle cx="146" cy="72" r="12" fill="var(--b200)"/><circle cx="146" cy="67" r="5" fill="#fff"/>
        <ellipse cx="146" cy="80" rx="8" ry="6" fill="#fff"/>
        <circle cx="60" cy="26" r="3.5" fill="var(--b100)"/><circle cx="160" cy="40" r="4" fill="var(--b100)"/>
      </svg>`
    },
    survey: {
      label: '설문 · 체크리스트',
      svg: `<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="108" rx="62" ry="7" fill="var(--b50)"/>
        <rect x="64" y="24" width="72" height="80" rx="9" fill="#fff" stroke="var(--b200)" stroke-width="2"/>
        <rect x="86" y="18" width="28" height="12" rx="6" fill="var(--b300)"/>
        <rect x="76" y="46" width="12" height="12" rx="3" fill="var(--b100)"/>
        <path d="M79 52.2l2.4 2.4 4.2-4.6" stroke="var(--b600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="94" y="49" width="30" height="5" rx="2.5" fill="var(--b50)"/>
        <rect x="76" y="66" width="12" height="12" rx="3" fill="var(--b100)"/>
        <path d="M79 72.2l2.4 2.4 4.2-4.6" stroke="var(--b600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="94" y="69" width="24" height="5" rx="2.5" fill="var(--b50)"/>
        <rect x="76" y="86" width="12" height="12" rx="3" fill="#fff" stroke="var(--b300)" stroke-width="2"/>
        <rect x="94" y="89" width="30" height="5" rx="2.5" fill="var(--b50)"/>
        <path d="M138 74l14-14 8 8-14 14-10 2z" fill="var(--b600)"/>
        <circle cx="52" cy="40" r="4" fill="var(--b100)"/>
      </svg>`
    },
    graduation: {
      label: '학사모 · 교육',
      svg: `<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="108" rx="62" ry="7" fill="var(--b50)"/>
        <rect x="56" y="52" width="88" height="52" rx="8" fill="#fff" stroke="var(--b200)" stroke-width="2"/>
        <rect x="68" y="64" width="12" height="12" rx="3" fill="var(--b100)"/>
        <path d="M71 70.2l2.4 2.4 4.2-4.6" stroke="var(--b600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="86" y="67" width="44" height="5" rx="2.5" fill="var(--b50)"/>
        <rect x="68" y="84" width="12" height="12" rx="3" fill="var(--b100)"/>
        <path d="M71 90.2l2.4 2.4 4.2-4.6" stroke="var(--b600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="86" y="87" width="34" height="5" rx="2.5" fill="var(--b50)"/>
        <path d="M100 16l40 16-40 16-40-16 40-16z" fill="var(--b600)"/>
        <path d="M78 40v12c0 6 10 10 22 10s22-4 22-10V40l-22 9-22-9z" fill="var(--b500)"/>
        <path d="M140 32v16" stroke="var(--b700)" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="140" cy="50" r="3.4" fill="var(--b700)"/>
        <circle cx="46" cy="34" r="4" fill="var(--b100)"/><circle cx="164" cy="66" r="3.4" fill="var(--b100)"/>
      </svg>`
    },
    laptop: {
      label: '노트북 · 실습',
      svg: `<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="108" rx="62" ry="7" fill="var(--b50)"/>
        <rect x="56" y="30" width="88" height="58" rx="7" fill="#fff" stroke="var(--b200)" stroke-width="2"/>
        <rect x="66" y="40" width="68" height="38" rx="4" fill="var(--b50)"/>
        <rect x="74" y="48" width="30" height="5" rx="2.5" fill="var(--b200)"/>
        <rect x="74" y="59" width="46" height="5" rx="2.5" fill="var(--b100)"/>
        <rect x="74" y="68" width="22" height="4" rx="2" fill="var(--b100)"/>
        <path d="M44 88h112l-6 8H50l-6-8z" fill="var(--b300)"/>
        <circle cx="152" cy="34" r="10" fill="var(--b600)"/>
        <path d="M148.5 34l2.6 2.6 5-5.4" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    calendar: {
      label: '일정 · 캘린더',
      svg: `<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="108" rx="62" ry="7" fill="var(--b50)"/>
        <rect x="60" y="30" width="80" height="72" rx="9" fill="#fff" stroke="var(--b200)" stroke-width="2"/>
        <path d="M60 39a9 9 0 0 1 9-9h62a9 9 0 0 1 9 9v13H60V39z" fill="var(--b600)"/>
        <rect x="76" y="22" width="6" height="16" rx="3" fill="var(--b300)"/>
        <rect x="118" y="22" width="6" height="16" rx="3" fill="var(--b300)"/>
        <rect x="72" y="62" width="14" height="12" rx="3" fill="var(--b50)"/>
        <rect x="93" y="62" width="14" height="12" rx="3" fill="var(--b100)"/>
        <rect x="114" y="62" width="14" height="12" rx="3" fill="var(--b50)"/>
        <rect x="72" y="80" width="14" height="12" rx="3" fill="var(--b100)"/>
        <rect x="93" y="80" width="14" height="12" rx="3" fill="var(--b600)"/>
        <rect x="114" y="80" width="14" height="12" rx="3" fill="var(--b50)"/>
        <circle cx="48" cy="46" r="4" fill="var(--b100)"/>
      </svg>`
    }
  };

  /* ── 작은 아이콘 (24x24 stroke) ── */
  const P = 'stroke-linecap="round" stroke-linejoin="round"';
  const ICON = {
    clock:    { label: '시간',   path: `<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14" ${P}/>` },
    calendar: { label: '날짜',   path: `<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="16" y1="3" x2="16" y2="7" ${P}/><line x1="8" y1="3" x2="8" y2="7" ${P}/><line x1="3" y1="11" x2="21" y2="11"/>` },
    users:    { label: '인원',   path: `<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" ${P}/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87" ${P}/>` },
    bell:     { label: '마감',   path: `<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" ${P}/><path d="M13.7 21a2 2 0 0 1-3.4 0" ${P}/>` },
    pin:      { label: '장소',   path: `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" ${P}/><circle cx="12" cy="10" r="3"/>` },
    building: { label: '건물',   path: `<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="9" y1="8" x2="9" y2="8" ${P}/><line x1="15" y1="8" x2="15" y2="8" ${P}/><line x1="9" y1="13" x2="15" y2="13" ${P}/>` },
    phone:    { label: '문의',   path: `<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z" ${P}/>` },
    mail:     { label: '메일',   path: `<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6" ${P}/>` },
    laptop:   { label: '노트북', path: `<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20" ${P}/>` },
    wifi:     { label: '인터넷', path: `<path d="M5 12.5a10 10 0 0 1 14 0" ${P}/><path d="M8.5 16a5 5 0 0 1 7 0" ${P}/><line x1="12" y1="19.5" x2="12.01" y2="19.5" ${P}/>` },
    card:     { label: '신분증', path: `<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.2"/><line x1="14" y1="10" x2="18" y2="10" ${P}/><line x1="14" y1="14" x2="18" y2="14" ${P}/>` },
    clipboard:{ label: '준비물', path: `<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" ${P}/><rect x="8" y="2" width="8" height="4" rx="1"/>` },
    car:      { label: '자가용', path: `<path d="M5 17h14M6 17l-1.5-5.5L6 7h12l1.5 4.5L18 17" ${P}/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>` },
    subway:   { label: '지하철', path: `<rect x="5" y="3" width="14" height="14" rx="3"/><line x1="5" y1="11" x2="19" y2="11"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M8 21l2-3M16 21l-2-3" ${P}/>` },
    bus:      { label: '버스',   path: `<rect x="4" y="3" width="16" height="14" rx="3"/><line x1="4" y1="11" x2="20" y2="11"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/><path d="M7 21v-3M17 21v-3" ${P}/>` },
    info:     { label: '안내',   path: `<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16" ${P}/><line x1="12" y1="8" x2="12.01" y2="8" ${P}/>` },
    check:    { label: '확인',   path: `<circle cx="12" cy="12" r="9"/><polyline points="8.5 12 11 14.5 15.5 9.5" ${P}/>` },
    link:     { label: '링크',   path: `<path d="M10 13a5 5 0 0 0 7.5.5l3-3A5 5 0 0 0 13.4 3.4l-1.7 1.7" ${P}/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3A5 5 0 0 0 10.6 20.6l1.7-1.7" ${P}/>` },
    download: { label: '다운로드',path: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" ${P}/><polyline points="7 10 12 15 17 10" ${P}/><line x1="12" y1="15" x2="12" y2="3" ${P}/>` },
    monitor:  { label: '화면',   path: `<rect x="2" y="4" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21" ${P}/><line x1="12" y1="17" x2="12" y2="21" ${P}/>` },
    shield:   { label: '보안',   path: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" ${P}/><polyline points="9 12 11 14 15 10" ${P}/>` },
    user:     { label: '사용자', path: `<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0" ${P}/>` },
    edit:     { label: '작성',   path: `<path d="M12 20h9" ${P}/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" ${P}/>` }
  };

  function illustSvg(name, cls) {
    const it = ILLUST[name] || null;
    if (!it) return '';
    return it.svg.replace('<svg ', '<svg class="' + (cls || '') + '" ');
  }
  function iconSvg(name, size, cls) {
    const it = ICON[name];
    if (!it) return '';
    return '<svg class="' + (cls || '') + '" width="' + (size || 16) + '" height="' + (size || 16) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + it.path + '</svg>';
  }

  window.OnboardingAssets = {
    ILLUST, ICON, illustSvg, iconSvg,
    THEME_PRESETS, DEFAULT_THEME, normHex, makeRamp, applyTheme,
    illustList: Object.keys(ILLUST).map(k => ({ key: k, label: ILLUST[k].label })),
    iconList:   Object.keys(ICON).map(k => ({ key: k, label: ICON[k].label }))
  };
})();
