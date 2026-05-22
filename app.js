/**
 * 역량 기반 진로 탐색 시스템
 * 기반 논문: 교육과정 핵심 역량을 통한 학생 맞춤형 진로 탐색 시스템 개발
 * 데이터: KNOW 한국직업정보 재직자조사 (570개 직업)
 */

// ── 교육과정 6대 핵심 역량 ──────────────────────────────────────────
const COMPS = [
  {
    id: 'l', label: '리더십', color: '#1D9E75', idx: 0,
    qs: [
      '팀의 목표를 명확하게 전달할 수 있다.',
      '어려운 상황에서도 팀을 효과적으로 이끌 수 있다.',
      '팀원들의 의견을 경청하고 존중한다.',
      '갈등 상황에서 중재 역할을 잘 수행한다.',
      '팀원이 최선을 다하도록 동기부여한다.'
    ]
  },
  {
    id: 'a', label: '분석적 사고', color: '#185FA5', idx: 1,
    qs: [
      '문제를 체계적으로 분석하고 해결책을 찾는다.',
      '데이터를 기반으로 합리적인 결정을 내린다.',
      '복잡한 상황에서도 핵심 문제를 파악한다.',
      '다양한 정보를 효과적으로 통합하여 결론을 도출한다.',
      '예측 가능한 문제를 사전에 파악하고 대비한다.'
    ]
  },
  {
    id: 'ac', label: '성취/노력', color: '#BA7517', idx: 2,
    qs: [
      '목표를 설정하고 이를 달성하기 위해 최선을 다한다.',
      '어려운 상황에서도 포기하지 않고 도전한다.',
      '지속적인 자기 개발을 위해 노력한다.',
      '업무에 대한 열정과 헌신을 보인다.',
      '성과를 평가하고 이를 기반으로 발전 방안을 모색한다.'
    ]
  },
  {
    id: 'r', label: '책임성·진취성', color: '#D85A30', idx: 3,
    qs: [
      '맡은 업무를 철저하게 수행한다.',
      '실수나 실패에 대해 책임을 진다.',
      '새로운 도전 과제를 적극적으로 수용한다.',
      '자율적으로 업무를 계획하고 실행한다.',
      '결과에 대해 책임지고 이를 개선하기 위해 노력한다.'
    ]
  },
  {
    id: 'i', label: '혁신', color: '#534AB7', idx: 4,
    qs: [
      '새로운 아이디어를 제안하고 실현한다.',
      '변화하는 환경에 유연하게 대처한다.',
      '기존의 방식에서 벗어나 창의적으로 문제를 해결한다.',
      '혁신적인 사고를 통해 업무 효율성을 향상시킨다.',
      '실패를 두려워하지 않고 새로운 시도를 한다.'
    ]
  },
  {
    id: 're', label: '신뢰성', color: '#888780', idx: 5,
    qs: [
      '약속한 일을 정해진 기한 내에 완수한다.',
      '자신의 행동에 대해 정직하고 투명하게 대처한다.',
      '신뢰를 얻기 위해 꾸준히 노력한다.',
      '타인에게 신뢰를 줄 수 있는 행동을 보인다.',
      '윤리적 기준을 준수하며 업무를 수행한다.'
    ]
  }
];

// ── 꿈길 연계 체험 프로그램 (API 연동 전 기본 샘플) ────────────────
const PROGRAMS = {
  l: [
    { name: '청소년 리더십 캠프', type: '캠프형', org: '꿈길 체험센터', dur: '2박 3일', kw: '리더십' },
    { name: '학생 자치회 운영 체험', type: '참여형', org: '지역교육청', dur: '1일', kw: '자치' }
  ],
  a: [
    { name: '데이터 사이언스 체험', type: '직업체험', org: '꿈길 IT센터', dur: '4시간', kw: '데이터' },
    { name: '과학수사 추리 워크숍', type: '체험형', org: '진로체험기관', dur: '3시간', kw: '분석' }
  ],
  ac: [
    { name: '청년 도전 챌린지', type: '멘토링', org: '꿈길 지원센터', dur: '4주', kw: '도전' },
    { name: '목표설정 자기계발 워크숍', type: '교육형', org: '진로지원센터', dur: '1일', kw: '자기계발' }
  ],
  r: [
    { name: '사회적 기업 인턴십', type: '현장체험', org: '꿈길 사회적경제', dur: '1주', kw: '사회적기업' },
    { name: '지역사회 봉사 진로체험', type: '봉사형', org: '교육지원청', dur: '4시간', kw: '봉사' }
  ],
  i: [
    { name: '메이커스페이스 창작 체험', type: '창작형', org: '꿈길 창의센터', dur: '하루', kw: '메이커' },
    { name: '스타트업 아이디어톤', type: '경쟁형', org: '청소년창업지원', dur: '1일', kw: '창업' }
  ],
  re: [
    { name: '직업윤리 탐구 프로그램', type: '교육형', org: '꿈길 직업교육', dur: '2시간', kw: '직업윤리' },
    { name: '직장예절 소통 체험', type: '체험형', org: '진로체험기관', dur: '반일', kw: '직장예절' }
  ]
};

