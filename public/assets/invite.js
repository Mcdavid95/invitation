import { FONTS, INTROS, monogramOf, inviteTitle, SAMPLE } from './schema.js';
import { SCENE_ART, FRAME_ART } from './scenes.js';

const SVG = 'http://www.w3.org/2000/svg';
const root = document.getElementById('root');
const pad = (n) => String(n).padStart(2, '0');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// Read straight from the string so the viewer's time zone can never shift the day.
const longDate = (iso) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

function h(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k in n) n[k] = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  n.append(...kids.flat(Infinity).filter((x) => x != null && x !== false));
  return n;
}
function use(id, cls, viewBox) {
  const svg = document.createElementNS(SVG, 'svg');
  if (cls) svg.setAttribute('class', cls);
  if (viewBox) svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-hidden', 'true');
  for (const item of [].concat(id)) {
    const [ref, attrs = {}] = [].concat(item);
    const u = document.createElementNS(SVG, 'use');
    u.setAttribute('href', `#${ref}`);
    for (const [k, v] of Object.entries(attrs)) u.setAttribute(k, v);
    svg.append(u);
  }
  return svg;
}
const divider = (cls = '') => use('divider', `divider ${cls}`);
const heading = (text) => (text ? [h('h2', { class: 'script', text }), divider()] : []);
const para = (text, cls) => (text ? h('p', { class: `pre ${cls ?? ''}`, text }) : null);
const mono = (cfg, cls) => {
  const [a, b] = monogramOf(cfg);
  if (!a) return null;
  return h('p', { class: `mono ${cls}` }, a, b ? h('small', { text: '&' }) : null, b);
};

function mediaEl(m, cls = 'media') {
  if (!m) return null;
  const el = m.kind === 'video'
    ? h('video', { src: m.url, muted: true, loop: true, autoplay: true, playsInline: true, preload: 'metadata' })
    : h('img', { src: m.url, alt: '', loading: 'lazy' });
  return cls === 'media' ? h('figure', { class: 'media' }, el) : (el.classList.add(cls), el);
}

/* ---------- Theme ---------- */
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const mix = (a, b, t) => '#' + [1, 3, 5].map((i) => pad(Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16))).join('');

function applyTheme(theme) {
  const st = document.documentElement.style;
  for (const k of ['bg', 'paper', 'accent', 'text']) st.setProperty(`--${k}`, theme[k]);
  st.setProperty('--on-accent', lum(theme.accent) > 0.45 ? '#221a0c' : '#ffffff');
  const font = FONTS[theme.fonts] ?? FONTS.classic;
  st.setProperty('--script', `'${font.script}'`);
  st.setProperty('--body', `'${font.body}'`);
  st.setProperty('--caps', `'${font.caps}'`);
  st.setProperty('--fs', `${font.size}px`);
  const href = `https://fonts.googleapis.com/css2?family=${font.q}&family=Amiri&display=swap`;
  const link = document.getElementById('fonts');
  if (link.getAttribute('href') !== href) link.setAttribute('href', href);
  document.querySelector('meta[name=theme-color]')?.remove();
  document.head.append(h('meta', { name: 'theme-color', content: theme.bg }));
}

/* ---------- State that outlives a render ---------- */
let ticker = 0;
let audio = null;
let observer = null;
let mode = { preview: false, demo: false, slug: null };

function stopAudio() {
  if (audio) {
    audio.pause();
    audio = null;
  }
}

