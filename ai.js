function runAIPredict() {
  const fields = ['p_age', 'p_bmi', 'p_hba1c', 'p_hr', 'p_sys'];
  let allFilled = true;
  fields.forEach(id => document.getElementById(id).style.borderColor = '');
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value) { el.style.borderColor = 'red'; allFilled = false; }
  });
  if (!allFilled) {
    document.getElementById('predictResult').innerText = 'Please fill all fields.';
    document.getElementById('predictDetails').innerText = '';
    return;
  }

  const age = Number(document.getElementById('p_age').value);
  const bmi = Number(document.getElementById('p_bmi').value);
  const hba1c = Number(document.getElementById('p_hba1c').value);
  const hr = Number(document.getElementById('p_hr').value);
  const sys = Number(document.getElementById('p_sys').value);

  document.getElementById('predictResult').innerText = 'Analyzing...';
  document.getElementById('predictDetails').innerText = 'Running AI-based model...';

  setTimeout(() => {
    const res = simulateAIPredict({ age, bmi, hba1c, hr, sys });

    let color = res.riskLabel === 'High risk' ? '#ff4d4f' : res.riskLabel === 'Moderate risk' ? '#faad14' : '#52c41a';

    const imgAdvice = 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png';
    const imgPrecautions = 'https://cdn-icons-png.flaticon.com/512/2331/2331945.png';
    const imgSuggestions = 'https://cdn-icons-png.flaticon.com/512/2910/2910763.png';
    const imgFood = 'https://cdn-icons-png.flaticon.com/512/135/135539.png';

    document.getElementById('predictDetails').innerHTML = `
      <div style="border:1px solid #ccc; padding:20px; border-radius:12px; background:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.1); margin-top:12px;">
        <div style="text-align:center; margin-bottom:15px;">
          <h2 style="color:${color}; font-weight:bold;">${res.riskLabel} (${Math.round(res.riskProb * 100)}% risk)</h2>
        </div>
        <div style="display:flex; align-items:center; margin-bottom:12px;">
          <img src="${imgAdvice}" style="width:30px; margin-right:10px;">
          <strong>Advice:</strong> ${res.advice}
        </div>
        <div style="display:flex; align-items:center; margin-bottom:12px;">
          <img src="${imgPrecautions}" style="width:30px; margin-right:10px;">
          <strong>Precautions:</strong> ${res.precautions}
        </div>
        <div style="display:flex; align-items:center; margin-bottom:12px;">
          <img src="${imgSuggestions}" style="width:30px; margin-right:10px;">
          <strong>Suggestions:</strong> ${res.suggestions}
        </div>
        <div style="display:flex; align-items:center; margin-bottom:12px;">
          <img src="${imgFood}" style="width:30px; margin-right:10px;">
          <strong>Food Recommendations:</strong> ${res.food}
        </div>
      </div>
    `;

    if (res.riskProb > 0.6) {
      pushNotification(`High risk predicted: ${res.riskLabel} (${Math.round(res.riskProb * 100)}%)`, 'alert', true);
    }

  }, 700);
}

function clearPredict() {
  ['p_age', 'p_bmi', 'p_hba1c', 'p_hr', 'p_sys'].forEach(id => {
    const el = document.getElementById(id); el.value = ''; el.style.borderColor = '';
  });
  document.getElementById('predictResult').innerText = 'No prediction yet.';
  document.getElementById('predictDetails').innerText = 'Results will appear here — simulated probabilities and advice.';
}

function simulateAIPredict({ age, bmi, hba1c, hr, sys }) {
  const weights = { age: 0.2, bmi: 0.2, hba1c: 0.3, hr: 0.15, sys: 0.15 };
  const ageScore = Math.min(1, Math.max(0, (age - 30) / 50));
  const bmiScore = Math.min(1, Math.max(0, (bmi - 22) / 20));
  const hba1cScore = Math.min(1, Math.max(0, (hba1c - 5) / 3));
  const hrScore = Math.min(1, Math.max(0, (hr - 60) / 80));
  const sysScore = Math.min(1, Math.max(0, (sys - 110) / 80));
  const score = Math.max(0, Math.min(1, ageScore * weights.age + bmiScore * weights.bmi + hba1cScore * weights.hba1c + hrScore * weights.hr + sysScore * weights.sys));

  let label, advice, precautions, suggestions, food;
  if (score > 0.65) {
    label = 'High risk';
    advice = 'Urgent clinical review recommended, lifestyle modifications, and further tests.';
    precautions = 'Avoid strenuous activity, monitor vitals daily, limit sugar & salt, stay hydrated.';
    suggestions = 'Consult doctor immediately, follow prescribed medication, regular monitoring, balanced diet, exercise.';
    food = 'Leafy greens, whole grains, lean protein, low sugar fruits, avoid fried/processed food.';
  } else if (score > 0.35) {
    label = 'Moderate risk';
    advice = 'Monitor health and consider lifestyle changes; periodic clinical review.';
    precautions = 'Maintain healthy blood pressure and sugar levels, avoid smoking/alcohol, moderate activity.';
    suggestions = 'Balanced diet, regular exercise, stress management, routine check-ups.';
    food = 'Vegetables, fruits, nuts, moderate protein, avoid sugary drinks and excessive fats.';
  } else {
    label = 'Low risk';
    advice = 'Low immediate risk; continue healthy lifestyle.';
    precautions = 'Maintain regular monitoring of vitals.';
    suggestions = 'Balanced diet, regular physical activity, adequate sleep, stress management.';
    food = 'Variety of healthy foods: fruits, vegetables, whole grains, lean protein.';
  }

  return { riskProb: score, riskLabel: label, advice, precautions, suggestions, food };
}
