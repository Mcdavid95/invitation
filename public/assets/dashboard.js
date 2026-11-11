import { h, $, api, toast } from './dom.js';
import { STARTER_LIST, PALETTES } from './schema.js';

const list = $('#list');
const linkOf = (slug) => `${location.origin}/i/${slug}`;

function offset() {
  const m = -new Date().getTimezoneOffset();
  const a = Math.abs(m);
  const snapped = Math.round(a / 30) * 30;
  return `${m < 0 ? '-' : '+'}${String(Math.floor(snapped / 60)).padStart(2, '0')}:${String(snapped % 60).padStart(2, '0')}`;
}

function modal(...content) {
  const d = h('dialog', { class: 'modal' }, h('button', { class: 'x', type: 'button', ariaLabel: 'Close', text: '×', onclick: () => d.close() }), content);
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', (e) => e.target === d && d.close());
  document.body.append(d);
  d.showModal();
  return d;
}

async function load() {
  const [{ user }, { invites }] = await Promise.all([api('/me'), api('/invites')]);
  $('#who').textContent = user?.name ?? '';
  if (!invites.length) {
    list.replaceChildren(h('div', { class: 'empty' }, h('h2', { text: 'No invitations yet' }), h('p', { text: 'Start with a design, then make it your own.' }), h('button', { class: 'button big', type: 'button', text: 'Create your first invitation', onclick: create })));
    return;
  }
  list.replaceChildren(...invites.map(card));
}

function card(inv) {
  const replies = inv.yes + inv.no;
  return h('article', { class: 'card' },
    h('div', {},
      h('h2', { text: inv.title }),
      h('p', { class: 'muted' }, h('span', { class: `pill ${inv.published ? 'live' : ''}`, text: inv.published ? 'Published' : 'Draft' }), ` Edited ${new Date(inv.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`),
      inv.published ? h('p', {}, h('a', { class: 'link', href: linkOf(inv.slug), target: '_blank', rel: 'noopener', text: linkOf(inv.slug).replace(/^https?:\/\//, '') })) : null,
      h('p', { class: 'stats', text: replies ? `${inv.yes} coming (${inv.guests} ${inv.guests === 1 ? 'guest' : 'guests'}) · ${inv.no} not coming` : 'No replies yet' })),
    h('div', { class: 'actions' },
      h('a', { class: 'button', href: `/edit/${inv.id}`, text: 'Edit' }),
      inv.published ? h('button', { class: 'button ghost', type: 'button', text: 'Copy link', onclick: () => copy(linkOf(inv.slug)) }) : null,
      h('button', { class: 'button ghost', type: 'button', text: 'Replies', onclick: () => replies_(inv) }),
      h('button', { class: 'link danger', type: 'button', text: 'Delete', onclick: () => remove(inv) })));
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Link copied');
  } catch {
    prompt('Copy this link', text);
  }
}

function create() {
  const error = h('p', { class: 'error', role: 'alert' });
  const submit = h('button', { class: 'button big', type: 'submit', text: 'Create and customise' });
  const form = h('form', { noValidate: true },
    h('h2', { text: 'New invitation' }),
    h('div', { class: 'two' },
      h('label', {}, 'First name', h('input', { name: 'first', maxLength: 60, required: true })),
      h('label', {}, 'Second name', h('input', { name: 'second', maxLength: 60, required: true }))),
    h('label', {}, 'Date and time of the celebration', h('input', { name: 'dateTime', type: 'datetime-local' })),
    h('fieldset', {}, h('legend', { text: 'Start from' }),
      h('div', { class: 'starters' }, STARTER_LIST.map((s, i) => {
        const p = PALETTES[s.palette];
        return h('label', { class: 'starter' }, h('input', { type: 'radio', name: 'starter', value: s.id, checked: i === 0 }),
          h('span', { class: 'swatch', style: `background:${p.bg};border-color:${p.accent};color:${p.accent}`, text: 'A&Z' }),
          h('strong', { text: s.label }), h('small', { text: s.note }));
      }))),
    h('p', { class: 'hint', text: 'Everything can be changed afterwards.' }),
    error, submit);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    const body = Object.fromEntries(new FormData(form));
    if (!body.first.trim() || !body.second.trim()) return void (error.textContent = 'Please enter both names.');
    submit.disabled = true;
    try {
      const { id } = await api('/invites', { method: 'POST', body: { ...body, utcOffset: offset() } });
      location.href = `/edit/${id}`;
    } catch (err) {
      error.textContent = err.message;
      submit.disabled = false;
    }
  });
  modal(form);
}

async function replies_(inv) {
  const body = h('div', {}, h('p', { class: 'muted', text: 'Loading…' }));
  modal(h('h2', { text: `Replies — ${inv.title}` }), body);
  const draw = async () => {
    const { rsvps } = await api(`/invites/${inv.id}/rsvps`);
    if (!rsvps.length) return body.replaceChildren(h('p', { class: 'muted', text: inv.published ? 'No replies yet. Share your link to start collecting them.' : 'No replies yet. Publish the invitation to start collecting them.' }));
    const coming = rsvps.filter((r) => r.attending);
    body.replaceChildren(
      h('p', { class: 'stats', text: `${coming.length} coming, ${coming.reduce((n, r) => n + r.guests, 0)} guests in total · ${rsvps.length - coming.length} not coming` }),
      h('div', { class: 'table' }, h('table', {},
        h('thead', {}, h('tr', {}, ['Name', 'Coming', 'Guests', 'Message', ''].map((t) => h('th', { text: t })))),
        h('tbody', {}, rsvps.map((r) => h('tr', {},
          h('td', { text: r.name }), h('td', { text: r.attending ? 'Yes' : 'No' }), h('td', { text: r.attending ? r.guests : '—' }), h('td', { text: r.message }),
          h('td', {}, h('button', { class: 'link danger', type: 'button', text: 'Remove', onclick: async () => {
            if (!confirm(`Remove the reply from ${r.name}?`)) return;
            await api(`/invites/${inv.id}/rsvps/${r.id}`, { method: 'DELETE' }).catch((e) => toast(e.message, true));
            draw();
            load();
          } }))))))),
      h('p', {}, h('a', { class: 'button ghost', href: `/api/invites/${inv.id}/rsvps.csv`, text: 'Download as spreadsheet (CSV)' })));
  };
  draw().catch((e) => body.replaceChildren(h('p', { class: 'error', text: e.message })));
}

async function remove(inv) {
  if (!confirm(`Delete "${inv.title}"? Its link will stop working, and its photos, music and ${inv.yes + inv.no} replies will be deleted. This cannot be undone.`)) return;
  try {
    await api(`/invites/${inv.id}`, { method: 'DELETE' });
    toast('Invitation deleted');
    load();
  } catch (e) {
    toast(e.message, true);
  }
}

$('#new').addEventListener('click', create);
$('#logout').addEventListener('click', async () => {
  await api('/auth/logout', { method: 'POST' }).catch(() => {});
  location.href = '/';
});
load().catch((e) => list.replaceChildren(h('p', { class: 'error', text: e.message })));
