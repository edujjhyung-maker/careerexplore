/**
 * 꿈길 체험프로그램 지도 (Leaflet.js + OpenStreetMap)
 * 998개 실제 프로그램 위치 표시 + 역량별 필터
 */

let leafletMap = null;
let programMarkers = [];
let centerMarkers = [];
let activeFilters = { region: '전국', comps: [] };

// 역량 ID → 표시명 / 색상
const COMP_INFO = {
  l:  { label:'리더십',      color:'#1D9E75', bg:'#E1F5EE' },
  a:  { label:'분석적 사고', color:'#185FA5', bg:'#E6F1FB' },
  ac: { label:'성취/노력',   color:'#BA7517', bg:'#FAEEDA' },
  r:  { label:'책임성·진취성', color:'#D85A30', bg:'#FAECE7' },
  i:  { label:'혁신',        color:'#534AB7', bg:'#EEEDFE' },
  re: { label:'신뢰성',      color:'#888780', bg:'#F1EFE8' },
};

// 지도 초기화 (GAP 분석 후 약한 역량 자동 전달)
function initMap(region, weakCompIds) {
  region = region || '전국';
  activeFilters.region = region;
  activeFilters.comps = weakCompIds || [];

  const el = document.getElementById('center-map');
  if (!el) return;

  if (leafletMap) { leafletMap.remove(); leafletMap = null; }
  programMarkers = [];
  centerMarkers = [];

  leafletMap = L.map('center-map', {
    center: [36.5, 127.8], zoom: 7,
    zoomControl: true, scrollWheelZoom: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(leafletMap);

  // 꿈길 센터 마커 (회색 고정 아이콘)
  CENTERS.forEach(c => {
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;background:#444;border:2px solid white;
        border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
      iconSize: [16,16], iconAnchor: [8,8], popupAnchor:[0,-10]
    });
    const m = L.marker([c.lat, c.lng], { icon, zIndexOffset: 1000 })
      .addTo(leafletMap)
      .bindPopup(`<div style="font-family:'Noto Sans KR',sans-serif;min-width:200px">
        <b style="color:#085041;font-size:13px">🏫 ${c.n}</b><br>
        <span style="font-size:11px;color:#5F5E5A">${c.addr}</span><br>
        <span style="font-size:11px;color:#5F5E5A">📞 ${c.tel}</span><br>
        <a href="https://www.ggoomgil.go.kr" target="_blank" style="font-size:11px;color:#1D9E75">꿈길 바로가기 →</a>
      </div>`, { maxWidth: 250 });
    centerMarkers.push(m);
  });

  applyFilter();
  renderCompFilterUI();
}

// 필터 적용 후 마커 렌더링
function applyFilter() {
  if (!leafletMap) return;

  // 기존 프로그램 마커 제거
  programMarkers.forEach(m => leafletMap.removeLayer(m));
  programMarkers = [];

  let filtered = PROGRAMS_DATA;

  // 지역 필터
  if (activeFilters.region !== '전국') {
    filtered = filtered.filter(p => p.region === activeFilters.region);
  }
  // 역량 필터 (선택된 역량 중 하나라도 포함)
  if (activeFilters.comps.length > 0) {
    filtered = filtered.filter(p =>
      p.comp.some(c => activeFilters.comps.includes(c))
    );
  }

  // 최대 150개만 표시 (성능)
  const shown = filtered.slice(0, 150);

  shown.forEach(prog => {
    const mainComp = prog.comp[0] || 'i';
    const ci = COMP_INFO[mainComp] || COMP_INFO.i;
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:24px;height:24px;
        background:${ci.color};
        border:2.5px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 5px rgba(0,0,0,0.35);
        cursor:pointer;
      "></div>`,
      iconSize: [24,24], iconAnchor: [12,24], popupAnchor:[0,-26]
    });

    const grades = [prog.el&&'초등', prog.mid&&'중학', prog.hi&&'고등'].filter(Boolean).join('·') || '전체';
    const freeTag = prog.free
      ? `<span style="background:#E1F5EE;color:#0F6E56;font-size:10px;padding:1px 6px;border-radius:10px">무료</span>`
      : `<span style="background:#FAECE7;color:#D85A30;font-size:10px;padding:1px 6px;border-radius:10px">유료</span>`;

    const m = L.marker([prog.lat, prog.lng], { icon })
      .addTo(leafletMap)
      .bindPopup(`
        <div style="font-family:'Noto Sans KR',sans-serif;min-width:230px;padding:2px 0">
          <div style="font-weight:700;font-size:13px;color:#1a1a1a;margin-bottom:6px;line-height:1.4">${prog.n}</div>
          <div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap">
            <span style="background:${ci.bg};color:${ci.color};font-size:10px;padding:2px 7px;border-radius:10px;font-weight:600">${ci.label}</span>
            ${freeTag}
            <span style="background:#F1EFE8;color:#5F5E5A;font-size:10px;padding:2px 7px;border-radius:10px">${prog.type}</span>
          </div>
          <div style="font-size:12px;color:#5F5E5A;margin-bottom:3px">🏢 ${prog.org}</div>
          <div style="font-size:12px;color:#5F5E5A;margin-bottom:3px">📂 ${prog.cat}</div>
          <div style="font-size:12px;color:#5F5E5A;margin-bottom:8px">🎓 대상: ${grades} | 📍 ${prog.addr}</div>
          <a href="https://www.ggoomgil.go.kr/front/progm/actSchoolProgmList.do?searchText=${encodeURIComponent(prog.n)}"
             target="_blank" rel="noopener"
             style="display:inline-block;background:#1D9E75;color:white;font-size:11px;
               padding:5px 12px;border-radius:6px;text-decoration:none;font-weight:600">
            꿈길에서 신청하기 →
          </a>
        </div>
      `, { maxWidth: 290 });

    programMarkers.push(m);
  });

  // 지도 뷰 조정
  if (shown.length > 0) {
    const bounds = L.latLngBounds(shown.map(p => [p.lat, p.lng]));
    leafletMap.fitBounds(bounds, { padding: [40,40], maxZoom: 13 });
  }

  updateMapStats(filtered.length, shown.length);
  renderProgramList(shown.slice(0,20));
}