// ── 앱 상태 ──────────────────────────────────────────────────────────
let answers = {};
let selectedJob = null;
let radarChart = null;
let activeTab = 0;
let dropItems = [];
let dropIdx = -1;

// API 키 설정 (발급 후 여기에 입력)
const API_CONFIG = {
  ggoomgil: '',      // 꿈길 API 키 (data.go.kr 발급)
  careernet: '',     // 커리어넷 API 키 (career.go.kr 발급)
};

// ── 유틸 함수 ────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const calcComp = (id) => {
  const comp = COMPS.find(c => c.id === id);
  const vals = comp.qs.map((_, i) => answers[`${id}_${i}`] || 0);
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
};
const calcAllScores = () => {
  const s = {};
  COMPS.forEach(c => { s[c.id] = calcComp(c.id); });
  return s;
};
const scoresArr = (sc) => COMPS.map(c => sc[c.id]);

// ── 단계 이동 ────────────────────────────────────────────────────────
function goStep(n) {
  document.querySelectorAll('.step').forEach((s, i) => s.classList.toggle('active', i === n));
  if (n === 1) renderQuestions();
  if (n === 3) renderResult();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 진행도 바 ────────────────────────────────────────────────────────
function renderProgressBar() {
  const total = COMPS.length * 5;
  const done = Object.keys(answers).length;
  const pct = Math.round(done / total * 100);

  const pb = $('prog-bar');
  if (!pb) return;
  pb.innerHTML = '';
  COMPS.forEach((comp, i) => {
    const dot = document.createElement('div');
    const groupDone = comp.qs.every((_, j) => answers[`${comp.id}_${j}`]);
    dot.className = 'prog-dot' + (groupDone ? ' done' : '');
    dot.title = comp.label;
    pb.appendChild(dot);
  });
  const lbl = document.createElement('span');
  lbl.className = 'prog-label';
  lbl.textContent = `${done}/${total} 완료`;
  pb.appendChild(lbl);

  const fill = $('prog-fill');
  if (fill) fill.style.width = pct + '%';
}

// ── 문항 렌더링 ──────────────────────────────────────────────────────
function renderQuestions() {
  const container = $('q-container');
  if (!container) return;
  container.innerHTML = '';

  COMPS.forEach((comp, ci) => {
    const group = document.createElement('div');
    group.className = 'q-group';

    const title = document.createElement('div');
    title.className = 'q-group-title';
    title.innerHTML = `<span class="q-dot" style="background:${comp.color}"></span>${ci + 1}. ${comp.label}`;
    group.appendChild(title);

    comp.qs.forEach((q, qi) => {
      const key = `${comp.id}_${qi}`;
      const qNum = ci * 5 + qi + 1;
      const item = document.createElement('div');
      item.className = 'q-item';

      const stars = [1, 2, 3, 4, 5].map(v =>
        `<button class="star-btn${answers[key] === v ? ' sel' : ''}"
          data-key="${key}" data-val="${v}"
          onclick="setAnswer('${key}', ${v})"
          aria-label="${v}점">${v}</button>`
      ).join('');

      item.innerHTML = `
        <div class="q-text"><span class="q-num">${qNum}.</span>${q}</div>
        <div class="rating-row">
          <span class="rating-label">매우 낮음</span>
          <div class="stars">${stars}</div>
          <span class="rating-label right">매우 높음</span>
        </div>`;
      group.appendChild(item);
    });
    container.appendChild(group);
  });

  renderProgressBar();
}

// ── 응답 저장 ────────────────────────────────────────────────────────
function setAnswer(key, val) {
  answers[key] = val;
  document.querySelectorAll(`[data-key="${key}"]`).forEach(btn => {
    btn.classList.toggle('sel', parseInt(btn.dataset.val) === val);
  });
  renderProgressBar();
  $('error-msg')?.classList.remove('show');
}

// ── 검사 제출 ────────────────────────────────────────────────────────
function submitTest() {
  const missing = COMPS.some(c => c.qs.some((_, i) => !answers[`${c.id}_${i}`]));
  if (missing) {
    const err = $('error-msg');
    if (err) { err.classList.add('show'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    return;
  }
  $('error-msg')?.classList.remove('show');
  goStep(2);
}

// ── 직업 검색 (자동완성) ─────────────────────────────────────────────
function onJobSearch() {
  const q = $('job-search').value.trim();
  const dd = $('job-dropdown');
  if (!q) { dd.classList.remove('show'); return; }

  const filtered = JOBS.filter(j => j.n.includes(q)).slice(0, 15);
  dropItems = filtered;
  dropIdx = -1;

  if (!filtered.length) {
    dd.innerHTML = `<div class="drop-empty">검색 결과 없음</div>`;
    dd.classList.add('show');
    return;
  }
  dd.innerHTML = filtered.map((j, i) =>
    `<div class="drop-item" data-idx="${i}" onmousedown="selectJob(${i})">${j.n}</div>`
  ).join('');
  dd.classList.add('show');
}

function onJobKey(e) {
  const dd = $('job-dropdown');
  const items = dd.querySelectorAll('.drop-item');
  if (e.key === 'ArrowDown') {
    dropIdx = Math.min(dropIdx + 1, items.length - 1);
    items.forEach((it, i) => it.classList.toggle('active', i === dropIdx));
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    dropIdx = Math.max(dropIdx - 1, 0);
    items.forEach((it, i) => it.classList.toggle('active', i === dropIdx));
    e.preventDefault();
  } else if (e.key === 'Enter' && dropIdx >= 0) {
    selectJob(dropIdx);
  } else if (e.key === 'Escape') {
    dd.classList.remove('show');
  }
}

function selectJob(i) {
  selectedJob = dropItems[i];
  $('job-search').value = '';
  $('job-dropdown').classList.remove('show');
  $('sel-job-wrap').innerHTML = `
    <div class="selected-job-pill">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
      <span>${selectedJob.n}</span>
      <button onclick="clearJob()" aria-label="선택 취소">×</button>
    </div>`;
}

function clearJob() {
  selectedJob = null;
  $('sel-job-wrap').innerHTML = '';
  $('job-search').value = '';
}

// ── 직업 추천 (최근접 이웃) ──────────────────────────────────────────
function findBestJob(scores) {
  const myArr = scoresArr(scores);
  let best = null, bestDiff = Infinity;
  JOBS.forEach(job => {
    const diff = job.s.reduce((sum, v, i) => sum + Math.abs(v - myArr[i]), 0);
    if (diff < bestDiff) { bestDiff = diff; best = { ...job, diff: +diff.toFixed(2) }; }
  });
  return best;
}

// ── 탭 전환 ──────────────────────────────────────────────────────────
function showTab(n) {
  activeTab = n;
  ['tab-radar', 'tab-gap', 'tab-program', 'tab-map'].forEach((id, i) => {
    const el = $(id);
    if (el) el.style.display = i === n ? 'block' : 'none';
  });
  document.querySelectorAll('.tab-btn').forEach((t, i) => t.classList.toggle('active', i === n));
  if (n === 3) {
    setTimeout(() => {
      const weakComps = window._lastWeakComps || [];
      initMap(activeFilters ? activeFilters.region : '전국', weakComps);
    }, 50);
  }
}

// ── 결과 렌더링 ──────────────────────────────────────────────────────
function renderResult() {
  const scores = calcAllScores();
  const recJob = findBestJob(scores);
  const myArr = scoresArr(scores);

  // 히어로
  $('result-hero').innerHTML = `
    <div class="rh-label">역량 기반 추천 직업</div>
    <div class="rh-name">${recJob.n}</div>
    ${selectedJob
      ? `<div class="rh-sub">희망 직업 <strong>${selectedJob.n}</strong>과(와) 함께 비교합니다</div>`
      : `<div class="rh-sub">역량 유사도 차이값 <strong>${recJob.diff}</strong></div>`
    }`;

  renderRadar(myArr, recJob, scores);
  renderGap(myArr, recJob);
  // 약한 역량 ID 추출 (지도 자동 필터용)
  const weakCompIds = COMPS
    .filter((c, i) => myArr[i] - recJob.s[i] < -0.3)
    .map(c => c.id);
  window._lastWeakComps = weakCompIds;
  window._lastMyArr = myArr;

  renderPrograms(myArr, recJob);
  showTab(0);
}

// ── 레이더 차트 ──────────────────────────────────────────────────────
function renderRadar(myArr, recJob, scores) {
  const labels = COMPS.map(c => c.label);
  const datasets = [
    {
      label: '나의 역량',
      data: myArr,
      borderColor: '#1D9E75',
      backgroundColor: 'rgba(29,158,117,0.12)',
      pointBackgroundColor: '#1D9E75',
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7
    },
    {
      label: `${recJob.n} 평균`,
      data: recJob.s,
      borderColor: '#185FA5',
      backgroundColor: 'rgba(24,95,165,0.08)',
      pointBackgroundColor: '#185FA5',
      borderWidth: 2,
      pointRadius: 4,
      borderDash: [6, 3]
    }
  ];
  if (selectedJob) {
    datasets.push({
      label: `${selectedJob.n} 평균`,
      data: selectedJob.s,
      borderColor: '#D85A30',
      backgroundColor: 'rgba(216,90,48,0.08)',
      pointBackgroundColor: '#D85A30',
      borderWidth: 2,
      pointRadius: 4,
      borderDash: [3, 3]
    });
  }

  // 범례
  $('radar-legend').innerHTML = datasets.map(d =>
    `<span class="leg">
      <span class="leg-sq" style="background:${d.borderColor}"></span>
      ${d.label}
    </span>`
  ).join('');

  if (radarChart) radarChart.destroy();
  radarChart = new Chart($('radar-chart'), {
    type: 'radar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 1, max: 5,
          ticks: { stepSize: 1, font: { size: 11 }, backdropColor: 'transparent', color: '#888780' },
          grid: { color: 'rgba(136,135,128,0.2)' },
          angleLines: { color: 'rgba(136,135,128,0.2)' },
          pointLabels: { font: { size: 12, weight: '500' }, color: '#5F5E5A' }
        }
      }
    }
  });
}

