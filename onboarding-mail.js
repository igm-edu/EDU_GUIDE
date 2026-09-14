/* ============================================================================
   OnboardingMail — 과정 데이터 → 메일 발송용 HTML 생성기
   ----------------------------------------------------------------------------
   메일 클라이언트는 브라우저가 아닙니다. 그래서 페이지 렌더링 코드를 재사용하지
   않고 별도로 생성합니다. 지켜야 하는 규칙:

     · 모든 스타일은 인라인 (<style>은 모바일 보정용 보너스일 뿐)
     · 레이아웃은 전부 <table role="presentation"> (flex/grid 금지)
     · CSS 변수 금지 → makeRamp() 결과를 리터럴 hex로 박아 넣음
     · 이미지·링크는 절대 URL (상대경로·data URI 금지)
     · 600px 고정폭, <script> 없음

   사용:  const html = OnboardingMail.buildMailHtml(course, course.themeColor);
   ============================================================================ */
(function () {
  const CFG = window.ONBOARDING_CONFIG || {};

  function siteBase() {
    let u = (CFG.siteUrl || 'https://igm-edu.github.io/EDU_GUIDE/').trim();
    if (!/\/$/.test(u)) u += '/';
    return u;
  }
  const MAIL_ASSET_DIR = 'mail-assets/';

  /* ── 문자열 유틸 ── */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function nl2br(s) { return escapeHtml(s).replace(/\r?\n/g, '<br />'); }
  function attr(s) { return escapeHtml(s); }
  function has(s) { return !!String(s == null ? '' : s).trim(); }

  /* ── 테마 ── */
  // 임의 색이면 가장 가까운 프리셋을 골라 일러스트 PNG를 찾는다
  function pickThemeKey(hex) {
    const A = window.OnboardingAssets;
    const presets = (A && A.THEME_PRESETS) || [];
    if (!presets.length) return 'blue';
    const norm = (A.normHex(hex) || A.DEFAULT_THEME);
    const exact = presets.find(p => p.hex.toUpperCase() === norm.toUpperCase());
    if (exact) return exact.key;
    const rgb = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
    const [r, g, b] = rgb(norm);
    let best = presets[0], bestD = Infinity;
    presets.forEach(p => {
      const [pr, pg, pb] = rgb(p.hex);
      const d = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2;
      if (d < bestD) { bestD = d; best = p; }
    });
    return best.key;
  }

  function themeOf(hex) {
    const A = window.OnboardingAssets;
    const base = (A && A.normHex(hex)) || (A && A.DEFAULT_THEME) || '#2563EB';
    const r = A.makeRamp(base);
    return {
      base: base,
      key: pickThemeKey(base),
      c50: r['--b50'], c100: r['--b100'], c200: r['--b200'],
      c600: r['--b600'], c700: r['--b700'], c800: r['--b800']
    };
  }

  /* ── 공통 조각 ── */
  const FONT = "Pretendard,'Malgun Gothic','맑은 고딕',Apple SD Gothic Neo,sans-serif";
  const INK = '#111827', BODY = '#374151', MUTE = '#6B7280', LINE = '#EEF1F6';

  function divider(padTop, padBottom) {
    return `<tr><td style="padding:${padTop}px 36px ${padBottom}px 36px;">` +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
      `<td height="1" bgcolor="${LINE}" style="height:1px; line-height:1px; font-size:0; background-color:${LINE};">&nbsp;</td>` +
      `</tr></table></td></tr>`;
  }

  function heading(text, t) {
    return `<h2 class="h2" style="margin:0 0 18px 0; font-size:20px; line-height:28px; font-weight:bold; color:${INK}; letter-spacing:-0.3px;">` +
      `<span style="color:${t.c600};">&#9635;</span>&nbsp; ${escapeHtml(text)}</h2>`;
  }

  // 강조 박스 (그룹 노트 · 안내문)
  function noteBox(text, t) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${t.c50}" ` +
      `style="background-color:${t.c50}; border-radius:12px; border-left:4px solid ${t.c600};"><tr>` +
      `<td style="padding:14px 18px; font-family:${FONT}; font-size:13px; line-height:21px; color:${t.c800};">${nl2br(text)}</td>` +
      `</tr></table>`;
  }

  /* ── 섹션들 ── */

  function heroSection(course, t) {
    const h = course.hero || {};
    const lines = (h.titleLines || []).filter(has);
    const title = lines.map((ln, i) => {
      const last = (i === lines.length - 1);
      return (h.highlightLast && last)
        ? `<span style="color:${t.c600};">${escapeHtml(ln)}</span>`
        : escapeHtml(ln);
    }).join('<br />');

    let out = `<tr><td class="pad-side" style="padding:40px 36px 0 36px; font-family:${FONT};">`;
    if (has(h.badge)) {
      out += `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
        `<td bgcolor="${t.c50}" style="padding:6px 14px; background-color:${t.c50}; border-radius:100px; font-size:12px; font-weight:bold; color:${t.c700};">` +
        `${escapeHtml(h.badge)}</td></tr></table>`;
    }
    if (title) {
      out += `<h1 class="h1" style="margin:18px 0 14px 0; font-size:30px; line-height:42px; font-weight:800; color:${INK}; letter-spacing:-0.6px;">${title}</h1>`;
    }
    if (has(h.description)) {
      out += `<p style="margin:0 0 26px 0; font-size:14px; line-height:24px; color:${MUTE};">${nl2br(h.description)}</p>`;
    }
    out += `</td></tr>`;

    // 일러스트 (절대 URL PNG)
    if (has(h.illust)) {
      const src = siteBase() + MAIL_ASSET_DIR + h.illust + '-' + t.key + '.png';
      out += `<tr><td align="center" style="padding:0 36px 4px 36px;">` +
        `<img src="${attr(src)}" width="360" alt="" style="width:360px; max-width:100%; height:auto; display:block; margin:0 auto;" />` +
        `</td></tr>`;
    }

    // CTA
    const cta = siteBase() + 'course.html?c=' + encodeURIComponent(course.slug || '');
    out += `<tr><td align="center" class="pad-side" style="padding:16px 36px 34px 36px;">` +
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" class="btn"><tr>` +
      `<td align="center" bgcolor="${t.base}" style="border-radius:12px; background-color:${t.base};">` +
      `<!--[if mso]>` +
      `<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${attr(cta)}" ` +
      `style="height:50px; v-text-anchor:middle; width:280px;" arcsize="24%" stroke="f" fillcolor="${t.base}">` +
      `<w:anchorlock/><center style="color:#ffffff; font-family:'Malgun Gothic',sans-serif; font-size:15px; font-weight:bold;">사전 준비 사항 확인하기 →</center>` +
      `</v:roundrect><![endif]-->` +
      `<!--[if !mso]><!-- -->` +
      `<a href="${attr(cta)}" target="_blank" style="display:inline-block; padding:15px 38px; font-family:${FONT}; font-size:15px; font-weight:bold; color:#FFFFFF; text-decoration:none; border-radius:12px;">사전 준비 사항 확인하기 &rarr;</a>` +
      `<!--<![endif]-->` +
      `</td></tr></table></td></tr>`;
    return out;
  }

  function infoSection(course, t) {
    const groups = ((course.info && course.info.groups) || []).filter(g =>
      has(g.title) || (g.rows || []).some(r => has(r.label) || has(r.value)));
    if (!groups.length) return '';

    let out = '';
    groups.forEach((g, gi) => {
      const rows = (g.rows || []).filter(r => has(r.label) || has(r.value));
      out += divider(gi === 0 ? 0 : 26, 0);
      out += `<tr><td class="pad-side" style="padding:${gi === 0 ? 34 : 32}px 36px 8px 36px; font-family:${FONT};">`;
      if (has(g.title)) out += heading(g.title, t);

      if (rows.length) {
        out += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">`;
        rows.forEach((r, ri) => {
          const isLast = ri === rows.length - 1;
          const pad = isLast ? 4 : 16;
          let val = has(r.value) ? nl2br(r.value) : '';
          if (has(r.linkUrl)) {
            const label = has(r.linkLabel) ? r.linkLabel : '링크';
            val += (val ? '<br />' : '') +
              `<a href="${attr(r.linkUrl)}" target="_blank" style="color:${t.c600}; font-weight:bold; text-decoration:none; font-size:13px;">${escapeHtml(label)} &#8599;</a>`;
          }
          out += `<tr>`;
          if (has(r.label)) {
            out += `<td width="72" valign="top" style="width:72px; padding:0 8px ${pad}px 0; font-size:14px; line-height:23px; font-weight:bold; color:${t.c600};">${escapeHtml(r.label)}</td>` +
              `<td valign="top" style="padding:0 0 ${pad}px 0; font-size:14px; line-height:23px; color:${BODY};">${val || '&nbsp;'}</td>`;
          } else {
            out += `<td colspan="2" valign="top" style="padding:0 0 ${pad}px 0; font-size:14px; line-height:23px; color:${BODY};">${val}</td>`;
          }
          out += `</tr>`;
        });
        out += `</table>`;
      }
      out += `</td></tr>`;

      if (has(g.note)) {
        out += `<tr><td class="pad-side" style="padding:16px 36px 0 36px;">${noteBox(g.note, t)}</td></tr>`;
      }
    });
    return out;
  }

  function curriculumSection(course, t) {
    const c = course.curriculum || {};
    const cols = (c.columns || []).filter(x => x !== undefined);
    const rows = (c.rows || []).filter(r => (r || []).some(has));
    if (!c.enabled || !rows.length || !cols.length) return '';

    let out = divider(26, 0);
    out += `<tr><td class="pad-side" style="padding:32px 36px 10px 36px; font-family:${FONT};">`;
    out += heading(c.title || '커리큘럼', t);

    out += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${t.c200}; border-radius:12px; border-collapse:separate;">`;
    // 헤더
    out += `<tr>`;
    cols.forEach((col, ci) => {
      const w = ci === 0 ? ' width="108"' : '';
      out += `<td${w} bgcolor="${t.c50}" class="cur-cell" style="${ci === 0 ? 'width:108px; ' : ''}padding:12px 14px; background-color:${t.c50}; font-size:12px; font-weight:bold; color:${t.c700}; border-bottom:1px solid ${t.c200};">${escapeHtml(col)}</td>`;
    });
    out += `</tr>`;
    // 본문
    rows.forEach((row, ri) => {
      const last = ri === rows.length - 1;
      const bb = last ? '' : ` border-bottom:1px solid ${LINE};`;
      out += `<tr>`;
      cols.forEach((col, ci) => {
        const cell = row[ci] == null ? '' : row[ci];
        let style, cls = 'cur-cell';
        if (ci === 0) {
          style = `width:108px; padding:14px; font-size:13px; line-height:20px; color:${t.c600}; font-weight:bold;${bb}`;
          cls += ' cur-time';
        } else if (ci === cols.length - 1 && cols.length > 2) {
          style = `padding:14px; font-size:13px; line-height:21px; color:${MUTE};${bb}`;
        } else {
          style = `padding:14px; font-size:14px; line-height:21px; font-weight:bold; color:${INK};${bb}`;
        }
        // 빈 셀은 삭제하면 표 구조가 어긋나므로 공백으로 채운다 (Outlook 테두리 붕괴 방지)
        out += `<td class="${cls}" valign="top" style="${style}">${has(cell) ? nl2br(cell) : '&nbsp;'}</td>`;
      });
      out += `</tr>`;
    });
    out += `</table>`;

    if (has(c.note)) {
      out += `<p style="margin:10px 0 0 0; font-size:12px; line-height:19px; color:#9CA3AF;">${nl2br(c.note)}</p>`;
    }
    out += `</td></tr>`;
    return out;
  }

  function directionsSection(course, t) {
    const d = course.directions || {};
    if (!d.enabled) return '';
    const transit = (d.transit || []).filter(x => has(x.label) || has(x.value));
    if (!has(d.placeName) && !has(d.address) && !transit.length) return '';

    const mapUrl = has(d.mapLink) ? d.mapLink
      : (has(d.address) ? 'https://map.kakao.com/?q=' + encodeURIComponent(d.address) : '');

    let out = divider(26, 0);
    out += `<tr><td class="pad-side" style="padding:32px 36px 8px 36px; font-family:${FONT};">`;
    out += heading(d.title || '오시는 길', t);
    out += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">`;

    if (has(d.placeName) || has(d.address)) {
      let v = '';
      if (has(d.placeName)) v += `<strong style="color:${INK};">${escapeHtml(d.placeName)}</strong>`;
      if (has(d.address)) v += (v ? '<br />' : '') + `<span style="color:${MUTE};">${escapeHtml(d.address)}</span>`;
      if (has(d.placeDetail)) v += `<br /><span style="color:#9CA3AF; font-size:13px;">${escapeHtml(d.placeDetail)}</span>`;
      if (mapUrl) v += `<br /><a href="${attr(mapUrl)}" target="_blank" style="color:${t.c600}; font-weight:bold; text-decoration:none; font-size:13px;">지도 보기 &#8599;</a>`;
      out += `<tr><td width="72" valign="top" style="width:72px; padding:0 8px 16px 0; font-size:14px; line-height:23px; font-weight:bold; color:${t.c600};">장소</td>` +
        `<td valign="top" style="padding:0 0 16px 0; font-size:14px; line-height:23px; color:${BODY};">${v}</td></tr>`;
    }
    transit.forEach((tr, i) => {
      const pad = (i === transit.length - 1) ? 4 : 16;
      out += `<tr><td width="72" valign="top" style="width:72px; padding:0 8px ${pad}px 0; font-size:14px; line-height:23px; font-weight:bold; color:${t.c600};">${escapeHtml(tr.label)}</td>` +
        `<td valign="top" style="padding:0 0 ${pad}px 0; font-size:14px; line-height:23px; color:${BODY};">${nl2br(tr.value)}</td></tr>`;
    });
    out += `</table></td></tr>`;

    if (has(d.note)) {
      out += `<tr><td class="pad-side" style="padding:16px 36px 0 36px;">${noteBox(d.note, t)}</td></tr>`;
    }
    return out;
  }

  function linksSection(course, t) {
    const links = [];
    if (has(course.previewUrl)) links.push({ label: '과정 교안 미리보기', url: course.previewUrl });
    if (has(course.autoUrl))    links.push({ label: '자동화 미리보기',    url: course.autoUrl });
    if (has(course.startUrl))   links.push({ label: '과정 시작하기',      url: course.startUrl });
    if (!links.length) return '';

    let out = `<tr><td class="pad-side" align="center" style="padding:28px 36px 34px 36px; font-family:${FONT};">` +
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>`;
    links.forEach(l => {
      out += `<td style="padding:0 6px;"><a href="${attr(l.url)}" target="_blank" ` +
        `style="display:inline-block; padding:11px 20px; border:1px solid ${t.c200}; border-radius:10px; font-size:13px; font-weight:bold; color:${t.c700}; text-decoration:none;">${escapeHtml(l.label)} &#8599;</a></td>`;
    });
    out += `</tr></table></td></tr>`;
    return out;
  }

  function footerSection() {
    const org = CFG.mailFooterOrg || 'IGM 세계경영연구원';
    const addr = CFG.mailFooterAddress || '';
    const email = CFG.mailFooterEmail || '';
    let out = `<tr><td class="pad-side" bgcolor="${INK}" style="padding:26px 36px; background-color:${INK}; font-family:${FONT};">` +
      `<p style="margin:0 0 8px 0; font-size:13px; font-weight:bold; color:#FFFFFF;">${escapeHtml(org)}</p>`;
    if (addr || email) {
      out += `<p style="margin:0 0 12px 0; font-size:12px; line-height:20px; color:#9CA3AF;">`;
      if (addr) out += escapeHtml(addr);
      if (addr && email) out += '<br />';
      if (email) out += `문의: <a href="mailto:${attr(email)}" style="color:#93B4F5; text-decoration:none;">${escapeHtml(email)}</a>`;
      out += `</p>`;
    }
    out += `<p style="margin:0; font-size:11px; line-height:18px; color:#6B7280;">본 메일은 교육 신청자께 발송되는 안내 메일입니다.</p>`;
    // 수신거부가 필요하면 아래 줄의 주석을 풀고 발송 도구의 치환 태그를 넣으세요.
    // out += `<p style="margin:8px 0 0 0; font-size:11px; color:#6B7280;"><a href="{{UNSUBSCRIBE}}" style="color:#9CA3AF; text-decoration:underline;">수신거부</a></p>`;
    out += `</td></tr>`;
    return out;
  }

  // 받은편지함 미리보기 문구
  function preheader(course) {
    const groups = (course.info && course.info.groups) || [];
    for (const g of groups) {
      for (const r of (g.rows || [])) {
        if (/일시|일정|날짜|교육\s*일/.test(r.label || '') && has(r.value)) {
          return String(r.value).split('\n')[0];
        }
      }
    }
    const d = (course.hero && course.hero.description) || '';
    return has(d) ? String(d).split('\n')[0] : '교육 일정과 준비물을 확인해 주세요.';
  }

  /* ── 본체 ── */
  function buildMailHtml(course, themeHex) {
    course = course || {};
    const t = themeOf(themeHex || course.themeColor);
    const subject = (course.courseName || '교육') + ' 입과 안내';

    const body =
      heroSection(course, t) +
      infoSection(course, t) +
      curriculumSection(course, t) +
      directionsSection(course, t) +
      linksSection(course, t) +
      footerSection();

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="format-detection" content="telephone=no" />
<title>${escapeHtml(subject)}</title>
<!--[if mso]>
<xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
<style type="text/css">
  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }
  body { margin:0 !important; padding:0 !important; width:100% !important; }
  @media screen and (max-width:620px) {
    .wrap     { width:100% !important; }
    .pad-side { padding-left:22px !important; padding-right:22px !important; }
    .h1       { font-size:25px !important; line-height:36px !important; }
    .h2       { font-size:19px !important; line-height:28px !important; }
    .btn a    { display:block !important; }
    .cur-time { white-space:nowrap !important; font-size:12px !important; }
    .cur-cell { padding-left:10px !important; padding-right:10px !important; }
  }
</style>
</head>

<body style="margin:0; padding:0; background-color:#F7F9FC;">

<div style="display:none; font-size:1px; color:#F7F9FC; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
  ${escapeHtml(preheader(course))}
  &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F7F9FC;">
  <tr>
    <td align="center" style="padding:28px 12px 40px 12px;">

      <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">
        <tr>
          <td class="pad-side" style="padding:0 8px 16px 8px;">
            <img src="${attr(siteBase() + 'igm-logo.png')}" width="150" alt="${attr(CFG.mailFooterOrg || 'IGM 세계경영연구원')}" style="width:150px; max-width:150px; height:auto; display:block;" />
          </td>
        </tr>
      </table>

      <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#FFFFFF; border-radius:16px; overflow:hidden;">
${body}
      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
  }

  window.OnboardingMail = {
    buildMailHtml, escapeHtml, nl2br, pickThemeKey, siteBase,
    MAIL_ASSET_DIR
  };
})();
