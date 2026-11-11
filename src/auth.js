const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (s) => new Uint8Array(s.match(/../g).map((h) => parseInt(h, 16)));

// Workers cap PBKDF2 at 100,000 iterations.
const ITERATIONS = 100_000;
export const SESSION_DAYS = 30;
const MAX_FAILED = 8;
const LOCK_MS = 15 * 60_000;

async function pbkdf2(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256));
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { hash: await pbkdf2(password, salt), salt: hex(salt) };
}

export async function verifyPassword(password, hash, salt) {
  const got = await pbkdf2(password, unhex(salt));
  let diff = got.length ^ hash.length;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hash.charCodeAt(i % hash.length);
  return diff === 0;
}

export const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
export const randomToken = (bytes = 32) => hex(crypto.getRandomValues(new Uint8Array(bytes)));

export const cookieOf = (req, name) => {
  for (const part of (req.headers.get('Cookie') ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
};

export const sessionCookie = (token, secure, maxAge = SESSION_DAYS * 86400) =>
  `sid=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;

/** Only the hash of the session token is stored, so a database read cannot be replayed as a login. */
export async function createSession(db, userId) {
  const token = randomToken();
  await db
    .prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(await sha256(token), userId, Date.now() + SESSION_DAYS * 86400_000)
    .run();
  return token;
}

export async function userFromRequest(db, req) {
  const token = cookieOf(req, 'sid');
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return db
    .prepare('SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?')
    .bind(await sha256(token), Date.now())
    .first();
}

export async function destroySession(db, req) {
  const token = cookieOf(req, 'sid');
  if (token) await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
}

/** Returns the user on success, or { error } with a message that does not reveal whether the email exists. */
export async function login(db, email, password) {
  const bad = { error: 'That email and password do not match.' };
  const u = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!u) {
    await pbkdf2(password, new Uint8Array(16)); // keep timing close to the real path
    return bad;
  }
  const now = Date.now();
  if (u.locked_until > now) return { error: 'Too many attempts. Try again in a few minutes.' };
  if (!(await verifyPassword(password, u.pw_hash, u.pw_salt))) {
    const failed = u.failed_logins + 1;
    await db
      .prepare('UPDATE users SET failed_logins = ?, locked_until = ? WHERE id = ?')
      .bind(failed >= MAX_FAILED ? 0 : failed, failed >= MAX_FAILED ? now + LOCK_MS : 0, u.id)
      .run();
    return bad;
  }
  if (u.failed_logins) await db.prepare('UPDATE users SET failed_logins = 0, locked_until = 0 WHERE id = ?').bind(u.id).run();
  return { user: { id: u.id, email: u.email, name: u.name } };
}
