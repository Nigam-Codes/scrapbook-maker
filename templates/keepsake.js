/* Keepsake: one message per page, like fine stationery. Gilt rules, centred serif type, dates in words. */
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
    description: "Fine stationery: each person's message is centred on its own page in bottle-green serif type inside a double gilt rule. The cover writes the date out in words, as on an invitation.",
    facts: {
      'Each page': 'One message, centred, in bottle-green italic',
      Name: 'Small capitals between gilt rules, under a sprig',
      Photo: 'In an arched frame above the message',
    },
    fonts: ['Cormorant Garamond:ital,wght@0,300;0,500;1,300;1,400', 'Cormorant SC:wght@500;600'],
    fontFaces: ['300 16px "Cormorant Garamond"', '500 16px "Cormorant Garamond"', 'italic 300 16px "Cormorant Garamond"',
      'italic 400 16px "Cormorant Garamond"', '500 16px "Cormorant SC"', '600 16px "Cormorant SC"'],

    pageHead({ book, u }) {
      return `<span class="ks-mono">${u.esc(u.initial(book.recipient || book.title))}</span>`;
    },

    folio(n) {
      return roman(n);
    },

    entry(e, _, { u }) {
      return `<article class="entry ks-entry">
        ${e.photo ? `<figure class="ks-photo"><img src="${u.esc(e.photo)}" alt="">${e.caption ? `<figcaption>${u.esc(e.caption)}</figcaption>` : ''}</figure>` : ''}
        <div class="entry-message" data-fit="1.8">${u.paragraphs(e.message)}</div>
        <span class="ks-sprig" aria-hidden="true"></span>
        <p class="entry-name">${u.esc(e.name)}</p>
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