// ── GAP 분석 ─────────────────────────────────────────────────────────
function renderGap(myArr, recJob) {
  const gapEl = $('gap-list');
  let html = `
    <div class="gap-legend">
      <span class="gap-leg-item"><span class="gap-leg-dot" style="background:#1D9E75;opacity:.35"></span>추천 직업 평균</span>
      ${selectedJob ? `<span class="gap-leg-item"><span class="gap-leg-dot" style="background:#D85A30;opacity:.45"></span>${selectedJob.n} 평균</span>` : ''}
      <span class="gap-leg-item"><span class="gap-leg-dot" style="background:#1D9E75"></span>나의 역량</span>
    </div>`;

  COMPS.forEach((comp, i) => {
    const me = myArr[i];
    const jobVal = recJob.s[i];
    const gap = +(me - jobVal).toFixed(2);
    const pMe = Math.round(me / 5 * 100);
    const pJob = Math.round(jobVal / 5 * 100);

    const badge = gap < -0.5
      ? `<span class="badge need">향상 필요 (${gap})</span>`
      : gap > 0.5
      ? `<span class="badge good">강점 (+${gap})</span>`
      : `<span class="badge ok">적정 (${gap})</span>`;

    let desiredBar = '';
    if (selectedJob) {
      const dv = selectedJob.s[i];
      const pD = Math.round(dv / 5 * 100);
      desiredBar = `<div class="bar-track" title="${selectedJob.n}: ${dv}점">
        <div class="bar-fill" style="width:${pD}%;background:#D85A30;opacity:.45"></div>
      </div>`;
    }

    html += `
      <div class="gap-item">
        <span class="gap-label">${comp.label}</span>
        <div class="gap-bars">
          <div class="bar-track" title="추천 직업 평균: ${jobVal}점">
            <div class="bar-fill" style="width:${pJob}%;background:${comp.color};opacity:.35"></div>
          </div>
          ${desiredBar}
          <div class="bar-track" title="나의 역량: ${me}점">
            <div class="bar-fill" style="width:${pMe}%;background:${comp.color}"></div>
          </div>
        </div>
        <div class="gap-vals">${me}<br><span style="color:${comp.color};opacity:.6">${jobVal}</span></div>
        ${badge}
      </div>`;
  });

  gapEl.innerHTML = html;
}

