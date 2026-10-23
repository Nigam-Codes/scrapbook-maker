/* Notebook: one wide-ruled page per person, written on the lines in their own pen and hand. */
(function () {
  const DOODLES = [
    // star
    '<path d="M12 2l2.9 6.3 6.8.7-5.1 4.6 1.5 6.7L12 16.9 5.9 20.3l1.5-6.7L2.3 9l6.8-.7z"/>',
    // heart
    '<path d="M12 20s-7.5-4.6-9.2-9.1C1.6 7.5 4 4.5 7 4.5c2 0 3.6 1.2 5 3 1.4-1.8 3-3 5-3 3 0 5.4 3 4.2 6.4C19.5 15.4 12 20 12 20z"/>',
    // smiley
    '<circle cx="12" cy="12" r="9.5"/><path d="M8 14.5c2.2 2.6 5.8 2.6 8 0M9 9.5v.5M15 9.5v.5"/>',
    // squiggle arrow
    '<path d="M2 15c3-5 5 3 8-2s5 3 8-2M14 7l5 2-1.5 5"/>',
    // flower
    '<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C10 4 14 4 12 9.5M14.5 12c5.5-2 5.5 2 0 0M12 14.5c2 5.5-2 5.5 0 0M9.5 12C4 14 4 10 9.5 12"/>',
  ];

  const doodle = (k) =>
    `<svg class="nb-doodle" viewBox="0 0 24 24" aria-hidden="true">${DOODLES[k % DOODLES.length]}</svg>`;

  Scrapbook.register({
    id: 'notebook',
    name: 'Notebook',
    bestFor: 'Teachers, classmates, kids, casual groups.',
    description: "Wide-ruled school paper with a red margin and punched holes. Each person's page is written on the lines in a different pen and hand, with their name highlighted and a doodle beside it.",
    facts: {
      'Each page': 'A wide-ruled notebook page, written on the lines in its own pen and hand',
      Name: 'Highlighted, with a doodle beside it',
      Photo: 'Taped in, with the writing wrapping around it',
    },
    fonts: ['Kalam:wght@400;700', 'Caveat:wght@400;700', 'Gochi Hand'],
    fontFaces: ['400 16px Kalam', '700 16px Kalam', '400 16px Caveat', '700 16px Caveat', '400 16px "Gochi Hand"'],

    pageHead({ book, u }) {
      return `<span class="page-title">${u.esc(book.title)}</span><span>${u.esc(u.formatDate(book.date, 'short'))}</span>`;
    },

    folio(n) {
      return `pg. ${n}`;
    },

    entry(e, { i }, { u }) {
      return `<article class="entry nb-entry hand${i % 3} ink${i % 5}" data-fit="1.3">
        ${e.photo ? `<figure class="nb-photo"><img src="${u.esc(e.photo)}" alt="">${e.caption ? `<figcaption>${u.esc(e.caption)}</figcaption>` : ''}</figure>` : ''}
        <p class="entry-name"><mark>${u.esc(e.name)}</mark>${doodle(i)}</p>
        <div class="entry-message">${u.paragraphs(e.message)}</div>
      </article>`;
    },

    cover({ book, count, u }) {
      return `<div class="nb-cover">
        <div class="nb-label">
          <p class="nb-label-head">Composition Book</p>
          <p class="nb-label-title">${u.esc(book.title)}</p>
          <p class="nb-field"><span>Name</span><b>${u.esc(book.recipient || '')}</b></p>
          <p class="nb-field"><span>Subject</span><b>${u.esc(book.occasion || '')}</b></p>
          <p class="nb-field"><span>From</span><b>${u.esc(book.from || '')}</b></p>
          <p class="nb-label-foot"><span>${count} notes</span><span>Wide ruled 8.7 mm</span><span>${u.esc(u.formatDate(book.date, 'short'))}</span></p>
        </div>
        ${book.coverPhoto ? `<figure class="nb-photo nb-cover-photo"><img src="${u.esc(book.coverPhoto)}" alt="">${book.coverCaption ? `<figcaption>${u.esc(book.coverCaption)}</figcaption>` : ''}</figure>` : ''}
      </div>`;
    },
  });
})();
