import { h, $, api, toast } from './dom.js';
import { GROUPS, SECTIONS, PALETTES, COLOR_KEYS, COLOR_LABELS, FONTS, SOUNDS, soundUrl, isLibrarySound, UPLOAD_TYPES, UPLOAD_MAX, newSection, inviteTitle } from './schema.js';
import { SCENE_ART } from './scenes.js';

// Lettering previews need each heading typeface; ask Google Fonts for just the two letters shown.
document.head.append(h('link', { rel: 'stylesheet', href: `https://fonts.googleapis.com/css2?${Object.values(FONTS).map((f) => `family=${f.q.split('&')[0]}`).join('&')}&text=Aa&display=swap` }));
// The scene thumbnails reference a sun gradient and a flower that only exist inside the invitation page.
document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="sun"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><symbol id="flower" viewBox="-30 -30 60 60"><circle r="22" class="sc-petal"/><circle r="6" class="sc-c"/></symbol></defs></svg>');

let previewAudio = null;
function stopPreviewAudio() {
  previewAudio?.pause();
  previewAudio = null;
}
function sceneThumb(id) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '45 240 300 400');
  svg.setAttribute('aria-hidden', 'true');
  // Markup comes from the constants in scenes.js; ids are suffixed so thumbnails never collide with each other.
  svg.innerHTML = `<rect x="0" y="0" width="390" height="780" class="sc-water"/>${SCENE_ART[id]().replaceAll('"sk"', '"sk-t"').replaceAll('#sk', '#sk-t').replaceAll('"lk"', '"lk-t"').replaceAll('#lk', '#lk-t')}`;
  return svg;
}

const id = location.pathname.split('/')[2];
const pane = $('#pane');
const statusEl = $('#status');
const publishBtn = $('#publish');
const frame = $('#preview');

let cfg, version, slug, published;
let dirty = false;
let saving = false;
let conflict = false;
let saveTimer = 0;
let previewTimer = 0;
let previewReady = false;
let focus = null;
// Replaced files are only deleted once a save without them has succeeded, so a failed save never leaves a broken image.
let trash = [];

/* ---------- Saving ---------- */
const setStatus = (text, cls = '') => {
  statusEl.textContent = text;
  statusEl.className = cls;
};

function changed({ redraw } = {}) {
  dirty = true;
  $('#title').textContent = inviteTitle(cfg);
  setStatus('Unsaved changes');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 900);
  clearTimeout(previewTimer);
  previewTimer = setTimeout(sendPreview, 120);
  if (redraw) draw();
}

async function save(extra = {}) {
  if (conflict) return false;
  while (saving) await new Promise((r) => setTimeout(r, 100));
  clearTimeout(saveTimer);
  saving = true;
  dirty = false;
  const drop = trash;
  trash = [];
  setStatus('Saving…');
  try {
    const r = await api(`/invites/${id}`, { method: 'PUT', body: { config: cfg, version, ...extra } });
    ({ version, slug, published } = r);
    setStatus(dirty ? 'Unsaved changes' : 'All changes saved', 'ok');
    for (const url of drop) api(`/invites/${id}/media/${url.split('/').pop().split('.')[0]}`, { method: 'DELETE' }).catch(() => {});
    return true;
  } catch (e) {
    trash = drop.concat(trash);
    dirty = true;
    if (e.status === 409 && !('slug' in extra)) {
      conflict = true;
      const b = $('#banner');
      b.replaceChildren(e.message + ' ', h('button', { class: 'link', type: 'button', text: 'Reload', onclick: () => location.reload() }));
      b.hidden = false;
      setStatus('Not saved', 'bad');
    } else {
      setStatus('Not saved', 'bad');
      toast(e.message, true);
    }
    return false;
  } finally {
    saving = false;
    syncPublish();
  }
}
addEventListener('beforeunload', (e) => {
  if (dirty && !conflict) e.preventDefault();
});

