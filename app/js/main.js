// Boot and routing for the Leonida Ledger.
// Hash routes: #/ (checklist), #/roadmap, #/missables, #/trophy/<id>.
// URL parameters for a first look or a screenshot: ?seed=13 seeds 13 earned trophies
// when no saved progress exists; ?kind=, ?grade=, ?spoiler=on and ?q= set the filters.
import { loadTrophies, loadRoadmap } from './data.js';
import { loadProgress, saveProgress, seedProgress, exportFile, importFile } from './store.js';
import { renderChecklist, renderDetail, renderRoadmap, renderMissables, renderProgress, KIND_LABELS } from './views.js';

const params = new URLSearchParams(location.search);
const seedCount = Number(params.get('seed') || '0');

const state = {
  trophies: [],
  roadmap: null,
  listSources: [],
  earned: new Set(),
  seeded: false,
  spoilerOn: params.get('spoiler') === 'on',
  selectedId: null,
  filters: {
    kind: params.get('kind') || 'all',
    grade: params.get('grade') || 'all',
    earned: 'all',
    query: params.get('q') || '',
  },
  onToggle(trophy) {
    if (state.earned.has(trophy.name)) state.earned.delete(trophy.name);
    else state.earned.add(trophy.name);
    saveProgress(state.earned, state.seeded);
    renderAll();
  },
  onSelect(id) {
    state.selectedId = id;
    location.hash = '#/trophy/' + id;
    renderAll();
    document.getElementById('detailPane').scrollIntoView({ block: 'nearest' });
  },
};

const listEl = document.getElementById('trophyList');
const metaEl = document.getElementById('listMeta');
const pane = document.getElementById('detailPane');
const roadmapView = document.getElementById('roadmapView');
const missablesView = document.getElementById('missablesView');
const columnsEl = document.querySelector('.columns');
const toolbarEl = document.getElementById('toolbar');

function currentTab() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/roadmap')) return 'roadmap';
  if (hash.startsWith('#/missables')) return 'missables';
  const match = hash.match(/^#\/trophy\/(\d+)$/);
  if (match) state.selectedId = Number(match[1]);
  return 'checklist';
}

function renderAll() {
  renderProgress(
    document.getElementById('earnedCount'),
    document.getElementById('progressFill'),
    document.getElementById('gradeCounts'),
    state.trophies,
    state.earned,
  );
  const tab = currentTab();
  for (const link of document.querySelectorAll('.tabs a')) {
    link.classList.toggle('active', link.dataset.tab === tab);
  }
  const checklistVisible = tab === 'checklist';
  columnsEl.hidden = !checklistVisible;
  toolbarEl.style.display = checklistVisible ? '' : 'none';
  roadmapView.hidden = tab !== 'roadmap';
  missablesView.hidden = tab !== 'missables';
  if (checklistVisible) {
    renderChecklist(listEl, metaEl, state);
    renderDetail(pane, state);
  } else if (tab === 'roadmap' && state.roadmap) {
    renderRoadmap(roadmapView, state.roadmap, state.trophies, state.earned, (id) => state.onSelect(id));
  } else if (tab === 'missables') {
    renderMissables(missablesView, state.trophies, state.earned, (id) => state.onSelect(id));
  }
}

function buildKindChips() {
  const wrap = document.getElementById('kindChips');
  const kinds = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];
  for (const kind of kinds) {
    const count = kind === 'all'
      ? state.trophies.length
      : kind === 'missable'
        ? state.trophies.filter((t) => t.missable !== 'no').length
        : state.trophies.filter((t) => t.kind === kind).length;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = (kind === 'all' ? 'All' : KIND_LABELS[kind]) + ` (${count})`;
    button.setAttribute('aria-pressed', String(state.filters.kind === kind));
    button.addEventListener('click', () => {
      state.filters.kind = kind;
      for (const b of wrap.querySelectorAll('.chip')) b.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-pressed', 'true');
      renderAll();
    });
    wrap.append(button);
  }
}

async function boot() {
  const { trophies, sources } = await loadTrophies();
  state.trophies = trophies;
  state.listSources = sources;
  state.roadmap = await loadRoadmap();
  const saved = loadProgress();
  state.earned = saved.earned;
  state.seeded = saved.seeded;
  if (state.earned.size === 0 && seedCount > 0) {
    const byId = new Map(trophies.map((t) => [t.id, t]));
    for (const id of seedProgress(seedCount)) {
      const t = byId.get(id);
      if (t) state.earned.add(t.name);
    }
    state.seeded = true;
    saveProgress(state.earned, true);
    document.getElementById('seedNote').hidden = false;
  }
  const search = document.getElementById('search');
  search.value = state.filters.query;
  search.addEventListener('input', () => { state.filters.query = search.value; renderAll(); });
  const grade = document.getElementById('gradeFilter');
  grade.value = state.filters.grade;
  grade.addEventListener('change', () => { state.filters.grade = grade.value; renderAll(); });
  const earnedFilter = document.getElementById('earnedFilter');
  earnedFilter.addEventListener('change', () => { state.filters.earned = earnedFilter.value; renderAll(); });
  const spoiler = document.getElementById('spoilerToggle');
  spoiler.checked = state.spoilerOn;
  spoiler.addEventListener('change', () => { state.spoilerOn = spoiler.checked; renderAll(); });
  document.getElementById('exportBtn').addEventListener('click', () => exportFile(state.earned));
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      state.earned = await importFile(file, state.trophies.map((t) => t.name));
      saveProgress(state.earned, state.seeded);
      renderAll();
    } catch (error) {
      alert('Could not import that file: ' + error.message);
    }
    event.target.value = '';
  });
  buildKindChips();
  window.addEventListener('hashchange', renderAll);
  renderAll();
}

boot().catch((error) => {
  document.getElementById('main').replaceChildren(
    Object.assign(document.createElement('p'), { textContent: 'The guide could not load its data: ' + error.message }),
  );
});
