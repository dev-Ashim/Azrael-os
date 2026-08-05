// ── Clock ──────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('clockTime').textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('clockDate').textContent =
    now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
updateClock();
setInterval(updateClock, 1000);

// ── Window Manager ─────────────────────────────────────
function openWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'flex';
  win.classList.remove('minimized', 'maximized');
  win.style.zIndex = ++topZ;
}
function closeWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'none';
  document.querySelector(`[data-dock="${id}"]`)?.classList.remove('running');
}
function minimizeWindow(id) {
  const win = document.getElementById(id);
  win.classList.toggle('minimized');
  win.classList.remove('maximized');
}
function maximizeWindow(id) {
  const win = document.getElementById(id);
  win.classList.toggle('maximized');
  win.classList.remove('minimized');
}

let topZ = 50;

// Bring window to front on click
document.querySelectorAll('.window').forEach(win => {
  win.addEventListener('mousedown', () => { win.style.zIndex = ++topZ; });
});

// data-action buttons
document.querySelectorAll('[data-action]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const { action, target } = btn.dataset;
    if (action === 'close')    closeWindow(target);
    if (action === 'minimize') minimizeWindow(target);
    if (action === 'maximize') maximizeWindow(target);
  });
});

// Explorer controls (id-based)
document.getElementById('explorerClose').addEventListener('click',    () => closeWindow('explorer-window'));
document.getElementById('explorerMinimize').addEventListener('click', () => minimizeWindow('explorer-window'));
document.getElementById('explorerMaximize').addEventListener('click', () => maximizeWindow('explorer-window'));

// ── Dock ───────────────────────────────────────────────
const dockMap = {
  dockFiles:    'explorer-window',
  dockBrowser:  'browserWindow',
  dockTerminal: 'terminalWindow',
  dockNotes:    'notesWindow',
  dockCalc:     'calcWindow',
  dockTrash:    'trashWindow',
};

Object.entries(dockMap).forEach(([dockId, winId]) => {
  const el = document.getElementById(dockId);
  el.dataset.dock = winId;
  el.addEventListener('click', () => {
    const win = document.getElementById(winId);
    if (win.style.display === 'none' || win.style.display === '') {
      openWindow(winId);
      el.classList.add('running');
      if (winId === 'terminalWindow') document.getElementById('terminalInput').focus();
    } else if (win.classList.contains('minimized')) {
      win.classList.remove('minimized');
    } else {
      minimizeWindow(winId);
    }
  });
});

// ── Desktop icon double-click ──────────────────────────
document.getElementById('Files').addEventListener('dblclick',       () => { openWindow('explorer-window'); document.getElementById('dockFiles').classList.add('running'); });
document.getElementById('iconBrowser').addEventListener('dblclick', () => { openWindow('browserWindow');   document.getElementById('dockBrowser').classList.add('running'); });
document.getElementById('iconNotes').addEventListener('dblclick',   () => { openWindow('notesWindow');     document.getElementById('dockNotes').classList.add('running'); });
document.getElementById('iconTerminal').addEventListener('dblclick',() => { openWindow('terminalWindow');  document.getElementById('dockTerminal').classList.add('running'); document.getElementById('terminalInput').focus(); });
document.getElementById('iconCalc').addEventListener('dblclick',    () => { openWindow('calcWindow');      document.getElementById('dockCalc').classList.add('running'); });
document.getElementById('iconTrash').addEventListener('dblclick',   () => { openWindow('trashWindow');     document.getElementById('dockTrash').classList.add('running'); });

// ── Desktop Icon Drag ──────────────────────────────────
document.querySelectorAll('.icon').forEach(icon => {
  let startX, startY, dragging = false;
  let origLeft, origTop;

  icon.addEventListener('mousedown', e => {
    startX = e.clientX;
    startY = e.clientY;
    const rect = icon.getBoundingClientRect();
    origLeft = rect.left;
    origTop  = rect.top;
    dragging = false;

    function onMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Only start dragging after 5px movement to preserve dblclick
      if (!dragging && Math.sqrt(dx*dx + dy*dy) < 5) return;
      if (!dragging) {
        dragging = true;
        icon.style.position = 'fixed';
        icon.style.left = origLeft + 'px';
        icon.style.top  = origTop  + 'px';
        icon.style.zIndex = 999;
        icon.style.margin = '0';
        document.body.appendChild(icon); // move out of flex container
      }
      icon.style.left = (origLeft + dx) + 'px';
      icon.style.top  = (origTop  + dy) + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (dragging) {
        icon.style.zIndex = 10;
        dragging = false;
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
});

// ── Browser ────────────────────────────────────────────
const browserFrame   = document.getElementById('browserFrame');
const browserNewTab  = document.getElementById('browserNewTab');
const browserUrlInput = document.getElementById('browserUrl');
const tabTitleEl     = document.getElementById('tabTitle');

function browserNavigate(raw) {
  let url = raw.trim();
  if (!url) return;
  // If no dot and no protocol, treat as search
  if (!url.includes('.') && !url.startsWith('http')) {
    url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
  } else if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  browserUrlInput.value = url;
  browserNewTab.style.display = 'none';
  browserFrame.style.display = 'flex';
  browserFrame.src = url;
  tabTitleEl.textContent = new URL(url).hostname.replace('www.', '');
}

document.getElementById('browserGo').addEventListener('click', () => browserNavigate(browserUrlInput.value));
browserUrlInput.addEventListener('keydown', e => { if (e.key === 'Enter') browserNavigate(browserUrlInput.value); });

document.getElementById('newtabGo').addEventListener('click', () => {
  browserNavigate(document.getElementById('newtabSearch').value);
});
document.getElementById('newtabSearch').addEventListener('keydown', e => {
  if (e.key === 'Enter') browserNavigate(document.getElementById('newtabSearch').value);
});

document.querySelectorAll('.shortcut').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); browserNavigate(a.dataset.url); });
});

document.getElementById('btnRefresh').addEventListener('click', () => {
  if (browserFrame.style.display !== 'none') browserFrame.src = browserFrame.src;
});
document.getElementById('btnBack').addEventListener('click', () => {
  try { browserFrame.contentWindow.history.back(); } catch(e) {}
});
document.getElementById('btnForward').addEventListener('click', () => {
  try { browserFrame.contentWindow.history.forward(); } catch(e) {}
});

// ── Draggable Windows ──────────────────────────────────
document.querySelectorAll('.window').forEach(win => {
  const bar = win.querySelector('.titlebar');
  if (!bar) return;
  let dragging = false, ox = 0, oy = 0;
  bar.addEventListener('mousedown', e => {
    if (e.target.closest('.mac-controls, .mac-btn, .browser-tabs, .tab-close, .tab-add')) return;
    if (win.classList.contains('maximized')) return;
    dragging = true;
    ox = e.clientX - win.offsetLeft;
    oy = e.clientY - win.offsetTop;
    win.style.zIndex = ++topZ;
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    win.style.left = (e.clientX - ox) + 'px';
    win.style.top  = (e.clientY - oy) + 'px';
    win.style.transform = 'none';
  });
  document.addEventListener('mouseup', () => { dragging = false; });
});

// ── Terminal ───────────────────────────────────────────
const terminalBody  = document.getElementById('terminalBody');
const terminalInput = document.getElementById('terminalInput');
const cmdHistory = [];
let histIdx = -1;

const commands = {
  help:   () => 'Commands: help, clear, echo, date, whoami, ls, pwd, uname',
  clear:  () => { terminalBody.innerHTML = ''; return null; },
  date:   () => new Date().toString(),
  whoami: () => 'user',
  pwd:    () => '/Users/user',
  ls:     () => 'Desktop  Downloads  Documents  Pictures  Projects  Music',
  uname:  () => 'Azrael-OS 1.0 (Browser Edition)',
  echo:   args => args.join(' '),
};

function printLine(text, type = 'out') {
  const d = document.createElement('div');
  d.className = 'terminal-line ' + type;
  d.textContent = text;
  terminalBody.appendChild(d);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}
printLine('Azrael-OS Terminal — type "help" for commands');

terminalInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const raw = terminalInput.value.trim();
    if (!raw) return;
    cmdHistory.unshift(raw); histIdx = -1;
    printLine('user@azrael ~ % ' + raw, 'cmd');
    const [cmd, ...args] = raw.split(' ');
    const result = commands[cmd] ? commands[cmd](args) : `${cmd}: command not found`;
    if (result !== null && result !== undefined) printLine(result, commands[cmd] ? 'out' : 'err');
    terminalInput.value = '';
  }
  if (e.key === 'ArrowUp')   { histIdx = Math.min(histIdx + 1, cmdHistory.length - 1); terminalInput.value = cmdHistory[histIdx] || ''; }
  if (e.key === 'ArrowDown') { histIdx = Math.max(histIdx - 1, -1); terminalInput.value = histIdx === -1 ? '' : cmdHistory[histIdx]; }
});

// ── Calculator ─────────────────────────────────────────
document.querySelectorAll('.calc-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-mode').forEach(m => m.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('mode-' + tab.dataset.mode).classList.add('active');
  });
});

let calcExpr = '';
function calcInput(mode, val) {
  const exprEl = document.getElementById(mode + 'Expr');
  const resEl  = document.getElementById(mode + 'Result');
  if (val === 'AC')     { calcExpr = ''; resEl.textContent = '0'; exprEl.textContent = ''; return; }
  if (val === '\u232b') { calcExpr = calcExpr.slice(0, -1); resEl.textContent = calcExpr || '0'; return; }
  if (val === '+/-')    { if (calcExpr) { calcExpr = calcExpr.startsWith('-') ? calcExpr.slice(1) : '-' + calcExpr; resEl.textContent = calcExpr; } return; }
  if (val === '=') {
    try {
      exprEl.textContent = calcExpr + ' =';
      const r = Function('return ' + calcExpr)();
      resEl.textContent = parseFloat(r.toFixed(10));
      calcExpr = String(parseFloat(r.toFixed(10)));
    } catch { resEl.textContent = 'Error'; calcExpr = ''; }
    return;
  }
  calcExpr += val;
  resEl.textContent = calcExpr;
}

document.querySelectorAll('#mode-standard .calc-btn').forEach(b => b.addEventListener('click', () => calcInput('std', b.dataset.val)));
document.querySelectorAll('#mode-scientific .calc-btn:not(.fn)').forEach(b => b.addEventListener('click', () => calcInput('sci', b.dataset.val)));

document.querySelectorAll('.calc-btn.fn').forEach(btn => {
  btn.addEventListener('click', () => {
    const n = parseFloat(calcExpr) || 0;
    const fact = x => x <= 1 ? 1 : x * fact(x - 1);
    const r2d = d => d * Math.PI / 180;
    const map = { sin: Math.sin(r2d(n)), cos: Math.cos(r2d(n)), tan: Math.tan(r2d(n)), log: Math.log10(n), ln: Math.log(n), sqrt: Math.sqrt(n), sq: n*n, inv: 1/n, fact: fact(Math.abs(Math.round(n))) };
    if (btn.dataset.sci === 'pi')  { calcExpr += Math.PI; document.getElementById('sciResult').textContent = calcExpr; return; }
    if (btn.dataset.sci === 'e')   { calcExpr += Math.E;  document.getElementById('sciResult').textContent = calcExpr; return; }
    if (btn.dataset.sci === 'pow') { calcExpr += '**';    document.getElementById('sciResult').textContent = calcExpr; return; }
    const res = parseFloat(map[btn.dataset.sci].toFixed(10));
    document.getElementById('sciExpr').textContent = btn.dataset.sci + '(' + n + ') =';
    document.getElementById('sciResult').textContent = res;
    calcExpr = String(res);
  });
});

