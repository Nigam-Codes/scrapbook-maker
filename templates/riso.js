/* Riso Zine: two-colour risograph print, with overprinted inks and slight misregistration. */
(function () {
  // The same text printed twice: once per ink drum.
  const inks = (text) => `<span class="rz-a">${text}</span><span class="rz-b" aria-hidden="true">${text}</span>`;

  // Break a title into 2–4 lines of roughly even length for the cover.
  function titleLines(title) {
    const words = String(title || '').trim().split(/\s+/).filter(Boolean);
    if (words.length <= 4) return words;
    const lines = [];
    const target = Math.ceil(words.join(' ').length / 4);
    let line = '';
    for (const w of words) {
      if (line && (line + ' ' + w).length > target) { lines.push(line); line = w; }
      else line = line ? line + ' ' + w : w;
    }
    if (line) lines.push(line);
    return lines;
  }

  function burst(points = 14) {
    const pts = [];
    for (let k = 0; k < points * 2; k++) {
      const r = k % 2 ? 38 : 50;
      const a = (Math.PI * k) / points;
      pts.push(`${(50 + r * Math.sin(a)).toFixed(1)},${(50 - r * Math.cos(a)).toFixed(1)}`);
    }
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="${pts.join(' ')}"/></svg>`;
  }

  Scrapbook.register({
    id: 'riso',
    name: 'Riso Zine',
    bestFor: 'Birthdays, celebrations, friend groups.',
    description: 'A two-colour risograph zine in fluorescent pink and blue. Names print huge with the inks slightly out of register, and photos come out as blue duotones.',
    facts: {
      'Per page': '3 messages as full-width bands',
      'Long messages': 'Double band, set in two columns',
      Photos: 'Blue duotone with pink halftone',
      'Last page': 'Spare bands become blank ones to fill in by hand',
    },
    layout: { mode: 'units', capacity: 3 },
    fonts: ['Bricolage Grotesque:opsz,wdth,wght@12..96,75..100,400..800', 'DM Mono:wght@400;500'],
    fontFaces: ['800 40px "Bricolage Grotesque"', '400 12px "DM Mono"', '500 12px "DM Mono"'],

    weight(e) {
      return Scrapbook.util.length(e) > 440 ? 2 : 1;
    },

    pageHead({ book, u }) {
      return `<span>Issue 01</span><span class="page-title">${u.esc(book.title)}</span><span>${u.esc(u.formatDate(book.date, 'dots'))}</span>`;
    },

    folio(n) {
      return inks(`P.${String(n).padStart(2, '0')}`);
    },

    entry(e, { i, w }, { u }) {
      const cls = ['entry', 'rz-entry', i % 2 ? 'rz-entry--flip' : '', w >= 2 ? 'rz-entry--long' : '', e.photo ? 'has-photo' : '']
        .filter(Boolean).join(' ');
      return `<article class="${cls}">
        <h2 class="rz-name"><span class="rz-fit" data-fit-line="64">${inks(u.esc(e.name))}</span></h2>
        ${e.photo
          ? `<figure class="rz-photo"><img src="${u.esc(e.photo)}" alt=""></figure>`
          : `<span class="rz-dot rz-dot--${i % 3}" aria-hidden="true"></span>`}
        <div class="entry-message" data-fit>${u.paragraphs(e.message)}</div>
      </article>`;
    },

    blank({ i }) {
      return `<article class="entry rz-entry rz-blank${i % 2 ? ' rz-entry--flip' : ''}">
        <h2 class="rz-name"><span class="rz-fit" data-fit-line="64"><span class="rz-a">Your name</span></span></h2>
        <span class="rz-dot rz-dot--${i % 3}" aria-hidden="true"></span>
        <div class="entry-message" aria-hidden="true"></div>
      </article>`;
    },

    cover({ book, count, u }) {
      const lines = titleLines(book.title)
        .map((l, k) => `<span class="rz-line rz-line--${k % 2}" data-fit-line="260">${inks(u.esc(l))}</span>`)
        .join('');
      return `<div class="rz-cover">
        <p class="rz-cover-top"><span>Issue 01</span><span>${u.esc(book.occasion || '')}</span><span>${u.esc(u.formatDate(book.date, 'dots'))}</span></p>
        ${book.coverPhoto ? `<figure class="rz-photo rz-cover-photo"><img src="${u.esc(book.coverPhoto)}" alt=""></figure>` : '<span class="rz-dot rz-dot--big" aria-hidden="true"></span>'}
        <h1 class="cover-title">${lines}</h1>
        <div class="rz-burst">${burst()}<span><strong>${count}</strong>messages</span></div>
        ${book.from ? `<p class="rz-cover-from">${u.esc(book.from)}</p>` : ''}
      </div>`;
    },
  });
})();
