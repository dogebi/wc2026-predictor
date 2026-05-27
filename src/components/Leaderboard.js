export function renderLeaderboard(container, rankings, myId = null) {
  const medals = ['🥇', '🥈', '🥉'];
  container.innerHTML = rankings.map((r, i) => {
    const isMe = myId && r.id === myId;
    const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const rankClass = i < 3 ? (i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze') : '';
    return `
      <div class="rank-item${i === 0 ? ' top1' : ''}${isMe ? ' me' : ''}">
        <div class="rank-pos ${rankClass}">${i < 3 ? medals[i] : `#${i+1}`}</div>
        <div class="rank-info"><span class="rank-name">${r.emoji || '👤'} ${r.name}</span></div>
        <div class="rank-score">
          <div class="rank-score-val ${isMe ? 'blue' : ''}">${r.score}점</div>
          <div class="rank-rate">${r.accuracy}%</div>
        </div>
      </div>
    `;
  }).join('');
}
