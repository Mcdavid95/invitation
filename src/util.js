/** Returns the slug if it is valid, otherwise ''. */
export const cleanSlug = (v) => (typeof v === 'string' && /^[a-z0-9](?:[a-z0-9-]{1,48})[a-z0-9]$/.test(v) && !v.includes('--') ? v : '');

export const slugFrom = (title) =>
  title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '') || 'invitation';

/** Validates a guest reply against the invitation's RSVP section. Returns the clean reply or { error }. */
export function cleanRsvp(b, section) {
  const strip = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max);
  const clientId = String(b.clientId ?? '');
  if (!/^[A-Za-z0-9-]{16,64}$/.test(clientId)) return { error: 'Please reload the page and try again.' };
  const name = strip(b.name, 120).replace(/\s+/g, ' ');
  if (!name) return { error: 'Please enter your name.' };
  if (typeof b.attending !== 'boolean') return { error: 'Please let us know if you can come.' };
  let guests = 0;
  if (b.attending) {
    guests = section.askGuests ? Math.round(Number(b.guests)) : 1;
    if (!Number.isFinite(guests) || guests < 1 || guests > section.maxGuests) {
      return { error: `Please choose between 1 and ${section.maxGuests} guests.` };
    }
  }
  return { clientId, name, attending: b.attending, guests, message: section.askMessage ? strip(b.message, 500) : '' };
}

/** Quotes a CSV cell and defuses values a spreadsheet would run as a formula. */
export function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
