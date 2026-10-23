/*
 * Message looks: a person's page drawn as if their message just arrived on
 * the recipient's screen, as a chat (iMessage, WhatsApp, Snapchat, Messenger,
 * Slack, Discord, Hike) or an inbox message (Gmail, Outlook, Canvas Inbox).
 * They are chosen per person in the editor and replace the book's design for
 * that page only. Looks with a group() can also show several people together
 * as a group chat. Recreated from layout, colour and type; no logos are used.
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
    image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
    thumb: 'M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 3.2 2.1L13 10h6a2 2 0 0 1 2 2.3l-1.4 6A2 2 0 0 1 17.6 20H7',
    plusCircle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v8M8 12h8',
    user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0',
    dashboard: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
    book: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11',
    calendar: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
    inbox: 'M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5',
    help: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.01',
    compose: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.3M18 14a6.5 6.5 0 0 1 3.5 6',
    at: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1',
    pin: 'M9 4h6l-1 5 3 3H7l3-3zM12 12v8',
    gift: 'M4 9h16v4H4zM6 13v7h12v-7M12 9v11M12 9C10 5 6 5 6 7.5S12 9 12 9zm0 0c2-4 6-4 6-1.5S12 9 12 9z',
    sticker: 'M5 4h9l5 5v11H5zM14 4v5h5M9 14a3.5 3.5 0 0 0 6 0',
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

  /* ---------- group chat helpers ---------- */

  // Distinct name colours for the people in one group chat.
  const MEMBER_COLOURS = ['#e542a3', '#1f7aec', '#02a698', '#d3396d', '#7f66ff', '#fa6533', '#a62c71', '#00838f'];
  const memberColour = (k) => MEMBER_COLOURS[k % MEMBER_COLOURS.length];

  const later = (t, mins) => {
    const total = t.h * 60 + t.m + mins;
    return { h: Math.floor(total / 60) % 24, m: total % 60 };
  };

  // In a group, messages arrive in order a few minutes apart.
  function groupTimes(all) {
    const start = clock(all[0].i);
    let mins = 0;
    return new Map(all.map((m, j) => {
      mins += j ? 3 + (hash(m.e.name) % 6) : 0;
      return [m, later(start, mins)];
    }));
  }

  const groupTitle = (g, all) => g.name || all.map((m) => m.e.name).join(', ');
  // The recipient is in the group too: it is their phone.
  const memberList = (all) => [...all.map((m) => m.e.name), 'You'].join(', ');

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

  // One person's messages: a photo first if there is one, then a bubble per
  // paragraph. In a group, the first bubble carries their name in colour.
  function waBubbles(e, t, u, label) {
    const time = `<span class="wa-time">${h24(t)}</span>`;
    const items = [...(e.photo ? [null] : []), ...u.blocks(e.message)];
    return items.map((b, j) => {
      const cls = `wa-msg${j === 0 ? ' wa-first' : ''}${b === null ? ' wa-photo' : ''}`;
      const name = j === 0 ? label : '';
      if (b === null) {
        return `<div class="${cls}">${name}<img src="${u.esc(e.photo)}" alt="${photoAlt(e, u)}">${e.caption ? `<span class="wa-cap">${u.esc(e.caption)}${time}</span>` : time}</div>`;
      }
      return `<div class="${cls}">${name}${b}${time}</div>`;
    }).join('');
  }

  function waScreen({ t, avatar, title, sub, thread }) {
    return `<article class="entry mx-entry">
      <div class="ph ph--android"><div class="ph-screen">
        ${statusBar(h24(t), 'cam')}
        <div class="wa-head">
          ${icon('arrow', 'wa-back')}
          ${avatar}
          <span class="wa-who"><span class="wa-name">${title}</span>${sub ? `<small class="wa-sub">${sub}</small>` : ''}</span>
          <span class="wa-actions">${icon('video')}${icon('phone')}${icon('more')}</span>
        </div>
        <div class="wa-thread entry-message" data-fit="2.3">${thread}</div>
        <div class="wa-input">
          <span class="wa-field">${icon('smile')}<span>Message</span>${icon('clip')}${icon('camera')}</span>
          <span class="wa-mic">${icon('mic')}</span>
        </div>
      </div></div>
    </article>`;
  }

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
      return waScreen({
        t,
        avatar: `<span class="wa-avatar" style="background:${colour(e.name)}">${u.esc(initials(e.name, 1))}</span>`,
        title: u.esc(e.name),
        thread: `${d ? `<div class="wa-day">${d.d} ${d.month} ${d.y}</div>` : ''}${waBubbles(e, t, u, '')}`,
      });
    },

    group(g, members, { part, all }, { book, u }) {
      const d = day(book, u);
      const times = groupTimes(all);
      const runs = members.map((m) => {
        const k = all.indexOf(m);
        const label = `<span class="wa-sender" style="color:${memberColour(k)}">${u.esc(m.e.name)}</span>`;
        return `<div class="wa-run">
          <span class="wa-avatar wa-avatar--sm" style="background:${colour(m.e.name)}">${u.esc(initials(m.e.name, 1))}</span>
          <div class="wa-run-msgs">${waBubbles(m.e, times.get(m), u, label)}</div>
        </div>`;
      }).join('');
      return waScreen({
        t: times.get(members[members.length - 1]),
        avatar: `<span class="wa-avatar wa-avatar--group">${icon('users')}</span>`,
        title: u.esc(groupTitle(g, all)),
        sub: u.esc(memberList(all)),
        thread: `${part === 1 && d ? `<div class="wa-day">${d.d} ${d.month} ${d.y}</div>` : ''}${runs}`,
      });
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
  /* ---------- Snapchat ---------- */

  Scrapbook.register({
    ...common,
    id: 'snapchat',
    name: 'Snapchat',
    description: 'A phone chat screen: their name in blue capitals above their messages, each marked with a blue line.',
    fonts: ['Nunito Sans:wght@400;600;800'],
    fontFaces: ['400 16px "Nunito Sans"', '600 16px "Nunito Sans"', '800 16px "Nunito Sans"'],

    entry(e, { i }, { book, u }) {
      const t = clock(i);
      const d = day(book, u);
      return `<article class="entry mx-entry">
        <div class="ph"><div class="ph-screen">
          ${statusBar(bare(t), 'island')}
          <div class="sc-head">
            ${icon('back', 'sc-back')}
            <span class="sc-avatar" style="background:${colour(e.name)}">${u.esc(initials(e.name, 1))}</span>
            <span class="sc-name">${u.esc(e.name)}</span>
            <span class="sc-actions">${icon('phone')}${icon('video')}</span>
          </div>
          <div class="sc-thread entry-message" data-fit="2.3">
            ${d ? `<div class="sc-day">${d.weekday}, ${d.month} ${d.d}</div>` : ''}
            <div class="sc-who">${u.esc(e.name)}</div>
            <div class="sc-group">
              ${e.photo ? `<div class="sc-photo"><img src="${u.esc(e.photo)}" alt="${photoAlt(e, u)}"></div>` : ''}
              ${e.photo && e.caption ? `<div class="sc-text">${u.esc(e.caption)}</div>` : ''}
              ${u.blocks(e.message).map((b) => `<div class="sc-text">${b}</div>`).join('')}
            </div>
          </div>
          <div class="sc-input">
            <span class="sc-cam">${icon('camera')}</span>
            <span class="sc-field">Send a chat</span>
            ${icon('mic')}${icon('smile')}
          </div>
          <span class="ph-home"></span>
        </div></div>
      </article>`;
    },
  });

  /* ---------- Messenger ---------- */

  Scrapbook.register({
    ...common,
    id: 'messenger',
    name: 'Messenger',
    description: 'A phone chat screen with their message in grey bubbles beside their small avatar, and blue icons.',
    fonts: ['Inter:wght@400;500;600'],
    fontFaces: ['400 16px Inter', '600 16px Inter'],

    entry(e, { i }, { book, u }) {
      const t = clock(i);
      const d = day(book, u);
      const when = d ? `${d.weekday.slice(0, 3).toUpperCase()} ${h12(t)}` : h12(t);
      const avatar = (cls) => `<span class="ms-avatar ${cls}" style="background:${colour(e.name)}">${u.esc(initials(e.name, 1))}</span>`;
      const bubbles = [
        ...(e.photo ? [`<div class="ms-bubble ms-photo"><img src="${u.esc(e.photo)}" alt="${photoAlt(e, u)}"></div>`] : []),
        ...(e.photo && e.caption ? [`<div class="ms-bubble">${u.esc(e.caption)}</div>`] : []),
        ...u.blocks(e.message).map((b) => `<div class="ms-bubble">${b}</div>`),
      ];
      return `<article class="entry mx-entry">
        <div class="ph"><div class="ph-screen">
          ${statusBar(bare(t), 'island')}
          <div class="ms-head">
            ${icon('back', 'ms-back')}
            ${avatar('ms-avatar--head')}
            <span class="ms-name">${u.esc(e.name)}</span>
            <span class="ms-actions">${icon('phone')}${icon('video')}</span>
          </div>
          <div class="ms-thread entry-message" data-fit="2.3">
            <div class="ms-stamp">${u.esc(when)}</div>
            <div class="ms-group">
              <div class="ms-bubbles">${bubbles.join('')}</div>
              ${avatar('')}
            </div>
          </div>
          <div class="ms-input">
            ${icon('plusCircle')}${icon('camera')}${icon('image')}${icon('mic')}
            <span class="ms-field">Aa${icon('smile')}</span>
            ${icon('thumb')}
          </div>
          <span class="ph-home"></span>
        </div></div>
      </article>`;
    },
  });

  /* ---------- Canvas Inbox ---------- */

  Scrapbook.register({
    ...common,
    id: 'canvas',
    name: 'Canvas Inbox',
    description: 'A message in the Canvas course inbox: subject, their initials and name "to" the recipient, then the message.',
    fonts: ['Lato:wght@400;700;900'],
    fontFaces: ['400 16px Lato', '700 16px Lato', '900 16px Lato'],

    entry(e, { i }, { book, u }) {
      const t = clock(i);
      const d = day(book, u);
      const ampm = h12(t).replace(' AM', 'am').replace(' PM', 'pm');
      const when = d ? `${d.month.slice(0, 3)} ${d.d}, ${d.y} at ${ampm}` : ampm;
      const nav = [['user', 'Account'], ['dashboard', 'Dashboard'], ['book', 'Courses'], ['calendar', 'Calendar'], ['inbox', 'Inbox'], ['help', 'Help']];
      return `<article class="entry mx-entry">
        <div class="mx-win cv-win">
          <nav class="cv-rail">
            ${nav.map(([ic, label]) => `<span class="cv-nav${label === 'Inbox' ? ' is-on' : ''}">${icon(ic)}<small>${label}</small></span>`).join('')}
          </nav>
          <div class="cv-main">
            <div class="cv-bar">
              <b>Inbox</b>
              <span class="cv-tools">${icon('compose')}${icon('reply')}${icon('replyAll')}${icon('archive')}${icon('trash')}</span>
            </div>
            <div class="cv-read">
              <h1 class="cv-subject">${u.esc(book.title || '(No subject)')}</h1>
              <div class="cv-from">
                <span class="cv-avatar">${u.esc(initials(e.name, 2))}</span>
                <div class="cv-who">
                  <p><b>${u.esc(e.name)}</b></p>
                  <p class="cv-to">to ${u.esc(book.recipient || 'you')}</p>
                </div>
                <div class="cv-side">
                  <span class="cv-when">${u.esc(when)}</span>
                  <span class="cv-reply">${icon('reply')}Reply</span>
                </div>
              </div>
              <div class="cv-body entry-message" data-fit="2">
                ${u.paragraphs(e.message)}
                ${e.photo ? `<figure class="mx-img"><img src="${u.esc(e.photo)}" alt="${photoAlt(e, u)}">${e.caption ? `<figcaption>${icon('clip')}${u.esc(e.caption)}</figcaption>` : ''}</figure>` : ''}
              </div>
            </div>
          </div>
        </div>
      </article>`;
    },
  });
  /* ---------- Discord ---------- */

  // Discord's default avatar colours.
  const DISCORD_COLOURS = ['#5865f2', '#3ba55c', '#faa61a', '#ed4245', '#eb459f', '#757e8a'];

  function discordPage({ title, dm, members, all, part }, { book, u }) {
    const d = day(book, u);
    const times = groupTimes(all);
    const stamp = (t) => (d ? `${d.m}/${d.d}/${d.y} ${h12(t)}` : h12(t));
    const avatar = (m, cls = '') =>
      `<span class="dc-avatar ${cls}" style="background:${DISCORD_COLOURS[all.indexOf(m) % DISCORD_COLOURS.length]}">${u.esc(initials(m.e.name, 1))}</span>`;
    const runs = members.map((m) => `<div class="dc-msg">
        ${avatar(m)}
        <div class="dc-body">
          <p class="dc-meta"><b>${u.esc(m.e.name)}</b><span>${stamp(times.get(m))}</span></p>
          ${u.blocks(m.e.message).map((b) => `<p class="dc-text">${b}</p>`).join('')}
          ${m.e.photo ? `<figure class="dc-file"><img src="${u.esc(m.e.photo)}" alt="${photoAlt(m.e, u)}">${m.e.caption ? `<figcaption>${u.esc(m.e.caption)}</figcaption>` : ''}</figure>` : ''}
        </div>
      </div>`).join('');
    return `<article class="entry mx-entry">
      <div class="mx-win dc-win">
        <div class="dc-top"><span class="mx-lights"><i></i><i></i><i></i></span></div>
        <div class="dc-main">
          <div class="dc-chat">
            <div class="dc-head">
              ${dm ? icon('at', 'dc-hicon') : `<span class="dc-gicon">${icon('users')}</span>`}
              <b>${u.esc(title)}</b>
              <span class="dc-hacts">${icon('phone')}${icon('video')}${icon('pin')}${dm ? '' : icon('users')}</span>
            </div>
            <div class="dc-thread entry-message" data-fit="2">
              ${part === 1 && d ? `<div class="dc-day"><span>${d.month} ${d.d}, ${d.y}</span></div>` : ''}
              ${runs}
            </div>
            <div class="dc-input">${icon('plusCircle')}<span>Message ${dm ? '@' : ''}${u.esc(title)}</span>${icon('gift')}${icon('sticker')}${icon('smile')}</div>
          </div>
          ${dm ? '' : `<aside class="dc-members">
            <p>Members — ${all.length + 1}</p>
            ${all.map((m) => `<span class="dc-member">${avatar(m, 'dc-avatar--sm')}${u.esc(m.e.name)}</span>`).join('')}
            <span class="dc-member"><span class="dc-avatar dc-avatar--sm dc-avatar--you">${u.esc(initials(book.recipient || 'You', 1))}</span>${u.esc(book.recipient || 'You')}</span>
          </aside>`}
        </div>
      </div>
    </article>`;
  }

  Scrapbook.register({
    ...common,
    id: 'discord',
    name: 'Discord',
    description: 'A dark desktop chat: their avatar, name and timestamp above each message. Groups list their members on the right.',
    fonts: ['Noto Sans:wght@400;500;600;700'],
    fontFaces: ['400 16px "Noto Sans"', '600 16px "Noto Sans"', '700 16px "Noto Sans"'],

    entry(e, { i }, ctx) {
      const one = [{ e, i }];
      return discordPage({ title: e.name, dm: true, members: one, all: one, part: 1 }, ctx);
    },

    group(g, members, { part, all }, ctx) {
      return discordPage({ title: groupTitle(g, all), members, all, part }, ctx);
    },
  });

  /* ---------- Hike ---------- */

  function hikePage({ title, sub, avatar, members, all, part, group }, { book, u }) {
    const d = day(book, u);
    const times = groupTimes(all);
    const runs = members.map((m) => {
      const t = times.get(m);
      const k = all.indexOf(m);
      const time = `<span class="hk-time">${h12(t)}</span>`;
      const name = group ? `<b class="hk-sender" style="color:${memberColour(k)}">${u.esc(m.e.name)}</b>` : '';
      const items = [...(m.e.photo ? [null] : []), ...u.blocks(m.e.message)];
      const bubbles = items.map((b, j) => {
        const label = j === 0 ? name : '';
        if (b === null) {
          return `<div class="hk-msg hk-photo">${label}<img src="${u.esc(m.e.photo)}" alt="${photoAlt(m.e, u)}">${m.e.caption ? `<span class="hk-cap">${u.esc(m.e.caption)}</span>` : ''}${time}</div>`;
        }
        return `<div class="hk-msg">${label}${b}${time}</div>`;
      }).join('');
      return group
        ? `<div class="hk-run"><span class="hk-avatar hk-avatar--sm" style="background:${colour(m.e.name)}">${u.esc(initials(m.e.name, 1))}</span><div class="hk-run-msgs">${bubbles}</div></div>`
        : bubbles;
    }).join('');
    const last = times.get(members[members.length - 1]);
    return `<article class="entry mx-entry">
      <div class="ph ph--android"><div class="ph-screen">
        ${statusBar(bare(last), 'cam')}
        <div class="hk-head">
          ${icon('arrow', 'hk-back')}
          ${avatar}
          <span class="hk-who"><b>${u.esc(title)}</b>${sub ? `<small>${u.esc(sub)}</small>` : ''}</span>
          <span class="hk-actions">${icon('phone')}${icon('more')}</span>
        </div>
        <div class="hk-thread entry-message" data-fit="2.3">
          ${part === 1 && d ? `<div class="hk-day">${d.d} ${d.month.slice(0, 3)} ${d.y}</div>` : ''}
          ${runs}
        </div>
        <div class="hk-input">
          <span class="hk-field">${icon('smile')}<span>Type a message</span>${icon('sticker')}</span>
          <span class="hk-send">${icon('mic')}</span>
        </div>
      </div></div>
    </article>`;
  }

  Scrapbook.register({
    ...common,
    id: 'hike',
    name: 'Hike',
    description: 'A phone chat under a bright blue header, with rounded white bubbles. In groups each bubble is signed with a coloured name.',
    fonts: ['Roboto:wght@400;500;700'],
    fontFaces: ['400 16px Roboto', '500 16px Roboto', '700 16px Roboto'],

    entry(e, { i }, ctx) {
      const one = [{ e, i }];
      const avatar = `<span class="hk-avatar" style="background:${colour(e.name)}">${ctx.u.esc(initials(e.name, 1))}</span>`;
      return hikePage({ title: e.name, avatar, members: one, all: one, part: 1 }, ctx);
    },

    group(g, members, { part, all }, ctx) {
      const avatar = `<span class="hk-avatar hk-avatar--group">${icon('users')}</span>`;
      return hikePage({ title: groupTitle(g, all), sub: `${all.length + 1} members`, avatar, members, all, part, group: true }, ctx);
    },
  });
})();
