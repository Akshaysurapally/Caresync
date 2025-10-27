
// Main boot, auth, and UI wiring
window.currentUser = null;
const pages = ['home', 'iot', 'predict', 'appointments', 'profile', 'admin'];

function showPage(page) {
  pages.forEach(p => {
    const el = document.getElementById('page_' + p);
    if (el) el.classList.toggle('hidden', p !== page);
  });
  document.querySelectorAll('.navlink').forEach(n => {
    n.classList.toggle('nav-active', n.dataset.page === page);
  });
  const el = document.getElementById('page_' + page);
  if (el) { el.classList.add('fade-enter-active'); setTimeout(() => el.classList.remove('fade-enter-active'), 400); }
  if (page === 'appointments') renderAppointments();
  if (page === 'iot') ensureIotRunning();
  if (page === 'profile') loadProfile();
  if (page === 'admin') renderAdmin();
}

const authBtn = document.getElementById('authBtn');
const authModal = document.getElementById('authModal');
const currentUserDisplay = document.getElementById('currentUserDisplay');
const logoutBtn = document.getElementById('logoutBtn');
authBtn.addEventListener('click', () => openAuth());
logoutBtn.addEventListener('click', () => doLogout());

function openAuth() { authModal.classList.remove('hidden'); document.getElementById('authTitle').innerText = 'Login / Signup' }
function closeAuth() { authModal.classList.add('hidden') }

function authSignup() {
  const u = document.getElementById('authUser').value.trim().toLowerCase();
  const p = document.getElementById('authPass').value;
  const r = document.getElementById('authRole').value;
  if (!u || !p || !r) { alert('Fill username, password and role to signup'); return; }
  const DB = loadDB();
  if (DB.users[u]) { alert('User exists'); return; }
  DB.users[u] = { password: p, profile: { name: u, email: `${u}@caresync.com`, avatarBase64: '', role: r } };
  saveDB(DB);
  alert('User created. Please login.');
}

function authLogin() {
  const u = document.getElementById('authUser').value.trim().toLowerCase();
  const p = document.getElementById('authPass').value;
  const DB = loadDB();
  if (DB.users[u] && DB.users[u].password === p) {
    loginAs(u);
    closeAuth();
  } else alert('Invalid username/password');
}

function loginAs(username) {
  const DB = loadDB();
  window.currentUser = { username, profile: DB.users[username].profile };
  updateUIForUser();
  showPage('home');
}

function doLogout() {
  if (!window.currentUser) return;
  if (!confirm('Logout?')) return;
  window.currentUser = null;
  updateUIForUser();
  showPage('home');
}

function updateUIForUser() {
  const name = window.currentUser ? window.currentUser.profile.name : 'Guest';
  const display = document.getElementById('currentUserDisplay');
  if (display) display.innerText = window.currentUser ? `${name} (${window.currentUser.profile.role})` : 'Not signed in';
  const sname = document.getElementById('sidebarName');
  const srole = document.getElementById('sidebarRole');
  const sav = document.getElementById('sidebarAvatar');
  if (sname) sname.innerText = window.currentUser ? window.currentUser.profile.name : 'Guest';
  if (srole) srole.innerText = window.currentUser ? window.currentUser.profile.role : 'Visitor';
  if (sav) sav.src = window.currentUser && window.currentUser.profile.avatarBase64 ? window.currentUser.profile.avatarBase64 : defaultAvatar();
  document.getElementById('adminLink').style.display = (window.currentUser && window.currentUser.profile.role === 'Admin') ? 'block' : 'none';
  document.getElementById('logoutBtn').classList.toggle('hidden', !window.currentUser);
  populateDoctorSelect();
  updateStats();
  renderRecentNotifs();
}

function prefill(username) {
  document.getElementById('authUser').value = username;
  document.getElementById('authPass').value = 'pass';
  document.getElementById('authRole').value = '';
}

document.querySelectorAll('.navlink').forEach(n => {
  n.addEventListener('click', () => showPage(n.dataset.page));
});
document.getElementById('adminLink').addEventListener('click', () => showPage('admin'));

function ensureIotRunning() {
  if (!chartHR) initIotCharts();
  if (!iotInterval && iotRunning) startIot();
}

function renderRecentNotifs() {
  const DB = loadDB();
  const recent = DB.notifications.slice(0, 5);
  const recentNotifsEl = document.getElementById('recentNotifs');
  recentNotifsEl.innerText = recent.length ? recent.map(n => `${new Date(n.time).toLocaleString()}: ${n.message}`).join('\n') : 'No notifications yet.';
  updateNotifCount();
}

// theme toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const current = document.body.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('cs_theme', next);
});
document.body.dataset.theme = localStorage.getItem('cs_theme') || 'light';

// server time
setInterval(() => { const el = document.getElementById('serverTime'); if (el) el.innerText = new Date().toLocaleString(); }, 1000);

function initialSetup() {
  loadDB();
  document.getElementById('sidebarAvatar').src = defaultAvatar();
  updateStats();
  populateDoctorSelect();
  initIotCharts(); startIot();
  updateNotifCount();
}

// Ensure the main content is offset by the actual header height so it never
// scrolls under the fixed header (useful if the header height changes).
function adjustHeaderSpacing() {
  const hdr = document.querySelector('header.site-header') || document.querySelector('header');
  const h = hdr ? Math.ceil(hdr.getBoundingClientRect().height) : 72;
  document.documentElement.style.setProperty('--header-height', h + 'px');
}

// call adjustHeaderSpacing on load and resize
window.addEventListener('resize', () => adjustHeaderSpacing());

setInterval(() => { updateStats(); renderRecentNotifs(); }, 5000);

// expose some functions globally for inline onclick attributes
window.showPage = showPage;
window.bookAppointment = bookAppointment;
window.createSpike = createSpike;
window.runAIPredict = runAIPredict;
window.clearPredict = clearPredict;
window.saveProfile = saveProfile;
window.loadProfile = loadProfile;
window.loginAs = loginAs;
window.adminCreateUser = adminCreateUser;
window.adminDeleteUser = adminDeleteUser;
window.respondAppt = respondAppt;
window.playBeep = playBeep;
window.authSignup = authSignup;
window.authLogin = authLogin;
window.closeAuth = closeAuth;
window.openAuth = openAuth;
window.prefill = prefill;
window.doLogout = doLogout;

initialSetup();
adjustHeaderSpacing();
showPage('home');