/* ---------- Sections ---------- */
function scratchCard(label, value, theme) {
  const canvas = h('canvas', { role: 'button', tabIndex: 0, ariaLabel: `Reveal the ${label.toLowerCase()}` });
  const val = h('b', { text: value, ariaHidden: 'true' });
  const card = h('div', { class: 'scratch' }, val, canvas);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let size = 0;
  let touched = false;
  const paint = () => {
    size = Math.round(card.clientWidth * Math.min(window.devicePixelRatio || 1, 2));
    if (!size) return;
    canvas.width = canvas.height = size;
    const hi = mix(theme.accent, '#ffffff', 0.55);
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, mix(hi, theme.bg, 0.3));
    g.addColorStop(0.35, mix(hi, '#ffffff', 0.5));
    g.addColorStop(0.7, mix(theme.accent, hi, 0.5));
    g.addColorStop(1, theme.accent);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = size / 60;
    for (let i = -size; i < size; i += size / 5) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + size, size);
      ctx.stroke();
    }
  };
  const done = () => {
    if (card.classList.contains('done')) return;
    card.classList.add('done');
    val.removeAttribute('aria-hidden');
    canvas.tabIndex = -1;
    canvas.setAttribute('aria-hidden', 'true');
  };
  // The foil is only repainted before any scratching, so a resize never wipes progress.
  new ResizeObserver(() => {
    if (!touched && !card.classList.contains('done')) paint();
  }).observe(card);

  let last = null;
  const scratch = (e) => {
    const r = canvas.getBoundingClientRect();
    const p = { x: ((e.clientX - r.left) / r.width) * size, y: ((e.clientY - r.top) / r.height) * size };
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = size * 0.24;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo((last ?? p).x, (last ?? p).y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
    last = p;
  };
  const end = () => {
    last = null;
    if (!size) return;
    const data = ctx.getImageData(0, 0, size, size).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 64) {
      total++;
      if (data[i] < 40) clear++;
    }
    if (clear / total > 0.45) done();
  };
  canvas.addEventListener('pointerdown', (e) => {
    touched = true;
    canvas.setPointerCapture(e.pointerId);
    last = null;
    scratch(e);
  });
  canvas.addEventListener('pointermove', (e) => canvas.hasPointerCapture(e.pointerId) && scratch(e));
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      done();
    }
  });
  return h('div', {}, card, h('p', { class: 'scratch-label', text: label }));
}

const RENDER = {
  date(s, cfg) {
    const dt = cfg.basics.dateTime;
    let body = null;
    if (dt && s.scratch) {
      const [y, m, d] = dt.slice(0, 10).split('-');
      body = [para(s.hint, 'hint'), h('div', { class: 'scratch-row' }, scratchCard('Day', d, cfg.theme), scratchCard('Month', m, cfg.theme), scratchCard('Year', y, cfg.theme))];
    } else if (dt) body = h('p', { class: 'date-plain', text: longDate(dt) });
    return [s.title ? h('h2', { class: 'script', text: s.title }) : null, mediaEl(s.media), body];
  },
  couple(s, cfg) {
    const who = (name, label, parents) => [
      name ? h('p', { class: 'name script', text: name }) : null,
      parents ? h('p', { class: 'caps' }, label, label ? h('br') : null, parents) : null,
    ];
    const { first, second } = cfg.basics;
    return [
      mediaEl(s.media), para(s.eventLine, 'caps'), who(first, s.firstLabel, s.firstParents),
      first && second && s.joiner ? h('p', { class: 'with script', text: s.joiner }) : null,
      who(second, s.secondLabel, s.secondParents),
    ];
  },
  message(s) {
    const side = (c) => use([['sprig', { x: 20, y: 0, width: 60, height: 120 }], ['flower', { x: -10, y: 90, width: 80, height: 80 }]], `side-flower ${c}`, '0 0 90 160');
    return [s.florals ? [side('l'), side('r')] : null, s.title ? h('h3', { class: 'script', text: s.title }) : null, para(s.text), mediaEl(s.media)];
  },
  quote(s) {
    return [divider(), mediaEl(s.media), s.text ? h('p', { class: 'big pre', dir: 'auto', text: s.text }) : null, para(s.translation), para(s.reference)];
  },
  timeline(s) {
    return [
      s.title ? [h('h2', { class: 'script', text: s.title }), divider('wide')] : null,
      mediaEl(s.media),
      s.items.length
        ? h('ol', { class: 'timeline' }, s.items.map((it) =>
            h('li', { class: 'reveal' }, h('div', { class: 't-icon' }, use(`i-${it.icon}`)), h('div', {}, h('p', { class: 't-time script', text: it.time }), h('p', { text: it.title })))))
        : null,
    ];
  },
  countdown(s, cfg) {
    const { dateTime, utcOffset } = cfg.basics;
    const target = new Date(`${dateTime}:00${utcOffset}`).getTime();
    if (!Number.isFinite(target)) return [heading(s.title), mediaEl(s.media)];
    const cell = (label) => {
      const b = h('b', { text: '00' });
      return [b, h('div', {}, b, h('span', { text: label }))];
    };
    const cells = ['Days', 'Hours', 'Minutes', 'Seconds'].map(cell);
    const tick = () => {
      const t = Math.max(0, Math.floor((target - Date.now()) / 1000));
      [Math.floor(t / 86400), Math.floor(t / 3600) % 24, Math.floor(t / 60) % 60, t % 60].forEach((v, i) => (cells[i][0].textContent = pad(v)));
    };
    tick();
    ticker = setInterval(tick, 1000);
    return [heading(s.title), mediaEl(s.media), h('div', { class: 'count', role: 'timer' }, cells.flatMap((c, i) => (i ? [h('i', { text: ':' }), c[1]] : [c[1]])))];
  },
  location(s) {
    const q = encodeURIComponent(s.mapQuery || [s.venue, s.city].filter(Boolean).join(', '));
    const map = s.showMap && q;
    return [
      heading(s.title), para(s.city, 'city caps'), para(s.venue), mediaEl(s.media),
      map ? h('div', { class: 'map-frame' }, divider(), h('iframe', { title: 'Venue map', loading: 'lazy', src: `https://www.google.com/maps?q=${q}&output=embed`, referrerPolicy: 'no-referrer-when-downgrade' }), divider()) : null,
      q && s.linkLabel ? h('a', { class: 'text-link script', href: `https://www.google.com/maps/search/?api=1&query=${q}`, target: '_blank', rel: 'noopener', text: s.linkLabel }) : null,
    ];
  },
  dress(s) {
    const notes = s.notes.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
    return [
      heading(s.title), mediaEl(s.media), para(s.intro), s.style ? h('p', { class: 'script style', text: s.style }) : null, para(s.outro),
      s.shades.length ? [divider(), para(s.shadesLabel, 'sub'), h('ul', { class: 'shades' }, s.shades.map((c) => h('li', { style: `background:${c}` }))), divider()] : null,
      notes.length ? h('div', { class: 'notes' }, notes.map((t) => para(t))) : null,
    ];
  },
  gifts(s) {
    return h('div', { class: 'card' },
      heading(s.title), mediaEl(s.media), para(s.text),
      s.linkUrl && s.linkLabel ? h('a', { class: 'text-link script', href: s.linkUrl, target: '_blank', rel: 'noopener', text: s.linkLabel }) : null,
      para(s.note),
      s.florals ? use([['flower', { x: 30, y: 30, width: 90, height: 90 }], ['flower', { x: 0, y: 70, width: 50, height: 50 }], ['flower', { x: 70, y: 0, width: 44, height: 44 }]], 'card-flower', '0 0 120 120') : null,
    );
  },
  gallery(s) {
    return [heading(s.title), s.images.length ? h('div', { class: 'photos' }, s.images.map((src) => h('img', { src, alt: '', loading: 'lazy' }))) : null];
  },
  custom(s) {
    return [
      heading(s.title), mediaEl(s.media), para(s.text),
      s.linkUrl && s.linkLabel ? h('a', { class: 'text-link script', href: s.linkUrl, target: '_blank', rel: 'noopener', text: s.linkLabel }) : null,
    ];
  },
  rsvp(s) {
    const dialog = rsvpDialog(s);
    const text = [s.text, s.deadline ? `by ${longDate(s.deadline)}` : ''].filter(Boolean).join(' ');
    return [heading(s.title), mediaEl(s.media), para(text), h('button', { class: 'btn', type: 'button', text: s.button || 'RSVP', onclick: () => dialog.showModal() }), dialog];
  },
};

