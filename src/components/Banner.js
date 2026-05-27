export function renderBanner(bannerEl, items) {
  if (!items || items.length === 0) return;
  let idx = 0;
  function show() {
    const item = items[idx % items.length];
    bannerEl.innerHTML = `<div class="banner-item" style="animation:slideIn 0.4s ease-out">🔥 <b>${item.name}</b> ${item.home_team} <b>${item.home_score}:${item.away_score}</b> ${item.away_team} 예측${item.streak ? ` <span style="color:var(--yellow)">(${item.streak}연속 적중!)</span>` : ''}</div>`;
    idx++;
  }
  show();
  setInterval(show, 4000);
}
