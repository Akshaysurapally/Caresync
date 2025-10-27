const notifWrap = document.getElementById('notifWrap');
const notifCountEl = document.getElementById('notifCount');

function renderNotif(notif){
  const d = document.createElement('div');
  d.className = 'notif';
  d.innerHTML = `<div style="font-weight:700">${notif.message}</div><div class="muted small">${new Date(notif.time).toLocaleString()}</div>`;
  notifWrap.appendChild(d);
  setTimeout(()=>{ d.style.opacity=1; },20);
  setTimeout(()=>{ d.style.opacity=0; d.remove(); }, 7000);
}
function updateNotifCount(){
  const DB = loadDB();
  const count = DB.notifications.filter(n=>!n.read).length;
  if(notifCountEl) notifCountEl.innerText = count;
  const recentNotifsEl = document.getElementById('recentNotifs');
  if(recentNotifsEl) recentNotifsEl.innerText = DB.notifications.slice(0,5).map(n=>n.message).join('\n') || 'No notifications yet.';
}
document.getElementById('notifyCenterBtn').addEventListener('click', ()=> {
  alert( loadDB().notifications.map(n=>`${new Date(n.time).toLocaleString()} - ${n.message}`).join('\n\n') || 'No notifications' );
});

function playBeep(freq=880,dur=0.15){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type='sine'; o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur + 0.02);
  }catch(e){/* ignore on mobile restrictions */}
}

function pushNotification(message, type='info', sound=true){
  const DB = loadDB();
  const notif = { id:Date.now(), message, type, time: new Date().toISOString(), read:false };
  DB.notifications.unshift(notif);
  saveDB(DB);
  renderNotif(notif);
  updateNotifCount();
  if(sound) playBeep();
}
