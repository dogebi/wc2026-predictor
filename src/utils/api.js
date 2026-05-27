const SUPABASE_URL = 'https://pemduyglnkcpbpoiqybb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q7PegGJriO6h7uukWuZV2A_dje1fk9T';

export const API_BASE = '/api'; // Backend proxy

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export function formatDate(iso) {
  const d = new Date(iso);
  const days = ['일','월','화','수','목','금','토'];
  return `${d.getMonth()+1}/${d.getDate()} (${days[d.getDay()]})`;
}

export function formatTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
