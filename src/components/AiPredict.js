/**
 * MyKing AI Prediction Component
 * 80% 실력분석 / 10% 운세 / 10% 날씨
 */
export function renderAiPredict(match, container) {
  const { home_team, away_team, id } = match;
  const wrapper = document.createElement('div');
  wrapper.className = 'ai-predict-wrapper';

  wrapper.innerHTML = `
    <button class="ai-predict-btn" data-match-id="${id}">
      <span class="ai-btn-icon">🔮</span>
      <span class="ai-btn-text">MyKing AI 예측</span>
      <span class="ai-btn-badge">BETA</span>
    </button>
    <div class="ai-panel hidden" data-match-id="${id}">
      <div class="ai-loading">
        <div class="ai-spinner"></div>
        <span>MyKing이 데이터를 분석중입니다...</span>
      </div>
    </div>
  `;

  // Attach click handler
  const btn = wrapper.querySelector('.ai-predict-btn');
  const panel = wrapper.querySelector('.ai-panel');

  btn.addEventListener('click', async () => {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden') && !panel.dataset.loaded) {
      panel.dataset.loaded = 'true';
      await loadAiPrediction(id, panel);
    }
  });

  container.appendChild(wrapper);
}

async function loadAiPrediction(matchId, panel) {
  try {
    // Try backend API first
    const res = await fetch(`/api/predict/ai/${matchId}`);
    if (res.ok) {
      const data = await res.json();
      renderPredictionResult(data, panel);
      return;
    }
  } catch (e) {
    // Fallback to mock
  }

  // Fallback: generate mock AI prediction
  const mock = await generateMockPrediction(matchId);
  renderPredictionResult(mock, panel);
}

