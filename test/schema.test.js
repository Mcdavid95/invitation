import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeConfig, starterConfig, SAMPLE, mediaKind, monogramOf, inviteTitle, LIMITS, STARTER_LIST, INTROS, SCENES, FONTS, SOUNDS } from '../public/assets/schema.js';
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
  assert.equal(out.basics.first.length, 200);
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
  for (const s of [...STARTER_LIST.map((x) => x.id), 'unknown']) assert.equal(starterConfig(s).sections.length, 10);
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
