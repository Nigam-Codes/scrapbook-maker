/* Corkboard: sticky notes and index cards pinned to a framed cork board. */
(function () {
  const ROT = [-2, 1.5, -0.8, 2.2, -1.6, 0.9];

  const pin = (k) => `<span class="cb-pin p${k % 4}"></span>`;

  Scrapbook.register({
    id: 'corkboard',
    name: 'Corkboard',
    bestFor: 'Office farewells, team thank-yous, big groups with short notes.',
    description: 'Short messages go on sticky notes, longer ones on ruled index cards, all pinned to a framed cork board. Good when lots of people each write a line or two.',
    facts: {
      'Per page': 'Up to 6 sticky notes',
      'Long messages': 'Ruled index card across the row (or two rows)',
      Photos: 'Pinned polaroid beside the note',
      'Last page': 'Spare cells become blank sticky notes to fill in by hand',
    },
    layout: { mode: 'units', capacity: 6 },
    fonts: ['Gochi Hand', 'Permanent Marker'],
    fontFaces: ['400 16px "Gochi Hand"', '400 16px "Permanent Marker"'],

    weight(e) {
      const n = Scrapbook.util.length(e);
      if (n > 320) return 4;
      return e.photo || n > 190 ? 2 : 1;
    },

    pageHead({ book, u }) {
      return `<span class="page-title">${pin(0)}${u.esc(book.title)}</span>`;
    },

    folio(n) {
      return `p. ${n}`;
    },

    entry(e, { i, w }, { u }) {
      const size = w >= 4 ? ' entry--wide entry--tall' : w >= 2 ? ' entry--wide' : '';
      const card = w >= 2 && !e.photo;
      return `<article class="entry cb-entry${size}" style="--r:${ROT[i % ROT.length]}deg">
        ${e.photo ? `<figure class="cb-polaroid">${pin(i + 1)}<img src="${u.esc(e.photo)}" alt=""><figcaption>${u.esc(e.caption || '')}</figcaption></figure>` : ''}
        <div class="cb-note ${card ? 'cb-card' : 'n' + (i % 5)}">
          ${pin(i)}${card ? pin(i + 2) : ''}
          <div class="entry-message" data-fit>${u.paragraphs(e.message)}</div>
          <p class="entry-name">${u.esc(e.name)}</p>
        </div>
      </article>`;
    },

    blank({ i }) {
      return `<article class="entry cb-entry cb-blank" style="--r:${ROT[i % ROT.length]}deg">
        <div class="cb-note n${i % 5}">
          ${pin(i)}
          <div class="entry-message"><p>Your note here</p></div>
          <p class="entry-name">&nbsp;</p>
        </div>
      </article>`;
    },

    cover({ book, count, u }) {
      return `<div class="cb-cover">
        ${book.coverPhoto ? `<figure class="cb-polaroid cb-cover-photo">${pin(1)}<img src="${u.esc(book.coverPhoto)}" alt=""><figcaption>${u.esc(book.coverCaption || '')}</figcaption></figure>` : ''}
        <div class="cb-note cb-card cb-cover-card">
          ${pin(0)}${pin(2)}
          ${book.occasion ? `<p class="cb-cover-occasion">${u.esc(book.occasion)}</p>` : ''}
          <h1 class="cover-title">${u.esc(book.title)}</h1>
          <p class="cb-cover-date">${u.esc(u.formatDate(book.date))}</p>
        </div>
        <div class="cb-note n0 cb-cover-note cb-cover-note--a">${pin(3)}<p>${count} notes inside</p></div>
        ${book.from ? `<div class="cb-note n1 cb-cover-note cb-cover-note--b">${pin(1)}<p>${u.esc(book.from)}</p></div>` : ''}
      </div>`;
    },
  });
})();
