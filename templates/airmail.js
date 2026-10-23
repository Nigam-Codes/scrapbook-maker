/* Airmail: each person's message is a typed airmail letter with its own stamp and postmark. */
(function () {
  let uid = 0;

  // Round postmark with the occasion and place set around the ring, plus cancel waves.
  function postmark(ring, top, bottom, u) {
    const id = `am-ring-${++uid}`;
    const waves = [26, 38, 50, 62, 74]
      .map((y) => `<path d="M104 ${y} q9 -6 18 0 t18 0 t18 0 t18 0 t18 0 t18 0"/>`)
      .join('');
    return `<svg class="am-postmark" viewBox="0 0 214 100" aria-hidden="true">
      <defs><path id="${id}" d="M50,50 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0"/></defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2.4"/>
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <text font-size="9" letter-spacing="1.5" fill="currentColor"><textPath href="#${id}">${u.esc(ring)}</textPath></text>
      <text x="50" y="49" text-anchor="middle" font-size="11.5" font-weight="700" fill="currentColor">${u.esc(top)}</text>
      <text x="50" y="62" text-anchor="middle" font-size="9.5" fill="currentColor">${u.esc(bottom)}</text>
      <g fill="none" stroke="currentColor" stroke-width="2.4">${waves}</g>
    </svg>`;
  }

  function ringText(book, u) {
    const bits = [book.occasion, book.place, u.formatDate(book.date, 'stamp')].filter(Boolean);
    const one = bits.join(' · ').toUpperCase() + ' · ';
    // Repeat to wrap the whole ring.
    return one.length < 34 ? one + one : one;
  }

  function stamp(u, { photo, letter, no, big }) {
    const inner = photo
      ? `<img src="${u.esc(photo)}" alt="">`
      : `<span class="am-stamp-top">Par avion</span><span class="am-stamp-ini">${u.esc(letter)}</span><span class="am-stamp-no">${u.esc(no)}</span>`;
    return `<div class="am-stamp${photo ? ' am-stamp--photo' : ''}${big ? ' am-stamp--big' : ''}"><div class="am-stamp-in">${inner}</div></div>`;
  }

  function dateParts(book, u) {
    const s = u.formatDate(book.date, 'stamp').split(' ');
    return s.length === 3 ? [`${s[0]} ${s[1]}`, s[2]] : [s.join(' '), ''];
  }

  Scrapbook.register({
    id: 'airmail',
    name: 'Airmail',
    bestFor: 'Farewells, moves abroad, long-distance friends.',
    description: "Each person's message is a typed airmail letter on blue onionskin, inside a striped airmail border, with its own stamp and postmark.",
    facts: {
      'Each page': 'A typed letter, addressed to the recipient',
      Name: 'Signed by hand at the bottom',
      Photo: 'A print tucked in above the letter',
    },
    fonts: ['Special Elite', 'Caveat:wght@400;700', 'Courier Prime:wght@400;700'],
    fontFaces: ['400 12px "Special Elite"', '400 16px Caveat', '700 16px Caveat', '400 10px "Courier Prime"', '700 10px "Courier Prime"'],

    pageHead({ book, u }) {
      return `<span class="am-label">Par avion</span><span class="page-title">${u.esc(book.title)}</span>`;
    },

    folio(n) {
      return `No. ${String(n).padStart(2, '0')}`;
    },

    entry(e, { i, n }, { book, u }) {
      const [top, bottom] = dateParts(book, u);
      return `<article class="entry am-letter c${i % 4}">
        <div class="am-top">
          <div class="am-address">
            <span class="am-to">To</span>
            <p>${u.esc(book.recipient || book.title)}</p>
            <p>${u.esc(book.place || '')}</p>
          </div>
          <div class="am-franking">
            ${stamp(u, { letter: u.initial(e.name), no: `No. ${u.pad(n)}` })}
            ${postmark(ringText(book, u), top, bottom, u)}
          </div>
        </div>
        ${e.photo ? `<figure class="am-snap"><img src="${u.esc(e.photo)}" alt="">${e.caption ? `<figcaption>${u.esc(e.caption)}</figcaption>` : ''}</figure>` : ''}
        <div class="entry-message" data-fit="2">${u.paragraphs(e.message)}</div>
        <p class="entry-name">${u.esc(e.name)}</p>
      </article>`;
    },

    cover({ book, count, u }) {
      const [top, bottom] = dateParts(book, u);
      return `<div class="am-cover">
        <h1 class="cover-title">${u.esc(book.title)}</h1>
        <div class="am-envelope">
          <div class="am-env-in">
            <p class="am-env-from">${u.esc(book.from || '')}</p>
            <span class="am-label am-env-label">Par avion<br>By air mail</span>
            <div class="am-env-stamps">
              ${stamp(u, { letter: u.initial(book.recipient || book.title), no: book.occasion || '' })}
              ${book.coverPhoto ? stamp(u, { photo: book.coverPhoto, big: true }) : ''}
            </div>
            ${postmark(ringText(book, u), top, bottom, u)}
            <div class="am-address am-env-address">
              <span class="am-to">To</span>
              <p>${u.esc(book.recipient || '')}</p>
              <p>${u.esc(book.place || '')}</p>
            </div>
          </div>
        </div>
        <p class="am-cover-meta">${count} letters · ${u.esc(u.formatDate(book.date))}</p>
      </div>`;
    },
  });
})();
