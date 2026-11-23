import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeConfig, starterConfig, sampleConfig, KINDS, ordinal, displayNames, occasionLine, hostsLabel, AMBIENT, PALETTES, SAMPLE, mediaKind, monogramOf, inviteTitle, LIMITS, STARTER_LIST, INTROS, SCENES, FONTS, SOUNDS } from '../public/assets/schema.js';
import { SCENE_ART, FRAME_ART } from '../public/assets/scenes.js';

test('a starter config survives sanitising unchanged', () => {
  const cfg = SAMPLE();
  assert.deepEqual(sanitizeConfig(structuredClone(cfg)), cfg);
  assert.equal(inviteTitle(cfg), 'Ayaan & Zara');
  assert.deepEqual(monogramOf(cfg), ['A', 'Z']);
});

test('garbage input becomes a valid empty config', () => {
  for (const bad of [null, 'x', 42, [], { sections: 'nope', theme: 7, basics: [] }]) {
    const cfg = sanitizeConfig(bad);
    assert.equal(cfg.theme.palette, 'champagne');
    assert.deepEqual(cfg.sections, []);
    assert.equal(cfg.basics.first, '');
  }
});

test('unknown keys, section types and unsafe values are dropped', () => {
  const cfg = SAMPLE();
  cfg.evil = 1;
  cfg.basics.extra = 'x';
  cfg.theme.accent = 'red;background:url(x)';
  cfg.hero.media = { kind: 'image', url: 'https://evil.example/a.png' };
  cfg.music.url = 'javascript:alert(1)';
  cfg.sections.push({ type: 'script', title: 'x' });
  cfg.sections.push({ type: 'custom', title: 'ok', linkUrl: 'javascript:alert(1)', linkLabel: 'go', onclick: 'x' });
  cfg.sections.push({ type: 'custom', title: 'ok2', linkUrl: 'http://insecure.example', media: { kind: 'video', url: '/media/abcdefgh1234/abcdefgh1234.jpg' } });
  const out = sanitizeConfig(cfg);
  assert.equal(out.evil, undefined);
  assert.equal(out.basics.extra, undefined);
  assert.equal(out.theme.accent, '#b08a4a');
  assert.equal(out.hero.media, null);
  assert.equal(out.music.url, '');
  assert.equal(out.sections.some((s) => s.type === 'script'), false);
  const [a, b] = out.sections.slice(-2);
  assert.equal(a.linkUrl, '');
  assert.equal(a.onclick, undefined);
  assert.equal(b.linkUrl, '');
  // the kind comes from the stored extension, not from what the client claims
  assert.deepEqual(b.media, { kind: 'image', url: '/media/abcdefgh1234/abcdefgh1234.jpg' });
});

test('single sections cannot be duplicated and counts are capped', () => {
  const cfg = SAMPLE();
  const rsvp = cfg.sections.find((s) => s.type === 'rsvp');
  cfg.sections.push({ ...rsvp }, { ...rsvp, id: 'zzzzzzzz' });
  for (let i = 0; i < 60; i++) cfg.sections.push({ type: 'custom', title: `c${i}` });
  const out = sanitizeConfig(cfg);
  assert.equal(out.sections.filter((s) => s.type === 'rsvp').length, 1);
  assert.equal(out.sections.length, LIMITS.sections);
  assert.equal(new Set(out.sections.map((s) => s.id)).size, out.sections.length);
});

test('text is length-limited and control characters removed', () => {
  const cfg = SAMPLE();
  cfg.basics.first = 'A\u0000B\nC' + 'x'.repeat(500);
  const out = sanitizeConfig(cfg);
  assert.equal(out.basics.first.length, 60);
  assert.ok(out.basics.first.startsWith('ABC'));
  const rsvp = sanitizeConfig({ sections: [{ type: 'rsvp', maxGuests: 9999 }] }).sections[0];
  assert.equal(rsvp.maxGuests, 20);
});

test('mediaKind only recognises uploaded files', () => {
  assert.equal(mediaKind('/media/abcdefgh1234/abcdefgh1234.mp4'), 'video');
  assert.equal(mediaKind('/media/abcdefgh1234/abcdefgh1234.mp3'), 'audio');
  assert.equal(mediaKind('/media/abcdefgh1234/abcdefgh1234.svg'), null);
  assert.equal(mediaKind('/media/../secret/abcdefgh1234.png'), null);
  assert.equal(mediaKind('//evil.example/media/abcdefgh1234/abcdefgh1234.png'), null);
});

test('every starter builds', () => {
  for (const st of STARTER_LIST) {
    const cfg = starterConfig(st.id);
    assert.equal(cfg.basics.kind, st.kind, st.id);
    assert.ok(cfg.sections.length >= 5, st.id);
    assert.equal(cfg.sections.some((x) => x.type === 'rsvp'), true, st.id);
    // wedding designs introduce the couple; the others introduce a guest of honour
    assert.equal(cfg.sections[st.kind === 'wedding' ? 1 : 0].type, st.kind === 'wedding' ? 'couple' : 'honoree', st.id);
  }
  assert.equal(starterConfig('unknown').basics.kind, 'wedding');
});

