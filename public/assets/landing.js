import { api } from './dom.js';

const frame = document.getElementById('sample');
const names = { wedding: 'wedding', birthday: 'birthday', anniversary: 'anniversary', custom: 'party' };
for (const b of document.querySelectorAll('.sample-tabs button')) {
  b.addEventListener('click', () => {
    for (const o of document.querySelectorAll('.sample-tabs button')) o.setAttribute('aria-pressed', String(o === b));
    const k = b.dataset.kind;
    frame.src = k === 'wedding' ? '/demo' : `/demo/${k}`;
    frame.title = `Sample ${names[k]} invitation`;
  });
}
api('/me').then(({ user }) => {
  for (const el of document.querySelectorAll('[data-auth]')) el.hidden = (el.dataset.auth === 'in') !== !!user;
}).catch(() => {});