/* ---------- Preview ---------- */
function sendPreview(intro = false) {
  if (!previewReady || !cfg) return;
  frame.contentWindow.postMessage({ type: 'invite', cfg, intro, focus }, location.origin);
  focus = null;
}
addEventListener('message', (e) => {
  if (e.origin === location.origin && e.source === frame.contentWindow && e.data?.type === 'invite-ready') {
    previewReady = true;
    sendPreview();
  }
});
// The frame announces itself once, which is lost if it loads before this script; keep asking until it answers.
const hello = setInterval(() => {
  if (previewReady) return clearInterval(hello);
  frame.contentWindow?.postMessage({ type: 'invite-ping' }, location.origin);
}, 400);
$('#replay').addEventListener('click', () => {
  document.body.classList.add('show-preview');
  sendPreview(true);
});
$('#toggle').addEventListener('click', (e) => {
  const on = document.body.classList.toggle('show-preview');
  e.target.textContent = on ? 'Back to editing' : 'Preview';
});

/* ---------- Uploads ---------- */
async function upload(file, kinds) {
  const spec = UPLOAD_TYPES[file.type];
  if (!spec || !kinds.includes(spec[0])) throw new Error(`"${file.name}" is not a supported ${kinds.join(' or ')} file.`);
  if (file.size > UPLOAD_MAX[spec[0]]) throw new Error(`"${file.name}" is too big. The limit for ${spec[0]} files is ${Math.round(UPLOAD_MAX[spec[0]] / 2 ** 20)} MB.`);
  return api(`/invites/${id}/media`, { method: 'POST', raw: true, body: file, headers: { 'Content-Type': file.type } });
}

function picker(label, accept, kinds, multiple, onDone) {
  const input = h('input', { type: 'file', accept, multiple, hidden: true });
  const btn = h('button', { class: 'button ghost small', type: 'button', text: label, onclick: () => input.click() });
  input.addEventListener('change', async () => {
    const files = [...input.files];
    input.value = '';
    if (!files.length) return;
    btn.disabled = true;
    btn.textContent = 'Uploading…';
    const done = [];
    try {
      for (const file of files) done.push(await upload(file, kinds));
    } catch (e) {
      toast(e.message, true);
    }
    btn.disabled = false;
    btn.textContent = label;
    if (done.length) onDone(done);
  });
  return [btn, input];
}

