import {
  sanitizeConfig, starterConfig, inviteTitle, newId, SAMPLE, LIMITS,
  UPLOAD_TYPES, UPLOAD_MAX, CONTENT_TYPE_BY_EXT, UTC_OFFSETS,
} from '../public/assets/schema.js';
import { hashPassword, login, createSession, destroySession, userFromRequest, sessionCookie } from './auth.js';
import { cleanSlug, slugFrom, cleanRsvp, csvCell } from './util.js';
import { ASSETS } from './assets.gen.js';

const MAX_INVITES = 20;
const MAX_RSVPS = 3000;
const MEDIA_QUOTA = 300 * 2 ** 20;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });

async function body(req) {
  if (!(req.headers.get('Content-Type') ?? '').includes('application/json')) throw new HttpError(415, 'Send JSON.');
  const text = await req.text();
  if (text.length > LIMITS.configBytes * 2) throw new HttpError(413, 'That is too large.');
  try {
    const v = JSON.parse(text);
    if (v && typeof v === 'object') return v;
  } catch {}
  throw new HttpError(400, 'Invalid JSON.');
}

const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com', "img-src 'self' data: blob:", "media-src 'self' blob:",
  "frame-src 'self' https://www.google.com", "connect-src 'self'", "object-src 'none'", "base-uri 'none'",
  "form-action 'self'", "frame-ancestors 'self'",
].join('; ');

function secure(res) {
  const out = new Response(res.body, res);
  out.headers.set('X-Content-Type-Options', 'nosniff');
  out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!out.headers.has('Content-Security-Policy')) out.headers.set('Content-Security-Policy', CSP);
  return out;
}

export default {
  async fetch(req, env) {
    try {
      return secure(await route(req, env));
    } catch (e) {
      if (e instanceof HttpError) return secure(json({ error: e.message }, e.status));
      console.error(e.stack ?? e);
      return secure(json({ error: 'Something went wrong on our side.' }, 500));
    }
  },
};

/** Serves a file bundled from public/. "/login" resolves to "/login.html". Returns null when there is none. */
function asset(path, req) {
  const a = ASSETS[path] ?? ASSETS[`${path.replace(/\/$/, '')}.html`] ?? (path === '/' ? ASSETS['/index.html'] : null);
  if (!a) return null;
  const headers = { 'Content-Type': a.type, ETag: a.etag, 'Cache-Control': a.type.startsWith('text/html') ? 'no-cache' : 'public, max-age=300' };
  if (req?.headers.get('If-None-Match') === a.etag) return new Response(null, { status: 304, headers });
  return new Response(a.body, { headers });
}

