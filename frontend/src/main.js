import { api } from './utils/api.js';
import { renderMatchList } from './components/MatchCard.js';
import { renderBanner } from './components/Banner.js';
import { renderLeaderboard } from './components/Leaderboard.js';

const SUPABASE_URL = 'https://pemduyglnkcpbpoiqybb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q7PegGJriO6h7uukWuZV2A_dje1fk9T';
const SUPABASE_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
};

// ── App State ──
const state = {
  user: null,
  matches: [],
  banner: [],
  rankings: [],
  myId: 'user_1',
};

// ── Supabase API helpers ──
async function supabaseFetch(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: SUPABASE_HEADERS,
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

// ── Data Loading ──
async function loadData() {
  try {
    const [matches, badges, rankings] = await Promise.all([
      supabaseFetch('matches?order=kickoff.asc'),
      supabaseFetch('badges?order=condition_value.asc'),
      supabaseFetch('scores?order=total_points.desc&limit=10&select=user_id,total_points,correct_predictions,total_predictions'),
    ]);

    state.matches = matches;
    state.badges = badges;

    // Reformat rankings
    state.rankings = rankings.map((r, i) => ({
      id: r.user_id,
      name: r.user_id === 'user_1' ? '중기린' : `User_${r.user_id.slice(0,4)}`,
      emoji: r.user_id === 'user_1' ? '🐯' : '👤',
      score: r.total_points || 0,
      accuracy: r.total_predictions > 0 ? Math.round((r.correct_predictions / r.total_predictions) * 100) : 0,
    }));

    // Mock user (until auth is implemented)
    state.user = {
      id: 'user_1',
      name: '중기린',
      emoji: '🐯',
      level: 7,
      title: '🥈 노련한 분석가',
      score: 284,
      xp_progress: 65,
      next_level: 8,
      predictions: 38,
      correct: 31,
      accuracy: 81,
      badges: badges.map(b => ({ ...b, owned: b.condition_value <= 5 })),
      specials: [
        { label: '🏆 우승팀', value: '브라질' },
        { label: '⚽ 득점왕', value: '음바페' },
        { label: '🌟 MVP', value: null },
      ],
    };

    renderAll();
  } catch (err) {
    console.error('Failed to load data:', err);
    // Fallback to mock data
    loadMockData();
  }
}

// ── Render Functions ──
function renderUserStatus() {
  const u = state.user;
  document.getElementById('user-name').textContent = `${u.emoji} ${u.name}`;
  document.getElementById('user-level').textContent = `Lv.${u.level} ${u.title}`;
  document.getElementById('user-avatar').textContent = u.emoji;

  const content = document.getElementById('my-status-content');
  content.innerHTML = `
    <div class="status-row">
      <div><div class="status-level">Lv.${u.level}</div><div class="status-level-label">${u.title}</div></div>
      <div class="status-score"><div class="status-score-value">${u.score}</div><div class="status-score-label">총 점수</div></div>
    </div>
    <div class="xp-bar"><div class="xp-fill" style="width:${u.xp_progress}%"></div></div>
    <div class="xp-labels"><span>Lv.${u.level}</span><span>${u.xp_progress}%</span><span>Lv.${u.next_level}</span></div>
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-num green">${u.predictions}</div><div class="stat-label">예측</div></div>
      <div class="stat-box"><div class="stat-num blue">${u.correct}</div><div class="stat-label">적중</div></div>
      <div class="stat-box"><div class="stat-num yellow">${u.accuracy}%</div><div class="stat-label">적중률</div></div>
    </div>
  `;
}

function renderBadges() {
  const content = document.getElementById('badge-content');
  const owned = state.user.badges.filter(b => b.owned).length;
  const total = state.user.badges.length;
  content.innerHTML = `
    <div class="badge-grid">
      ${state.user.badges.map(b => `
        <div class="badge-item${b.owned ? ' owned' : ' locked'}">
          <div class="badge-icon">${b.icon}</div>
          <div class="badge-name">${b.name}</div>
        </div>
      `).join('')}
    </div>
    <div class="badge-progress">도감 ${owned}/${total} · <span class="badge-link">전체보기 →</span></div>
  `;
}

function renderSpecials() {
  const content = document.getElementById('special-content');
  content.innerHTML = state.user.specials.map(s => `
    <div class="special-item">
      <span class="special-label">${s.label}</span>
      <span class="special-value${!s.value ? ' empty' : ''}">${s.value || '미예측'}</span>
    </div>
  `).join('');
}

// ── Event Handlers ──
async function onPredict(matchId, homeScore, awayScore) {
  try {
    // In real app, call: api('/predictions', { method: 'POST', body: JSON.stringify({ matchId, homeScore, awayScore }) });
    alert(`🎯 ${matchId}: ${homeScore}:${awayScore} 예측 완료!`);
  } catch (err) {
    alert('예측 실패: ' + err.message);
  }
}

// ── Render All ──
function renderAll() {
  renderUserStatus();
  renderBadges();
  renderSpecials();
  renderMatchList(state.matches, document.getElementById('match-list'), onPredict);
  renderLeaderboard(document.getElementById('leaderboard-content'), state.rankings, state.myId);
  renderBanner(document.getElementById('banner-scroll'), state.banner);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  // Date nav
  const dates = ['6/12 (금)', '6/13 (토)', '6/14 (일)', '6/15 (월)'];
  const nav = document.getElementById('date-nav');
  dates.forEach((d, i) => {
    const btn = document.createElement('button');
    btn.className = `date-btn${i === 0 ? ' active' : ''}`;
    btn.textContent = d;
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    nav.appendChild(btn);
  });
});