/* ---------- Fields ---------- */
function field(f, obj) {
  const set = (v, opts) => {
    obj[f.k] = v;
    changed(opts);
  };
  const help = f.help ? h('small', { class: 'help', text: f.help }) : null;
  const wrap = (control) => h('label', { class: 'field' }, h('span', { text: f.l }), control, help);
  const v = obj[f.k];

  switch (f.t) {
    case 'text': return wrap(h('input', { type: 'text', value: v, maxLength: f.max ?? 200, oninput: (e) => set(e.target.value) }));
    case 'textarea': return wrap(h('textarea', { value: v, rows: 3, maxLength: f.max ?? 2000, oninput: (e) => set(e.target.value) }));
    case 'url': return wrap(h('input', { type: 'url', value: v, placeholder: 'https://', oninput: (e) => set(e.target.value.trim()) }));
    case 'date': return wrap(h('input', { type: 'date', value: v, oninput: (e) => set(e.target.value) }));
    case 'datetime': return wrap(h('input', { type: 'datetime-local', value: v, oninput: (e) => set(e.target.value.slice(0, 16)) }));
    case 'int': return wrap(h('input', { type: 'number', value: v, min: f.min, max: f.max, oninput: (e) => e.target.value && set(Math.min(f.max, Math.max(f.min, Math.round(+e.target.value)))) }));
    case 'select':
      if (f.tiles) {
        const t = cfg.theme;
        return h('div', { class: 'field' }, h('span', { text: f.l }),
          h('div', { class: `tiles ${f.tiles === 'scene' ? 'scenes' : ''}`, style: `--accent:${t.accent};--bg:${t.bg};--paper:${t.paper};--text:${t.text}` },
            f.options.map((o) => h('button', { type: 'button', class: `tile ${o === v ? 'on' : ''}`, ariaPressed: String(o === v), onclick: () => set(o, { redraw: true }) },
              f.tiles === 'scene' ? sceneThumb(o) : null, h('span', { text: f.labels[o] })))),
          help);
      }
      return wrap(h('select', { onchange: (e) => set(e.target.value) }, f.options.map((o) => h('option', { value: o, text: f.labels?.[o] ?? (f.k === 'utcOffset' ? `UTC${o}` : o[0].toUpperCase() + o.slice(1)), selected: o === v }))));
    case 'bool': return h('label', { class: 'field check' }, h('input', { type: 'checkbox', checked: v, onchange: (e) => set(e.target.checked) }), h('span', { text: f.l }));

    case 'colors':
      return h('div', { class: 'field' }, h('span', { text: f.l }),
        h('div', { class: 'chips' },
          v.map((c, i) => h('span', { class: 'chip' },
            h('input', { type: 'color', value: c, ariaLabel: `Shade ${i + 1}`, oninput: (e) => { v[i] = e.target.value; changed(); } }),
            h('button', { type: 'button', ariaLabel: `Remove shade ${i + 1}`, text: '×', onclick: () => { v.splice(i, 1); changed({ redraw: true }); } }))),
          v.length < f.max ? h('button', { class: 'button ghost small', type: 'button', text: 'Add shade', onclick: () => { v.push('#e8dccb'); changed({ redraw: true }); } }) : null));

    case 'media': {
      const thumb = v ? (v.kind === 'video' ? h('video', { src: v.url, muted: true, preload: 'metadata' }) : h('img', { src: v.url, alt: '' })) : null;
      return h('div', { class: 'field' }, h('span', { text: f.l }),
        h('div', { class: 'mediabox' }, thumb,
          h('div', {},
            picker(v ? 'Replace' : 'Upload photo or video', 'image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm', ['image', 'video'], false, ([m]) => { if (v) trash.push(v.url); set(m, { redraw: true }); }),
            v ? h('button', { class: 'link danger', type: 'button', text: 'Remove', onclick: () => { trash.push(v.url); set(null, { redraw: true }); } }) : null)),
        help);
    }
    case 'audio': {
      const own = v && !isLibrarySound(v);
      const choose = (url) => {
        if (url === v) return;
        stopPreviewAudio();
        if (own) trash.push(v);
        set(url, { redraw: true });
      };
      const row = (url, label, selected) => {
        const play = url ? h('button', { type: 'button', class: 'play', ariaLabel: `Listen to ${label}`, text: '▶', onclick: (e) => {
          e.stopPropagation();
          const was = previewAudio?.dataset.url === url;
          stopPreviewAudio();
          for (const b of document.querySelectorAll('.track .play')) b.textContent = '▶';
          if (was) return;
          previewAudio = new Audio(url);
          previewAudio.dataset.url = url;
          previewAudio.addEventListener('ended', () => (e.target.textContent = '▶'));
          previewAudio.play().then(() => (e.target.textContent = '❚❚'), () => toast('That track could not be played.', true));
        } }) : h('span', { class: 'play none' });
        return h('div', { class: `track ${selected ? 'on' : ''}` }, play,
          h('button', { type: 'button', class: 'pick', ariaPressed: String(selected), text: label, onclick: () => choose(url) }));
      };
      return h('div', { class: 'field' }, h('span', { text: f.l }),
        h('div', { class: 'tracks' },
          row('', 'No music', !v),
          Object.entries(SOUNDS).map(([key, label]) => row(soundUrl(key), label, v === soundUrl(key))),
          own ? row(v, 'Your uploaded track', true) : null),
        h('div', {},
          picker(own ? 'Replace your track' : 'Upload your own', 'audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,audio/wav', ['audio'], false, ([m]) => { stopPreviewAudio(); if (own) trash.push(v); set(m.url, { redraw: true }); })),
        help);
    }
    case 'images':
      return h('div', { class: 'field' }, h('span', { text: f.l }),
        h('div', { class: 'thumbs' }, v.map((url, i) => h('span', {}, h('img', { src: url, alt: '' }),
          h('button', { type: 'button', ariaLabel: `Remove photo ${i + 1}`, text: '×', onclick: () => { trash.push(url); v.splice(i, 1); changed({ redraw: true }); } })))),
        v.length < f.max ? h('div', {}, picker('Add photos', 'image/jpeg,image/png,image/webp,image/gif,image/avif', ['image'], true, (ms) => { v.push(...ms.map((m) => m.url).slice(0, f.max - v.length)); changed({ redraw: true }); })) : null);

    case 'list':
      return h('div', { class: 'field' }, h('span', { text: f.l }),
        v.map((item, i) => h('div', { class: 'item' },
          h('div', { class: 'itemfields' }, f.item.map((sub) => field(sub, item))),
          h('div', { class: 'itemctl' },
            h('button', { type: 'button', ariaLabel: 'Move up', text: '↑', disabled: i === 0, onclick: () => move(v, i, -1) }),
            h('button', { type: 'button', ariaLabel: 'Move down', text: '↓', disabled: i === v.length - 1, onclick: () => move(v, i, 1) }),
            h('button', { type: 'button', ariaLabel: 'Remove', text: '×', onclick: () => { v.splice(i, 1); changed({ redraw: true }); } })))),
        v.length < f.max ? h('button', { class: 'button ghost small', type: 'button', text: f.add, onclick: () => { v.push({ ...f.blank }); changed({ redraw: true }); } }) : null);
  }
}
function move(arr, i, d) {
  [arr[i], arr[i + d]] = [arr[i + d], arr[i]];
  changed({ redraw: true });
}

/* ---------- Panels ---------- */
const open = new Set(['basics']);
function panel(key, title, body, { controls, muted } = {}) {
  const d = h('details', { class: `panel ${muted ? 'off' : ''}`, open: open.has(key) }, h('summary', {}, h('span', { text: title }), controls), h('div', { class: 'body' }, body));
  d.addEventListener('toggle', () => {
    d.open ? open.add(key) : open.delete(key);
    if (d.open && key.startsWith('s:')) {
      focus = key.slice(2);
      sendPreview();
    }
  });
  return d;
}

function themePanel() {
  const t = cfg.theme;
  const custom = COLOR_KEYS.some((k) => t[k] !== PALETTES[t.palette][k]);
  return panel('theme', 'Colours & lettering', [
    h('div', { class: 'field' }, h('span', { text: 'Palette' }),
      h('div', { class: 'palettes' }, Object.entries(PALETTES).map(([key, p]) =>
        h('button', { type: 'button', class: `palette ${t.palette === key && !custom ? 'on' : ''}`, ariaPressed: String(t.palette === key && !custom), title: p.label,
          onclick: () => { Object.assign(t, { palette: key }, Object.fromEntries(COLOR_KEYS.map((k) => [k, p[k]]))); changed({ redraw: true }); } },
          h('span', { class: 'dots' }, COLOR_KEYS.map((k) => h('i', { style: `background:${p[k]}` }))), p.label)))),
    h('div', { class: 'field' }, h('span', { text: custom ? 'Your colours' : 'Fine-tune the colours' }),
      h('div', { class: 'colors' }, COLOR_KEYS.map((k) => h('label', {}, h('input', { type: 'color', value: t[k], oninput: (e) => { t[k] = e.target.value; changed(); }, onchange: () => draw() }), COLOR_LABELS[k])))),
    h('div', { class: 'field' }, h('span', { text: 'Lettering' }),
      h('div', { class: 'fonts' }, Object.entries(FONTS).map(([key, f]) =>
        h('button', { type: 'button', class: `font ${t.fonts === key ? 'on' : ''}`, ariaPressed: String(t.fonts === key), onclick: () => { t.fonts = key; changed({ redraw: true }); } },
          h('b', { style: `font-family:'${f.script}',cursive`, text: 'Aa' }), f.label)))),
  ]);
}

function sectionPanel(s, i) {
  const def = SECTIONS[s.type];
  const n = cfg.sections.length;
  const stop = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
  const controls = h('span', { class: 'ctl' },
    h('button', { type: 'button', ariaLabel: 'Move up', text: '↑', disabled: i === 0, onclick: stop(() => move(cfg.sections, i, -1)) }),
    h('button', { type: 'button', ariaLabel: 'Move down', text: '↓', disabled: i === n - 1, onclick: stop(() => move(cfg.sections, i, 1)) }),
    h('label', { class: 'switch', title: s.enabled ? 'Shown' : 'Hidden', onclick: (e) => e.stopPropagation() },
      h('input', { type: 'checkbox', checked: s.enabled, ariaLabel: `Show ${def.label}`, onchange: (e) => { s.enabled = e.target.checked; changed({ redraw: true }); } }), h('i')));
  const title = s.title && s.title !== def.label ? `${def.label} — ${s.title}` : def.label;
  return panel(`s:${s.id}`, title, [
    def.fields.map((f) => field(f, s)),
    h('button', { class: 'link danger', type: 'button', text: 'Delete this section', onclick: () => {
      if (!confirm(`Delete the "${def.label}" section and its content?`)) return;
      for (const f of def.fields) {
        if (f.t === 'media' && s[f.k]) trash.push(s[f.k].url);
        if (f.t === 'images') trash.push(...s[f.k]);
      }
      cfg.sections.splice(i, 1);
      changed({ redraw: true });
    } }),
  ], { controls, muted: !s.enabled });
}

