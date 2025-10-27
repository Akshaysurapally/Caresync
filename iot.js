let iotRunning = true;
let iotInterval = null;
const HR = []; const SP = []; const GL = [];
const MAX_POINTS = 40;
let chartHR=null, chartSp=null, chartGl=null;

function initIotCharts(){
  const ctxHR = document.getElementById('chartHR').getContext('2d');
  chartHR = new Chart(ctxHR, { type:'line', data:{ labels:[], datasets:[{label:'HR', data:[], borderWidth:2, tension:0.3, fill:false}]}, options:{animation:false, plugins:{legend:{display:false}}, scales:{y:{min:40,max:200}} } });

  const ctxSP = document.getElementById('chartSpO2').getContext('2d');
  chartSp = new Chart(ctxSP, { type:'line', data:{ labels:[], datasets:[{label:'SpO2', data:[], borderWidth:2, tension:0.3, fill:false}]}, options:{animation:false, plugins:{legend:{display:false}}, scales:{y:{min:70,max:100}} } });

  const ctxGL = document.getElementById('chartGluc').getContext('2d');
  chartGl = new Chart(ctxGL, { type:'line', data:{ labels:[], datasets:[{label:'Glucose', data:[], borderWidth:2, tension:0.3, fill:false}]}, options:{animation:false, plugins:{legend:{display:false}}, scales:{y:{min:60,max:300}} } });
}

function startIot(){
  if(iotInterval) return;
  iotInterval = setInterval(()=> {
    const nowLabel = new Date().toLocaleTimeString().split(' ')[0];
    const lastHR = HR.length?HR[HR.length-1].val:78;
    const newHR = Math.round(Math.max(40, Math.min(180, lastHR + (Math.random()-0.5)*6)));
    HR.push({ts:Date.now(), val:newHR}); if(HR.length>MAX_POINTS) HR.shift();

    const lastSP = SP.length?SP[SP.length-1].val:98;
    const newSP = Math.round(Math.max(70, Math.min(100, lastSP + (Math.random()-0.5)*1.5)));
    SP.push({ts:Date.now(), val:newSP}); if(SP.length>MAX_POINTS) SP.shift();

    const lastGL = GL.length?GL[GL.length-1].val:110;
    const newGL = Math.round(Math.max(60, Math.min(350, lastGL + (Math.random()-0.5)*8)));
    GL.push({ts:Date.now(), val:newGL}); if(GL.length>MAX_POINTS) GL.shift();

    if(chartHR){
      chartHR.data.labels = HR.map(h=>new Date(h.ts).toLocaleTimeString());
      chartHR.data.datasets[0].data = HR.map(h=>h.val);
      chartHR.update('none');
      const el = document.getElementById('hrNow'); if(el) el.innerText = `Current: ${newHR} bpm`;
    }
    if(chartSp){
      chartSp.data.labels = SP.map(s=>new Date(s.ts).toLocaleTimeString());
      chartSp.data.datasets[0].data = SP.map(s=>s.val);
      chartSp.update('none');
      const el = document.getElementById('spNow'); if(el) el.innerText = `Current: ${newSP} %`;
    }
    if(chartGl){
      chartGl.data.labels = GL.map(g=>new Date(g.ts).toLocaleTimeString());
      chartGl.data.datasets[0].data = GL.map(g=>g.val);
      chartGl.update('none');
      const el = document.getElementById('glucNow'); if(el) el.innerText = `Current: ${newGL} mg/dL`;
    }

    const DB = loadDB();
    DB.iotReadings.hr = HR.slice(-100);
    DB.iotReadings.sp = SP.slice(-100);
    DB.iotReadings.gl = GL.slice(-100);
    saveDB(DB);

    if(newHR > 140) pushNotification(`High heart rate detected: ${newHR} bpm`, 'alert', true);
    if(newSP < 88) pushNotification(`Low oxygen detected: ${newSP}%`, 'alert', true);
    if(newGL > 250) pushNotification(`High glucose spike: ${newGL} mg/dL`, 'alert', true);

  }, 1500);
}

function pauseIot(){
  clearInterval(iotInterval); iotInterval = null;
}

document.getElementById('toggleStreamBtn').addEventListener('click', ()=>{
  if(iotInterval){ pauseIot(); document.getElementById('toggleStreamBtn').innerText='Resume Stream'; }
  else { startIot(); document.getElementById('toggleStreamBtn').innerText='Pause Stream'; }
});

function createSpike(type){
  if(type==='hr'){ HR.push({ts:Date.now(), val:180}); }
  if(type==='sp'){ SP.push({ts:Date.now(), val:82}); }
  if(type==='gl'){ GL.push({ts:Date.now(), val:300}); }
  pushNotification('SIM: manual spike created for testing', 'info', true);
}
