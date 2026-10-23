/* Kraft & Washi: each person's message on its own scrap of paper, taped to kraft card. */
(function () {
  const ROT = [-0.9, 0.7, -0.4, 1, -0.7, 0.5];

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
    description: "Each person's message is a big note on its own scrap of paper, washi-taped onto kraft card. Their name is punched out on label-maker tape.",
    facts: {
      'Each page': 'One note on dot-grid, graph or coloured paper (it varies by person)',
      Name: 'Label-maker tape',
      Photo: 'A taped-down polaroid above the note',
    },
    fonts: ['Caveat:wght@400;700', 'Courier Prime:wght@700'],
    fontFaces: ['400 16px Caveat', '700 16px Caveat', '700 12px "Courier Prime"'],

    pageHead({ book, u }, n) {
      return `<span class="page-title">${u.esc(book.title)}</span><span class="k-dymo">No. ${u.pad(n)}</span>`;
    },

    entry(e, { i }, { u }) {
      return `<article class="entry k-entry v${i % 4}${e.photo ? ' has-photo' : ''}${i % 2 ? ' k-flip' : ''}" style="--r:${ROT[i % ROT.length]}deg">
        ${e.photo ? polaroid(u, e.photo, e.caption) : ''}
        <div class="k-card">
          <span class="k-tape"></span>
          <div class="entry-message" data-fit="2.4">${u.paragraphs(e.message)}</div>
          <p class="entry-name"><span class="k-dymo">${u.esc(e.name)}</span></p>
        </div>
      </article>`;
    },

    cover({ book, count, u }) {
      return `<div class="k-cover">
        ${book.recipient ? `<p class="k-cover-for">for ${u.esc(book.recipient)}</p>` : ''}
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
