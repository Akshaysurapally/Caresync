document.getElementById('profileImageInput').addEventListener('change', e=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('profilePreview').src = reader.result;
  };
  reader.readAsDataURL(f);
});

function loadProfile(){
  if(!window.currentUser){ alert('Login to edit profile'); showPage('home'); return; }
  const DB = loadDB();
  const prof = DB.users[window.currentUser.username].profile;
  document.getElementById('profileName').value = prof.name || '';
  document.getElementById('profileEmail').value = prof.email || '';
  document.getElementById('profileRole').value = prof.role || 'Patient';
  document.getElementById('profilePreview').src = prof.avatarBase64 || defaultAvatar();
}

function saveProfile(){
  if(!window.currentUser){ alert('Login to save profile'); return; }
  const DB = loadDB();
  const name = document.getElementById('profileName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  const role = document.getElementById('profileRole').value;
  const avatar = document.getElementById('profilePreview').src;
  DB.users[window.currentUser.username].profile = { name, email, avatarBase64: avatar, role };
  saveDB(DB);
  window.currentUser.profile = DB.users[window.currentUser.username].profile;
  updateUIForUser();
  alert('Profile saved.');
}
