// LocalStorage DB helpers
const DB_KEY = 'caresync_db_v1';
function loadDB(){
  let db = JSON.parse(localStorage.getItem(DB_KEY) || 'null');
  if(!db){
    db = {
      users: {
        'admin':{password:'pass', profile:{name:'Admin', email:'admin@caresync.com', avatarBase64:'', role:'Admin'}},
        'dr':{password:'pass', profile:{name:'Dr. Demo', email:'dr@caresync.com', avatarBase64:'', role:'Doctor'}},
        'patient':{password:'pass', profile:{name:'Patient Demo', email:'patient@caresync.com', avatarBase64:'', role:'Patient'}},
      },
      appointments: [],
      notifications: [],
      iotReadings: { hr:[], sp:[], gl:[] }
    };
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }
  return db;
}
function saveDB(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }
