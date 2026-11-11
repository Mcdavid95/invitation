import { api, $ } from './dom.js';
const form = $('#auth');
const error = $('.error', form);
const button = $('button', form);
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (button.disabled) return;
  const body = Object.fromEntries(new FormData(form));
  button.disabled = true;
  error.textContent = '';
  try {
    await api(`/auth/${form.dataset.mode}`, { method: 'POST', body });
    location.href = '/dashboard';
  } catch (err) {
    error.textContent = err.message;
    button.disabled = false;
  }
});
