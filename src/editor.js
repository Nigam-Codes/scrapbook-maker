/*
 * Scrapbook Maker editor: type the cover details and each person's message,
 * watch every page update, then print. Work is saved in this browser as you
 * type, and can be saved to (and opened from) a file.
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const COVER_FIELDS = ['title', 'recipient', 'occasion', 'from', 'date', 'place', 'coverCaption'];
  const PREFS_KEY = 'scrapbook-maker/prefs';

  let nextId = 1;
  const newId = () => 'p' + nextId++;

  const blankBook = () => ({
    title: '', recipient: '', occasion: '', from: '', date: '', place: '', coverPhoto: '', coverCaption: '',
    groups: [], entries: [],
  });
  const blankPerson = () => ({ id: newId(), name: '', message: '', photo: '', caption: '', style: '', group: '' });
  // A person's page can use any paper design or message look.
  const DESIGNS = Scrapbook.templates;
  const MESSAGES = Scrapbook.messageStyles;
  const LOOKS = [...DESIGNS, ...MESSAGES];
  const styleName = (id) => (LOOKS.find((t) => t.id === id) || {}).name || '';
  const esc = Scrapbook.util.esc;
  const optionList = (list) => list.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
  // Looks that can show several people together as a group chat.
  const GROUP_LOOKS = MESSAGES.filter((t) => t.group);
  const groupLabel = (g) => g.name.trim() || 'Unnamed group';

  // Accept anything shaped roughly like a book; ids are internal and reissued.
  function normalise(data) {
    const book = blankBook();
    for (const k of [...COVER_FIELDS, 'coverPhoto']) if (typeof data?.[k] === 'string') book[k] = data[k];
    const ids = new Set();
    book.groups = (Array.isArray(data?.groups) ? data.groups : []).map((g, k) => {
      let id = String(g?.id || `g${k + 1}`);
      while (ids.has(id)) id += '-';
      ids.add(id);
      return { id, name: String(g?.name ?? ''), style: GROUP_LOOKS.some((t) => t.id === g?.style) ? g.style : GROUP_LOOKS[0].id };
    });
    book.entries = (Array.isArray(data?.entries) ? data.entries : []).map((e) => ({
      id: newId(),
      name: String(e?.name ?? ''),
      message: String(e?.message ?? ''),
      photo: String(e?.photo ?? ''),
      caption: String(e?.caption ?? ''),
      style: styleName(e?.style) ? e.style : '',
      group: ids.has(e?.group) ? e.group : '',
    }));
    return book;
  }

  const serialise = (b) => ({ ...b, entries: b.entries.map(({ id, ...rest }) => rest) });
  const hasContent = (b) => Boolean(b.title.trim() || b.entries.some((e) => e.name.trim() || e.message.trim()));

  let book = blankBook();
  let currentId = null;

  /* ---------- saving ---------- */

  // IndexedDB holds the book (photos can be large); localStorage is the fallback.
  const store = (() => {
    let opening = null;
    const open = () => opening || (opening = new Promise((resolve, reject) => {
      const req = indexedDB.open('scrapbook-maker', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
    const run = async (mode, fn) => {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('kv', mode);
        const req = fn(tx.objectStore('kv'));
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    };
    return {
      async get() {
        try { return await run('readonly', (s) => s.get('book')); } catch (e) { /* fall through */ }
        try { return JSON.parse(localStorage.getItem('scrapbook-maker/book') || 'null'); } catch (e) { return null; }
      },
      async set(value) {
        try { await run('readwrite', (s) => s.put(value, 'book')); return true; } catch (e) { /* fall through */ }
        try { localStorage.setItem('scrapbook-maker/book', JSON.stringify(value)); return true; } catch (e) { return false; }
      },
    };
  })();

  let saveTimer = 0;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const ok = await store.set(serialise(book));
      const status = $('save-status');
      status.classList.toggle('warn', !ok);
      status.textContent = ok
        ? `Saved in this browser at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
        : "This browser won't save your work automatically. Use Save to file so you don't lose it.";
    }, 500);
  }

  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); } catch (e) { return {}; }
  }
  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        template: $('template').value, paper: $('paper').value, cover: $('cover').checked,
      }));
    } catch (e) { /* preferences are a convenience only */ }
  }

  /* ---------- photos ---------- */

  // Photos are stored inside the book, shrunk so a long list stays manageable.
  async function readPhoto(file) {
    const url = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('That file is not an image this browser can read.'));
      i.src = url;
    });
    const max = 1600;
    const w = img.naturalWidth || max;
    const h = img.naturalHeight || max;
    const k = Math.min(1, max / Math.max(w, h));
    if (k === 1 && file.size < 700000) return url;
    const c = document.createElement('canvas');
    c.width = Math.round(w * k);
    c.height = Math.round(h * k);
    const g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.86);
  }

  function showPhoto(box, photo) {
    const thumb = box.querySelector('.thumb');
    thumb.hidden = !photo;
    if (photo) thumb.src = photo;
    else thumb.removeAttribute('src');
    box.querySelector('.button').firstChild.textContent = photo ? 'Change photo' : box.id === 'cover-photo' ? 'Add cover photo' : 'Add photo';
    box.querySelector('button.link').hidden = !photo;
    box.querySelector('.caption').hidden = !photo;
  }

  /* ---------- the form ---------- */

  function fillCover() {
    for (const f of COVER_FIELDS) $('f-' + f).value = book[f] || '';
    showPhoto($('cover-photo'), book.coverPhoto);
  }

  function personWarning(p) {
    const name = p.name.trim();
    const message = p.message.trim();
    if (name && !message) return `Add a message to give ${name} a page.`;
    if (message && !name) return 'Add a name to sign this page.';
    return '';
  }

  // "Book design" first, then each message look, then the other paper designs.
  const lookOptions = () =>
    `<option value="">Book design (${esc($('template').selectedOptions[0]?.text || '')})</option>` +
    `<optgroup label="Messages">${optionList(MESSAGES)}</optgroup>` +
    `<optgroup label="Paper designs">${optionList(DESIGNS)}</optgroup>`;

  function personCard(p, i, total) {
    const li = document.createElement('li');
    li.className = 'person';
    li.dataset.id = p.id;
    li.innerHTML = `
      <div class="person-head">
        <span class="person-no">${i + 1}</span>
        <input id="name-${p.id}" data-key="name" placeholder="Name" autocomplete="off" aria-label="Name of person ${i + 1}">
        <div class="person-tools">
          <button type="button" data-act="up" aria-label="Move up" title="Move up"${i === 0 ? ' disabled' : ''}>↑</button>
          <button type="button" data-act="down" aria-label="Move down" title="Move down"${i === total - 1 ? ' disabled' : ''}>↓</button>
          <button type="button" data-act="remove" aria-label="Remove this person" title="Remove">✕</button>
        </div>
      </div>
      <textarea id="msg-${p.id}" data-key="message" rows="4" placeholder="Their message" aria-label="Message from person ${i + 1}"></textarea>
      ${book.groups.length ? `<div class="look">
        <label for="grp-${p.id}">Group chat</label>
        <select id="grp-${p.id}" data-key="group"><option value="">None: their own page</option>${book.groups.map((g) => `<option value="${esc(g.id)}">${esc(groupLabel(g))} (${esc(styleName(g.style))})</option>`).join('')}</select>
      </div>` : ''}
      <div class="look">
        <label for="look-${p.id}">Looks like</label>
        <select id="look-${p.id}" data-key="style">${lookOptions()}</select>
      </div>
      <div class="photo">
        <img class="thumb" alt="" hidden>
        <label class="button small">Add photo<input type="file" accept="image/*" data-photo="person"></label>
        <button type="button" class="small link" data-act="unphoto" hidden>Remove photo</button>
        <input class="caption" id="cap-${p.id}" data-key="caption" placeholder="Photo caption (optional)" autocomplete="off" aria-label="Photo caption" hidden>
      </div>
      <p class="hint warn" hidden></p>`;
    li.querySelector('[data-key="name"]').value = p.name;
    li.querySelector('[data-key="message"]').value = p.message;
    li.querySelector('[data-key="caption"]').value = p.caption;
    li.querySelector('[data-key="style"]').value = p.style;
    if (book.groups.length) li.querySelector('[data-key="group"]').value = p.group;
    showGroup(li, p);
    showPhoto(li.querySelector('.photo'), p.photo);
    showWarning(li, p);
    return li;
  }

  // In a group chat the group decides how the page looks.
  function showGroup(li, p) {
    const look = li.querySelector('[data-key="style"]');
    look.disabled = Boolean(p.group);
    look.title = p.group ? 'Set by their group chat' : '';
  }

  function showWarning(li, p) {
    const warn = li.querySelector('.hint.warn');
    warn.textContent = personWarning(p);
    warn.hidden = !warn.textContent;
  }

  function renderList() {
    const list = $('people');
    list.replaceChildren(...book.entries.map((p, i) => personCard(p, i, book.entries.length)));
  }

  const findPerson = (el) => {
    const li = el.closest('.person');
    return li ? { li, p: book.entries.find((x) => x.id === li.dataset.id) } : {};
  };

  function updateCount(pages) {
    const writing = book.entries.filter((e) => e.message.trim());
    if (pages === undefined) {
      // Until the preview is drawn: one page each, one per group chat in use.
      const groups = new Set(writing.map((e) => e.group).filter(Boolean));
      pages = writing.filter((e) => !e.group).length + groups.size + ($('cover').checked ? 1 : 0);
    }
    const people = writing.length;
    $('count').textContent = `${people} ${people === 1 ? 'person' : 'people'} · ${pages} ${pages === 1 ? 'page' : 'pages'}`;
  }

  /* ---------- group chats ---------- */

  function newGroupId() {
    let k = book.groups.length + 1;
    while (book.groups.some((g) => g.id === `g${k}`)) k++;
    return `g${k}`;
  }

  function renderGroups() {
    $('groups').replaceChildren(...book.groups.map((g) => {
      const li = document.createElement('li');
      li.className = 'group';
      li.dataset.gid = g.id;
      li.innerHTML = `
        <input id="gname-${esc(g.id)}" data-gkey="name" placeholder="Group name, e.g. Design team" autocomplete="off" aria-label="Group name">
        <select id="glook-${esc(g.id)}" data-gkey="style" aria-label="Group chat look">${optionList(GROUP_LOOKS)}</select>
        <button type="button" data-gact="remove" aria-label="Remove this group chat" title="Remove">✕</button>
        <p class="hint"></p>`;
      li.querySelector('[data-gkey="name"]').value = g.name;
      li.querySelector('[data-gkey="style"]').value = g.style;
      return li;
    }));
    $('groups-empty').hidden = book.groups.length > 0;
    updateGroupCounts();
  }

  function updateGroupCounts() {
    for (const li of $('groups').children) {
      const members = book.entries.filter((e) => e.group === li.dataset.gid);
      li.querySelector('.hint').textContent = members.length
        ? `${members.length} ${members.length === 1 ? 'person' : 'people'}: ${members.map((e) => e.name.trim() || 'no name yet').join(', ')}`
        : 'Nobody yet. Choose this group on people\'s cards below.';
    }
  }

  function changed() {
    updateCount();
    scheduleRender();
    scheduleSave();
  }

  /* ---------- preview ---------- */

  let renderRun = 0;
  let renderTimer = 0;
  function scheduleRender(delay = 350) {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderPreview, delay);
  }

  // Pages are built off-screen and swapped in at once, so the preview doesn't jump.
  async function renderPreview() {
    clearTimeout(renderTimer);
    const mine = ++renderRun;
    const paper = Scrapbook.PAPER[$('paper').value];
    $('page-size').textContent = `@page { size: ${paper.css}; margin: 0; }`;
    const stage = document.createElement('div');
    stage.className = 'pages stage';
    $('preview').append(stage);
    const shown = { ...book, title: book.title.trim() || 'Untitled scrapbook' };
    await Scrapbook.render(shown, $('template').value, {
      paper: paper.id,
      cover: $('cover').checked,
      place: (sheet, info) => {
        if (mine !== renderRun) return;
        const fig = document.createElement('figure');
        fig.className = 'page';
        const f = Scrapbook.frame(paper);
        f.append(sheet);
        const cap = document.createElement('figcaption');
        if (info.kind === 'cover') {
          cap.textContent = 'Cover';
        } else if (info.group) {
          fig.dataset.members = info.members.map((e) => e.id).join(' ');
          const n = $('cover').checked ? info.index : info.index + 1;
          const names = info.members.map((e) => e.name.trim() || 'No name yet').join(', ');
          cap.textContent = `${n} · ${groupLabel(info.group)} (${styleName(info.group.style)} group) · ${names}`;
        } else {
          fig.dataset.person = info.entry.id;
          const n = $('cover').checked ? info.index : info.index + 1;
          const look = styleName(info.entry.style);
          cap.textContent = `${n} · ${info.entry.name.trim() || 'No name yet'}${look ? ` · ${look}` : ''}`;
        }
        fig.append(f, cap);
        stage.append(fig);
        Scrapbook.scaleFrames(fig);
      },
    });
    if (mine !== renderRun) {
      stage.remove();
      return;
    }
    const pages = $('pages');
    if (stage.children.length) {
      pages.replaceChildren(...stage.children);
    } else {
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = "Type a person's name and message on the left to see their page here.";
      pages.replaceChildren(p);
    }
    stage.remove();
    Scrapbook.scaleFrames(pages);
    updateCount(pages.querySelectorAll('.page').length);
    markCurrent(false);
  }

  function markCurrent(scroll) {
    let target = null;
    for (const fig of $('pages').querySelectorAll('.page')) {
      const on = Boolean(currentId) &&
        (fig.dataset.person === currentId || (fig.dataset.members || '').split(' ').includes(currentId));
      fig.classList.toggle('is-current', on);
      if (on && !target) target = fig;
    }
    if (scroll && target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------- events ---------- */

  for (const t of Scrapbook.templates) $('template').add(new Option(t.name, t.id));
  const prefs = loadPrefs();
  const fromHash = location.hash.slice(1);
  const known = (id) => Scrapbook.templates.some((t) => t.id === id);
  $('template').value = known(fromHash) ? fromHash : known(prefs.template) ? prefs.template : Scrapbook.templates[0].id;
  if (prefs.paper && Scrapbook.PAPER[prefs.paper]) $('paper').value = prefs.paper;
  if (typeof prefs.cover === 'boolean') $('cover').checked = prefs.cover;

  for (const id of ['template', 'paper', 'cover']) {
    $(id).addEventListener('change', () => {
      savePrefs();
      updateCount();
      if (id === 'template') renderList();
      renderPreview();
    });
  }

  // Set every person's look at once, or shuffle them.
  $('all-style').insertAdjacentHTML('beforeend', `
    <option value="book">Book design</option>
    <optgroup label="Shuffle">
      <option value="random-all">Random mix of everything</option>
      <option value="random-messages">Random message apps</option>
      <option value="random-designs">Random paper designs</option>
    </optgroup>
    <optgroup label="Messages">${optionList(MESSAGES)}</optgroup>
    <optgroup label="Paper designs">${optionList(DESIGNS)}</optgroup>`);

  const POOLS = { 'random-all': LOOKS, 'random-messages': MESSAGES, 'random-designs': DESIGNS };

  // Deal looks like cards: every look is used once before any repeats, and
  // the same look never lands on two pages in a row.
  function shuffleLooks(pool) {
    const ids = pool.map((t) => t.id);
    let deck = [];
    let previous = '';
    for (const p of book.entries) {
      if (!deck.length) {
        deck = [...ids];
        for (let k = deck.length - 1; k > 0; k--) {
          const j = Math.floor(Math.random() * (k + 1));
          [deck[k], deck[j]] = [deck[j], deck[k]];
        }
        if (deck.length > 1 && deck[0] === previous) deck.push(deck.shift());
      }
      p.style = deck.shift();
      previous = p.style;
    }
  }

  $('shuffle').addEventListener('click', () => {
    shuffleLooks(LOOKS);
    renderList();
    changed();
  });

  $('all-style').addEventListener('change', () => {
    const v = $('all-style').value;
    if (!v) return;
    if (POOLS[v]) shuffleLooks(POOLS[v]);
    else for (const p of book.entries) p.style = v === 'book' ? '' : v;
    $('all-style').value = '';
    renderList();
    changed();
  });
  $('print').addEventListener('click', () => window.print());

  // Cover fields
  document.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('input', () => {
      book[input.dataset.field] = input.value;
      changed();
    });
  });
  $('cover-photo').addEventListener('change', async (ev) => {
    if (ev.target.type !== 'file') return;
    const file = ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    try {
      book.coverPhoto = await readPhoto(file);
      showPhoto($('cover-photo'), book.coverPhoto);
      changed();
    } catch (err) {
      alert(err.message);
    }
  });
  $('cover-photo').querySelector('button.link').addEventListener('click', () => {
    book.coverPhoto = '';
    book.coverCaption = '';
    $('f-coverCaption').value = '';
    showPhoto($('cover-photo'), '');
    changed();
  });

  // People
  const people = $('people');
  people.addEventListener('input', (ev) => {
    const key = ev.target.dataset.key;
    const { li, p } = findPerson(ev.target);
    if (!key || !p) return;
    p[key] = ev.target.value;
    showWarning(li, p);
    if (key === 'group') showGroup(li, p);
    if (key === 'group' || key === 'name') updateGroupCounts();
    changed();
  });

  people.addEventListener('change', async (ev) => {
    if (ev.target.dataset.photo !== 'person') return;
    const { li, p } = findPerson(ev.target);
    const file = ev.target.files[0];
    ev.target.value = '';
    if (!p || !file) return;
    try {
      p.photo = await readPhoto(file);
      showPhoto(li.querySelector('.photo'), p.photo);
      changed();
    } catch (err) {
      alert(err.message);
    }
  });

  people.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-act]');
    if (!btn) return;
    const { li, p } = findPerson(btn);
    if (!p) return;
    const i = book.entries.indexOf(p);
    const act = btn.dataset.act;
    if (act === 'unphoto') {
      p.photo = '';
      p.caption = '';
      li.querySelector('[data-key="caption"]').value = '';
      showPhoto(li.querySelector('.photo'), '');
    } else if (act === 'remove') {
      const label = p.name.trim() ? `${p.name.trim()}'s page` : 'this person';
      if ((p.message.trim() || p.photo) && !confirm(`Remove ${label}? This can't be undone.`)) return;
      book.entries.splice(i, 1);
      renderList();
      updateGroupCounts();
    } else if (act === 'up' || act === 'down') {
      const j = act === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= book.entries.length) return;
      [book.entries[i], book.entries[j]] = [book.entries[j], book.entries[i]];
      renderList();
      const again = people.querySelector(`[data-id="${p.id}"] [data-act="${act}"]`);
      (again && !again.disabled ? again : people.querySelector(`[data-id="${p.id}"] input`)).focus();
    }
    changed();
  });

  people.addEventListener('focusin', (ev) => {
    const { p } = findPerson(ev.target);
    if (!p || p.id === currentId) return;
    currentId = p.id;
    markCurrent(true);
  });

  $('add').addEventListener('click', () => {
    const p = blankPerson();
    book.entries.push(p);
    renderList();
    const input = $('name-' + p.id);
    input.focus();
    input.closest('.person').scrollIntoView({ block: 'nearest' });
    changed();
  });

  // Group chats
  const groupsEl = $('groups');
  const findGroup = (el) => {
    const li = el.closest('.group');
    return li ? { li, g: book.groups.find((x) => x.id === li.dataset.gid) } : {};
  };

  groupsEl.addEventListener('input', (ev) => {
    const key = ev.target.dataset.gkey;
    const { g } = findGroup(ev.target);
    if (!key || !g) return;
    g[key] = ev.target.value;
    renderList(); // people's group menus show the name and look
    changed();
  });

  groupsEl.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-gact="remove"]');
    if (!btn) return;
    const { g } = findGroup(btn);
    if (!g) return;
    const members = book.entries.filter((e) => e.group === g.id);
    if (members.length && !confirm(`Remove the group chat "${groupLabel(g)}"? Its ${members.length} ${members.length === 1 ? 'person gets their own page' : 'people get their own pages'} again.`)) return;
    members.forEach((e) => { e.group = ''; });
    book.groups = book.groups.filter((x) => x !== g);
    renderGroups();
    renderList();
    changed();
  });

  $('add-group').addEventListener('click', () => {
    const g = { id: newGroupId(), name: '', style: GROUP_LOOKS[0].id };
    book.groups.push(g);
    renderGroups();
    renderList();
    $('gname-' + g.id).focus();
    changed();
  });

  // Files and starting points
  function replaceBook(next) {
    book = next;
    if (!book.entries.length) book.entries.push(blankPerson());
    currentId = null;
    fillCover();
    renderGroups();
    renderList();
    changed();
    renderPreview();
  }

  $('export').addEventListener('click', () => {
    const slug = (book.title.trim() || 'scrapbook').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scrapbook';
    const blob = new Blob([JSON.stringify(serialise(book), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  $('import').addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.entries)) throw new Error('it has no list of people ("entries").');
      if (hasContent(book) && !confirm('Replace what you have now with this file?')) return;
      replaceBook(normalise(data));
    } catch (err) {
      alert(`Couldn't open ${file.name}: ${err.message}`);
    }
  });

  $('example').addEventListener('click', () => {
    if (hasContent(book) && !confirm('Replace what you have now with the example messages?')) return;
    replaceBook(normalise(window.SAMPLE_BOOK));
  });

  $('reset').addEventListener('click', () => {
    if (hasContent(book) && !confirm('Clear the cover and every person? This can\'t be undone unless you saved a file.')) return;
    replaceBook(blankBook());
  });

  new ResizeObserver(() => Scrapbook.scaleFrames($('pages'))).observe($('preview'));

  // Start from what was saved in this browser, or a blank book with one person.
  (async () => {
    const saved = await store.get();
    book = saved && Array.isArray(saved.entries) ? normalise(saved) : blankBook();
    if (!book.entries.length) book.entries.push(blankPerson());
    fillCover();
    renderGroups();
    renderList();
    updateCount();
    renderPreview();
  })();
})();
