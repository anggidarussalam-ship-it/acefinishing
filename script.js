// ============================================================
//  script.js — Production Finishing Dashboard · Mei 2026
//  Requires: data.js loaded first
// ============================================================

/* ─── HELPERS ─────────────────────────────────────────────── */
const fmt  = n => (n >= 1000 ? (n / 1000).toFixed(1) + 'K' : Math.round(n));
const pct  = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) + '%' : '0%';
const avg  = arr => { const f = arr.filter(x => x > 0); return f.length ? f.reduce((s, v) => s + v, 0) / f.length : 0; };
const sum  = arr => arr.reduce((s, v) => s + (v || 0), 0);

/* ─── CLOCK ───────────────────────────────────────────────── */
function updateClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2,'0');
  const mm  = String(now.getMinutes()).padStart(2,'0');
  const ss  = String(now.getSeconds()).padStart(2,'0');
  document.getElementById('clockTime').textContent = `${hh}:${mm}:${ss}`;

  const days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  document.getElementById('clockDate').textContent =
    `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  document.getElementById('shiftVal').textContent =
    (now.getHours() >= 7 && now.getHours() < 19) ? 'PAGI' : 'MALAM';
  document.getElementById('lastUpdate').textContent = `${hh}:${mm}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ─── KPI CARDS ───────────────────────────────────────────── */
function buildKPIs() {
  const k  = DATA.katun;
  const ku = DATA.kusuma;
  const p  = DATA.pouring;

  const ktTotal  = sum(k.total_output);
  const kuTotal  = sum(ku.total_output);
  const combined = ktTotal + kuTotal;

  const kDays   = k.total_output.filter(x => x > 0).length;
  const kuDays  = ku.total_output.filter(x => x > 0).length;
  const ktTgt   = kDays * TARGET * 2;
  const kuTgt   = kuDays * TARGET * 2;
  const totalTgt = ktTgt + kuTgt;
  const ach     = totalTgt > 0 ? (combined / totalTgt) * 100 : 0;

  const totalMH = sum(k.mh_actual) + sum(ku.mh_actual);
  const prod    = totalMH > 0 ? (combined / totalMH).toFixed(1) : 0;

  const ktFG    = sum(k.finish_good);
  const kuFG    = sum(ku.finish_good);
  const totalFG = ktFG + kuFG;

  const ktNG    = sum(k.ng);
  const kuNG    = sum(ku.ng);
  const ngRate  = combined > 0 ? ((ktNG + kuNG) / combined * 100).toFixed(2) : 0;

  const ktAbs   = sum(k.absensi);
  const kuAbs   = sum(ku.absensi);
  const totalLoss = sum(k.loss_pcs) + sum(ku.loss_pcs);

  const wip = p.wip_total.filter(x => x > 0).slice(-1)[0] || 0;

  const kpis = [
    {
      label:'Total Output Actual', val:fmt(combined), unit:'pcs', icon:'📦', color:'cyan',
      trend:'up', trendVal:'+vs target', fill:Math.min(100,ach), fillColor:'var(--cyan)',
      badge: ach>=95?'ON TARGET':'BELOW', badgeClass: ach>=95?'badge-green':'badge-red'
    },
    {
      label:'Target Output', val:fmt(totalTgt), unit:'pcs', icon:'🎯', color:'cyan',
      fill:100, fillColor:'var(--blue)'
    },
    {
      label:'Achievement %', val:ach.toFixed(1), unit:'%', icon:'📊',
      color: ach>=95?'green':'red',
      trend: ach>=95?'up':'down', trendVal: ach>=95?'Mencapai target':'Di bawah target',
      fill:Math.min(100,ach), fillColor: ach>=95?'var(--green)':'var(--red)',
      badge: ach>=95?'GOOD':'WARNING', badgeClass: ach>=95?'badge-green':'badge-red'
    },
    {
      label:'Productivity', val:prod, unit:'pcs/MH', icon:'⚡', color:'green',
      fill:Math.min(100,(prod/GENTANI_TGT)*100), fillColor:'var(--green)'
    },
    {
      label:'Total Man Hour', val:fmt(totalMH), unit:'MH', icon:'⏱️', color:'cyan',
      fill:70, fillColor:'var(--blue2)'
    },
    {
      label:'Finish Good', val:fmt(totalFG), unit:'pcs', icon:'✅', color:'green',
      fill: combined>0?Math.min(100,(totalFG/combined)*100):0, fillColor:'var(--green)'
    },
    {
      label:'NG Rate', val:ngRate, unit:'%', icon:'❌', color:'red',
      fill:Math.min(100, ngRate*10), fillColor:'var(--red)',
      badge: ngRate<5?'NORMAL':'HIGH', badgeClass: ngRate<5?'badge-green':'badge-red'
    },
    {
      label:'Total Absensi', val: ktAbs+kuAbs, unit:'orang', icon:'👤', color:'yellow',
      fill:Math.min(100,((ktAbs+kuAbs)/20)*100), fillColor:'var(--yellow)'
    },
    {
      label:'Total Loss Pcs', val:fmt(totalLoss), unit:'pcs', icon:'📉', color:'red',
      fill:30, fillColor:'var(--red)'
    },
    {
      label:'WIP Aktual', val:fmt(wip), unit:'pcs', icon:'🔄',
      color: wip>WIP_MAX?'red': wip<WIP_MIN?'yellow':'green',
      fill:Math.min(100,(wip/WIP_MAX)*100),
      fillColor: wip>WIP_MAX?'var(--red)':'var(--green)',
      badge: wip>WIP_MAX?'WARNING':'NORMAL', badgeClass: wip>WIP_MAX?'badge-red':'badge-green'
    }
  ];

  const grid = document.getElementById('kpiGrid');
  grid.innerHTML = kpis.map((c, i) => `
    <div class="kpi-card ${c.color}" style="animation-delay:${i*0.06}s">
      ${c.badge ? `<div class="kpi-badge ${c.badgeClass}">${c.badge}</div>` : ''}
      <div class="kpi-icon">${c.icon}</div>
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value">${c.val}<span class="kpi-unit">${c.unit}</span></div>
      ${c.trend ? `<div class="kpi-trend ${c.trend}">${c.trend==='up'?'▲':'▼'} ${c.trendVal}</div>` : ''}
      <div class="kpi-bar">
        <div class="kpi-bar-fill" style="width:${c.fill||0}%;background:${c.fillColor||'var(--blue)'}"></div>
      </div>
    </div>
  `).join('');
}