async function generateMockPrediction(matchId) {
  // Generate a deterministic-ish mock based on matchId
  const seed = matchId.charCodeAt(1) || 42;

  const teams = {
    m1: { home: '브라질', away: '독일', homeRank: 1, awayRank: 10 },
    m2: { home: '대한민국', away: '일본', homeRank: 23, awayRank: 15 },
    m3: { home: '아르헨티나', away: '사우디아라비아', homeRank: 2, awayRank: 56 },
    m4: { home: '프랑스', away: '포르투갈', homeRank: 3, awayRank: 6 },
    m5: { home: '스페인', away: '네덜란드', homeRank: 5, awayRank: 8 },
    m6: { home: '브라질', away: '아르헨티나', homeRank: 1, awayRank: 2 },
  };

  const t = teams[matchId] || { home: '팀A', away: '팀B', homeRank: 15, awayRank: 15 };
  const rankDiff = t.awayRank - t.homeRank;
  const homePower = Math.min(95, Math.max(40, 50 + rankDiff * 1.5 + (seed % 10)));
  const awayPower = Math.min(95, Math.max(40, 50 - rankDiff * 1.5 + ((seed * 3) % 10)));

  const total = homePower + awayPower;
  const homeSkill = Math.round((homePower / total) * 100);
  const awaySkill = 100 - homeSkill;

  const homeLuck = ((seed * 7 + 13) % 21) - 8;
  const isHomeLucky = homeLuck > 0;

  const weathers = ['맑음 ☀️', '흐림 ⛅', '비 🌧️', '폭염 🔥', '강풍 💨'];
  const weather = weathers[seed % 5];

  const homeTotal = homeSkill * 0.8 + (homeLuck + 50) * 0.1 + 10 * 0.1;
  const awayTotal = awaySkill * 0.8 + (-homeLuck + 50) * 0.1 + 9 * 0.1;
  const drawBase = 20;
  const sum = homeTotal + awayTotal + drawBase;

  const homePct = Math.round((homeTotal / sum) * 100);
  const awayPct = Math.round((awayTotal / sum) * 100);
  const drawPct = 100 - homePct - awayPct;

  const hg = Math.max(0, Math.round((homePower / 100) * (2 + (seed % 3))));
  const ag = Math.max(0, Math.round((awayPower / 100) * (1 + ((seed * 2) % 2))));

  const forms = ['WWWDW', 'WDLWW', 'WWLWD', 'LDWLL', 'WDWWL'];
  const homeForm = forms[(seed * 3) % 5];
  const awayForm = forms[(seed * 7) % 5];

  return {
    match_id: matchId,
    home_team: t.home,
    away_team: t.away,
    predicted_score: { home: hg > ag ? hg : hg + 1, away: hg > ag ? ag : ag + 1 },
    winner: hg > ag ? t.home : t.away,
    probabilities: { home_win: homePct, draw: drawPct, away_win: awayPct },
    analysis: {
      skill_80: {
        home_power: Math.round(homePower),
        away_power: Math.round(awayPower),
        home_attack: `⚔️ ${(2 + seed % 5 / 5).toFixed(1)} goals/match`,
        away_attack: `⚔️ ${(1.5 + (seed * 3) % 5 / 5).toFixed(1)} goals/match`,
        home_defense: `🛡️ ${(0.5 + (seed % 10) / 10).toFixed(1)} conceded/match`,
        away_defense: `🛡️ ${(0.8 + (seed * 7) % 10 / 10).toFixed(1)} conceded/match`,
        home_form: `최근 ${homeForm}`,
        away_form: `최근 ${awayForm}`,
        key_player: getKeyPlayer(t.home) + ' vs ' + getKeyPlayer(t.away),
        rank_diff: `FIFA 랭킹: ${t.homeRank}위 vs ${t.awayRank}위`,
        home_pct: homeSkill,
        away_pct: awaySkill,
      },
      luck_10: {
        message: isHomeLucky
          ? ['별자리가 상승세입니다! 🌟', '오늘은 🐯 호랑이 기운이 가득합니다!', '황금 물결이 당신을 감쌉니다 💛'][seed % 3]
          : ['수성 역행일지도... 🌑', '검은 고양이가 길을 건넜습니다 🐈‍⬛', '살짝 불운이 깃든 날입니다 💫'][seed % 3],
        value: Math.abs(homeLuck) * 2,
        is_lucky: isHomeLucky,
      },
      weather_10: {
        condition: weather,
        temperature: ['28°C', '22°C', '18°C', '35°C', '20°C'][seed % 5],
        home_advantage: 1.0 + (seed % 3) * 0.05,
        away_disadvantage: 0.9 + (seed % 4) * 0.03,
      },
    },
    verdict: homePower - awayPower > 15
      ? `🏆 ${t.home}의 압도적 우세!`
      : homePower - awayPower > 5
      ? `⭐ ${t.home}이(가) 다소 유리합니다.`
      : Math.abs(homePower - awayPower) <= 5
      ? '⚖️ 초접전이 예상됩니다!'
      : `💪 ${t.away}이(가) 객관적 전력에서 앞서지만, 변수가 많습니다.`,
    confidence: '매우 높음',
  };
}

function getKeyPlayer(team) {
  const map = {
    '브라질': '비니시우스', '독일': '무시알라', '대한민국': '손흥민',
    '일본': '미토마', '아르헨티나': '메시', '사우디': '알다우사리',
    '사우디아라비아': '알다우사리', '프랑스': '음바페', '포르투갈': '호날두',
    '스페인': '야말', '네덜란드': '데파이',
  };
  return map[team] || 'N/A';
}

