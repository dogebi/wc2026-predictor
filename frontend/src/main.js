import { api } from './utils/api.js';
import { renderMatchList } from './components/MatchCard.js';
import { renderBanner } from './components/Banner.js';
import { renderLeaderboard } from './components/Leaderboard.js';

// ── Mock data for MVP (until backend is live) ──
const MOCK = {
  user: {
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
    badges: [
      { id: 'b1', icon: '🥉', name: '첫 예측', owned: true },
      { id: 'b2', icon: '🥈', name: '5연속', owned: true },
      { id: 'b3', icon: '🥇', name: '10연속', owned: true },
      { id: 'b4', icon: '⭐', name: '분석가', owned: true },
      { id: 'b5', icon: '💎', name: '마스터', owned: false },
      { id: 'b6', icon: '🔥', name: '15연속', owned: false },
      { id: 'b7', icon: '👑', name: '챔피언', owned: false },
      { id: 'b8', icon: '🎯', name: '완벽예측', owned: false },
      { id: 'b9', icon: '🔮', name: '예언자', owned: false },
      { id: 'b10', icon: '🌍', name: '월드컵', owned: false },
    ],
    specials: [
      { label: '🏆 우승팀', value: '브라질' },
      { label: '⚽ 득점왕', value: '음바페' },
      { label: '🌟 MVP', value: null },
    ],
  },
  matches: [
    {
      id: 'm1', group_name: '조별리그 A조', home_team: '브라질', home_flag: '🇧🇷', home_rank: 1,
      away_team: '독일', away_flag: '🇩🇪', away_rank: 10,
      kickoff: '2026-06-12T22:00:00', status: 'upcoming', predictions_open: true,
      predict_count: 47, stats: { home_win: 62, away_win: 22, draw: 16 },
      hot: true,
    },
    {
      id: 'm2', group_name: '조별리그 B조', home_team: '대한민국', home_flag: '🇰🇷', home_rank: 23,
      away_team: '일본', away_flag: '🇯🇵', away_rank: 15,
      kickoff: '2026-06-13T01:00:00', status: 'upcoming', predictions_open: true,
      predict_count: 128, stats: { home_win: 45, away_win: 38, draw: 17 },
      hot: true,
    },
    {
      id: 'm3', group_name: '조별리그 C조', home_team: '아르헨티나', home_flag: '🇦🇷', home_rank: 2,
      away_team: '사우디아라비아', away_flag: '🇸🇦', away_rank: 56,
      kickoff: '2026-06-11T22:00:00', status: 'finished', predictions_open: false,
      home_score: 3, away_score: 1, prediction_rate: 32, predict_count: 141,
    },
    {
      id: 'm4', group_name: '조별리그 D조', home_team: '프랑스', home_flag: '🇫🇷', home_rank: 3,
      away_team: '포르투갈', away_flag: '🇵🇹', away_rank: 6,
      kickoff: '2026-06-13T19:00:00', status: 'upcoming', predictions_open: true,
      predict_count: 89, stats: { home_win: 55, away_win: 25, draw: 20 },
    },
    {
      id: 'm5', group_name: '조별리그 E조', home_team: '스페인', home_flag: '🇪🇸', home_rank: 5,
      away_team: '네덜란드', away_flag: '🇳🇱', away_rank: 8,
      kickoff: '2026-06-14T04:00:00', status: 'upcoming', predictions_open: true,
      predict_count: 63, stats: { home_win: 40, away_win: 35, draw: 25 },
    },
  ],
  banner: [
    { name: '김민수', home_team: '브라질', away_team: '독일', home_score: 3, away_score: 1 },
    { name: '박지연', home_team: '한국', away_team: '일본', home_score: 2, away_score: 0, streak: 5 },
    { name: '이철수', home_team: '아르헨티나', away_team: '사우디', home_score: 1, away_score: 1 },
    { name: '최예진', home_team: '포르투갈', away_team: '스위스', home_score: 2, away_score: 0 },
    { name: '김민수', home_team: '프랑스', away_team: '포르투갈', home_score: 2, away_score: 1, streak: 8 },
  ],
  rankings: [
    { id: 'u1', name: '김민수', emoji: '👑', score: 284, accuracy: 92 },
    { id: 'u2', name: '박지연', emoji: '🥈', score: 251, accuracy: 87 },
    { id: 'u3', name: '이철수', emoji: '🥉', score: 238, accuracy: 81 },
    { id: 'u4', name: '최예진', emoji: '⭐', score: 201, accuracy: 78 },
    { id: 'u5', name: '정민호', emoji: '🔥', score: 187, accuracy: 74 },
    { id: 'u6', name: '강수진', emoji: '🎯', score: 165, accuracy: 70 },
    { id: 'user_1', name: '중기린', emoji: '🐯', score: 142, accuracy: 73 },
    { id: 'u8', name: '홍길동', emoji: '⚡', score: 98, accuracy: 65 },
  ],
};

// ── App State ──
const state = {
  user: MOCK.user,
  matches: MOCK.matches,
  banner: MOCK.banner,
  rankings: MOCK.rankings,
  myId: 'user_1',
};

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

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderUserStatus();
  renderBadges();
  renderSpecials();
  renderMatchList(state.matches, document.getElementById('match-list'), onPredict);
  renderLeaderboard(document.getElementById('leaderboard-content'), state.rankings, state.myId);
  renderBanner(document.getElementById('banner-scroll'), state.banner);

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
