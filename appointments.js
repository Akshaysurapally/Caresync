function bookAppointment(){
  if(!window.currentUser || window.currentUser.profile.role!=='Patient'){ alert('Only logged-in patients can request appointments.'); return; }
  const doctor = document.getElementById('apptDoctorSelect').value;
  const datetime = document.getElementById('apptDatetime').value;
  const reason = document.getElementById('apptReason').value || 'General';
  if(!doctor || !datetime){ alert('Select doctor and date/time'); return; }
  const DB = loadDB();
  const appt = { id:Date.now(), patient:window.currentUser.username, doctor, datetime, reason, status:'pending' };
  DB.appointments.push(appt);
  saveDB(DB);
  pushNotification(`Appointment requested with ${DB.users[doctor].profile.name} on ${new Date(datetime).toLocaleString()}`, 'info', true);
  clearApptForm();
  renderAppointments();
}

function clearApptForm(){ document.getElementById('apptDatetime').value=''; document.getElementById('apptReason').value=''; }

function renderAppointments(){
  const DB = loadDB();
  const pendingDiv = document.getElementById('pendingAppts');
  if(window.currentUser && window.currentUser.profile.role==='Doctor'){
    const pend = DB.appointments.filter(a=>a.doctor===window.currentUser.username && a.status==='pending');
    if(!pend.length) pendingDiv.innerText='No pending requests.';
    else {
      pendingDiv.innerHTML = '';
      pend.forEach(a=>{
        const d = document.createElement('div'); d.className='card';
        d.innerHTML = `<b>From:</b> ${DB.users[a.patient].profile.name || a.patient}<br/>
                       <b>When:</b> ${new Date(a.datetime).toLocaleString()}<br/>
                       <b>Reason:</b> ${a.reason}<br/>
                       <div style="margin-top:8px"><button class="btn" onclick="respondAppt(${a.id},'approved')">Approve</button>
                       <button class="ghost" onclick="respondAppt(${a.id},'rejected')">Reject</button></div>`;
        pendingDiv.appendChild(d);
      });
    }
  } else {
    if(pendingDiv) pendingDiv.innerText='Login as a Doctor to view and respond to requests.';
  }

  const all = DB.appointments.slice().sort((a,b)=>b.id-a.id);
  const allDiv = document.getElementById('allAppts');
  if(!all.length) allDiv.innerText='No appointments';
  else {
    const t = document.createElement('table');
    t.innerHTML = `<thead><tr><th>Patient</th><th>Doctor</th><th>When</th><th>Reason</th><th>Status</th></tr></thead>`;
    const tbody = document.createElement('tbody');
    all.forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${DB.users[a.patient]?.profile.name || a.patient}</td>
                      <td>${DB.users[a.doctor]?.profile.name || a.doctor}</td>
                      <td>${new Date(a.datetime).toLocaleString()}</td>
                      <td>${a.reason}</td>
                      <td><span class="pill ${a.status==='approved'?'green':'red'}">${a.status}</span></td>`;
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    allDiv.innerHTML = ''; allDiv.appendChild(t);
  }
}

function respondAppt(id, status){
  const DB = loadDB();
  const a = DB.appointments.find(x=>x.id===id);
  if(!a) return alert('Not found');
  a.status = status;
  saveDB(DB);
  pushNotification(`Appointment ${status} for ${DB.users[a.patient].profile.name}`, 'info', true);
  renderAppointments();
}
