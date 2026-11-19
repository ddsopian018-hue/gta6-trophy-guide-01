// Data loading: the trophy list and the roadmap, both plain files under app/data/.
// The app fetches nothing else, and nothing outside app/.
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  const doc = await response.json();
  const trophies = Array.isArray(doc) ? doc : doc.trophies;
  return { trophies, sources: doc.sources || [] };
}

export async function loadRoadmap() {
  const response = await fetch('data/roadmap.json');
  if (!response.ok) throw new Error('Could not load data/roadmap.json');
  return response.json();
}
