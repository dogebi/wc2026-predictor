import { api, formatDate, formatTime } from '../utils/api.js';

export function renderMatchList(matches, container, onPredict) {
  container.innerHTML = '';
  matches.forEach(m => {
    const card = document.createElement('div');
    card.className = `match-card${m.status === 'finished' ? ' finished' : ''}${m.hot ? ' hot' : ''}`;

    const statusLabel = m.status === 'finished' ? '경기 종료 ✅'
      : m.status === 'live' ? '경기 중 🔴'
      : m.predictions_open ? '예측 가능'
      : '예측 마감';

    const badgeClass = m.status === 'finished' ? 'done'
      : m.status === 'live' ? 'hot-badge'
      : m.predictions_open ? 'open' : '';

    card.innerHTML = `
      <div class="match-meta">
        <span class="match-group">🇺🇸 월드컵 · ${m.group_name || '조별리그'}</span>
        <span class="match-badge ${badgeClass}">${statusLabel}</span>
      </div>
      <div class="match-teams">
        <div class="team">
          <span class="team-flag">${m.home_flag || '🏴'}</span>
          <div>
            <div class="team-name">${m.home_team}</div>
            <div class="team-rank">FIFA ${m.home_rank || '?'}위</div>
          </div>
        </div>
        <div class="vs-section">
          ${m.status === 'finished'
            ? `<div class="score-display"><span class="home">${m.home_score}</span><span style="color:var(--text3);margin:0 0.25rem">:</span><span class="away">${m.away_score}</span></div>`
            : `<div class="vs-text">VS</div><div class="match-time">${formatTime(m.kickoff)} KST</div>`}
          ${m.prediction_rate ? `<div class="prediction-rate">예측 적중률 ${m.prediction_rate}%</div>` : ''}
        </div>
        <div class="team team-right">
          <div>
            <div class="team-name">${m.away_team}</div>
            <div class="team-rank">FIFA ${m.away_rank || '?'}위</div>
          </div>
          <span class="team-flag">${m.away_flag || '🏴'}</span>
        </div>
      </div>
      ${m.status !== 'finished' && m.status !== 'live' && m.predictions_open !== false
        ? `<div class="predict-row">
            <div class="predict-inputs">
              <input type="number" min="0" max="20" placeholder="?" class="score-input" data-match-id="${m.id}" data-side="home">
              <span style="color:var(--text3);font-size:0.875rem">:</span>
              <input type="number" min="0" max="20" placeholder="?" class="score-input" data-match-id="${m.id}" data-side="away">
            </div>
            <button class="predict-btn" data-match-id="${m.id}">🎯 예측하기</button>
          </div>`
        : ''}
      <div class="predict-stats">
        <span>예측 ${m.predict_count || 0}명</span>
        ${m.stats ? `<span>🇧🇷 ${m.stats.home_win}% / 🇩🇪 ${m.stats.away_win}% / 무 ${m.stats.draw}%</span>` : ''}
      </div>
    `;

    // Attach event
    const btn = card.querySelector('.predict-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const homeInp = card.querySelector('[data-side="home"]');
        const awayInp = card.querySelector('[data-side="away"]');
        const home = parseInt(homeInp.value);
        const away = parseInt(awayInp.value);
        if (isNaN(home) || isNaN(away)) {
          alert('스코어를 입력해주세요!');
          return;
        }
        onPredict(m.id, home, away);
      });
    }

    container.appendChild(card);
  });
}
