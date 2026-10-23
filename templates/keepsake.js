/* Keepsake: fine stationery. Centred serif type, gilt rules, dates written out in words. */
(function () {
  const ROMAN = [['m', 1000], ['cm', 900], ['d', 500], ['cd', 400], ['c', 100], ['xc', 90],
    ['l', 50], ['xl', 40], ['x', 10], ['ix', 9], ['v', 5], ['iv', 4], ['i', 1]];
  function roman(n) {
    let out = '';
    for (const [s, v] of ROMAN) while (n >= v) { out += s; n -= v; }
    return out;
  }

  Scrapbook.register({
    id: 'keepsake',
    name: 'Keepsake',
    bestFor: 'Weddings, retirements, memorials, milestone birthdays.',
    description: 'Fine stationery: centred serif type in bottle-green ink, gilt rules, photos in arched frames, and the date written out in words, as on an invitation.',
    facts: {
      'Per page': '2 messages, separated by a sprig',
      'Long messages': 'A page of their own',
      Photos: 'Arched frame, one message per page',
      'Last page': 'A spare half becomes ruled lines for a handwritten message',
    },
    layout: { mode: 'units', capacity: 2 },
    fonts: ['Cormorant Garamond:ital,wght@0,300;0,500;1,300;1,400', 'Cormorant SC:wght@500;600'],
    fontFaces: ['300 16px "Cormorant Garamond"', '500 16px "Cormorant Garamond"', 'italic 300 16px "Cormorant Garamond"',
      'italic 400 16px "Cormorant Garamond"', '500 16px "Cormorant SC"', '600 16px "Cormorant SC"'],

    weight(e) {
      return e.photo || Scrapbook.util.length(e) > 480 ? 2 : 1;
    },

    pageHead({ book, u }) {
      return `<span class="ks-mono">${u.esc(u.initial(book.recipient || book.title))}</span>`;
    },

    folio(n) {
      return roman(n);
    },

    entry(e, { w }, { u }) {
      return `<article class="entry ks-entry${w >= 2 ? ' ks-entry--full' : ''}">
        ${e.photo ? `<figure class="ks-photo"><img src="${u.esc(e.photo)}" alt="">${e.caption ? `<figcaption>${u.esc(e.caption)}</figcaption>` : ''}</figure>` : ''}
        <div class="entry-message" data-fit>${u.paragraphs(e.message)}</div>
        <p class="entry-name">${u.esc(e.name)}</p>
      </article>`;
    },

    blank() {
      return `<article class="entry ks-entry ks-blank">
        <p class="ks-prompt">A few words of your own</p>
        <div class="ks-lines" aria-hidden="true"></div>
        <p class="entry-name"><span class="ks-sign"></span></p>
      </article>`;
    },

    cover({ book, count, u }) {
      return `<div class="ks-cover">
        ${book.occasion ? `<p class="ks-occasion">${u.esc(book.occasion)}</p>` : ''}
        <h1 class="cover-title">${u.esc(book.title)}</h1>
        ${book.coverPhoto
          ? `<figure class="ks-photo ks-cover-photo"><img src="${u.esc(book.coverPhoto)}" alt=""></figure>`
          : `<span class="ks-mono ks-mono--big">${u.esc(u.initial(book.recipient || book.title))}</span>`}
        ${book.from ? `<p class="ks-from">${u.esc(book.from)}</p>` : ''}
        <span class="ks-sprig" aria-hidden="true"></span>
        <p class="ks-date">${u.esc(u.formatDate(book.date, 'words'))}</p>
        <p class="ks-count">${count} messages</p>
      </div>`;
    },
  });
})();
