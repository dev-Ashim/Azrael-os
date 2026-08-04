
function updateClock() {
  const now = new Date();
  document.getElementById('clockTime').textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('clockDate').textContent =
    now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}
updateClock();
setInterval(updateClock, 1000);


function openWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'flex';
  win.classList.remove('minimized', 'maximized');
}

function closeWindow(id) {
  document.getElementById(id).style.display = 'none';
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


document.querySelectorAll('[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const target = btn.dataset.target;
    if (action === 'close')    closeWindow(target);
    if (action === 'minimize') minimizeWindow(target);
    if (action === 'maximize') maximizeWindow(target);
  });
});


document.getElementById('explorerClose')
  .addEventListener('click', () => closeWindow('explorer-window'));
document.getElementById('explorerMinimize')
  .addEventListener('click', () => minimizeWindow('explorer-window'));
document.getElementById('explorerMaximize')
  .addEventListener('click', () => maximizeWindow('explorer-window'));


document.getElementById('Files')
  .addEventListener('dblclick', () => openWindow('explorer-window'));
document.getElementById('iconBrowser')
  .addEventListener('dblclick', () => openWindow('browserWindow'));
document.getElementById('iconNotes')
  .addEventListener('dblclick', () => openWindow('notesWindow'));
document.getElementById('iconTerminal')
  .addEventListener('dblclick', () => {
    openWindow('terminalWindow');
    document.getElementById('terminalInput').focus();
  });
document.getElementById('iconTrash')
  .addEventListener('dblclick', () => openWindow('trashWindow'));


document.getElementById('browserGo').addEventListener('click', () => {
  let url = document.getElementById('browserUrl').value.trim();
  if (!url.startsWith('http')) url = 'https://' + url;
  document.getElementById('browserFrame').src = url;
});

document.getElementById('browserUrl').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('browserGo').click();
});


const terminalBody  = document.getElementById('terminalBody');
const terminalInput = document.getElementById('terminalInput');
const history = [];
let historyIndex = -1;

const commands = {
  help: () => 'Available: help, clear, echo, date, whoami, ls, pwd',
  clear: () => { terminalBody.innerHTML = ''; return null; },
  date: () => new Date().toString(),
  whoami: () => 'user@azrael',
  pwd: () => '/home/user',
  ls: () => 'Desktop  Downloads  Documents  Pictures  Projects',
  echo: (args) => args.join(' '),
};

function printLine(text, type = 'out') {
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  line.textContent = text;
  terminalBody.appendChild(line);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

printLine('Azrael-OS Terminal v1.0 — type "help" for commands', 'out');

terminalInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const raw = terminalInput.value.trim();
    if (!raw) return;

    history.unshift(raw);
    historyIndex = -1;
    printLine(`user@azrael:~$ ${raw}`, 'cmd');

    const [cmd, ...args] = raw.split(' ');
    if (commands[cmd]) {
      const result = commands[cmd](args);
      if (result !== null && result !== undefined) printLine(result);
    } else {
      printLine(`${cmd}: command not found`, 'err');
    }

    terminalInput.value = '';
  }

  if (e.key === 'ArrowUp') {
    historyIndex = Math.min(historyIndex + 1, history.length - 1);
    terminalInput.value = history[historyIndex] || '';
  }

  if (e.key === 'ArrowDown') {
    historyIndex = Math.max(historyIndex - 1, -1);
    terminalInput.value = historyIndex === -1 ? '' : history[historyIndex];
  }
});
