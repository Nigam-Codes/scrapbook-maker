/*
 * Message looks: a person's page drawn as if their message just arrived on
 * the recipient's screen, as a chat (iMessage, WhatsApp, Slack) or an email
 * (Gmail, Outlook). They are chosen per person in the editor and replace the
 * book's design for that page only. Recreated from layout, colour and type;
 * no logos are used.
 */
(function () {
  /* ---------- shared bits ---------- */

  const PALETTE = ['#e8710a', '#1a73e8', '#188038', '#d93025', '#9334e6', '#b06000', '#007b83', '#c5221f'];
  const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.codePointAt(0)) >>> 0, 7);
  const colour = (name) => PALETTE[hash(name) % PALETTE.length];

  function initials(name, count) {
    const letters = String(name || '').trim().split(/\s+/)
      .map((w) => (w.match(/[\p{L}\p{N}]/u) || [''])[0])
      .join('');
    return (letters.slice(0, count) || '·').toUpperCase();
  }

  // Each person gets a different, plausible sending time, spread through the day.
  function clock(i) {
    const mins = 9 * 60 + 12 + ((i * 47) % 540);
    return { h: Math.floor(mins / 60), m: mins % 60 };
  }
  const two = (n) => String(n).padStart(2, '0');
  const h12 = ({ h, m }) => `${((h + 11) % 12) + 1}:${two(m)} ${h < 12 ? 'AM' : 'PM'}`;
  const h24 = ({ h, m }) => `${two(h)}:${two(m)}`;
  const bare = ({ h, m }) => `${((h + 11) % 12) + 1}:${two(m)}`;

  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];

  function day(book, u) {
    const p = u.parseDate(book.date);
    if (!p) return null;
    const wd = new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
    return { ...p, weekday: WEEKDAYS[wd], month: MONTHS[p.m - 1] };
  }
  const nth = (d) => d + (d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th');

  // Simple line icons (24×24), drawn with the current text colour.
  const ICON_PATHS = {
    back: 'M15 5l-7 7 7 7',
    arrow: 'M20 12H5M11 6l-6 6 6 6',
    video: 'M3 7h12v10H3zM15 10l6-3v10l-6-3',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
    more: 'M12 5v.01M12 12v.01M12 19v.01',
    moreH: 'M5 12h.01M12 12h.01M19 12h.01',
    archive: 'M3 5h18v4H3zM5 9v10h14V9M10 13h4',
    report: 'M12 3l9 16H3zM12 10v4M12 17v.01',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
    star: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z',
    reply: 'M10 8L4 13l6 5M4 13h10a6 6 0 0 1 6 6',
    replyAll: 'M9 8l-6 5 6 5M14 8l-6 5 6 5M8 13h7a6 6 0 0 1 6 6',
    forward: 'M14 8l6 5-6 5M20 13H10a6 6 0 0 0-6 6',
    plus: 'M12 5v14M5 12h14',
    mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
    camera: 'M4 8h4l2-2h4l2 2h4v11H4zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    clip: 'M16 7l-7 7a2 2 0 0 0 3 3l7-7a4 4 0 0 0-6-6l-7 7a6 6 0 0 0 8 8l6-6',
    smile: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14a4.5 4.5 0 0 0 7 0M9 9.5v.01M15 9.5v.01',
    bold: 'M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z',
    italic: 'M14 5h-4M14 19h-4M13 5l-2 14',
    link: 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1',
    send: 'M4 12l16-8-6 16-3-7z',
    grid: 'M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
    chevron: 'M9 6l6 6-6 6',
    caret: 'M7 10l5 5 5-5',
  };
  const icon = (name, cls = '') =>
    `<svg class="mx-icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON_PATHS[name]}"/></svg>`;

  // Phone status bar: time, then signal, wifi and battery.
  function statusBar(time, notch) {
    return `<div class="ph-status">
      <span class="ph-time">${time}</span>
      <span class="ph-${notch}"></span>
      <span class="ph-sys" aria-hidden="true">
        <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".6"/><rect x="5" y="5.5" width="3" height="6.5" rx=".6"/><rect x="10" y="3" width="3" height="9" rx=".6"/><rect x="15" y="0" width="3" height="12" rx=".6"/></svg>
        <svg viewBox="0 0 16 12"><path d="M1 4.2a10 10 0 0 1 14 0M3.6 6.9a6.3 6.3 0 0 1 8.8 0M6.2 9.6a2.6 2.6 0 0 1 3.6 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        <svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="23" height="11" rx="3" fill="none" stroke="currentColor" stroke-opacity=".45"/><rect x="2" y="2" width="17" height="8" rx="1.6"/><rect x="24.5" y="4" width="1.8" height="4" rx=".9" opacity=".45"/></svg>
      </span>
    </div>`;
  }

  const photoAlt = (e, u) => u.esc(e.caption || `Photo from ${e.name}`);

  const common = {
    kind: 'message',
    pageHead: () => '',
  };

  /* ---------- iMessage ---------- */

  Scrapbook.register({
    ...common,
    id: 'imessage',
    name: 'iMessage',
    description: 'A phone screen with their message arriving in grey bubbles, their name and initials at the top.',
    fonts: ['Inter:wght@400;500;600'],
    fontFaces: ['400 16px Inter', '600 16px Inter'],

    entry(e, { i }, { book, u }) {
      const t = clock(i);
      const d = day(book, u);
      const when = d ? `${d.weekday.slice(0, 3)}, ${d.month.slice(0, 3)} ${d.d} at ${h12(t)}` : `Today ${h12(t)}`;
      const parts = u.blocks(e.message);
      return `<article class="entry mx-entry">
        <div class="ph"><div class="ph-screen">
          ${statusBar(bare(t), 'island')}
          <div class="im-head">
            ${icon('back', 'im-back')}
            <div class="im-contact">
              <span class="im-avatar">${u.esc(initials(e.name, 2))}</span>
              <span class="im-name">${u.esc(e.name)}${icon('chevron')}</span>
            </div>
            ${icon('video', 'im-video')}
          </div>
          <div class="im-thread entry-message" data-fit="2.3">
            <div class="im-stamp"><b>iMessage</b><br>${u.esc(when)}</div>
            ${e.photo ? `<div class="im-bubble im-photo"><img src="${u.esc(e.photo)}" alt="${photoAlt(e, u)}"></div>` : ''}
            ${e.photo && e.caption ? `<div class="im-bubble">${u.esc(e.caption)}</div>` : ''}
            ${parts.map((b, k) => `<div class="im-bubble${k === parts.length - 1 ? ' im-tail' : ''}">${b}</div>`).join('')}
          </div>
          <div class="im-input">
            <span class="im-plus">${icon('plus')}</span>
            <span class="im-field">iMessage${icon('mic')}</span>
          </div>
          <span class="ph-home"></span>
        </div></div>
      </article>`;
    },
  });

  /* ---------- WhatsApp ---------- */

  Scrapbook.register({
    ...common,
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'A phone screen with their message in white chat bubbles on the beige wallpaper, under a green header.',
    fonts: ['Roboto:wght@400;500'],
    fontFaces: ['400 16px Roboto', '500 16px Roboto'],

    entry(e, { i }, { book, u }) {
      const t = clock(i);
      const d = day(book, u);
      const parts = u.blocks(e.message);
      const time = `<span class="wa-time">${h24(t)}</span>`;
      return `<article class="entry mx-entry">
        <div class="ph ph--android"><div class="ph-screen">
          ${statusBar(h24(t), 'cam')}
          <div class="wa-head">
            ${icon('arrow', 'wa-back')}
            <span class="wa-avatar" style="background:${colour(e.name)}">${u.esc(initials(e.name, 1))}</span>
            <span class="wa-name">${u.esc(e.name)}</span>
            <span class="wa-actions">${icon('video')}${icon('phone')}${icon('more')}</span>
          </div>
          <div class="wa-thread entry-message" data-fit="2.3">
            ${d ? `<div class="wa-day">${d.d} ${d.month} ${d.y}</div>` : ''}
            ${e.photo ? `<div class="wa-msg wa-first wa-photo"><img src="${u.esc(e.photo)}" alt="${photoAlt(e, u)}">${e.caption ? `<span class="wa-cap">${u.esc(e.caption)}${time}</span>` : time}</div>` : ''}
            ${parts.map((b, k) => `<div class="wa-msg${k === 0 && !e.photo ? ' wa-first' : ''}">${b}${time}</div>`).join('')}
          </div>
          <div class="wa-input">
            <span class="wa-field">${icon('smile')}<span>Message</span>${icon('clip')}${icon('camera')}</span>
            <span class="wa-mic">${icon('mic')}</span>
          </div>
        </div></div>
      </article>`;
    },
  });

  /* ---------- Slack ---------- */

  Scrapbook.register({
    ...common,
    id: 'slack',
    name: 'Slack',
    description: 'A direct message in a desktop chat window: their avatar, name and time above the message.',
    fonts: ['Lato:wght@400;700;900'],
    fontFaces: ['400 16px Lato', '700 16px Lato', '900 16px Lato'],

    entry(e, { i }, { book, u }) {
      const t = clock(i);
      const d = day(book, u);
      const avatar = (cls) => `<span class="sk-avatar ${cls}" style="background:${colour(e.name)}">${u.esc(initials(e.name, 1))}</span>`;
      return `<article class="entry mx-entry">
        <div class="mx-win sk-win">
          <div class="sk-top">
            <span class="mx-lights"><i></i><i></i><i></i></span>
            <span class="sk-search">${icon('search')}Search</span>
          </div>
          <div class="sk-head">${avatar('sk-avatar--sm')}<b>${u.esc(e.name)}</b>${icon('caret')}</div>
          <div class="sk-thread entry-message" data-fit="2">
            ${d ? `<div class="sk-day"><span>${d.weekday}, ${d.month} ${nth(d.d)}</span></div>` : ''}
            <div class="sk-msg">
              ${avatar('')}
              <div class="sk-body">
                <p class="sk-meta"><b>${u.esc(e.name)}</b><span>${h12(t)}</span></p>
                ${u.blocks(e.message).map((b) => `<p class="sk-text">${b}</p>`).join('')}
                ${e.photo ? `<figure class="sk-file">${e.caption ? `<figcaption>${u.esc(e.caption)}</figcaption>` : ''}<img src="${u.esc(e.photo)}" alt="${photoAlt(e, u)}"></figure>` : ''}
              </div>
            </div>
          </div>
          <div class="sk-composer">
            <div class="sk-tools">${icon('bold')}${icon('italic')}${icon('link')}</div>
            <p>Message ${u.esc(e.name)}</p>
            <div class="sk-tools">${icon('plus')}${icon('smile')}<span class="sk-send">${icon('send')}</span></div>
          </div>
        </div>
      </article>`;
    },
  });

  /* ---------- Gmail ---------- */

  Scrapbook.register({
    ...common,
    id: 'gmail',
    name: 'Gmail',
    description: 'An email open in the inbox: subject, their name and letter avatar, "to me", then the message.',
    fonts: ['Roboto:wght@400;500'],
    fontFaces: ['400 16px Roboto', '500 16px Roboto'],

    entry(e, { i }, { book, u }) {
      const t = clock(i);
      const d = day(book, u);
      const when = d ? `${d.weekday.slice(0, 3)}, ${d.month.slice(0, 3)} ${d.d}, ${d.y}, ${h12(t)}` : h12(t);
      return `<article class="entry mx-entry">
        <div class="mx-win gm-win">
          <div class="gm-bar">
            ${icon('arrow')}<span class="gm-gap"></span>${icon('archive')}${icon('report')}${icon('trash')}
            <span class="gm-sep"></span>${icon('mail')}${icon('clock')}<span class="gm-gap"></span>${icon('more')}
          </div>
          <div class="gm-mail">
            <div class="gm-subject"><h1>${u.esc(book.title || '(no subject)')}</h1><span class="gm-chip">Inbox</span></div>
            <div class="gm-from">
              <span class="gm-avatar" style="background:${colour(e.name)}">${u.esc(initials(e.name, 1))}</span>
              <div class="gm-who">
                <p><b>${u.esc(e.name)}</b></p>
                <p class="gm-to">to me${icon('caret')}</p>
              </div>
              <div class="gm-when"><span>${u.esc(when)}</span>${icon('star')}${icon('reply')}${icon('more')}</div>
            </div>
            <div class="gm-body entry-message" data-fit="2">
              ${u.paragraphs(e.message)}
              ${e.photo ? `<figure class="mx-img"><img src="${u.esc(e.photo)}" alt="${photoAlt(e, u)}">${e.caption ? `<figcaption>${u.esc(e.caption)}</figcaption>` : ''}</figure>` : ''}
            </div>
            <div class="gm-actions"><span>${icon('reply')}Reply</span><span>${icon('forward')}Forward</span></div>
          </div>
        </div>
      </article>`;
    },
  });

  /* ---------- Outlook ---------- */

  Scrapbook.register({
    ...common,
    id: 'outlook',
    name: 'Outlook',
    description: 'An email in the reading pane under a blue top bar: subject, their initials, "To:" the recipient, then the message.',
    fonts: ['Open Sans:wght@400;600', 'Carlito:wght@400;700'],
    fontFaces: ['400 16px "Open Sans"', '600 16px "Open Sans"', '400 16px Carlito'],

    entry(e, { i }, { book, u }) {
      const t = clock(i);
      const d = day(book, u);
      const when = d ? `${d.weekday.slice(0, 3)} ${d.m}/${d.d}/${d.y} ${h12(t)}` : h12(t);
      return `<article class="entry mx-entry">
        <div class="mx-win ol-win">
          <div class="ol-top">${icon('grid', 'ol-grid')}<span class="ol-search">${icon('search')}Search</span></div>
          <div class="ol-read">
            <h1 class="ol-subject">${u.esc(book.title || '(No subject)')}</h1>
            <div class="ol-from">
              <span class="ol-avatar" style="background:${colour(e.name)}">${u.esc(initials(e.name, 2))}</span>
              <div class="ol-who">
                <p><b>${u.esc(e.name)}</b></p>
                <p class="ol-to">To: ${u.esc(book.recipient || 'You')}</p>
              </div>
              <div class="ol-side">
                <span class="ol-acts">${icon('reply')}${icon('replyAll')}${icon('forward')}${icon('moreH')}</span>
                <span class="ol-when">${u.esc(when)}</span>
              </div>
            </div>
            <div class="ol-body entry-message" data-fit="2">
              ${u.paragraphs(e.message)}
              ${e.photo ? `<figure class="mx-img"><img src="${u.esc(e.photo)}" alt="${photoAlt(e, u)}">${e.caption ? `<figcaption>${u.esc(e.caption)}</figcaption>` : ''}</figure>` : ''}
            </div>
          </div>
        </div>
      </article>`;
    },
  });
})();
