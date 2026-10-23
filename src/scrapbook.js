/*
 * Scrapbook Maker: turns a book of messages into printable pages.
 *
 * A "book" is plain data (see samples/farewell.js). A "template" is a design that
 * knows how to draw a cover and one person's page; this file handles the rest:
 * loading the template's fonts, making one page per person, and sizing each
 * message so it fills its page without overflowing.
 */
(function () {
  'use strict';

  const templates = new Map();

  const PAPER = {
    a4: { id: 'a4', label: 'A4', w: 210, h: 297, css: 'A4' },
    letter: { id: 'letter', label: 'US Letter', w: 215.9, h: 279.4, css: 'letter' },
  };

  // Text is never shrunk below this fraction of its designed size.
  const MIN_FIT = 0.62;

  /* ---------- helpers shared with templates ---------- */

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  // Blank lines start a new paragraph; single line breaks are kept.
  function blocks(text) {
    return String(text ?? '')
      .trim()
      .split(/\n\s*\n/)
      .map((p) => esc(p.trim()).replace(/\n/g, '<br>'));
  }
  const paragraphs = (text) => blocks(text).map((b) => `<p>${b}</p>`).join('');

  function initial(name) {
    const m = String(name ?? '').match(/[\p{L}\p{N}]/u);
    return m ? m[0].toUpperCase() : '·';
  }

  const pad = (n, width = 2) => String(n).padStart(width, '0');
  const length = (entry) => String(entry?.message ?? '').trim().length;

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const ORDINAL = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth',
    nine: 'ninth', twelve: 'twelfth' };

  function words(n) {
    if (n < 20) return ONES[n];
    return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  }
  function ordinal(n) {
    const w = words(n);
    const parts = w.split('-');
    const last = parts.pop();
    const ord = ORDINAL[last] || (last.endsWith('y') ? last.slice(0, -1) + 'ieth' : last + 'th');
    return [...parts, ord].join('-');
  }

  function parseDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
  }

  // Dates are written the way each design would write them by hand.
  function formatDate(iso, style = 'long') {
    const p = parseDate(iso);
    if (!p) return String(iso ?? '');
    const month = MONTHS[p.m - 1];
    switch (style) {
      case 'short': return `${p.d} ${month.slice(0, 3)} ${p.y}`;
      case 'stamp': return `${p.d} ${month.slice(0, 3).toUpperCase()} ${p.y}`;
      case 'dots': return `${pad(p.d)}.${pad(p.m)}.${String(p.y).slice(2)}`;
      case 'words': {
        const year = p.y >= 2000 && p.y < 2100
          ? 'two thousand' + (p.y % 100 ? ' ' + words(p.y % 100) : '')
          : String(p.y);
        return `the ${ordinal(p.d)} of ${month}, ${year}`;
      }
      default: return `${p.d} ${month} ${p.y}`;
    }
  }

  // A deterministic torn-paper edge for clip-path, top and bottom.
  function torn(seed = 1, steps = 34, depth = 1.8) {
    let s = seed * 7919;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const top = [];
    const bottom = [];
    for (let k = 0; k <= steps; k++) top.push(`${((k / steps) * 100).toFixed(2)}% ${(rnd() * depth).toFixed(2)}mm`);
    for (let k = steps; k >= 0; k--) bottom.push(`${((k / steps) * 100).toFixed(2)}% calc(100% - ${(rnd() * depth).toFixed(2)}mm)`);
    return `polygon(${top.join(',')},${bottom.join(',')})`;
  }

  const util = { esc, blocks, paragraphs, initial, pad, length, parseDate, formatDate, torn };

  /* ---------- fonts ---------- */

  const requested = new Set();
  const timeout = (ms) => new Promise((r) => setTimeout(r, ms));

  async function loadFonts(tpl) {
    const fresh = (tpl.fonts || []).filter((f) => !requested.has(f));
    if (fresh.length) {
      fresh.forEach((f) => requested.add(f));
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?' +
        fresh.map((f) => 'family=' + f.replace(/ /g, '+')).join('&') + '&display=swap';
      const ready = new Promise((r) => { link.onload = r; link.onerror = r; });
      document.head.append(link);
      await Promise.race([ready, timeout(5000)]);
    }
    // Wait for the actual faces so measuring happens with the right metrics.
    // Offline, the fallback stacks in each template take over.
    const faces = (tpl.fontFaces || []).map((f) => document.fonts.load(f).catch(() => {}));
    await Promise.race([Promise.all(faces), timeout(5000)]);
  }

  /* ---------- layout ---------- */

  // Size a one-line headline to fill its parent's width. Fonts with optical
  // sizing change shape with size, so this converges over a few passes.
  function fitLine(el) {
    const max = parseFloat(el.dataset.fitLine) || 400;
    const avail = el.parentElement.clientWidth;
    let size = 100;
    el.style.fontSize = size + 'px';
    for (let pass = 0; pass < 5 && avail; pass++) {
      const w = el.offsetWidth;
      if (!w) return;
      const next = Math.min(max, (size * avail) / w);
      if (Math.abs(next - size) < 0.25) break;
      size = next;
      el.style.fontSize = size.toFixed(2) + 'px';
    }
    while (el.offsetWidth > avail && size > 6) {
      size *= 0.98;
      el.style.fontSize = size.toFixed(2) + 'px';
    }
  }

  // Find the largest text size that fits its box. data-fit="1.4" lets short
  // messages grow up to 1.4× the designed size; long ones shrink down to MIN_FIT.
  // Only height counts: text wraps sideways, and tilted photos inside the box
  // poke out a little without being a real overflow.
  function fitBox(el) {
    const max = parseFloat(el.dataset.fit) || 1;
    const set = (f) => el.style.setProperty('--fit', f.toFixed(3));
    const tooTall = () => el.scrollHeight > el.clientHeight + 1;
    set(max);
    if (!tooTall()) return;
    let lo = MIN_FIT;
    let hi = max;
    set(lo);
    if (tooTall()) return;
    for (let k = 0; k < 9; k++) {
      const mid = (lo + hi) / 2;
      set(mid);
      if (tooTall()) hi = mid;
      else lo = mid;
    }
    set(lo);
  }

  function fit(sheet) {
    sheet.querySelectorAll('[data-fit-line]').forEach(fitLine);
    sheet.querySelectorAll('[data-fit]').forEach(fitBox);
  }

  function shell(tpl, ctx, n) {
    const head = tpl.pageHead ? tpl.pageHead(ctx, n) : `<span class="page-title">${esc(ctx.book.title)}</span>`;
    const folio = tpl.folio ? tpl.folio(n, ctx) : String(n);
    return `<header class="page-head">${head}</header><div class="page-body"></div><footer class="folio">${folio}</footer>`;
  }

  /**
   * Render a book with a design: a cover, then one page per person. A person
   * whose entry has a `style` (another design, or a message look such as
   * 'imessage') gets that look for their page instead of the book's design.
   * opts.paper      'a4' | 'letter'
   * opts.place      (sheet, info) => void — attaches each sheet to the page (it must
   *                 be in the document so it can be measured). Defaults to opts.host.
   * opts.cover      draw the cover page (default true)
   * opts.coverOnly  only draw the cover
   */
  async function render(book, id, opts = {}) {
    const tpl = templates.get(id);
    if (!tpl) throw new Error(`Unknown template "${id}"`);
    const paper = PAPER[opts.paper] || PAPER.a4;

    const entries = (book.entries || []).filter((e) => e && String(e.message ?? '').trim());
    const pageTpl = (e) => (e.style && templates.get(e.style)) || tpl;
    const used = new Set([tpl, ...(opts.coverOnly ? [] : entries.map(pageTpl))]);
    await Promise.all([...used].map(loadFonts));

    const place = opts.place || ((s) => (opts.host || document.body).append(s));
    const sheets = [];
    const make = (t, kind, html, entry) => {
      const s = document.createElement('section');
      s.className = `sheet sheet--${kind} tpl-${t.id}${t.kind === 'message' ? ' sheet--msg' : ''}`;
      s.style.setProperty('--page-w', paper.w + 'mm');
      s.style.setProperty('--page-h', paper.h + 'mm');
      s.innerHTML = html;
      place(s, { kind, index: sheets.length, paper, entry, template: t });
      sheets.push(s);
      return s;
    };

    const ctx = { book, count: entries.length, paper, u: util };

    if (opts.cover !== false || opts.coverOnly) make(tpl, 'cover', tpl.cover(ctx));
    if (!opts.coverOnly) {
      entries.forEach((e, i) => {
        const t = pageTpl(e);
        const sheet = make(t, 'page', shell(t, ctx, i + 1), e);
        sheet.querySelector('.page-body').innerHTML = t.entry(e, { i, n: i + 1 }, ctx);
      });
    }
    // Photos without a fixed shape take their height from the image, so size
    // text only once they have loaded.
    const images = sheets.flatMap((s) => [...s.querySelectorAll('img')]).filter((img) => !img.complete);
    await Promise.race([Promise.all(images.map((img) => img.decode().catch(() => {}))), timeout(8000)]);
    sheets.forEach(fit);
    return sheets;
  }

  /* ---------- on-screen preview ---------- */

  // Wrap a sheet so it can be shown scaled to any width; print undoes the scale.
  function frame(paper) {
    const p = PAPER[paper] || paper || PAPER.a4;
    const f = document.createElement('div');
    f.className = 'sheet-frame';
    f.style.aspectRatio = `${p.w} / ${p.h}`;
    return f;
  }

  function scaleFrames(root = document) {
    root.querySelectorAll('.sheet-frame').forEach((f) => {
      const s = f.querySelector('.sheet');
      if (s && s.offsetWidth) f.style.setProperty('--k', (f.clientWidth / s.offsetWidth).toFixed(5));
    });
  }

  function register(def) {
    templates.set(def.id, def);
  }

  window.Scrapbook = {
    register,
    render,
    frame,
    scaleFrames,
    util,
    PAPER,
    // Book designs (with a cover) and per-person message looks.
    get templates() { return [...templates.values()].filter((t) => t.kind !== 'message'); },
    get messageStyles() { return [...templates.values()].filter((t) => t.kind === 'message'); },
  };
})();
