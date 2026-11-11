import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanSlug, slugFrom, cleanRsvp, csvCell } from '../src/util.js';
import { hashPassword, verifyPassword } from '../src/auth.js';

const section = { askGuests: true, maxGuests: 4, askMessage: true };
const base = { clientId: 'a'.repeat(36), name: ' Ada   Obi ', attending: true, guests: 2, message: 'hi' };

test('rsvp: valid reply is normalised', () => {
  assert.deepEqual(cleanRsvp(base, section), { clientId: base.clientId, name: 'Ada Obi', attending: true, guests: 2, message: 'hi' });
});
test('rsvp: guests are bounded by the invitation, and zero when declining', () => {
  assert.ok(cleanRsvp({ ...base, guests: 5 }, section).error);
  assert.ok(cleanRsvp({ ...base, guests: 0 }, section).error);
  assert.ok(cleanRsvp({ ...base, guests: 'x' }, section).error);
  assert.equal(cleanRsvp({ ...base, attending: false, guests: 99 }, section).guests, 0);
  assert.equal(cleanRsvp({ ...base, guests: 99 }, { ...section, askGuests: false }).guests, 1);
});
test('rsvp: rejects missing name, non-boolean attending and bad client ids', () => {
  assert.ok(cleanRsvp({ ...base, name: '  ' }, section).error);
  assert.ok(cleanRsvp({ ...base, attending: 'yes' }, section).error);
  assert.ok(cleanRsvp({ ...base, clientId: "x' OR 1=1" }, section).error);
  assert.equal(cleanRsvp({ ...base, message: 'm' }, { ...section, askMessage: false }).message, '');
});

test('slugs', () => {
  assert.equal(slugFrom('Chidi & Amára'), 'chidi-and-amara');
  assert.equal(slugFrom('!!!'), 'invitation');
  assert.equal(cleanSlug('chidi-and-amara'), 'chidi-and-amara');
  for (const bad of ['ab', 'A-b-c', '-abc', 'abc-', 'a--b', 'a b c', '../x', 'x'.repeat(51), 5]) assert.equal(cleanSlug(bad), '');
});

test('csv cells are quoted and formulas defused', () => {
  assert.equal(csvCell('a "b", c'), '"a ""b"", c"');
  assert.equal(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
  assert.equal(csvCell('+1'), '"\'+1"');
  assert.equal(csvCell(3), '"3"');
});

test('passwords verify only against their own hash', async () => {
  const a = await hashPassword('correct horse');
  const b = await hashPassword('correct horse');
  assert.notEqual(a.hash, b.hash);
  assert.equal(await verifyPassword('correct horse', a.hash, a.salt), true);
  assert.equal(await verifyPassword('wrong', a.hash, a.salt), false);
  assert.equal(await verifyPassword('correct horse', a.hash, b.salt), false);
});