test('design options meet the promised minimums and every scene and frame has artwork', () => {
  assert.ok(Object.keys(INTROS).length >= 5);
  assert.ok(Object.keys(SCENES).length >= 10);
  assert.ok(Object.keys(FONTS).length >= 10);
  for (const id of Object.keys(SCENES)) assert.match(SCENE_ART[id](), /<(path|circle|g|rect)/);
  for (const id of ['arch', 'round', 'oval', 'none']) assert.equal(typeof FRAME_ART[id](), 'string');
});

test('invitations saved before frames and opening styles existed still load', () => {
  assert.equal(sanitizeConfig({ hero: { frame: true } }).hero.frame, 'arch');
  assert.equal(sanitizeConfig({ hero: { frame: false } }).hero.frame, 'none');
  assert.equal(sanitizeConfig({ intro: { enabled: true } }).intro.style, 'envelope');
  assert.equal(sanitizeConfig({ intro: { style: 'trapdoor' }, hero: { scene: 'volcano' } }).intro.style, 'envelope');
});

test('music accepts built-in tracks and uploads, nothing else', () => {
  const url = (u) => sanitizeConfig({ music: { url: u } }).music.url;
  for (const id of Object.keys(SOUNDS)) assert.equal(url(`/sounds/${id}.mp3`), `/sounds/${id}.mp3`);
  assert.equal(url('/media/abcdefgh1234/abcdefgh1234.mp3'), '/media/abcdefgh1234/abcdefgh1234.mp3');
  for (const bad of ['/sounds/unknown.mp3', '/sounds/../x.mp3', '/sounds/canon.mp3?x', 'https://example.com/a.mp3', '/sounds/constructor.mp3']) assert.equal(url(bad), '');
});

test('movement settings default on for older invitations and can each be switched off', () => {
  assert.deepEqual(sanitizeConfig({}).motion, { ambient: 'petals', living: true, wreath: true, scroll: true });
  assert.deepEqual(sanitizeConfig({ motion: { ambient: 'none', living: false, wreath: false, scroll: false } }).motion, { ambient: 'none', living: false, wreath: false, scroll: false });
  assert.equal(sanitizeConfig({ motion: { ambient: 'fireworks' } }).motion.ambient, 'petals');
});

test('every occasion has at least two starting designs and a working sample', () => {
  for (const kind of Object.keys(KINDS)) {
    assert.ok(STARTER_LIST.filter((s) => s.kind === kind).length >= 2, kind);
    const cfg = sampleConfig(kind);
    assert.equal(cfg.basics.kind, kind);
    assert.notEqual(inviteTitle(cfg), 'Untitled invitation');
  }
});

test('a starter from another occasion is swapped for one that fits', () => {
  const cfg = starterConfig('timeless', { kind: 'birthday', first: 'Ada' });
  assert.equal(cfg.basics.kind, 'birthday');
  assert.equal(cfg.sections.some((s) => s.type === 'couple'), false);
});

test('titles, names and wording follow the occasion', () => {
  const make = (basics) => sanitizeConfig({ basics });
  const bday = make({ kind: 'birthday', first: 'Ada', second: 'Ignored', milestone: 30 });
  assert.equal(inviteTitle(bday), 'Ada’s 30th Birthday');
  assert.equal(displayNames(bday), 'Ada');
  assert.deepEqual(monogramOf(bday), ['A']);
  assert.equal(hostsLabel(bday), 'Ada');
  assert.equal(occasionLine(make({ kind: 'birthday', first: 'Ada' })), 'Birthday Celebration');
  const ann = make({ kind: 'anniversary', first: 'Grace', second: 'Daniel', milestone: 25 });
  assert.equal(inviteTitle(ann), 'Grace & Daniel — 25th Anniversary');
  assert.equal(hostsLabel(ann), 'the couple');
  const other = make({ kind: 'custom', title: 'Baby Shower' });
  assert.equal(inviteTitle(other), 'Baby Shower');
  assert.deepEqual(monogramOf(other), ['B']);
  assert.equal(hostsLabel(other), 'the hosts');
  assert.equal(inviteTitle(make({ kind: 'custom' })), 'Untitled invitation');
  assert.equal(make({ kind: 'party', milestone: -4 }).basics.kind, 'wedding');
  assert.equal(make({ kind: 'birthday', milestone: 9999 }).basics.milestone, 150);
});

test('ordinals', () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 30, 101, 111, 112].map(ordinal), ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '30th', '101st', '111th', '112th']);
});

test('party options exist', () => {
  for (const k of ['confetti', 'balloons']) assert.ok(AMBIENT[k]);
  for (const k of ['candy', 'sunshine', 'mint', 'silver', 'ruby']) assert.ok(PALETTES[k]);
  for (const k of ['balloons', 'bunting']) assert.match(SCENE_ART[k](), /sc-bal/);
});