async function route(req, env) {
  const url = new URL(req.url);
  const path = url.pathname;
  const seg = path.split('/').filter(Boolean);
  const method = req.method;

  if (seg[0] === 'api') {
    // Session cookies are SameSite=Lax; this also refuses cross-origin writes from older browsers.
    const origin = req.headers.get('Origin');
    if (method !== 'GET' && origin && origin !== url.origin) throw new HttpError(403, 'Cross-origin request refused.');
    return api(req, env, url, seg.slice(1));
  }
  if (method !== 'GET' && method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');

  if (seg[0] === 'media' && seg.length === 3) return media(req, env, seg[1], seg[2]);
  if (seg[0] === 'i' && seg.length === 2) return publicInvite(req, env, seg[1]);
  if (path === '/demo') return renderInvite({ cfg: SAMPLE(), demo: true }, 'Sample invitation');
  if (seg[0] === 'edit' && seg.length === 2) return asset('/editor');
  if (path === '/dashboard' || path === '/editor') {
    if (!(await userFromRequest(env.DB, req))) return Response.redirect(new URL('/login', url), 302);
  }
  return asset(path, req) ?? missing();
}

const missing = () => new Response(ASSETS['/missing.html'].body, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

/* ---------- Public invitation ---------- */

function renderInvite(data, title) {
  const res = asset('/invite');
  // The config travels as inert JSON; "<" is escaped so it can never close the script element.
  const payload = JSON.stringify(data).replace(/</g, '\\u003c');
  return new HTMLRewriter()
    .on('script#invite-data', { element: (el) => void el.setInnerContent(payload, { html: true }) })
    .on('title', { element: (el) => void el.setInnerContent(title) })
    .on('meta[property="og:title"]', { element: (el) => void el.setAttribute('content', title) })
    .transform(res);
}

async function publicInvite(req, env, slug) {
  const row = cleanSlug(slug) === slug
    ? await env.DB.prepare('SELECT slug, config FROM invites WHERE slug = ? AND published = 1').bind(slug).first()
    : null;
  if (!row) return missing();
  const cfg = sanitizeConfig(JSON.parse(row.config));
  const res = renderInvite({ cfg, slug: row.slug }, `${inviteTitle(cfg)} — You are invited`);
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'public, max-age=60');
  return out;
}

async function media(req, env, inviteId, file) {
  const m = /^([A-Za-z0-9]{8,24})\.([a-z0-9]{2,4})$/.exec(file);
  const type = m && CONTENT_TYPE_BY_EXT[m[2]];
  if (!type || !/^[A-Za-z0-9]{8,24}$/.test(inviteId)) throw new HttpError(404, 'Not found.');
  const obj = await env.MEDIA.get(`${inviteId}/${file}`, { range: req.headers, onlyIf: req.headers });
  if (!obj) throw new HttpError(404, 'Not found.');
  const headers = new Headers({
    'Content-Type': type, // from the stored extension, never from the uploader
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
    ETag: obj.httpEtag,
    'Content-Security-Policy': "default-src 'none'; sandbox",
  });
  if (!obj.body) return new Response(null, { status: 304, headers });
  const r = obj.range;
  if (r && req.headers.has('Range')) {
    const start = r.offset ?? obj.size - r.suffix;
    const length = r.length ?? obj.size - start;
    headers.set('Content-Range', `bytes ${start}-${start + length - 1}/${obj.size}`);
    headers.set('Content-Length', String(length));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set('Content-Length', String(obj.size));
  return new Response(obj.body, { headers });
}

/* ---------- API ---------- */

async function api(req, env, url, seg) {
  const db = env.DB;
  const method = req.method;
  const is = (m, ...parts) => method === m && seg.length === parts.length && parts.every((p, i) => p === '*' || p === seg[i]);
  const secureCookie = url.protocol === 'https:';

  if (is('POST', 'auth', 'signup')) {
    const b = await body(req);
    const name = String(b.name ?? '').trim().slice(0, 80);
    const email = String(b.email ?? '').trim().toLowerCase();
    const password = String(b.password ?? '');
    if (!name) throw new HttpError(400, 'Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) throw new HttpError(400, 'Please enter a valid email address.');
    if (password.length < 8 || password.length > 200) throw new HttpError(400, 'Use a password of at least 8 characters.');
    const { hash, salt } = await hashPassword(password);
    const id = crypto.randomUUID();
    try {
      await db.prepare('INSERT INTO users (id, email, name, pw_hash, pw_salt, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, email, name, hash, salt, Date.now()).run();
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) throw new HttpError(409, 'An account with that email already exists. Try signing in.');
      throw e;
    }
    return json({ user: { id, email, name } }, 201, { 'Set-Cookie': sessionCookie(await createSession(db, id), secureCookie) });
  }

  if (is('POST', 'auth', 'login')) {
    const b = await body(req);
    const r = await login(db, String(b.email ?? '').trim().toLowerCase(), String(b.password ?? '').slice(0, 200));
    if (r.error) throw new HttpError(401, r.error);
    return json({ user: r.user }, 200, { 'Set-Cookie': sessionCookie(await createSession(db, r.user.id), secureCookie) });
  }

  if (is('POST', 'auth', 'logout')) {
    await destroySession(db, req);
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', secureCookie, 0) });
  }

  // Guests reply without an account.
  if (is('POST', 'i', '*', 'rsvp')) return rsvp(req, db, seg[1]);

  const user = await userFromRequest(db, req);
  if (is('GET', 'me')) return json({ user });
  if (!user) throw new HttpError(401, 'Please sign in.');

  if (is('GET', 'invites')) {
    const { results } = await db
      .prepare(
        `SELECT i.id, i.slug, i.title, i.published, i.updated_at AS updatedAt,
           COALESCE(SUM(r.attending), 0) AS yes,
           COALESCE(SUM(1 - r.attending), 0) AS no,
           COALESCE(SUM(CASE WHEN r.attending = 1 THEN r.guests ELSE 0 END), 0) AS guests
         FROM invites i LEFT JOIN rsvps r ON r.invite_id = i.id
         WHERE i.user_id = ? GROUP BY i.id ORDER BY i.updated_at DESC`,
      )
      .bind(user.id)
      .all();
    return json({ invites: results.map((r) => ({ ...r, published: !!r.published })) });
  }

  if (is('POST', 'invites')) {
    const b = await body(req);
    const { n } = await db.prepare('SELECT COUNT(*) AS n FROM invites WHERE user_id = ?').bind(user.id).first();
    if (n >= MAX_INVITES) throw new HttpError(403, `You can have up to ${MAX_INVITES} invitations. Delete one to make room.`);
    const cfg = starterConfig(String(b.starter ?? ''), {
      first: String(b.first ?? '').slice(0, 60),
      second: String(b.second ?? '').slice(0, 60),
      dateTime: b.dateTime,
      utcOffset: UTC_OFFSETS.includes(b.utcOffset) ? b.utcOffset : '+00:00',
    });
    const id = newId() + newId().slice(0, 4);
    const now = Date.now();
    // The random suffix makes a collision vanishingly unlikely; UNIQUE still has the last word.
    const slug = `${slugFrom(inviteTitle(cfg))}-${newId().slice(0, 4)}`;
    await db
      .prepare('INSERT INTO invites (id, user_id, slug, title, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, user.id, slug, inviteTitle(cfg), JSON.stringify(cfg), now, now)
      .run();
    return json({ id, slug }, 201);
  }

  if (seg[0] !== 'invites' || !seg[1]) throw new HttpError(404, 'Not found.');
  const invite = await db.prepare('SELECT * FROM invites WHERE id = ? AND user_id = ?').bind(seg[1], user.id).first();
  if (!invite) throw new HttpError(404, 'That invitation does not exist.');

  if (is('GET', 'invites', '*')) {
    return json({ id: invite.id, slug: invite.slug, published: !!invite.published, version: invite.version, config: sanitizeConfig(JSON.parse(invite.config)) });
  }

  if (is('PUT', 'invites', '*')) {
    const b = await body(req);
    const cfg = sanitizeConfig(b.config);
    const text = JSON.stringify(cfg);
    if (text.length > LIMITS.configBytes) throw new HttpError(413, 'This invitation has too much content to save.');
    const slug = b.slug === undefined ? invite.slug : cleanSlug(b.slug);
    if (!slug) throw new HttpError(400, 'Links use 3 to 50 lowercase letters, numbers and hyphens.');
    const published = b.published === undefined ? invite.published : b.published === true ? 1 : 0;
    let res;
    try {
      // The version check stops a second tab or device from silently overwriting newer edits.
      res = await db
        .prepare('UPDATE invites SET config = ?, title = ?, slug = ?, published = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?')
        .bind(text, inviteTitle(cfg), slug, published, Date.now(), invite.id, Number(b.version))
        .run();
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) throw new HttpError(409, 'That link is already taken. Try another.');
      throw e;
    }
    if (!res.meta.changes) throw new HttpError(409, 'This invitation was changed somewhere else. Reload to get the latest version.');
    return json({ version: Number(b.version) + 1, slug, published: !!published });
  }

  if (is('DELETE', 'invites', '*')) {
    const { results } = await db.prepare('SELECT id, ext FROM media WHERE invite_id = ?').bind(invite.id).all();
    for (let i = 0; i < results.length; i += 500) {
      await env.MEDIA.delete(results.slice(i, i + 500).map((m) => `${invite.id}/${m.id}.${m.ext}`));
    }
    await db.batch([
      db.prepare('DELETE FROM media WHERE invite_id = ?').bind(invite.id),
      db.prepare('DELETE FROM rsvps WHERE invite_id = ?').bind(invite.id),
      db.prepare('DELETE FROM invites WHERE id = ?').bind(invite.id),
    ]);
    return json({ ok: true });
  }

  if (is('GET', 'invites', '*', 'rsvps') || is('GET', 'invites', '*', 'rsvps.csv')) {
    const { results } = await db
      .prepare('SELECT id, name, attending, guests, message, updated_at AS updatedAt FROM rsvps WHERE invite_id = ? ORDER BY updated_at DESC')
      .bind(invite.id)
      .all();
    if (seg[2] === 'rsvps') return json({ rsvps: results.map((r) => ({ ...r, attending: !!r.attending })) });
    const rows = [['Name', 'Attending', 'Guests', 'Message', 'Replied (UTC)']];
    for (const r of results) rows.push([r.name, r.attending ? 'Yes' : 'No', r.guests, r.message, new Date(r.updatedAt).toISOString().slice(0, 16).replace('T', ' ')]);
    return new Response('﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n'), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="rsvps-${invite.slug}.csv"`, 'Cache-Control': 'no-store' },
    });
  }

  if (is('DELETE', 'invites', '*', 'rsvps', '*')) {
    await db.prepare('DELETE FROM rsvps WHERE id = ? AND invite_id = ?').bind(Number(seg[3]), invite.id).run();
    return json({ ok: true });
  }

  if (is('POST', 'invites', '*', 'media')) {
    const spec = UPLOAD_TYPES[(req.headers.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase()];
    if (!spec) throw new HttpError(415, 'Use a JPG, PNG, WebP, GIF or AVIF image, an MP4 or WebM video, or an MP3, M4A, OGG or WAV track.');
    const [kind, ext] = spec;
    const size = Number(req.headers.get('Content-Length'));
    const mb = (n) => `${Math.round(n / 2 ** 20)} MB`;
    if (!Number.isInteger(size) || size <= 0) throw new HttpError(411, 'The upload has no size.');
    if (size > UPLOAD_MAX[kind]) throw new HttpError(413, `That ${kind} file is too big. The limit is ${mb(UPLOAD_MAX[kind])}.`);
    const { used } = await db.prepare('SELECT COALESCE(SUM(size), 0) AS used FROM media WHERE invite_id = ?').bind(invite.id).first();
    if (used + size > MEDIA_QUOTA) throw new HttpError(413, `This invitation has reached its ${mb(MEDIA_QUOTA)} media allowance. Remove a file to make room.`);
    const id = newId() + newId().slice(0, 4);
    const key = `${invite.id}/${id}.${ext}`;
    const obj = await env.MEDIA.put(key, req.body, { httpMetadata: { contentType: CONTENT_TYPE_BY_EXT[ext] } });
    if (obj.size > UPLOAD_MAX[kind]) {
      await env.MEDIA.delete(key);
      throw new HttpError(413, 'That file is too big.');
    }
    await db.prepare('INSERT INTO media (id, invite_id, kind, ext, size, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, invite.id, kind, ext, obj.size, Date.now()).run();
    return json({ kind, url: `/media/${key}` }, 201);
  }

  if (is('DELETE', 'invites', '*', 'media', '*')) {
    const m = await db.prepare('SELECT id, ext FROM media WHERE id = ? AND invite_id = ?').bind(seg[3], invite.id).first();
    if (m) {
      await env.MEDIA.delete(`${invite.id}/${m.id}.${m.ext}`);
      await db.prepare('DELETE FROM media WHERE id = ?').bind(m.id).run();
    }
    return json({ ok: true });
  }

  throw new HttpError(404, 'Not found.');
}

async function rsvp(req, db, slug) {
  const invite = cleanSlug(slug) === slug
    ? await db.prepare('SELECT id, config FROM invites WHERE slug = ? AND published = 1').bind(slug).first()
    : null;
  if (!invite) throw new HttpError(404, 'This invitation is not available.');
  const section = sanitizeConfig(JSON.parse(invite.config)).sections.find((s) => s.type === 'rsvp' && s.enabled);
  if (!section) throw new HttpError(403, 'This invitation is not taking replies.');
  const r = cleanRsvp(await body(req), section);
  if (r.error) throw new HttpError(400, r.error);

  const now = Date.now();
  const existing = await db.prepare('SELECT id FROM rsvps WHERE invite_id = ? AND client_id = ?').bind(invite.id, r.clientId).first();
  if (!existing) {
    const { n } = await db.prepare('SELECT COUNT(*) AS n FROM rsvps WHERE invite_id = ?').bind(invite.id).first();
    if (n >= MAX_RSVPS) throw new HttpError(429, 'This invitation cannot take more replies. Please contact the hosts directly.');
  }
  // Keyed on (invitation, guest device): a retry or a double tap updates the same row instead of adding one.
  await db
    .prepare(
      `INSERT INTO rsvps (invite_id, client_id, name, attending, guests, message, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (invite_id, client_id) DO UPDATE SET
         name = excluded.name, attending = excluded.attending, guests = excluded.guests,
         message = excluded.message, updated_at = excluded.updated_at`,
    )
    .bind(invite.id, r.clientId, r.name, r.attending ? 1 : 0, r.guests, r.message, now, now)
    .run();
  return json({ ok: true, updated: !!existing });
}
