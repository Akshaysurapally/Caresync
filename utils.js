// Utility helpers used across modules
function defaultAvatar(){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect fill='%23e6eef7' width='100%' height='100%'/><text x='50%' y='55%' font-size='44' text-anchor='middle' fill='%232f4a66' font-family='Arial'>CS</text></svg>`;
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
}

function updateStats(){
  const DB = loadDB();
  const users = Object.values(DB.users);
  const patients = users.filter(u=>u.profile.role==='Patient').length;
  const doctors = users.filter(u=>u.profile.role==='Doctor').length;
  const appts = DB.appointments.filter(a=>a.status!=='rejected').length;
  const sp = document.getElementById('statPatients');
  const sd = document.getElementById('statDoctors');
  const sa = document.getElementById('statAppointments');
  if(sp) sp.innerText = patients;
  if(sd) sd.innerText = doctors;
  if(sa) sa.innerText = appts;
}

function populateDoctorSelect(){
  const DB = loadDB();
  const select = document.getElementById('apptDoctorSelect');
  if(!select) return;
  select.innerHTML = '';
  const doctors = Object.entries(DB.users).filter(([u,v]) => v.profile.role==='Doctor');
  doctors.forEach(([uname,uobj]) => {
    const opt = document.createElement('option'); opt.value = uname; opt.innerText = uobj.profile.name || uname;
    select.appendChild(opt);
  });
}
