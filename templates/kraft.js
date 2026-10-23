/* Kraft & Washi: notes on mixed papers taped to kraft card, names on label-maker tape. */
(function () {
  const ROT = [-1.4, 1.1, -0.5, 1.6, -1, 0.6];

  function polaroid(u, src, caption, cls = '') {
    return `<figure class="k-polaroid ${cls}">
      <span class="k-tape k-tape--l"></span><span class="k-tape k-tape--r"></span>
      <img src="${u.esc(src)}" alt="">
      <figcaption>${u.esc(caption || '')}</figcaption>
    </figure>`;
  }

  Scrapbook.register({
    id: 'kraft',
    name: 'Kraft & Washi',
    bestFor: 'Any occasion. The classic hand-made scrapbook.',
    description: 'Each message is a note on its own scrap of paper, taped onto kraft card. Names are punched out on label-maker tape and photos become polaroids.',
    facts: {
      'Per page': 'Up to 6 notes in a 2 × 3 grid',
      'Long messages': 'Take a full row, or two rows if very long',
      Photos: 'Taped-down polaroid beside the note',
      'Last page': 'Spare cells become blank notes to fill in by hand',
    },
    layout: { mode: 'units', capacity: 6 },
    fonts: ['Caveat:wght@400;700', 'Courier Prime:wght@700'],
    fontFaces: ['400 16px Caveat', '700 16px Caveat', '700 12px "Courier Prime"'],

    weight(e) {
      const n = Scrapbook.util.length(e);
      if (n > 480) return 4;
      return e.photo || n > 210 ? 2 : 1;
    },

    pageHead({ book, u }) {
      return `<span class="page-title">${u.esc(book.title)}</span>`;
    },

    entry(e, { i, w }, { u }) {
      const size = w >= 4 ? ' entry--wide entry--tall' : w >= 2 ? ' entry--wide' : '';
      return `<article class="entry k-entry v${i % 4}${size}${e.photo ? ' has-photo' : ''}" style="--r:${ROT[i % ROT.length]}deg">
        ${e.photo ? polaroid(u, e.photo, e.caption) : ''}
        <div class="k-card">
          <span class="k-tape"></span>
          <div class="entry-message" data-fit>${u.paragraphs(e.message)}</div>
          <p class="entry-name"><span class="k-dymo">${u.esc(e.name)}</span></p>
        </div>
      </article>`;
    },

    blank({ i }) {
      return `<article class="entry k-entry k-blank v${i % 4}" style="--r:${ROT[i % ROT.length]}deg">
        <div class="k-card">
          <span class="k-tape"></span>
          <div class="entry-message"><p>Room for one more note</p></div>
          <p class="entry-name"><span class="k-dymo">&nbsp;</span></p>
        </div>
      </article>`;
    },

    cover({ book, count, u }) {
      return `<div class="k-cover">
        <p class="k-cover-for">for ${u.esc(book.recipient || '')}</p>
        ${book.coverPhoto ? polaroid(u, book.coverPhoto, book.coverCaption, 'k-cover-photo') : ''}
        <div class="k-cover-card">
          <div class="k-cover-paper" style="clip-path:${u.torn(3)}">
            ${book.occasion ? `<p><span class="k-dymo k-dymo--red">${u.esc(book.occasion)}</span></p>` : ''}
            <h1 class="cover-title">${u.esc(book.title)}</h1>
            ${book.from ? `<p class="k-cover-from">${u.esc(book.from)}</p>` : ''}
          </div>
          <span class="k-tape k-tape--a"></span><span class="k-tape k-tape--b"></span>
        </div>
        <div class="k-ticket">
          <span>Admit one</span>
          <strong>${count} notes inside</strong>
          <span>${u.esc(u.formatDate(book.date, 'stamp'))}</span>
        </div>
      </div>`;
    },
  });
})();
