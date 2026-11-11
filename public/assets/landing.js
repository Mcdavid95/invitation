import { api } from './dom.js';
api('/me').then(({ user }) => {
  for (const el of document.querySelectorAll('[data-auth]')) el.hidden = (el.dataset.auth === 'in') !== !!user;
}).catch(() => {});