function renderPredictionResult(data, panel) {
  const { predicted_score, probabilities, analysis, verdict, confidence } = data;
  const s = analysis.skill_80;
  const l = analysis.luck_10;
  const w = analysis.weather_10;

  panel.innerHTML = `
    <div class="ai-header">
      <span class="ai-title">🔮 MyKing AI 분석</span>
      <span class="ai-confidence">신뢰도: ${confidence}</span>
    </div>

    <div class="ai-score-box">
      <div class="ai-team">
        <span class="ai-flag">${getFlag(data.home_team)}</span>
        <span class="ai-team-name">${data.home_team}</span>
      </div>
      <div class="ai-score">
        <span class="ai-score-num home">${predicted_score.home}</span>
        <span class="ai-score-colon">:</span>
        <span class="ai-score-num away">${predicted_score.away}</span>
      </div>
      <div class="ai-team">
        <span class="ai-team-name">${data.away_team}</span>
        <span class="ai-flag">${getFlag(data.away_team)}</span>
      </div>
    </div>

    <div class="ai-prob-bars">
      <div class="ai-prob-row">
        <span class="ai-prob-label home">${data.home_team}</span>
        <div class="ai-prob-bar-wrap">
          <div class="ai-prob-bar" style="width:${probabilities.home_win}%;background:var(--blue)"></div>
        </div>
        <span class="ai-prob-val">${probabilities.home_win}%</span>
      </div>
      <div class="ai-prob-row">
        <span class="ai-prob-label draw">무승부</span>
        <div class="ai-prob-bar-wrap">
          <div class="ai-prob-bar draw-bar" style="width:${probabilities.draw}%"></div>
        </div>
        <span class="ai-prob-val">${probabilities.draw}%</span>
      </div>
      <div class="ai-prob-row">
        <span class="ai-prob-label away">${data.away_team}</span>
        <div class="ai-prob-bar-wrap">
          <div class="ai-prob-bar" style="width:${probabilities.away_win}%;background:var(--purple)"></div>
        </div>
        <span class="ai-prob-val">${probabilities.away_win}%</span>
      </div>
    </div>

    <div class="ai-verdict">${verdict}</div>

    <div class="ai-breakdown">
      <div class="ai-bd-title">📊 분석 breakdown</div>

      <!-- 80% Skill -->
      <div class="ai-bd-section">
        <div class="ai-bd-header">
          <span class="ai-bd-icon">💪</span>
          <span class="ai-bd-label">실력 분석</span>
          <span class="ai-bd-weight">80%</span>
        </div>
        <div class="ai-bd-body">
          <div class="ai-compare-row">
            <span class="ai-compare-left">${s.home_power}</span>
            <span class="ai-compare-label">전력 지수</span>
            <span class="ai-compare-right">${s.away_power}</span>
          </div>
          <div class="ai-power-bar-wrap">
            <div class="ai-power-bar home" style="width:${s.home_pct}%"></div>
            <div class="ai-power-bar away" style="width:${s.away_pct}%"></div>
          </div>
          <div class="ai-detail">
            <div class="ai-detail-item"><span>${s.rank_diff}</span></div>
            <div class="ai-detail-item"><span>${s.key_player}</span></div>
            <div class="ai-detail-item"><span>${s.home_attack} / ${s.away_attack}</span></div>
            <div class="ai-detail-item"><span>${s.home_defense} / ${s.away_defense}</span></div>
            <div class="ai-detail-item"><span>${s.home_form} / ${s.away_form}</span></div>
          </div>
        </div>
      </div>

      <!-- 10% Luck -->
      <div class="ai-bd-section">
        <div class="ai-bd-header">
          <span class="ai-bd-icon">🍀</span>
          <span class="ai-bd-label">운세 분석</span>
          <span class="ai-bd-weight">10%</span>
        </div>
        <div class="ai-bd-body">
          <div class="ai-luck-msg ${l.is_lucky ? 'good' : 'bad'}">${l.message}</div>
          <div class="ai-luck-bar">
            <div class="ai-luck-fill ${l.is_lucky ? 'good' : 'bad'}" style="width:${l.value}%"></div>
          </div>
          <div class="ai-luck-label">행운 수치: ${l.value}%</div>
        </div>
      </div>

      <!-- 10% Weather -->
      <div class="ai-bd-section">
        <div class="ai-bd-header">
          <span class="ai-bd-icon">🌤️</span>
          <span class="ai-bd-label">날씨/컨디션</span>
          <span class="ai-bd-weight">10%</span>
        </div>
        <div class="ai-bd-body">
          <div class="ai-weather-display">
            <span>${w.condition}</span>
            <span>${w.temperature}</span>
          </div>
          <div class="ai-weather-effect">
            <span>🏠 홈 이점: +${Math.round((w.home_advantage - 1) * 100)}%</span>
            <span>✈️ 원정 페널티: -${Math.round((1 - w.away_disadvantage) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getFlag(team) {
  const map = {
    '브라질': '🇧🇷', '독일': '🇩🇪', '대한민국': '🇰🇷', '일본': '🇯🇵',
    '아르헨티나': '🇦🇷', '사우디아라비아': '🇸🇦', '프랑스': '🇫🇷',
    '포르투갈': '🇵🇹', '스페인': '🇪🇸', '네덜란드': '🇳🇱',
    '팀A': '🏴', '팀B': '🏴',
  };
  return map[team] || '🏴';
}
