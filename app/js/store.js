// Progress store: which trophies are earned, saved in localStorage, exportable as JSON.
// Nothing leaves the browser: no account, no cookies, no network.
export const STORAGE_KEY = 'leonida-ledger-progress-v1';

// A spread of 13 trophies across the kinds, used only when ?seed=N is given and no
// saved progress exists yet, so a first look shows the tracker part-way.
export const SEED_IDS = [2, 3, 4, 5, 8, 9, 10, 15, 16, 19, 21, 35, 42];

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: new Set(), seeded: false };
    const parsed = JSON.parse(raw);
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    return { earned: new Set(Array.isArray(names) ? names : []), seeded: Boolean(parsed.seeded) };
  } catch {
    return { earned: new Set(), seeded: false };
  }
}

export function saveProgress(earned, seeded) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: [...earned], seeded: Boolean(seeded) }));
}

export function seedProgress(count) {
  return SEED_IDS.slice(0, Math.max(0, Math.min(count, SEED_IDS.length)));
}

export function exportFile(earned) {
  const payload = {
    game: 'Grand Theft Auto VI',
    guide: 'Leonida Ledger',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importFile(file, knownNames) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file holds no earned list.');
  const known = new Set(knownNames);
  const kept = names.filter((n) => typeof n === 'string' && known.has(n));
  return new Set(kept);
}