// ── 체험 프로그램 & 링크 ──────────────────────────────────────────────
function renderPrograms(myArr, recJob) {
  const compIds = COMPS.map(c => c.id);
  const weakIds = compIds
    .filter((id, i) => myArr[i] - recJob.s[i] < -0.3)
    .sort((a, b) => {
      const ia = COMPS.findIndex(c => c.id === a);
      const ib = COMPS.findIndex(c => c.id === b);
      return (myArr[ia] - recJob.s[ia]) - (myArr[ib] - recJob.s[ib]);
    })
    .slice(0, 2);

  const shown = [];
  weakIds.forEach(k => (PROGRAMS[k] || []).forEach(p => shown.push(p)));
  if (!shown.length) compIds.forEach(k => (PROGRAMS[k] || []).slice(0, 1).forEach(p => shown.push(p)));

  // 꿈길 API 연동 여부 확인
  const apiStatus = $('api-status');
  if (apiStatus) {
    apiStatus.className = API_CONFIG.ggoomgil
      ? 'api-banner connected'
      : 'api-banner';
    apiStatus.innerHTML = API_CONFIG.ggoomgil
      ? '✅ 꿈길 API 연결됨 — 실시간 프로그램 데이터를 불러옵니다'
      : '⚠️ 꿈길 API 미연결 — 기본 샘플 프로그램을 표시합니다. js/app.js의 API_CONFIG에 키를 입력하세요.';
  }

  const pg = $('prog-grid');
  pg.innerHTML = shown.slice(0, 4).map(p => {
    const url = `https://www.ggoomgil.go.kr/front/progm/actSchoolProgmList.do?searchText=${encodeURIComponent(p.kw)}`;
    return `<a class="prog-card" href="${url}" target="_blank" rel="noopener">
      <div class="prog-type">📍 ${p.type}</div>
      <div class="prog-name">${p.name}</div>
      <div class="prog-meta">${p.org} · ${p.dur}</div>
    </a>`;
  }).join('');

  const kw1 = encodeURIComponent(recJob.n);
  const weakLabels = COMPS.filter((_, i) => myArr[i] - recJob.s[i] < -0.3).map(c => c.label);
  const kw2 = encodeURIComponent(weakLabels.join(' ') || recJob.n);

  $('link-row').innerHTML = `
    <a class="ext-btn ggoomgil" href="https://www.ggoomgil.go.kr/front/progm/actSchoolProgmList.do?searchText=${kw2}" target="_blank" rel="noopener">
      🌱 꿈길 체험 더보기
    </a>
    <a class="ext-btn careernet" href="https://www.career.go.kr/cnet/front/web/job/catJobView.do?SEQ=0&jobGbn=job&keyword=${kw1}" target="_blank" rel="noopener">
      🔎 커리어넷 직업 정보
    </a>
    ${selectedJob
      ? `<a class="ext-btn careernet" href="https://www.career.go.kr/cnet/front/web/job/catJobView.do?SEQ=0&jobGbn=job&keyword=${encodeURIComponent(selectedJob.n)}" target="_blank" rel="noopener">
          🔎 ${selectedJob.n} 정보
        </a>`
      : ''}`;
}