function addSection() {
  const have = new Set(cfg.sections.map((s) => s.type));
  const options = Object.entries(SECTIONS).filter(([type, d]) => !d.single || !have.has(type));
  const select = h('select', { ariaLabel: 'Section to add' }, h('option', { value: '', text: 'Add a section…' }), options.map(([type, d]) => h('option', { value: type, text: d.label })));
  select.addEventListener('change', () => {
    if (!select.value) return;
    const s = newSection(select.value);
    cfg.sections.push(s);
    open.add(`s:${s.id}`);
    focus = s.id;
    changed({ redraw: true });
  });
  return h('div', { class: 'add' }, select);
}

function sharePanel() {
  const link = `${location.origin}/i/${slug}`;
  const input = h('input', { type: 'text', value: slug, maxLength: 50, spellcheck: false, ariaLabel: 'Link name' });
  const err = h('small', { class: 'error' });
  return panel('share', 'Link & sharing', [
    h('div', { class: 'field' }, h('span', { text: 'Your invitation link' }),
      h('div', { class: 'slug' }, h('code', { text: `${location.host}/i/` }), input,
        h('button', { class: 'button ghost small', type: 'button', text: 'Save link', onclick: async () => {
          const want = input.value.trim().toLowerCase();
          err.textContent = '';
          if (want === slug) return;
          if (published && !confirm('Guests who already have the old link will no longer be able to open it. Change the link?')) return;
          if (await save({ slug: want })) {
            toast('Link updated');
            draw();
          } else err.textContent = 'That link could not be saved.';
        } })), err),
    published
      ? h('p', {}, 'Live at ', h('a', { class: 'link', href: link, target: '_blank', rel: 'noopener', text: link.replace(/^https?:\/\//, '') }), ' ',
          h('button', { class: 'button ghost small', type: 'button', text: 'Copy', onclick: () => navigator.clipboard.writeText(link).then(() => toast('Link copied'), () => prompt('Copy this link', link)) }))
      : h('p', { class: 'muted', text: 'Not published yet. Only you can see it, in this preview.' }),
    published ? h('button', { class: 'link danger', type: 'button', text: 'Unpublish', onclick: () => {
      if (confirm('Unpublish? The link will stop working for guests until you publish again. Replies you have received are kept.')) setPublished(false);
    } }) : null,
  ]);
}

function draw() {
  const y = pane.scrollTop;
  pane.replaceChildren(
    h('h2', { class: 'group', text: 'Design' }),
    panel('basics', GROUPS.basics.label, GROUPS.basics.fields.map((f) => field(f, cfg.basics))),
    themePanel(),
    ...['intro', 'hero', 'music'].map((g) => panel(g, GROUPS[g].label, GROUPS[g].fields.map((f) => field(f, cfg[g])))),
    h('h2', { class: 'group', text: 'Sections' }),
    h('p', { class: 'muted small', text: 'Open a section to edit it. Use the arrows to reorder and the switch to hide.' }),
    ...cfg.sections.map(sectionPanel),
    addSection(),
    h('h2', { class: 'group', text: 'Share' }),
    sharePanel(),
  );
  pane.scrollTop = y;
}

/* ---------- Publishing ---------- */
function syncPublish() {
  publishBtn.disabled = conflict;
  publishBtn.textContent = published ? 'View live' : 'Publish';
  publishBtn.classList.toggle('ghost', !!published);
}
async function setPublished(on) {
  if (await save({ published: on })) {
    toast(on ? 'Published. Your link is ready to share.' : 'Unpublished');
    if (on) open.add('share');
    draw();
  }
}
publishBtn.addEventListener('click', () => (published ? window.open(`/i/${slug}`, '_blank', 'noopener') : setPublished(true)));

/* ---------- Boot ---------- */
api(`/invites/${id}`)
  .then((r) => {
    ({ config: cfg, version, slug, published } = r);
    $('#title').textContent = inviteTitle(cfg);
    setStatus('All changes saved', 'ok');
    syncPublish();
    draw();
    sendPreview();
  })
  .catch((e) => pane.replaceChildren(h('p', { class: 'error', text: e.message }), h('p', {}, h('a', { class: 'link', href: '/dashboard', text: 'Back to my invitations' }))));