const physicsFormulas = {
  newton:    { label:'F = ma',     fields:['m (kg)','a (m/s²)'],           calc: v => v[0]*v[1]+' N' },
  kinetic:   { label:'KE = ½mv²',  fields:['m (kg)','v (m/s)'],            calc: v => 0.5*v[0]*v[1]**2+' J' },
  potential: { label:'PE = mgh',   fields:['m (kg)','g (m/s²)','h (m)'],   calc: v => v[0]*v[1]*v[2]+' J' },
  velocity:  { label:'v = u+at',   fields:['u (m/s)','a (m/s²)','t (s)'],  calc: v => v[0]+v[1]*v[2]+' m/s' },
  ohm:       { label:'V = IR',     fields:['I (A)','R (Ω)'],               calc: v => v[0]*v[1]+' V' },
  power:     { label:'P = IV',     fields:['I (A)','V (V)'],               calc: v => v[0]*v[1]+' W' },
  wave:      { label:'v = fλ',     fields:['f (Hz)','λ (m)'],              calc: v => v[0]*v[1]+' m/s' },
  einstein:  { label:'E = mc²',    fields:['m (kg)'],                      calc: v => v[0]*(3e8**2)+' J' },
};
let activeFormula = null;
document.querySelectorAll('.phys-formula').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.phys-formula').forEach(f => f.classList.remove('active'));
    el.classList.add('active'); activeFormula = el.dataset.formula;
    const f = physicsFormulas[activeFormula];
    document.getElementById('physInputs').innerHTML = f.fields.map((field,i) =>
      `<label>${field}<input type="number" class="phys-val" data-index="${i}" placeholder="0"></label>`).join('');
  });
});
document.getElementById('physCalc').addEventListener('click', () => {
  if (!activeFormula) return;
  const vals = [...document.querySelectorAll('.phys-val')].map(i => parseFloat(i.value)||0);
  document.getElementById('physResult').textContent = physicsFormulas[activeFormula].label + ' = ' + physicsFormulas[activeFormula].calc(vals);
});

const rates = { USD:1, EUR:0.92, GBP:0.79, JPY:149.5, INR:83.1, CAD:1.36, AUD:1.53, CNY:7.24, CHF:0.89, KRW:1325 };
document.getElementById('currConvert').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('currAmount').value);
  const from = document.getElementById('currFrom').value, to = document.getElementById('currTo').value;
  if (isNaN(amount)) { document.getElementById('currResult').textContent = 'Enter a valid amount'; return; }
  document.getElementById('currResult').textContent = `${amount} ${from} = ${((amount/rates[from])*rates[to]).toFixed(4)} ${to}`;
});

const unitData = {
  length: { m:1, km:0.001, cm:100, mm:1000, mi:0.000621371, ft:3.28084, inch:39.3701, yd:1.09361 },
  weight: { kg:1, g:1000, mg:1e6, lb:2.20462, oz:35.274, ton:0.001 },
  temp:   { C:null, F:null, K:null },
  speed:  { 'm/s':1, 'km/h':3.6, mph:2.23694, knot:1.94384 },
  area:   { 'm²':1, 'km²':1e-6, 'cm²':1e4, 'ft²':10.7639, acre:0.000247105, hectare:0.0001 },
};
function populateUnitSelects() {
  const cat = document.getElementById('unitCategory').value;
  ['unitFrom','unitTo'].forEach((id,i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = Object.keys(unitData[cat]).map(k => `<option value="${k}">${k}</option>`).join('');
    sel.selectedIndex = i;
  });
}
populateUnitSelects();
document.getElementById('unitCategory').addEventListener('change', populateUnitSelects);
document.getElementById('unitConvert').addEventListener('click', () => {
  const val = parseFloat(document.getElementById('unitAmount').value);
  const cat = document.getElementById('unitCategory').value;
  const from = document.getElementById('unitFrom').value, to = document.getElementById('unitTo').value;
  if (isNaN(val)) { document.getElementById('unitResult').textContent = 'Enter a valid value'; return; }
  let result;
  if (cat === 'temp') {
    if (from==='C'&&to==='F') result=val*9/5+32; else if (from==='F'&&to==='C') result=(val-32)*5/9;
    else if (from==='C'&&to==='K') result=val+273.15; else if (from==='K'&&to==='C') result=val-273.15;
    else if (from==='F'&&to==='K') result=(val-32)*5/9+273.15; else if (from==='K'&&to==='F') result=(val-273.15)*9/5+32;
    else result=val;
  } else { result=(val/unitData[cat][from])*unitData[cat][to]; }
  document.getElementById('unitResult').textContent = `${val} ${from} = ${parseFloat(result.toFixed(6))} ${to}`;
});