/* ---------- RSVP ---------- */
function clientId() {
  const key = `rsvp-client:${mode.slug}`;
  try {
    let id = localStorage.getItem(key);
    if (!id) localStorage.setItem(key, (id = crypto.randomUUID()));
    return id;
  } catch {
    return (clientId.memo ??= crypto.randomUUID());
  }
}

function rsvpDialog(s) {
  const msg = h('p', { class: 'form-msg', role: 'alert' });
  const submit = h('button', { class: 'btn', type: 'submit', text: 'Submit' });
  const guests = h('select', { name: 'guests' }, Array.from({ length: s.maxGuests }, (_, i) => h('option', { value: i + 1, text: i + 1 })));
  const guestsField = s.askGuests ? h('label', {}, 'Number of guests attending', guests) : null;
  const form = h('form', { noValidate: true },
    h('h2', { class: 'script', text: s.title || 'RSVP' }),
    s.deadline ? h('p', { class: 'sub', text: `Please reply by ${longDate(s.deadline)}` }) : null,
    h('label', {}, 'Your Full Name', h('input', { name: 'name', type: 'text', autocomplete: 'name', maxLength: 120 })),
    h('fieldset', {}, h('legend', { text: 'Will you come?' }),
      h('label', { class: 'radio' }, h('input', { type: 'radio', name: 'attending', value: 'yes' }), 'Yes, I will'),
      h('label', { class: 'radio' }, h('input', { type: 'radio', name: 'attending', value: 'no' }), "Unfortunately, I can't")),
    guestsField,
    s.askMessage ? h('label', {}, 'A message for the couple (optional)', h('textarea', { name: 'message', maxLength: 500 })) : null,
    msg, submit);
  const thanksText = h('p');
  const dialog = h('dialog', {});
  const thanks = h('div', { hidden: true }, h('h2', { class: 'script', text: 'Thank you' }), thanksText, h('button', { class: 'btn', type: 'button', text: 'Close', onclick: () => dialog.close() }));
  dialog.append(h('button', { class: 'close', type: 'button', ariaLabel: 'Close', text: '×', onclick: () => dialog.close() }), form, thanks);
  dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
  form.addEventListener('input', () => (msg.textContent = ''));
  form.addEventListener('change', () => guestsField && (guestsField.hidden = form.elements.attending.value === 'no'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    const name = form.elements.name.value.trim();
    const choice = form.elements.attending.value;
    if (!name || !choice) return void (msg.textContent = 'Please enter your name and let us know if you can come.');
    const attending = choice === 'yes';
    if (mode.preview || mode.demo) {
      thanksText.textContent = mode.preview ? 'This is a preview. Replies are collected once the invitation is published.' : 'This is a sample invitation, so the reply was not saved.';
    } else {
      submit.disabled = true;
      submit.textContent = 'Sending…';
      let error = '';
      try {
        const res = await fetch(`/api/i/${mode.slug}/rsvp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: clientId(), name, attending, guests: Number(guests.value), message: form.elements.message?.value ?? '' }),
        });
        if (!res.ok) error = (await res.json().catch(() => ({}))).error || 'Sorry, your reply could not be sent. Please try again.';
      } catch {
        error = 'Sorry, your reply could not be sent. Check your connection and try again.';
      }
      submit.disabled = false;
      submit.textContent = 'Submit';
      if (error) return void (msg.textContent = error);
      thanksText.textContent = attending ? 'We look forward to celebrating with you.' : 'We will miss you. Thank you for letting us know.';
    }
    form.hidden = true;
    thanks.hidden = false;
  });
  dialog.addEventListener('close', () => {
    form.hidden = false;
    thanks.hidden = true;
  });
  return dialog;
}

/* ---------- Cover and intro ---------- */
function hero(cfg) {
  const c = cfg.hero;
  const scene = document.getElementById('tpl-scene').content.firstElementChild.cloneNode(true);
  // Scene and frame markup comes only from the constants in scenes.js, never from the invitation's content.
  if (c.media) scene.querySelector('.l-sky').remove();
  else scene.querySelector('.l-scene').innerHTML = (SCENE_ART[c.scene] ?? SCENE_ART.sky)();
  scene.querySelector('.l-frame').innerHTML = (FRAME_ART[c.frame] ?? FRAME_ART.none)();
  if (c.media && c.frame === 'none') scene.querySelector('.l-flowers').remove();
  const title = inviteTitle(cfg);
  return h('section', { class: `hero ${c.media ? 'has-media' : ''} frame-${c.frame}` },
    mediaEl(c.media, 'hero-media'), scene,
    h('div', { class: 'hero-text' },
      c.showMonogram ? mono(cfg, 'hero-mono') : null,
      c.showNames && (cfg.basics.first || cfg.basics.second) ? h('p', { class: 'hero-names script', text: title }) : null,
      para(c.tagline, 'hero-tag')),
    c.cue ? h('div', { class: 'scroll-cue' }, h('span', { class: 'script', text: c.cue }), chevron()) : null);
}
function chevron() {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 20 10');
  svg.setAttribute('width', '18');
  const p = document.createElementNS(SVG, 'path');
  p.setAttribute('d', 'm2 2 8 6 8-6');
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', 'currentColor');
  p.setAttribute('stroke-width', '1.4');
  svg.append(p);
  return svg;
}

// How long each opening runs before the layer can be removed, in ms.
const INTRO_MS = { envelope: 2500, doors: 2700, curtain: 2700, heart: 2500, ribbon: 2600, petals: 3200 };
const INTRO_PARTS = {
  envelope: () => ['bottom', 'left', 'right', 'top'].map((side) => h('div', { class: `flap-wrap ${side}` }, h('div', { class: 'flap' }, use('sprig', 'emboss')))),
  doors: () => ['l', 'r'].map((side) => h('div', { class: `leaf ${side}` }, h('i'), h('i'), h('b'))),
  curtain: () => [h('div', { class: 'drape l' }), h('div', { class: 'drape r' }), h('div', { class: 'valance' })],
  heart: () => ['l', 'r'].map((side) => h('div', { class: `half ${side}` }, use('bigheart', 'art'))),
  ribbon: () => [h('div', { class: 'wrap' }), h('div', { class: 'band v' }), h('div', { class: 'band h' }), use('bow', 'bow')],
  petals: () => {
    const ring = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * 2 * Math.PI;
      const d = i % 2 ? 46 : 60;
      return ['flower', { x: 160 + 118 * Math.cos(a) - d / 2, y: 160 + 118 * Math.sin(a) - d / 2, width: d, height: d }];
    });
    // Fixed pseudo-random spread so the fall looks the same on every open.
    const petals = Array.from({ length: 26 }, (_, i) => {
      const r = (n) => ((i * 9301 + n * 49297) % 233280) / 233280;
      return h('i', { class: 'petal', style: `--x:${(r(1) * 96).toFixed(1)}%;--s:${(14 + r(2) * 16).toFixed(0)}px;--dx:${((r(3) - 0.5) * 160).toFixed(0)}px;--r:${(180 + r(4) * 540).toFixed(0)}deg;--d:${(1.7 + r(5) * 1.2).toFixed(2)}s;--w:${(r(6) * 0.9).toFixed(2)}s` });
    });
    return [h('div', { class: 'veil' }), use(ring, 'wreath', '0 0 320 320'), petals];
  },
};

function intro(cfg, onOpen) {
  const style = INTROS[cfg.intro.style] ? cfg.intro.style : 'envelope';
  const el = h('div', { id: 'intro', class: `intro-${style}`, role: 'button', tabIndex: 0, ariaLabel: 'Open the invitation' },
    style === 'petals' ? null : h('div', { class: 'intro-back' }), INTRO_PARTS[style](),
    h('div', { class: 'seal' }, mono(cfg, '')), para(cfg.intro.label, 'tap'));
  const open = () => {
    if (el.classList.contains('open')) return;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'true');
    el.removeAttribute('tabindex');
    document.body.classList.remove('locked');
    onOpen();
    // Drop the layers once they are invisible so they stop costing memory while the guest scrolls.
    setTimeout(() => el.remove(), INTRO_MS[style] + 400);
  };
  el.addEventListener('click', open);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
  return el;
}

function musicButton(cfg) {
  if (!cfg.music.url) return null;
  audio = new Audio(cfg.music.url);
  audio.loop = true;
  audio.preload = 'none';
  const a = audio;
  const icon = document.createElementNS(SVG, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('width', '22');
  icon.setAttribute('fill', 'currentColor');
  for (const [cls, d] of [['ic-play', 'M8 5v14l11-7z'], ['ic-pause', 'M7 5h4v14H7zM13 5h4v14h-4z']]) {
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('class', cls);
    p.setAttribute('d', d);
    icon.append(p);
  }
  const btn = h('button', { id: 'music', type: 'button', ariaLabel: 'Play music', ariaPressed: 'false' }, icon);
  const sync = () => {
    btn.setAttribute('aria-pressed', String(!a.paused));
    btn.setAttribute('aria-label', a.paused ? 'Play music' : 'Pause music');
  };
  a.addEventListener('play', sync);
  a.addEventListener('pause', sync);
  btn.addEventListener('click', () => (a.paused ? a.play().catch(() => {}) : a.pause()));
  return btn;
}

/* ---------- Render ---------- */
export function render(cfg, opts = {}) {
  clearInterval(ticker);
  observer?.disconnect();
  stopAudio();
  applyTheme(cfg.theme);
  if (!mode.preview) document.title = document.title === 'Invitation' ? inviteTitle(cfg) : document.title;

  const main = h('main', { class: `invite ${opts.static ? 'static' : ''}` }, hero(cfg));
  for (const s of cfg.sections) {
    if (!s.enabled || !RENDER[s.type]) continue;
    const cls = `${s.type}${s.florals ? ' florals' : ''}`;
    main.append(h('section', { class: `block reveal ${cls}`, 'data-id': s.id }, RENDER[s.type](s, cfg)));
  }
  main.append(h('footer', { class: 'block reveal' },
    cfg.basics.closing ? h('p', { class: 'script closing', text: cfg.basics.closing }) : null, mono(cfg, 'foot-mono'),
    h('p', { class: 'made' }, 'Made with ', h('a', { href: '/', text: 'Sealed' }))));

  const music = musicButton(cfg);
  // Browsers only allow sound after a tap, so music starts on the envelope tap or the first touch.
  const startMusic = () => cfg.music.autoplay && audio?.play().catch(() => {});
  const showIntro = cfg.intro.enabled && opts.intro !== false;
  document.body.classList.toggle('locked', showIntro);
  const enter = () => main.classList.add('entered');
  root.replaceChildren(...[showIntro ? intro(cfg, () => (enter(), startMusic())) : null, main, music].filter(Boolean));
  if (!showIntro) requestAnimationFrame(() => requestAnimationFrame(enter));
  if (!showIntro && music && !mode.preview) addEventListener('pointerdown', startMusic, { once: true });

  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  for (const n of main.querySelectorAll('.reveal')) observer.observe(n);
}

/* ---------- Boot ---------- */
const params = new URLSearchParams(location.search);
if (params.has('preview')) {
  // Inside the editor: the parent page sends the config on every change.
  mode.preview = true;
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || e.source !== parent) return;
    if (e.data?.type === 'invite-ping') return parent.postMessage({ type: 'invite-ready' }, location.origin);
    if (e.data?.type !== 'invite') return;
    const y = scrollY;
    render(e.data.cfg, { intro: !!e.data.intro, static: !e.data.intro });
    if (e.data.focus) document.querySelector(`[data-id="${CSS.escape(e.data.focus)}"]`)?.scrollIntoView({ block: 'start' });
    else scrollTo(0, e.data.intro ? 0 : y);
  });
  parent.postMessage({ type: 'invite-ready' }, location.origin);
} else {
  let data = null;
  try {
    data = JSON.parse(document.getElementById('invite-data').textContent || 'null');
  } catch {}
  mode.demo = !data?.slug;
  mode.slug = data?.slug ?? null;
  render(data?.cfg ?? SAMPLE());
}
