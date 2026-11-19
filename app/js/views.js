// Views: the checklist rows, the guide detail pane, the roadmap and the missables page.
// Every render is plain DOM built from the trophy data; no framework, no templates
// fetched from anywhere.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  combat: 'Combat',
  money: 'Money',
  exploration: 'Exploration',
  completion: 'Completion',
};

const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function isSpoilerHidden(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

export function missableLabel(trophy) {
  if (trophy.missable === 'yes') return 'Missable';
  if (trophy.missable === 'likely') return 'Likely missable';
  return null;
}

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function medalNode(grade) {
  const span = el('span', 'medal ' + grade);
  span.title = gradeLabel(grade);
  return span;
}

function tagsFor(trophy) {
  const wrap = el('span', 'trophy-tags');
  const gradeTag = el('span', 'tag grade-' + trophy.grade, gradeLabel(trophy.grade));
  wrap.append(gradeTag);
  const kindTag = el('span', 'tag', KIND_LABELS[trophy.kind] || trophy.kind);
  wrap.append(kindTag);
  const missable = missableLabel(trophy);
  if (missable) {
    wrap.append(el('span', 'tag missable-' + trophy.missable, missable));
  }
  if (trophy.target !== null && trophy.target !== undefined) {
    wrap.append(el('span', 'tag', 'Target: ' + trophy.target.toLocaleString('en-US')));
  }
  return wrap;
}

export function renderChecklist(listEl, metaEl, state) {
  const { trophies, earned, filters, spoilerOn, selectedId } = state;
  const query = filters.query.trim().toLowerCase();
  const visible = trophies.filter((t) => {
    if (filters.kind === 'story' && t.kind !== 'story') return false;
    if (filters.kind === 'missable' && t.missable === 'no') return false;
    if (filters.kind === 'collectibles' && t.kind !== 'collectibles') return false;
    if (filters.kind === 'activities' && t.kind !== 'activities') return false;
    if (filters.kind === 'online' && t.kind !== 'online') return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.earned === 'earned' && !earned.has(t.name)) return false;
    if (filters.earned === 'remaining' && earned.has(t.name)) return false;
    if (query) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
  listEl.replaceChildren();
  if (visible.length === 0) {
    const note = el('li', 'empty-note');
    note.textContent = filters.kind === 'online'
      ? 'The official list holds no online trophies, so this filter is empty — every one of the 55 is earned in single-player.'
      : 'No trophies match these filters. Clear the search or pick another kind.';
    listEl.append(note);
  }
  for (const t of visible) {
    const hidden = isSpoilerHidden(t, spoilerOn, earned);
    const li = el('li', 'trophy-row' + (earned.has(t.name) ? ' earned' : '') + (t.id === selectedId ? ' selected' : ''));
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => state.onToggle(t));
    li.append(box);
    li.append(medalNode(t.grade));
    const body = el('div');
    const name = el('div', 'trophy-name');
    if (hidden) name.append(el('span', 'hidden-name', 'Hidden story trophy'));
    else name.textContent = t.name;
    body.append(name);
    const desc = el('div', 'trophy-desc', hidden ? 'A story trophy — hidden until earned.' : t.description);
    body.append(desc);
    body.append(tagsFor(t));
    li.append(body);
    li.append(el('span', 'trophy-check', earned.has(t.name) ? '✓ Earned' : ''));
    li.addEventListener('click', () => state.onSelect(t.id));
    listEl.append(li);
  }
  metaEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies · ${earned.size} earned · ${trophies.length - earned.size} to go`;
}

export function renderDetail(pane, state) {
  const { trophies, earned, spoilerOn, selectedId, listSources } = state;
  pane.replaceChildren();
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    const wrap = el('div', 'detail-empty');
    wrap.append(el('h2', null, 'Pick a trophy to read its guide'));
    const p1 = el('p', null, 'Every trophy carries its official name, description and grade, a guide in our own words, and the sources that guide cites. Tick a box when you earn one — your progress is saved in this browser.');
    const p2 = el('p', null, 'Start with the Roadmap to Platinum for the order to earn them in, and check Missables before the final mission: four trophies are one-time story moments, and nineteen more are tied to a single mission.');
    wrap.append(p1, p2);
    pane.append(wrap);
    return;
  }
  const isEarned = earned.has(t.name);
  const hidden = isSpoilerHidden(t, spoilerOn, earned);
  pane.append(el('h2', null, hidden ? 'Hidden story trophy' : t.name));
  pane.append(el('p', 'detail-official', hidden ? 'Official name and description hidden until earned.' : `Official: “${t.description}”`));
  const earnRow = el('label', 'earn-row');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.addEventListener('change', () => state.onToggle(t));
  earnRow.append(box, document.createTextNode(isEarned ? 'Earned — ticked off' : 'Mark as earned'));
  pane.append(earnRow);
  const meta = el('div', 'detail-meta');
  meta.append(el('span', 'tag grade-' + t.grade, gradeLabel(t.grade)));
  meta.append(el('span', 'tag', KIND_LABELS[t.kind] || t.kind));
  const missable = missableLabel(t);
  if (missable) meta.append(el('span', 'tag missable-' + t.missable, missable));
  if (t.target !== null && t.target !== undefined) meta.append(el('span', 'tag', 'PSN target: ' + t.target.toLocaleString('en-US')));
  pane.append(meta);
  if (t.target !== null && t.target !== undefined) {
    pane.append(el('p', 'detail-target', `PSN tracks this one to ${t.target.toLocaleString('en-US')} — see the guide for how the count builds up.`));
  }
  const guide = el('div', 'detail-guide');
  if (hidden) {
    guide.append(el('p', null, 'This is a story trophy, and its guide is hidden while spoilers are on. Earn it in the game — or switch spoilers off — to read the guide.'));
  } else {
    for (const paragraph of t.guide.split('\n')) {
      if (paragraph.trim()) guide.append(el('p', null, paragraph.trim()));
    }
  }
  pane.append(guide);
  if (!hidden) {
    const sources = el('div', 'sources');
    sources.append(el('h3', null, 'Sources'));
    const ul = document.createElement('ul');
    for (const s of listSources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.label;
      a.rel = 'noopener';
      li.append(a);
      ul.append(li);
    }
    sources.append(ul);
    sources.append(el('p', null, 'The guide above is our own advice from the official description; where a place or step is not pinned down, it says so.'));
    pane.append(sources);
  }
  const nav = el('div', 'detail-nav');
  const index = trophies.findIndex((x) => x.id === t.id);
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = '← Previous trophy';
  prev.disabled = index <= 0;
  prev.addEventListener('click', () => state.onSelect(trophies[index - 1].id));
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next trophy →';
  next.disabled = index >= trophies.length - 1;
  next.addEventListener('click', () => state.onSelect(trophies[index + 1].id));
  nav.append(prev, next);
  pane.append(nav);
}

export function renderRoadmap(view, roadmap, trophies, earned, onSelect) {
  view.replaceChildren();
  view.append(el('h2', null, 'Roadmap to the Platinum'));
  view.append(el('p', 'lede', roadmap.note));
  const byId = new Map(trophies.map((t) => [t.id, t]));
  for (const stage of roadmap.stages) {
    const done = stage.trophies.filter((id) => earned.has(byId.get(id).name)).length;
    const box = el('section', 'stage');
    box.append(el('span', 'stage-count', `${done} / ${stage.trophies.length} earned`));
    box.append(el('h3', null, stage.title));
    box.append(el('p', 'stage-why', stage.why));
    box.append(el('p', 'stage-advice', stage.advice));
    const ul = el('ul', 'stage-trophies');
    for (const id of stage.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      const li = document.createElement('li');
      li.append(el('span', earned.has(t.name) ? 'done' : 'todo', earned.has(t.name) ? '✓' : '○'));
      const a = document.createElement('a');
      a.href = '#/trophy/' + t.id;
      a.textContent = t.name;
      a.addEventListener('click', (event) => { event.preventDefault(); onSelect(t.id); });
      li.append(a);
      li.append(el('span', null, ` — ${t.description} (${gradeLabel(t.grade)})`));
      ul.append(li);
    }
    box.append(ul);
    view.append(box);
  }
}

export function renderMissables(view, trophies, earned, onSelect) {
  view.replaceChildren();
  view.append(el('h2', null, 'Missable trophies'));
  view.append(el('p', 'lede', 'Built from the official descriptions alone. A trophy is “missable” when its moment happens once in the story; “likely missable” when it is tied to a single mission and whether it pops on a replay is not yet checked in the game. Everything else can be earned in free roam at any time.'));
  const key = el('div', 'missable-key');
  key.append(el('span', null, 'Missable — a one-time story moment. Do it when it comes.'));
  key.append(el('span', null, 'Likely missable — tied to one mission; replay status not yet checked.'));
  key.append(el('span', null, 'Not listed here — repeatable in free roam.'));
  view.append(key);
  const flagged = trophies.filter((t) => t.missable !== 'no');
  for (const t of flagged) {
    const box = el('section', 'stage');
    box.append(el('span', 'stage-count', earned.has(t.name) ? '✓ Earned' : 'Not yet earned'));
    box.append(el('h3', null, t.name));
    box.append(el('p', 'stage-why', `Official: “${t.description}” · ${gradeLabel(t.grade)} · ${missableLabel(t)}`));
    box.append(el('p', 'stage-advice', t.guide));
    const a = document.createElement('a');
    a.href = '#/trophy/' + t.id;
    a.textContent = 'Read the full guide →';
    a.addEventListener('click', (event) => { event.preventDefault(); onSelect(t.id); });
    box.append(a);
    view.append(box);
  }
}

export function renderProgress(earnedCountEl, fillEl, countsEl, trophies, earned) {
  earnedCountEl.textContent = String(earned.size);
  fillEl.style.width = (earned.size / trophies.length * 100).toFixed(1) + '%';
  const parts = GRADE_ORDER.map((g) => {
    const total = trophies.filter((t) => t.grade === g).length;
    const done = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    return `${gradeLabel(g)} ${done}/${total}`;
  });
  countsEl.textContent = parts.join(' · ');
}
