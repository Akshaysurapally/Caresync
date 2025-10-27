function renderAdmin(){
  const DB = loadDB();
  const container = document.getElementById('adminUsersList'); container.innerHTML='';
  const t = document.createElement('table'); t.innerHTML = `<thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead>`;
  const tbody = document.createElement('tbody');
  Object.entries(DB.users).forEach(([u,obj])=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u}</td><td>${obj.profile.name || ''}</td><td>${obj.profile.role || ''}</td>
                    <td><button class="ghost" onclick="adminEditUser('${u}')">Edit</button>
                        <button class="ghost" onclick="adminDeleteUser('${u}')">Delete</button></td>`;
    tbody.appendChild(tr);
  });
  t.appendChild(tbody);
  container.appendChild(t);
}

function adminEditUser(u){ const db = loadDB(); document.getElementById('adminNewUser').value = u; document.getElementById('adminNewRole').value = db.users[u].profile.role; document.getElementById('adminNewPass').value = db.users[u].password; }
function adminDeleteUser(u){
  if(!confirm('Delete user '+u+'?')) return;
  const DB = loadDB();
  delete DB.users[u];
  saveDB(DB);
  renderAdmin();
}
function adminCreateUser(){
  const u = document.getElementById('adminNewUser').value.trim().toLowerCase();
  const p = document.getElementById('adminNewPass').value;
  const r = document.getElementById('adminNewRole').value;
  if(!u || !p || !r){ alert('Fill all'); return; }
  const DB = loadDB();
  DB.users[u] = { password:p, profile:{ name:u, email:`${u}@caresync.com`, avatarBase64:'', role:r } };
  saveDB(DB);
  alert('user created/updated');
  renderAdmin();
}