// 역량 필터 UI
function renderCompFilterUI() {
  const el = document.getElementById('comp-filter-wrap');
  if (!el) return;

  el.innerHTML = Object.entries(COMP_INFO).map(([id, ci]) => {
    const active = activeFilters.comps.includes(id);
    return `<button class="comp-chip ${active ? 'active' : ''}"
      style="${active ? `background:${ci.color};color:#fff;border-color:${ci.color}` : ''}"
      onclick="toggleComp('${id}')">${ci.label}</button>`;
  }).join('');
}

function toggleComp(id) {
  const idx = activeFilters.comps.indexOf(id);
  if (idx >= 0) activeFilters.comps.splice(idx, 1);
  else activeFilters.comps.push(id);
  renderCompFilterUI();
  applyFilter();
}

function onRegionChange(val) {
  activeFilters.region = val;
  applyFilter();
  renderProgramListHeader();
}

function updateMapStats(total, shown) {
  const el = document.getElementById('map-stats');
  if (el) el.textContent = `전체 ${total}개 중 ${shown}개 표시 (최대 150개)`;
}

function renderProgramListHeader() {}

// 프로그램 카드 리스트
function renderProgramList(progs) {
  const el = document.getElementById('center-list');
  if (!el) return;
  if (!progs.length) {
    el.innerHTML = `<div style="padding:1rem;font-size:13px;color:#888;text-align:center">해당 조건의 프로그램이 없습니다</div>`;
    return;
  }
  el.innerHTML = `
    <div style="font-size:12px;color:#888;margin:.75rem 0 .5rem">목록 클릭 시 지도에서 위치 확인</div>
    <div class="center-cards">
      ${progs.map(p => {
        const ci = COMP_INFO[p.comp[0]] || COMP_INFO.i;
        return `<div class="center-card" onclick="flyToProgram(${p.lat},${p.lng})">
          <div class="cc-dot" style="background:${ci.color}"></div>
          <div class="cc-body">
            <div class="cc-name">${p.n}</div>
            <div class="cc-addr" style="color:${ci.color};font-weight:500">${ci.label} · ${p.type}</div>
            <div class="cc-tel">${p.org} · ${p.addr}</div>
          </div>
          <a href="https://www.ggoomgil.go.kr/front/progm/actSchoolProgmList.do?searchText=${encodeURIComponent(p.n)}"
             target="_blank" rel="noopener"
             class="cc-link" onclick="event.stopPropagation()">신청</a>
        </div>`;
      }).join('')}
    </div>`;
}

function flyToProgram(lat, lng) {
  if (!leafletMap) return;
  leafletMap.flyTo([lat, lng], 14, { duration: 0.8 });
  programMarkers.forEach(m => {
    if (Math.abs(m.getLatLng().lat - lat) < 0.001 &&
        Math.abs(m.getLatLng().lng - lng) < 0.001) {
      setTimeout(() => m.openPopup(), 900);
    }
  });
}