/* ─── SVG BAR CHART ───────────────────────────────────────── */
/**
 * drawBar(canvasId, labels, datasets, opts)
 * datasets: [{ data:[], color:'', label:'' }, ...]
 * opts: { targetLine: number }
 */
function drawBar(canvasId, labels, datasets, opts = {}) {
  const container = document.getElementById(canvasId);
  if (!container) return;

  const W    = container.clientWidth  || 500;
  const H    = container.clientHeight || 240;
  const PAD  = { top:20, right:16, bottom:30, left:52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top  - PAD.bottom;

  const allVals = datasets.flatMap(d => d.data).filter(v => v > 0);
  if (!allVals.length) return;
  const maxVal  = Math.max(...allVals, opts.targetLine || 0) * 1.1;

  const n      = labels.length;
  const ds     = datasets.length;
  const groupW = plotW / n;
  const barW   = Math.max(4, Math.floor(groupW / (ds + 1)));

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','100%');
  svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  /* Grid lines */
  for (let i = 0; i <= 5; i++) {
    const y   = PAD.top + plotH - (i / 5) * plotH;
    const val = (i / 5) * maxVal;
    const ln  = document.createElementNS('http://www.w3.org/2000/svg','line');
    ln.setAttribute('x1', PAD.left); ln.setAttribute('x2', PAD.left + plotW);
    ln.setAttribute('y1', y);        ln.setAttribute('y2', y);
    ln.setAttribute('stroke','rgba(0,212,255,0.08)'); ln.setAttribute('stroke-width','1');
    svg.appendChild(ln);
    if (i > 0) {
      const t = document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x', PAD.left - 4); t.setAttribute('y', y + 4);
      t.setAttribute('text-anchor','end'); t.setAttribute('fill','rgba(176,188,212,0.7)');
      t.setAttribute('font-size','9'); t.setAttribute('font-family','Exo 2,sans-serif');
      t.textContent = val >= 1000 ? (val/1000).toFixed(0)+'K' : Math.round(val);
      svg.appendChild(t);
    }
  }

  /* Bars */
  labels.forEach((lbl, i) => {
    const gx = PAD.left + i * groupW + (groupW - barW * ds) / 2;
    datasets.forEach((d, di) => {
      const val = d.data[i] || 0;
      if (val <= 0) return;
      const bh   = (val / maxVal) * plotH;
      const bx   = gx + di * barW;
      const by   = PAD.top + plotH - bh;
      const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x', bx);   rect.setAttribute('y', by);
      rect.setAttribute('width', Math.max(1, barW - 1)); rect.setAttribute('height', bh);
      rect.setAttribute('fill', d.color); rect.setAttribute('rx','2'); rect.setAttribute('opacity','0.85');
      svg.appendChild(rect);
    });

    /* X label */
    const t = document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x', PAD.left + i * groupW + groupW / 2);
    t.setAttribute('y', H - PAD.bottom + 14);
    t.setAttribute('text-anchor','middle'); t.setAttribute('fill','rgba(176,188,212,0.6)');
    t.setAttribute('font-size','9'); t.setAttribute('font-family','Exo 2,sans-serif');
    t.textContent = lbl;
    svg.appendChild(t);
  });

  /* Optional target line */
  if (opts.targetLine) {
    const ty = PAD.top + plotH - (opts.targetLine / maxVal) * plotH;
    const ln = document.createElementNS('http://www.w3.org/2000/svg','line');
    ln.setAttribute('x1', PAD.left); ln.setAttribute('x2', PAD.left + plotW);
    ln.setAttribute('y1', ty); ln.setAttribute('y2', ty);
    ln.setAttribute('stroke','rgba(255,193,7,0.7)'); ln.setAttribute('stroke-width','1.5');
    ln.setAttribute('stroke-dasharray','6,3');
    svg.appendChild(ln);
    const tl = document.createElementNS('http://www.w3.org/2000/svg','text');
    tl.setAttribute('x', PAD.left + plotW - 2); tl.setAttribute('y', ty - 4);
    tl.setAttribute('text-anchor','end'); tl.setAttribute('fill','rgba(255,193,7,0.8)');
    tl.setAttribute('font-size','9'); tl.setAttribute('font-family','Exo 2,sans-serif');
    tl.textContent = 'Target';
    svg.appendChild(tl);
  }

  container.innerHTML = '';
  container.appendChild(svg);
}

/* ─── SVG LINE CHART ──────────────────────────────────────── */
/**
 * drawLine(canvasId, labels, datasets, opts)
 * datasets: [{ data:[], color:'', fill:bool, dash:bool }, ...]
 * opts: { minZero:bool }
 */
function drawLine(canvasId, labels, datasets, opts = {}) {
  const container = document.getElementById(canvasId);
  if (!container) return;

  const W    = container.clientWidth  || 500;
  const H    = container.clientHeight || 220;
  const PAD  = { top:20, right:16, bottom:30, left:52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top  - PAD.bottom;

  const allVals = datasets.flatMap(d => d.data.filter(v => v > 0));
  if (!allVals.length) return;

  const maxVal = Math.max(...allVals) * 1.1;
  const minVal = opts.minZero ? 0 : Math.max(0, Math.min(...allVals) * 0.85);

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','100%');
  svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  /* Grid lines */
  for (let i = 0; i <= 5; i++) {
    const y   = PAD.top + plotH * (1 - i/5);
    const val = minVal + (maxVal - minVal) * (i/5);
    const ln  = document.createElementNS('http://www.w3.org/2000/svg','line');
    ln.setAttribute('x1', PAD.left); ln.setAttribute('x2', PAD.left + plotW);
    ln.setAttribute('y1', y); ln.setAttribute('y2', y);
    ln.setAttribute('stroke','rgba(0,212,255,0.08)'); ln.setAttribute('stroke-width','1');
    svg.appendChild(ln);
    const t = document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x', PAD.left - 4); t.setAttribute('y', y + 4);
    t.setAttribute('text-anchor','end'); t.setAttribute('fill','rgba(176,188,212,0.7)');
    t.setAttribute('font-size','9'); t.setAttribute('font-family','Exo 2,sans-serif');
    t.textContent = val >= 1000 ? (val/1000).toFixed(0)+'K' : val.toFixed(0);
    svg.appendChild(t);
  }

  const xOf = i => PAD.left + (labels.length > 1 ? (i / (labels.length - 1)) * plotW : plotW / 2);
  const yOf = v => PAD.top + plotH * (1 - (v - minVal) / (maxVal - minVal));

  datasets.forEach(ds => {
    const pts   = labels.map((l, i) => ({ x: xOf(i), y: yOf(ds.data[i] || 0), v: ds.data[i] || 0 }));
    const valid = pts.filter(p => p.v > 0);
    if (!valid.length) return;

    /* Area fill */
    if (ds.fill) {
      let pathD = `M ${valid[0].x} ${PAD.top + plotH}`;
      valid.forEach(p => { pathD += ` L ${p.x} ${p.y}`; });
      pathD += ` L ${valid[valid.length-1].x} ${PAD.top + plotH} Z`;
      const area = document.createElementNS('http://www.w3.org/2000/svg','path');
      area.setAttribute('d', pathD); area.setAttribute('fill', ds.color); area.setAttribute('opacity','0.1');
      svg.appendChild(area);
    }

    /* Line path */
    let d = '';
    valid.forEach((p, pi) => { d += (pi === 0 ? 'M ' : 'L ') + p.x + ' ' + p.y + ' '; });
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', d); path.setAttribute('stroke', ds.color);
    path.setAttribute('stroke-width','2'); path.setAttribute('fill','none');
    if (ds.dash) path.setAttribute('stroke-dasharray','6,3');
    svg.appendChild(path);

    /* Dots */
    valid.forEach(p => {
      const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r','3');
      c.setAttribute('fill', ds.color); c.setAttribute('stroke','var(--navy)'); c.setAttribute('stroke-width','1.5');
      svg.appendChild(c);
    });
  });

  /* X labels (every 2nd) */
  labels.forEach((l, i) => {
    if (i % 2 !== 0) return;
    const t = document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x', xOf(i)); t.setAttribute('y', H - PAD.bottom + 14);
    t.setAttribute('text-anchor','middle'); t.setAttribute('fill','rgba(176,188,212,0.6)');
    t.setAttribute('font-size','9'); t.setAttribute('font-family','Exo 2,sans-serif');
    t.textContent = l;
    svg.appendChild(t);
  });

  container.innerHTML = '';
  container.appendChild(svg);
}

/* ─── BUILD ALL CHARTS ────────────────────────────────────── */
function buildCharts() {
  const k   = DATA.katun;
  const ku  = DATA.kusuma;
  const p   = DATA.pouring;
  const lbls = DATA.days.map(d => `H${d}`);

  /* Computed achievement labels */
  const kDays  = k.total_output.filter(x => x > 0).length;
  const kuDays = ku.total_output.filter(x => x > 0).length;
  const ktTotal  = sum(k.total_output);
  const kuTotal  = sum(ku.total_output);
  const ktTgt   = kDays * TARGET * 2;
  const kuTgt   = kuDays * TARGET * 2;

  document.getElementById('katunAch').textContent  = ((ktTotal / ktTgt) * 100).toFixed(1) + '%';
  document.getElementById('katunAch').style.color  = (ktTotal / ktTgt) >= 0.95 ? 'var(--green)' : 'var(--red)';
  document.getElementById('kusumaAch').textContent = ((kuTotal / kuTgt) * 100).toFixed(1) + '%';
  document.getElementById('kusumaAch').style.color = (kuTotal / kuTgt) >= 0.95 ? 'var(--green)' : 'var(--red)';

  /* 1A — Katun Output */
  drawBar('chartKatunOutput', lbls, [
    { data:k.total_output, color:'rgba(26,108,245,0.8)',  label:'Actual' },
    { data:k.finish_good,  color:'rgba(0,230,118,0.75)', label:'FG' }
  ], { targetLine: TARGET });

  /* 1B — Kusuma Output */
  drawBar('chartKusumaOutput', lbls, [
    { data:ku.total_output, color:'rgba(0,212,255,0.8)',  label:'Actual' },
    { data:ku.finish_good,  color:'rgba(0,230,118,0.75)',label:'FG' }
  ], { targetLine: TARGET });

  /* 2A — Katun Productivity */
  const katunProd = k.mh_actual.map((mh, i) =>
    mh > 0 && k.total_output[i] > 0 ? +(k.total_output[i] / mh).toFixed(2) : 0);
  document.getElementById('katunProdAvg').textContent = avg(katunProd).toFixed(1);
  drawLine('chartKatunProd', lbls, [
    { data:katunProd, color:'var(--green)', fill:true },
    { data:Array(DATA.days.length).fill(GENTANI_TGT), color:'rgba(255,193,7,0.6)', dash:true }
  ], { minZero:true });

  /* 2B — Kusuma Productivity */
  const kusumaProd = ku.mh_actual.map((mh, i) =>
    mh > 0 && ku.total_output[i] > 0 ? +(ku.total_output[i] / mh).toFixed(2) : 0);
  document.getElementById('kusumaProdAvg').textContent = avg(kusumaProd).toFixed(1);
  drawLine('chartKusumaProd', lbls, [
    { data:kusumaProd, color:'var(--cyan)', fill:true },
    { data:Array(DATA.days.length).fill(GENTANI_TGT), color:'rgba(255,193,7,0.6)', dash:true }
  ], { minZero:true });

  /* 3A — Gentani Katun */
  document.getElementById('katunGentaniAvg').textContent = avg(k.total_gentani.filter(x=>x>0)).toFixed(1);
  drawLine('chartKatunGentani', lbls, [
    { data:k.total_gentani, color:'var(--yellow)', fill:true },
    { data:Array(DATA.days.length).fill(GENTANI_TGT), color:'rgba(255,61,87,0.5)', dash:true }
  ], { minZero:true });

  /* 3B — Gentani Kusuma */
  document.getElementById('kusumaGentaniAvg').textContent = avg(ku.total_gentani.filter(x=>x>0)).toFixed(1);
  drawLine('chartKusumaGentani', lbls, [
    { data:ku.total_gentani, color:'var(--yellow2)', fill:true },
    { data:Array(DATA.days.length).fill(GENTANI_TGT), color:'rgba(255,61,87,0.5)', dash:true }
  ], { minZero:true });

  /* 4A — Man Hour Katun */
  const ktPlan = k.plan_mh.filter(x=>x>0).reduce((s,v)=>s+v,0);
  const ktAct  = k.mh_actual.filter(x=>x>0).reduce((s,v)=>s+v,0);
  document.getElementById('katunMhEff').textContent = ktPlan > 0 ? ((ktAct/ktPlan)*100).toFixed(1)+'%' : '--';
  drawBar('chartKatunMH', lbls, [
    { data:k.plan_mh,    color:'rgba(26,108,245,0.7)' },
    { data:k.mh_actual,  color:'rgba(0,212,255,0.7)' },
    { data:k.mh_process, color:'rgba(0,230,118,0.65)' }
  ]);

  /* 4B — Man Hour Kusuma */
  const kuPlan = ku.plan_mh.filter(x=>x>0).reduce((s,v)=>s+v,0);
  const kuAct  = ku.mh_actual.filter(x=>x>0).reduce((s,v)=>s+v,0);
  document.getElementById('kusumaMhEff').textContent = kuPlan > 0 ? ((kuAct/kuPlan)*100).toFixed(1)+'%' : '--';
  drawBar('chartKusumaMH', lbls, [
    { data:ku.plan_mh,    color:'rgba(26,108,245,0.7)' },
    { data:ku.mh_actual,  color:'rgba(0,212,255,0.7)' },
    { data:ku.mh_process, color:'rgba(0,230,118,0.65)' }
  ]);

  /* 5A — Loss Pcs Katun */
  document.getElementById('katunTotalLoss').textContent = Math.round(sum(k.loss_pcs)).toLocaleString();
  drawBar('chartKatunLoss', lbls, [
    { data:k.loss_pcs, color:'rgba(255,61,87,0.8)' }
  ]);

  /* 5B — Loss Pcs Kusuma */
  document.getElementById('kusumaTotalLoss').textContent = Math.round(sum(ku.loss_pcs)).toLocaleString();
  drawBar('chartKusumaLoss', lbls, [
    { data:ku.loss_pcs, color:'rgba(255,23,68,0.8)' }
  ]);

  /* 6A — Pouring vs Finishing */
  const pourTotal = sum(p.output_pouring);
  const finTotal  = sum(p.output_finishing);
  document.getElementById('pourVarPct').textContent =
    pourTotal > 0 ? ((Math.abs(pourTotal - finTotal) / pourTotal) * 100).toFixed(1) + '%' : '--';
  drawBar('chartPouringFinishing', lbls, [
    { data:p.output_pouring,   color:'rgba(168,85,247,0.8)' },
    { data:p.output_finishing, color:'rgba(0,212,255,0.75)' }
  ]);

  /* 6B — WIP */
  const latestWip = p.wip_total.filter(x => x > 0).slice(-1)[0] || 0;
  document.getElementById('latestWIP').textContent = latestWip.toLocaleString();
  drawLine('chartWIP', lbls, [
    { data:p.wip_total, color:'var(--yellow)', fill:true },
    { data:Array(DATA.days.length).fill(WIP_MAX), color:'rgba(255,61,87,0.5)', dash:true }
  ], { minZero:true });

  /* 7A — NG Rate Katun */
  const ktNGRate = k.total_output.map((v, i) => v > 0 && k.ng[i] > 0 ? +(k.ng[i]/v*100).toFixed(2) : 0);
  document.getElementById('katunNGRate').textContent = avg(ktNGRate.filter(x=>x>0)).toFixed(2) + '%';
  drawBar('chartKatunNG', lbls, [
    { data:k.ng, color:'rgba(255,61,87,0.8)' }
  ]);

  /* 7B — NG Rate Kusuma */
  const kuNGRate = ku.total_output.map((v, i) => v > 0 && ku.ng[i] > 0 ? +(ku.ng[i]/v*100).toFixed(2) : 0);
  document.getElementById('kusumaNGRate').textContent = avg(kuNGRate.filter(x=>x>0)).toFixed(2) + '%';
  drawBar('chartKusumaNG', lbls, [
    { data:ku.ng, color:'rgba(255,23,68,0.8)' }
  ]);

  buildSummaryTable();
}

/* ─── SUMMARY TABLE ───────────────────────────────────────── */
function buildSummaryTable() {
  const k  = DATA.katun;
  const ku = DATA.kusuma;
  const p  = DATA.pouring;
  const achColor = v => {
    if (v === '--') return 'var(--white2)';
    return parseFloat(v) >= 95 ? 'var(--green)' : parseFloat(v) >= 80 ? 'var(--yellow)' : 'var(--red)';
  };

  let rows = '';
  DATA.days.forEach((day, i) => {
    const kOut  = k.total_output[i];
    const kuOut = ku.total_output[i];
    const kTgt  = TARGET * 2;
    const kAch  = kOut  > 0 ? ((kOut  / kTgt) * 100).toFixed(1) : '--';
    const kuAch = kuOut > 0 ? ((kuOut / kTgt) * 100).toFixed(1) : '--';

    rows += `
      <tr>
        <td style="color:var(--cyan);font-weight:700;font-family:'Rajdhani',sans-serif">${day}</td>
        <td>${kOut  ? kOut.toLocaleString()  : '-'}</td>
        <td>${Math.round(kTgt).toLocaleString()}</td>
        <td style="color:${achColor(kAch)};font-weight:700">${kAch !== '--' ? kAch+'%' : '-'}</td>
        <td>${k.mh_actual[i]  || '-'}</td>
        <td style="color:${k.absensi[i]  > 0 ? 'var(--red)' : 'var(--green)'}">${k.absensi[i]  || 0}</td>
        <td>${kuOut ? kuOut.toLocaleString() : '-'}</td>
        <td>${Math.round(kTgt).toLocaleString()}</td>
        <td style="color:${achColor(kuAch)};font-weight:700">${kuAch !== '--' ? kuAch+'%' : '-'}</td>
        <td>${ku.mh_actual[i] || '-'}</td>
        <td style="color:${ku.absensi[i] > 0 ? 'var(--red)' : 'var(--green)'}">${ku.absensi[i] || 0}</td>
        <td style="color:${p.wip_total[i] > WIP_MAX ? 'var(--red)' : 'var(--green)'}">
          ${p.wip_total[i] ? p.wip_total[i].toLocaleString() : '-'}
        </td>
      </tr>`;
  });
  document.getElementById('summaryBody').innerHTML = rows;
}

/* ─── ACTIONS ─────────────────────────────────────────────── */
function refreshData() {
  showNotif('🔄 Refresh','Data sedang diperbarui...');
  setTimeout(() => {
    buildKPIs();
    buildCharts();
    showNotif('✅ Berhasil','Data berhasil diperbarui!');
  }, 600);
}

function exportPDF() {
  showNotif('📄 Export PDF','Fitur export membutuhkan koneksi server. Silakan deploy terlebih dahulu.');
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

function showNotif(title, msg) {
  const n = document.getElementById('notif');
  document.getElementById('notifTitle').textContent = title;
  document.getElementById('notifMsg').textContent   = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3500);
}

/* ─── INIT ────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  buildKPIs();
  setTimeout(buildCharts, 100);
});

window.addEventListener('resize', () => {
  clearTimeout(window._resizeTimer);
  window._resizeTimer = setTimeout(buildCharts, 200);
});

/* Auto-refresh setiap 5 menit */
setInterval(() => { buildKPIs(); buildCharts(); }, 300_000);
