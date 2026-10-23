/* Corkboard: one big sticky note per person, pinned to a framed cork board. */
(function () {
  const ROT = [-1.2, 0.9, -0.5, 1.3, -0.9, 0.6];

  const pin = (k) => `<span class="cb-pin p${k % 4}"></span>`;

  Scrapbook.register({
    id: 'corkboard',
    name: 'Corkboard',
    bestFor: 'Office farewells, team thank-yous, big groups with short notes.',
    description: "Each person's message is written on a big sticky note and pinned to a framed cork board, with the note colour changing from page to page.",
    facts: {
      'Each page': 'One big sticky note, pinned to a framed cork board (colour varies by person)',
      Name: 'Signed in marker',
      Photo: 'A polaroid pinned above the note',
    },
    fonts: ['Gochi Hand', 'Permanent Marker'],
    fontFaces: ['400 16px "Gochi Hand"', '400 16px "Permanent Marker"'],

    pageHead({ book, u }) {
      return `<span class="page-title">${pin(0)}${u.esc(book.title)}</span>`;
    },

    folio(n) {
      return `p. ${n}`;
    },

    entry(e, { i }, { u }) {
      return `<article class="entry cb-entry${e.photo ? ' has-photo' : ''}${i % 2 ? ' cb-flip' : ''}" style="--r:${ROT[i % ROT.length]}deg">
        ${e.photo ? `<figure class="cb-polaroid">${pin(i + 1)}<img src="${u.esc(e.photo)}" alt=""><figcaption>${u.esc(e.caption || '')}</figcaption></figure>` : ''}
        <div class="cb-note n${i % 5}">
          ${pin(i)}
          <div class="entry-message" data-fit="2.4">${u.paragraphs(e.message)}</div>
          <p class="entry-name">${u.esc(e.name)}</p>
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