// ── 꿈길 API 연동 (API 키 발급 후 사용) ──────────────────────────────
async function fetchGgoomgilPrograms(keyword) {
  if (!API_CONFIG.ggoomgil) return null;
  try {
    const url = `https://www.ggoomgil.go.kr/front/openApi/actSchoolProgmList.do`
              + `?serviceKey=${API_CONFIG.ggoomgil}`
              + `&searchText=${encodeURIComponent(keyword)}`
              + `&pageIndex=1&pageSize=8`;
    const res = await fetch(url);
    const data = await res.json();
    return data.list || [];
  } catch (e) {
    console.warn('꿈길 API 오류:', e);
    return null;
  }
}

// ── 커리어넷 API 연동 (API 키 발급 후 사용) ──────────────────────────
async function fetchCareernetJob(jobName) {
  if (!API_CONFIG.careernet) return null;
  try {
    const url = `https://www.career.go.kr/cnet/openapi/getOpenApi.json`
              + `?apiKey=${API_CONFIG.careernet}`
              + `&svcType=api&svcCode=JOB`
              + `&contentType=json`
              + `&gubun=job_dic_list`
              + `&searchWord=${encodeURIComponent(jobName)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.dataSearch?.content || [];
  } catch (e) {
    console.warn('커리어넷 API 오류:', e);
    return null;
  }
}

// ── 초기화 ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 검색창 외부 클릭 시 드롭다운 닫기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      $('job-dropdown')?.classList.remove('show');
    }
  });

  // 초기 문항 렌더링
  renderQuestions();
});
