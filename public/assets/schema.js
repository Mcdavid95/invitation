// The shape of an invitation. Shared by the Worker (which sanitises every save
// with it), the editor (which builds its forms from it) and the renderer.

export const PALETTES = {
  champagne: { label: 'Champagne', bg: '#fdf5ec', paper: '#f6eee1', accent: '#b08a4a', text: '#6f5a37' },
  blush: { label: 'Blush', bg: '#fdf3f1', paper: '#f8e4e0', accent: '#b9737a', text: '#6b4a4e' },
  sage: { label: 'Sage', bg: '#f5f7f0', paper: '#e8eede', accent: '#7a8f62', text: '#47533a' },
  lavender: { label: 'Lavender', bg: '#f7f4fb', paper: '#ebe4f4', accent: '#8a6fb0', text: '#4d4263' },
  ocean: { label: 'Ocean', bg: '#f1f7f8', paper: '#dfecee', accent: '#3f7f8c', text: '#2f4f57' },
  burgundy: { label: 'Burgundy', bg: '#fbf4ef', paper: '#f2e3da', accent: '#7d2e3a', text: '#4d2a2f' },
  midnight: { label: 'Midnight', bg: '#141b2d', paper: '#1e2942', accent: '#d4b06a', text: '#e9e2d0' },
  noir: { label: 'Noir', bg: '#121212', paper: '#1e1e1e', accent: '#c9a769', text: '#ece7dc' },
  rosegold: { label: 'Rose gold', bg: '#fbf1ee', paper: '#f5e2dc', accent: '#b76e5d', text: '#5e4039' },
  terracotta: { label: 'Terracotta', bg: '#fbf3ea', paper: '#f3e2d0', accent: '#b5562f', text: '#5a3a28' },
  emerald: { label: 'Emerald', bg: '#0f2a22', paper: '#173a2f', accent: '#d8b76a', text: '#e8e4d2' },
  plum: { label: 'Plum', bg: '#2a1a2e', paper: '#3a2540', accent: '#d9a5b5', text: '#efe3ea' },
  peach: { label: 'Peach', bg: '#fff5ee', paper: '#fde6d6', accent: '#e08a5b', text: '#6b4634' },
  sky: { label: 'Sky', bg: '#f3f8fc', paper: '#e1edf7', accent: '#5b86b8', text: '#34495f' },
  forest: { label: 'Forest', bg: '#f3f5ee', paper: '#e2e8d8', accent: '#3f5f45', text: '#2f3f31' },
  ivory: { label: 'Ivory', bg: '#fbfaf6', paper: '#f1efe8', accent: '#3d3a34', text: '#3d3a34' },
  candy: { label: 'Candy', bg: '#fff4fa', paper: '#fde3f1', accent: '#d94f9b', text: '#5b2a4a' },
  sunshine: { label: 'Sunshine', bg: '#fffaf0', paper: '#fff0cc', accent: '#e0901a', text: '#5a4320' },
  mint: { label: 'Mint', bg: '#f2fbf7', paper: '#dcf3ea', accent: '#2e9c7a', text: '#234a3f' },
  silver: { label: 'Silver', bg: '#f6f7f9', paper: '#e7eaef', accent: '#7c8796', text: '#3b434f' },
  ruby: { label: 'Ruby', bg: '#fbf2f3', paper: '#f3dde0', accent: '#9b1b30', text: '#4a1d24' },
};

// What the invitation is for. Decides which name fields apply, how the title reads,
// and which starting designs are offered.
export const KINDS = { wedding: 'Wedding', birthday: 'Birthday', anniversary: 'Anniversary', custom: 'Something else' };
export const KIND_NOTES = {
  wedding: 'Nikkah, ceremony or reception', birthday: 'Any age, any kind of party',
  anniversary: 'Years together, renewed vows', custom: 'Graduation, shower, dinner, anything',
};
export const ordinal = (n) => {
  const t = n % 100;
  return `${n}${t >= 11 && t <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
};
export const COLOR_KEYS = ['bg', 'paper', 'accent', 'text'];
export const COLOR_LABELS = { bg: 'Background', paper: 'Cards', accent: 'Accent', text: 'Text' };

// script = headings, body = text, caps = small labels. size = body size in px, tuned per typeface.
const font = (label, script, body, caps, size, q) => ({ label, script, body, caps, size, q });
export const FONTS = {
  classic: font('Classic', 'Pinyon Script', 'Cormorant Garamond', 'Cinzel', 20, 'Pinyon+Script&family=Cormorant+Garamond:wght@400;500&family=Cinzel:wght@400;500'),
  romantic: font('Romantic', 'Great Vibes', 'EB Garamond', 'Cinzel', 19, 'Great+Vibes&family=EB+Garamond:wght@400;500&family=Cinzel:wght@400;500'),
  grand: font('Grand', 'Monsieur La Doulaise', 'Cormorant Garamond', 'Cinzel', 20, 'Monsieur+La+Doulaise&family=Cormorant+Garamond:wght@400;500&family=Cinzel:wght@400;500'),
  calligraphy: font('Calligraphy', 'Allura', 'Crimson Pro', 'Cinzel', 19, 'Allura&family=Crimson+Pro:wght@400;500&family=Cinzel:wght@400;500'),
  flowing: font('Flowing', 'Alex Brush', 'Playfair Display', 'Playfair Display', 17, 'Alex+Brush&family=Playfair+Display:wght@400;500'),
  royal: font('Royal', 'Italianno', 'Cormorant Infant', 'Cinzel Decorative', 20, 'Italianno&family=Cormorant+Infant:wght@400;500&family=Cinzel+Decorative'),
  vintage: font('Vintage', 'Parisienne', 'Libre Baskerville', 'Libre Baskerville', 16, 'Parisienne&family=Libre+Baskerville'),
  handwritten: font('Handwritten', 'Sacramento', 'Lora', 'Lora', 17, 'Sacramento&family=Lora:wght@400;500'),
  playful: font('Playful', 'Dancing Script', 'Quicksand', 'Quicksand', 17, 'Dancing+Script&family=Quicksand:wght@400;500'),
  modern: font('Modern', 'Italiana', 'Jost', 'Jost', 17, 'Italiana&family=Jost:wght@300;400;500'),
  party: font('Party', 'Pacifico', 'Nunito', 'Nunito', 17, 'Pacifico&family=Nunito:wght@400;600'),
  bubbly: font('Bubbly', 'Fredoka', 'Nunito', 'Fredoka', 17, 'Fredoka:wght@500&family=Nunito:wght@400;600'),
  retro: font('Retro', 'Lobster Two', 'Lora', 'Lora', 17, 'Lobster+Two&family=Lora:wght@400;500'),
  editorial: font('Editorial', 'Bodoni Moda', 'Montserrat', 'Montserrat', 16, 'Bodoni+Moda:ital@1&family=Montserrat:wght@300;400;500'),
  deco: font('Art deco', 'Poiret One', 'Raleway', 'Raleway', 17, 'Poiret+One&family=Raleway:wght@300;400;500'),
};

export const INTROS = {
  envelope: 'Sealed envelope', doors: 'Grand doors', curtain: 'Velvet curtains',
  heart: 'Heart locket', ribbon: 'Gift box', petals: 'Rose petals',
};
export const SCENES = {
  skyline: 'Domes at sunset', sky: 'Open sky', mountains: 'Mountains', beach: 'Beach', garden: 'Garden pavilion', night: 'Starry night',
  city: 'City skyline', chapel: 'Chapel on a hill', forest: 'Pine forest', hills: 'Vineyard hills', lake: 'Lakeside', blossom: 'Blossom branches',
  balloons: 'Balloons', bunting: 'Garden party',
};
export const AMBIENT = { petals: 'Petals', sparkles: 'Sparkles', hearts: 'Hearts', confetti: 'Confetti', balloons: 'Balloons', none: 'Nothing' };
export const FRAMES = { arch: 'Ornate arch', round: 'Round arch', oval: 'Oval', none: 'No frame' };
// Built-in tracks, generated by scripts/make-sounds.py and served from /sounds/<id>.mp3.
export const SOUNDS = {
  canon: 'Canon in D (harp)', reverie: 'Piano Reverie', musicbox: 'Music Box Lullaby',
  strings: 'Evening Strings', waltz: 'Garden Waltz', serenade: 'Guitar Serenade',
};
export const soundUrl = (id) => `/sounds/${id}.mp3`;
const soundId = (url) => {
  const m = typeof url === 'string' && /^\/sounds\/([a-z]+)\.mp3$/.exec(url);
  return m && Object.hasOwn(SOUNDS, m[1]) ? m[1] : null;
};
export const isLibrarySound = (url) => !!soundId(url);


export const ICONS = ['arch', 'bride', 'rings', 'heart', 'crescent', 'cloche', 'glass', 'cake', 'music', 'sparkle', 'balloon', 'gift', 'star', 'camera'];

const EXT = {
  image: ['jpg', 'png', 'webp', 'gif', 'avif'],
  video: ['mp4', 'webm'],
  audio: ['mp3', 'm4a', 'ogg', 'wav'],
};
// Content types accepted for upload, and the extension each is stored under.
export const UPLOAD_TYPES = {
  'image/jpeg': ['image', 'jpg'], 'image/png': ['image', 'png'], 'image/webp': ['image', 'webp'],
  'image/gif': ['image', 'gif'], 'image/avif': ['image', 'avif'],
  'video/mp4': ['video', 'mp4'], 'video/webm': ['video', 'webm'],
  'audio/mpeg': ['audio', 'mp3'], 'audio/mp4': ['audio', 'm4a'], 'audio/x-m4a': ['audio', 'm4a'],
  'audio/ogg': ['audio', 'ogg'], 'audio/wav': ['audio', 'wav'], 'audio/x-wav': ['audio', 'wav'],
};
export const UPLOAD_MAX = { image: 10 * 2 ** 20, audio: 25 * 2 ** 20, video: 80 * 2 ** 20 };
export const CONTENT_TYPE_BY_EXT = {
  jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif',
  mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav',
};

const MEDIA_RE = /^\/media\/[A-Za-z0-9]{8,24}\/[A-Za-z0-9]{8,24}\.([a-z0-9]{2,4})$/;
export const mediaKind = (url) => {
  const m = typeof url === 'string' && MEDIA_RE.exec(url);
  if (!m) return null;
  return Object.keys(EXT).find((k) => EXT[k].includes(m[1])) ?? null;
};

const OFFSETS = [];
for (let m = -720; m <= 840; m += 30) {
  const a = Math.abs(m);
  OFFSETS.push(`${m < 0 ? '-' : '+'}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`);
}
export const UTC_OFFSETS = OFFSETS;

// Field descriptor: k = key, l = label, t = type, plus type-specific options.
const f = (k, l, t = 'text', extra = {}) => ({ k, l, t, ...extra });
const mediaField = f('media', 'Photo or video', 'media', { help: 'Shown under the heading. Videos play silently on a loop.' });

export const GROUPS = {
  basics: {
    label: 'Occasion, names & date',
    // kinds: the occasions a field applies to. kl: the label for a particular occasion.
    fields: [
      f('kind', 'Occasion', 'select', { options: Object.keys(KINDS), labels: KINDS, tiles: true }),
      f('title', 'Event name', 'text', { max: 80, kinds: ['custom'], help: 'For example: Ada’s Graduation, Baby Shower, Dinner with Friends.' }),
      f('first', 'First name', 'text', { max: 60, kl: { birthday: 'Name of the guest of honour', custom: 'Host or guest of honour (optional)' } }),
      f('second', 'Second name', 'text', { max: 60, kinds: ['wedding', 'anniversary', 'custom'], kl: { custom: 'Second name (optional)' } }),
      f('milestone', 'Age they are turning', 'int', { min: 0, max: 150, kinds: ['birthday', 'anniversary'], kl: { anniversary: 'Years together' }, help: 'Shown as “30th Birthday” or “25th Anniversary”. 0 leaves it out.' }),
      f('monogram', 'Monogram', 'text', { max: 7, help: 'Leave empty to use the initials.' }),
      f('dateTime', 'Date and time', 'datetime'),
      f('utcOffset', 'Time zone of the venue (UTC offset)', 'select', { options: OFFSETS }),
      f('closing', 'Closing line'),
    ],
  },
  intro: {
    label: 'Opening moment',
    fields: [
      f('enabled', 'Start with an opening moment', 'bool'),
      f('style', 'What guests open', 'select', { options: Object.keys(INTROS), labels: INTROS, tiles: true }),
      f('label', 'Prompt'),
    ],
  },
  hero: {
    label: 'Cover',
    fields: [
      f('media', 'Cover photo or video', 'media', { help: 'Fills the cover. Without one, an illustrated scene is used.' }),
      f('frame', 'Frame', 'select', { options: Object.keys(FRAMES), labels: FRAMES, tiles: true, legacy: { true: 'arch', false: 'none' } }),
      f('scene', 'Illustrated scene', 'select', { options: Object.keys(SCENES), labels: SCENES, tiles: 'scene', help: 'Used when there is no cover photo or video.' }),
      f('showMonogram', 'Show monogram', 'bool'),
      f('showNames', 'Show names', 'bool'),
      f('showOccasion', 'Show the occasion (for example “30th Birthday”)', 'bool'),
      f('tagline', 'Line under the names'),
      f('cue', 'Scroll prompt'),
    ],
  },
  motion: {
    label: 'Movement',
    fields: [
      f('ambient', 'Floating in the air', 'select', { options: Object.keys(AMBIENT), labels: AMBIENT, tiles: true }),
      f('living', 'Illustrations move gently (swaying flowers, drifting clouds, twinkling stars)', 'bool'),
      f('wreath', 'Turning wreath around the monogram', 'bool'),
      f('scroll', 'Effects while scrolling (depth, timeline that fills in)', 'bool'),
    ],
  },
  music: {
    label: 'Music',
    fields: [
      f('url', 'Track', 'audio', { help: 'Pick a built-in track, or upload an audio file you have the right to use. Guests can pause it at any time.' }),
      f('autoplay', 'Start when the invitation is opened', 'bool'),
    ],
  },
};

export const SECTIONS = {
  honoree: {
    label: 'Guest of honour', single: true,
    fields: [
      f('eventLine', 'Invitation line', 'textarea', { max: 200 }),
      f('subtitle', 'Line under the name', 'text', { max: 120 }),
      f('showMilestone', 'Show the age or years as a badge', 'bool'),
      f('milestoneLabel', 'Badge wording', 'text', { max: 30, help: 'Leave empty for “Birthday” or “Anniversary”.' }),
      f('text', 'Message', 'textarea'),
      mediaField,
    ],
    defaults: { eventLine: 'Please join us to celebrate', subtitle: '', showMilestone: true, milestoneLabel: '', text: '' },
  },
  date: {
    label: 'The date', single: true,
    fields: [f('title', 'Heading'), f('scratch', 'Guests scratch to reveal', 'bool'), f('hint', 'Hint'), mediaField],
    defaults: { title: 'The Date', scratch: true, hint: '✦ Scratch to reveal the date ✦' },
  },
  couple: {
    label: 'The couple', single: true,
    fields: [
      f('eventLine', 'Invitation line', 'textarea', { max: 200 }),
      f('firstLabel', 'First: family label'), f('firstParents', 'First: parents'),
      f('joiner', 'Joining word'),
      f('secondLabel', 'Second: family label'), f('secondParents', 'Second: parents'),
      mediaField,
    ],
    defaults: { eventLine: 'Together with their families\ninvite you to celebrate the wedding of', firstLabel: 'Son of', firstParents: '', joiner: 'With', secondLabel: 'Daughter of', secondParents: '' },
  },
  message: {
    label: 'Welcome message', single: true,
    fields: [f('title', 'Heading'), f('text', 'Message', 'textarea'), f('florals', 'Floral accents', 'bool'), mediaField],
    defaults: { title: 'Dear Friends and Family', text: 'Join us for an evening of love, laughter and unforgettable memories as we begin our forever.', florals: true },
  },
  quote: {
    label: 'Verse or quote',
    fields: [f('text', 'Verse', 'textarea', { max: 400 }), f('translation', 'Translation or second line', 'textarea', { max: 400 }), f('reference', 'Reference'), mediaField],
    defaults: { text: '', translation: '"Whatever our souls are made of, his and mine are the same."', reference: 'Emily Brontë' },
  },
  timeline: {
    label: 'Timeline', single: true,
    fields: [
      f('title', 'Heading'),
      f('items', 'Moments', 'list', {
        max: 12, add: 'Add a moment',
        item: [f('time', 'Time', 'text', { max: 30 }), f('title', 'What happens', 'text', { max: 80 }), f('icon', 'Icon', 'select', { options: ICONS })],
        blank: { time: '', title: '', icon: 'heart' },
      }),
      mediaField,
    ],
    defaults: {
      title: 'Wedding Timeline',
      items: [
        { time: '4:00 pm', title: 'Guest Arrival and Welcome Drinks', icon: 'arch' },
        { time: '4:30 pm', title: 'Ceremony', icon: 'rings' },
        { time: '6:00 pm', title: 'Dinner', icon: 'cloche' },
        { time: '8:00 pm', title: 'First Dance', icon: 'music' },
        { time: '9:00 pm', title: 'Let the Fun Begin', icon: 'sparkle' },
      ],
    },
  },
  countdown: {
    label: 'Countdown', single: true,
    fields: [f('title', 'Heading'), mediaField],
    defaults: { title: 'The Celebration Begins' },
  },
  location: {
    label: 'Location', single: true,
    fields: [
      f('title', 'Heading'), f('city', 'City'), f('venue', 'Venue', 'textarea', { max: 200 }),
      mediaField,
      f('showMap', 'Show a map', 'bool'),
      f('mapQuery', 'Map search', 'text', { help: 'A place name or address, as you would type it into Google Maps.' }),
      f('linkLabel', 'Directions link text'),
    ],
    defaults: { title: 'Location', city: '', venue: '', showMap: true, mapQuery: '', linkLabel: 'Get Directions' },
  },
  dress: {
    label: 'Dress code', single: true,
    fields: [
      f('title', 'Heading'), mediaField, f('intro', 'Line before'), f('style', 'Dress code'), f('outro', 'Line after'),
      f('shadesLabel', 'Shades label'), f('shades', 'Recommended shades', 'colors', { max: 8 }),
      f('notes', 'Notes', 'textarea', { help: 'Leave an empty line between notes.' }),
    ],
    defaults: {
      title: 'Dress Code', intro: 'We kindly invite our guests to dress in', style: 'Formal Attire', outro: 'in soft pastel shades.',
      shadesLabel: 'Recommended shades', shades: ['#d9c8e8', '#f8cdb4', '#f5e0a3', '#ecc9cb', '#c3d3da', '#c9bfb2'], notes: '',
    },
  },
  gifts: {
    label: 'Gifts', single: true,
    fields: [f('title', 'Heading'), f('text', 'Message', 'textarea'), f('linkLabel', 'Link text'), f('linkUrl', 'Gift list link', 'url'), f('note', 'Extra note', 'textarea'), f('florals', 'Floral accent', 'bool'), mediaField],
    defaults: { title: 'Gift Preferences', text: 'Your love and presence mean the world to us. If you wish to bless us with a gift, we have created a gift list for your convenience.', linkLabel: 'View Gift List', linkUrl: '', note: '', florals: true },
  },
  gallery: {
    label: 'Photo gallery',
    fields: [f('title', 'Heading'), f('images', 'Photos', 'images', { max: 12 })],
    defaults: { title: 'Our Story', images: [] },
  },
  custom: {
    label: 'Custom section',
    fields: [f('title', 'Heading'), f('text', 'Text', 'textarea'), mediaField, f('linkLabel', 'Link text'), f('linkUrl', 'Link', 'url')],
    defaults: { title: 'A Note', text: '', linkLabel: '', linkUrl: '' },
  },
  rsvp: {
    label: 'RSVP', single: true,
    fields: [
      f('title', 'Heading'), f('text', 'Message', 'textarea'), f('deadline', 'Reply by', 'date'), f('button', 'Button text', 'text', { max: 30 }),
      f('askGuests', 'Ask how many guests', 'bool'), f('maxGuests', 'Most guests per reply', 'int', { min: 1, max: 20 }),
      f('askMessage', 'Let guests leave a message', 'bool'), mediaField,
    ],
    defaults: { title: 'Confirm Your Attendance', text: 'To help us prepare for a joyful celebration, kindly confirm your attendance', deadline: '', button: 'RSVP', askGuests: true, maxGuests: 6, askMessage: true },
  },
};

export const LIMITS = { sections: 30, text: 200, textarea: 2000, configBytes: 60_000 };

const HEX = /^#[0-9a-f]{6}$/i;
const str = (v, max, multiline) => {
  let s = typeof v === 'string' ? v : v == null ? '' : String(v);
  s = s.replace(multiline ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, '');
  return s.slice(0, max);
};
const httpsUrl = (v) => {
  const s = str(v, 500).trim();
  if (!/^https:\/\/[^\s<>"'`]+$/.test(s)) return '';
  try {
    return new URL(s).protocol === 'https:' ? s : '';
  } catch {
    return '';
  }
};

function cleanValue(field, v, dflt) {
  switch (field.t) {
    case 'text': return v === undefined ? dflt ?? '' : str(v, field.max ?? LIMITS.text);
    case 'textarea': return v === undefined ? dflt ?? '' : str(v, field.max ?? LIMITS.textarea, true);
    case 'bool': return v === undefined ? !!dflt : v === true;
    case 'int': {
      const n = Math.round(Number(v));
      return Number.isFinite(n) ? Math.min(field.max, Math.max(field.min, n)) : dflt ?? field.min;
    }
    case 'url': return httpsUrl(v);
    case 'date': return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : dflt ?? '';
    case 'datetime': return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? v : dflt ?? '';
    case 'select':
      if (field.legacy && typeof v === 'boolean') v = field.legacy[v];
      return field.options.includes(v) ? v : dflt ?? field.options[0];
    case 'colors': return (Array.isArray(v) ? v : dflt ?? []).filter((c) => HEX.test(c)).slice(0, field.max).map((c) => c.toLowerCase());
    case 'media': {
      const kind = mediaKind(v?.url);
      return kind === 'image' || kind === 'video' ? { kind, url: v.url } : null;
    }
    case 'audio': return mediaKind(v) === 'audio' || isLibrarySound(v) ? v : '';
    case 'images': return (Array.isArray(v) ? v : []).filter((u) => mediaKind(u) === 'image').slice(0, field.max);
    case 'list':
      return (Array.isArray(v) ? v : dflt ?? []).slice(0, field.max).map((item) => cleanFields(field.item, item, field.blank));
    default: return null;
  }
}
function cleanFields(fields, input, defaults = {}) {
  const src = input && typeof input === 'object' ? input : {};
  const out = {};
  for (const field of fields) out[field.k] = cleanValue(field, src[field.k], defaults[field.k]);
  return out;
}

export const newId = () => {
  const b = crypto.getRandomValues(new Uint8Array(8));
  return [...b].map((x) => (x % 36).toString(36)).join('');
};

const GROUP_DEFAULTS = {
  basics: { kind: 'wedding', title: '', first: '', second: '', milestone: 0, monogram: '', dateTime: '', utcOffset: '+00:00', closing: 'Hope to see you there' },
  intro: { enabled: true, style: 'envelope', label: 'Tap to open' },
  hero: { media: null, frame: 'arch', scene: 'sky', showMonogram: true, showNames: true, showOccasion: true, tagline: '', cue: 'Scroll down' },
  music: { url: '', autoplay: true },
  motion: { ambient: 'petals', living: true, wreath: true, scroll: true },
};

/** Returns a config containing only known keys with valid values. Never throws. */
export function sanitizeConfig(input) {
  const src = input && typeof input === 'object' ? input : {};
  const out = { v: 1 };
  for (const g of Object.keys(GROUPS)) out[g] = cleanFields(GROUPS[g].fields, src[g], GROUP_DEFAULTS[g]);

  const t = src.theme && typeof src.theme === 'object' ? src.theme : {};
  const palette = PALETTES[t.palette] ? t.palette : 'champagne';
  out.theme = { palette, fonts: FONTS[t.fonts] ? t.fonts : 'classic' };
  for (const k of COLOR_KEYS) out.theme[k] = HEX.test(t[k]) ? t[k].toLowerCase() : PALETTES[palette][k];

  const seen = new Set();
  const ids = new Set();
  out.sections = [];
  for (const s of Array.isArray(src.sections) ? src.sections : []) {
    const def = s && SECTIONS[s.type];
    if (!def || (def.single && seen.has(s.type)) || out.sections.length >= LIMITS.sections) continue;
    seen.add(s.type);
    let id = /^[a-z0-9]{6,12}$/.test(s.id) && !ids.has(s.id) ? s.id : newId();
    ids.add(id);
    out.sections.push({ id, type: s.type, enabled: s.enabled !== false, ...cleanFields(def.fields, s, def.defaults) });
  }
  return out;
}

export const newSection = (type) => ({ id: newId(), type, enabled: true, media: null, ...structuredClone(SECTIONS[type].defaults) });

const STARTERS = {
  timeless: {
    kind: 'wedding',
    label: 'Timeless', note: 'Champagne and gold, Nikkah wording',
    theme: { palette: 'champagne', fonts: 'classic' },
    intro: { style: 'envelope' },
    hero: { scene: 'skyline' },
    sections: {
      couple: { eventLine: 'You are invited to the\nNikkah ceremony of', firstParents: 'Mr & Mrs S. Rahman', secondParents: 'Mr & Mrs K. Malik' },
      message: { text: 'Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever.' },
      quote: { text: 'وَخَلَقْنَاكُمْ أَزْوَاجًا', translation: '"And We created you in pairs."', reference: '(Surah An-Naba 78:8)' },
      timeline: {
        items: [
          { time: '6:00 pm', title: 'Guest Arrival and Welcome Drinks', icon: 'arch' },
          { time: '6:30 pm', title: 'Bride Entrance', icon: 'bride' },
          { time: '7:30 pm', title: 'Salat al Isha', icon: 'crescent' },
          { time: '8:30 pm', title: 'Buffet Opening', icon: 'cloche' },
          { time: '10:00 pm', title: 'Let the Fun Begin', icon: 'sparkle' },
        ],
      },
      dress: { style: 'Traditional Attire', notes: 'Please avoid wearing beige, as it has been reserved for the bride and groom.\n\nSage green is reserved exclusively for the bridesmaids.' },
      gifts: { text: 'Your love, prayers, and presence mean the world to us. If you wish to bless us with a gift, we have created a gift list for your convenience.', note: 'While we adore your little ones, we have chosen to make this an adults-only celebration. We appreciate your understanding.' },
    },
  },
  garden: {
    kind: 'wedding',
    label: 'Garden', note: 'Sage green, relaxed daytime wedding',
    theme: { palette: 'sage', fonts: 'romantic' },
    intro: { style: 'petals' },
    hero: { scene: 'garden', frame: 'round' },
    sections: { dress: { style: 'Garden Party Attire', outro: 'in fresh, light colours.', shades: ['#dfe8d2', '#f6e3c5', '#f3d3cf', '#d7e3ea', '#efe6d5'] } },
  },
  midnight: {
    kind: 'wedding',
    label: 'Midnight', note: 'Navy and gold, black-tie evening',
    theme: { palette: 'midnight', fonts: 'modern' },
    intro: { style: 'curtain' },
    motion: { ambient: 'sparkles' },
    hero: { scene: 'night', frame: 'oval' },
    sections: { dress: { style: 'Black Tie', outro: '', shades: ['#141b2d', '#3a2f4a', '#5a2a35', '#2f4a45', '#d4b06a'], shadesLabel: 'Colours of the evening' }, message: { florals: false }, gifts: { florals: false } },
  },
  rose: {
    kind: 'wedding',
    label: 'Rosé', note: 'Rose gold, soft and romantic',
    theme: { palette: 'rosegold', fonts: 'calligraphy' },
    intro: { style: 'heart' },
    motion: { ambient: 'hearts' },
    hero: { scene: 'blossom', frame: 'oval' },
    sections: { dress: { style: 'Cocktail Attire', outro: 'in blush and neutral tones.', shades: ['#f5e2dc', '#e9c4b8', '#d9a79a', '#c9b8a8', '#f3ede4'] } },
  },
  emerald: {
    kind: 'wedding',
    label: 'Emerald', note: 'Deep green and gold, grand entrance',
    theme: { palette: 'emerald', fonts: 'royal' },
    intro: { style: 'doors' },
    motion: { ambient: 'sparkles' },
    hero: { scene: 'chapel', frame: 'arch' },
    sections: { dress: { style: 'Formal Attire', outro: 'in jewel tones.', shades: ['#0f5a45', '#7d2e3a', '#2b3f73', '#5a3a6b', '#d8b76a'] }, message: { florals: false }, gifts: { florals: false } },
  },
  coastal: {
    kind: 'wedding',
    label: 'Coastal', note: 'Sea blue, barefoot by the water',
    theme: { palette: 'ocean', fonts: 'handwritten' },
    intro: { style: 'ribbon' },
    hero: { scene: 'beach', frame: 'round' },
    sections: { dress: { style: 'Beach Formal', outro: 'in light, breezy fabrics.', shades: ['#dfecee', '#f6e9d5', '#c9dde6', '#f3d9c9', '#ffffff'] } },
  },

  // ---------- birthdays ----------
  balloons: {
    kind: 'birthday', label: 'Balloon party', note: 'Bright pink, confetti and balloons', swatch: '30',
    theme: { palette: 'candy', fonts: 'party' },
    intro: { style: 'ribbon', label: 'Open your invitation' },
    motion: { ambient: 'confetti' },
    hero: { scene: 'balloons', frame: 'none' },
    basics: { closing: 'Let’s party!' },
    order: ['honoree', 'date', 'message', 'countdown', 'timeline', 'location', 'dress', 'gifts', 'rsvp'],
    sections: {
      honoree: { eventLine: 'You’re invited to celebrate', subtitle: 'Food, music, cake and the people we love' },
      message: { title: 'Come Party With Us', text: 'Join us for a night of good food, great music and even better company. It would not be the same without you.', florals: false },
      timeline: { title: 'The Plan', items: [
        { time: '7:00 pm', title: 'Doors Open and Welcome Drinks', icon: 'glass' },
        { time: '8:00 pm', title: 'Dinner', icon: 'cloche' },
        { time: '9:00 pm', title: 'Cake and Toasts', icon: 'cake' },
        { time: '9:30 pm', title: 'Dance Floor Opens', icon: 'music' },
      ] },
      dress: { title: 'Dress Code', intro: 'Come dressed in', style: 'Something Sparkly', outro: 'and ready to dance.', shades: [], notes: '' },
      gifts: { title: 'Gifts', text: 'Your presence is the best present. If you would like to bring something, a card with a kind word means the world.', linkLabel: '', note: '', florals: false },
      rsvp: { title: 'Are You Coming?', text: 'Let us know so we can save you a slice of cake', askMessage: true },
    },
  },
  milestone: {
    kind: 'birthday', label: 'Golden milestone', note: 'Black and gold, an elegant evening', swatch: '50',
    theme: { palette: 'noir', fonts: 'editorial' },
    intro: { style: 'curtain' },
    motion: { ambient: 'sparkles' },
    hero: { scene: 'city', frame: 'round' },
    order: ['honoree', 'date', 'message', 'countdown', 'timeline', 'location', 'dress', 'gifts', 'rsvp'],
    sections: {
      honoree: { eventLine: 'Join us for a milestone celebration in honour of', subtitle: '' },
      message: { title: 'An Evening to Remember', text: 'Fifty years of laughter, adventures and friendship deserve a proper celebration. Raise a glass with us.', florals: false },
      timeline: { title: 'The Evening', items: [
        { time: '7:00 pm', title: 'Cocktails', icon: 'glass' },
        { time: '8:00 pm', title: 'Dinner Is Served', icon: 'cloche' },
        { time: '9:30 pm', title: 'Speeches and Cake', icon: 'cake' },
        { time: '10:00 pm', title: 'Dancing', icon: 'music' },
      ] },
      dress: { style: 'Black Tie', outro: 'with a touch of gold.', shades: ['#121212', '#c9a769', '#ece7dc', '#5a2a35'], shadesLabel: 'Colours of the evening', notes: '' },
      gifts: { title: 'Gifts', text: 'No gifts, please. Your company is the only present needed.', linkLabel: '', note: '', florals: false },
    },
  },
  sunshine: {
    kind: 'birthday', label: 'Sunshine', note: 'Yellow and bright, a daytime garden party', swatch: '7',
    theme: { palette: 'sunshine', fonts: 'bubbly' },
    intro: { style: 'petals' },
    motion: { ambient: 'balloons' },
    hero: { scene: 'bunting', frame: 'none' },
    basics: { closing: 'See you there!' },
    order: ['honoree', 'date', 'message', 'countdown', 'timeline', 'location', 'gifts', 'gallery', 'rsvp'],
    sections: {
      honoree: { eventLine: 'Come and celebrate', subtitle: 'Games, cake and lots of fun' },
      message: { title: 'Party Time!', text: 'Bring your smile and your appetite. There will be games, music and plenty of cake.', florals: false },
      timeline: { title: 'The Fun', items: [
        { time: '2:00 pm', title: 'Arrive and Play', icon: 'balloon' },
        { time: '3:00 pm', title: 'Party Games', icon: 'star' },
        { time: '4:00 pm', title: 'Cake Time', icon: 'cake' },
        { time: '4:30 pm', title: 'Presents', icon: 'gift' },
      ] },
      gifts: { title: 'Gifts', text: 'Gifts are not expected. Your company is what matters most.', linkLabel: 'View Wish List', florals: false },
      gallery: { title: 'Growing Up' },
      rsvp: { title: 'Can You Come?', text: 'Please let us know', askMessage: true },
    },
  },
  // ---------- anniversaries ----------
  silver: {
    kind: 'anniversary', label: 'Silver jubilee', note: 'Silver and soft grey, by the water', swatch: '25',
    theme: { palette: 'silver', fonts: 'classic' },
    intro: { style: 'doors' },
    motion: { ambient: 'sparkles' },
    hero: { scene: 'lake', frame: 'oval' },
    order: ['honoree', 'date', 'message', 'timeline', 'countdown', 'location', 'gifts', 'gallery', 'rsvp'],
    sections: {
      honoree: { eventLine: 'Please join us to celebrate the anniversary of', subtitle: 'Still choosing each other, every day' },
      message: { title: 'Dear Family and Friends', text: 'You have been part of our story. Celebrate this chapter with us.' },
      timeline: { title: 'Our Story', items: [
        { time: '1999', title: 'We Met', icon: 'heart' },
        { time: '2001', title: 'We Married', icon: 'rings' },
        { time: '2005', title: 'Our First Home', icon: 'arch' },
        { time: '2026', title: 'Twenty-Five Years', icon: 'sparkle' },
      ] },
      gifts: { title: 'Gifts', text: 'Your presence is our gift. If you wish, a note with a favourite memory of us would mean the most.', linkLabel: '' },
      gallery: { title: 'Through the Years' },
    },
  },
  ruby: {
    kind: 'anniversary', label: 'Ruby and roses', note: 'Deep red, hearts and blossom', swatch: '40',
    theme: { palette: 'ruby', fonts: 'romantic' },
    intro: { style: 'heart' },
    motion: { ambient: 'hearts' },
    hero: { scene: 'blossom', frame: 'arch' },
    order: ['honoree', 'date', 'message', 'quote', 'timeline', 'countdown', 'location', 'gifts', 'rsvp'],
    sections: {
      honoree: { eventLine: 'Celebrate forty years of love with', subtitle: '' },
      message: { text: 'Forty years ago we made a promise. Join us as we celebrate keeping it.' },
      quote: { text: '', translation: '"Grow old along with me, the best is yet to be."', reference: 'Robert Browning' },
      timeline: { title: 'Our Story', items: [
        { time: '1986', title: 'The Day We Met', icon: 'heart' },
        { time: '1987', title: 'Our Wedding', icon: 'rings' },
        { time: '2026', title: 'Forty Years', icon: 'sparkle' },
      ] },
      gifts: { title: 'Gifts', text: 'We have everything we need. If you would like to give something, please consider a donation to a charity close to your heart.', linkLabel: 'Our Chosen Charity' },
    },
  },
  golden: {
    kind: 'anniversary', label: 'Golden years', note: 'Champagne and gold, a garden reception', swatch: '50',
    theme: { palette: 'champagne', fonts: 'grand' },
    intro: { style: 'envelope' },
    motion: { ambient: 'petals' },
    hero: { scene: 'garden', frame: 'round' },
    order: ['honoree', 'date', 'message', 'timeline', 'countdown', 'location', 'dress', 'gifts', 'rsvp'],
    sections: {
      honoree: { eventLine: 'The family of', subtitle: 'invite you to celebrate their golden anniversary' },
      message: { text: 'Fifty years, a family and a lifetime of memories. Join us to give thanks and celebrate.' },
      timeline: { title: 'The Afternoon', items: [
        { time: '1:00 pm', title: 'Renewal of Vows', icon: 'rings' },
        { time: '2:00 pm', title: 'Garden Reception', icon: 'glass' },
        { time: '3:30 pm', title: 'Cutting the Cake', icon: 'cake' },
      ] },
      dress: { style: 'Garden Formal', outro: 'with a touch of gold.', shades: ['#f5e0a3', '#fdf5ec', '#e8dccb', '#c9a769'], notes: '' },
      gifts: { title: 'Gifts', text: 'Your presence is the greatest gift. Please, no presents.', linkLabel: '', note: '' },
    },
  },
  // ---------- anything else ----------
  celebration: {
    kind: 'custom', label: 'Celebration', note: 'Fresh and festive, for any party', swatch: 'Aa',
    theme: { palette: 'mint', fonts: 'flowing' },
    intro: { style: 'ribbon' },
    motion: { ambient: 'confetti' },
    hero: { scene: 'bunting', frame: 'none' },
    order: ['honoree', 'date', 'message', 'countdown', 'timeline', 'location', 'gifts', 'rsvp'],
    sections: {
      honoree: { eventLine: 'You are warmly invited to', subtitle: '' },
      message: { title: 'Join Us', text: 'We would love for you to be there. Come for the food, stay for the company.', florals: false },
      timeline: { title: 'Schedule', items: [
        { time: '6:00 pm', title: 'Welcome', icon: 'glass' },
        { time: '7:00 pm', title: 'Dinner', icon: 'cloche' },
        { time: '8:30 pm', title: 'Celebrations', icon: 'sparkle' },
      ] },
      gifts: { title: 'Gifts', text: 'No gifts are necessary. Your presence is more than enough.', linkLabel: '', note: '', florals: false },
    },
  },
  blank: {
    kind: 'custom', label: 'Blank canvas', note: 'Plain and minimal, add only what you need', swatch: 'Aa',
    theme: { palette: 'ivory', fonts: 'modern' },
    intro: { enabled: false },
    motion: { ambient: 'none', wreath: false },
    hero: { scene: 'sky', frame: 'none' },
    order: ['honoree', 'date', 'message', 'location', 'rsvp'],
    sections: {
      honoree: { eventLine: 'You are invited to', subtitle: '' },
      message: { title: 'Details', text: '', florals: false },
    },
  },
};
export const STARTER_LIST = Object.entries(STARTERS).map(([id, s]) => ({ id, kind: s.kind, label: s.label, note: s.note, palette: s.theme.palette, swatch: s.swatch ?? 'A&Z' }));

const ORDER = ['date', 'couple', 'message', 'quote', 'timeline', 'countdown', 'location', 'dress', 'gifts', 'rsvp'];

/**
 * A complete starting config. `basics` may carry kind, title, first, second, milestone,
 * dateTime and utcOffset. When the starter is for a different occasion than basics.kind,
 * the first starter for that occasion is used instead, so the sections always fit.
 */
export function starterConfig(starter = 'timeless', basics = {}) {
  let s = STARTERS[starter];
  const kind = KINDS[basics.kind] ? basics.kind : s?.kind ?? 'wedding';
  if (!s || s.kind !== kind) s = Object.values(STARTERS).find((x) => x.kind === kind);
  const order = s.order ?? ORDER;
  return sanitizeConfig({
    basics: { ...GROUP_DEFAULTS.basics, ...s.basics, ...basics, kind },
    intro: { ...GROUP_DEFAULTS.intro, ...s.intro },
    hero: { ...GROUP_DEFAULTS.hero, ...s.hero },
    music: GROUP_DEFAULTS.music,
    motion: { ...GROUP_DEFAULTS.motion, ...s.motion },
    theme: s.theme,
    sections: order.map((type) => ({ ...newSection(type), ...(s.sections[type] ?? {}) })),
  });
}

const SAMPLES = {
  wedding: ['timeless', { first: 'Ayaan', second: 'Zara', dateTime: '2027-04-17T18:00', utcOffset: '+04:00' }],
  birthday: ['balloons', { first: 'Ada', milestone: 30, dateTime: '2027-03-06T19:00', utcOffset: '+01:00' }],
  anniversary: ['silver', { first: 'Grace', second: 'Daniel', milestone: 25, dateTime: '2027-05-22T17:00', utcOffset: '+00:00' }],
  custom: ['celebration', { title: 'Tolu’s Graduation Party', dateTime: '2027-07-10T18:00', utcOffset: '+01:00' }],
};
/** A filled-in example invitation for an occasion, used by the public samples. */
export const sampleConfig = (kind = 'wedding') => {
  const [starter, basics] = SAMPLES[kind] ?? SAMPLES.wedding;
  return starterConfig(starter, { ...basics, kind: KINDS[kind] ? kind : 'wedding' });
};
export const SAMPLE = () => sampleConfig('wedding');

const usesSecond = (b) => b.kind !== 'birthday';
/** The names as they appear on the cover: "Ada", "Ayaan & Zara". */
export const displayNames = (cfg) => {
  const b = cfg.basics;
  return [b.first, usesSecond(b) ? b.second : ''].map((n) => n.trim()).filter(Boolean).join(' & ');
};
/** "30th Birthday", "25th Anniversary", the event name for other occasions, or ''. */
export const occasionLine = (cfg) => {
  const b = cfg.basics;
  const n = b.milestone > 0 ? `${ordinal(b.milestone)} ` : '';
  if (b.kind === 'birthday') return n ? `${n}Birthday` : 'Birthday Celebration';
  if (b.kind === 'anniversary') return n ? `${n}Anniversary` : 'Anniversary Celebration';
  if (b.kind === 'custom') return b.title.trim();
  return '';
};
/** Title for the dashboard, the browser tab and the link. */
export const inviteTitle = (cfg) => {
  const b = cfg.basics;
  const names = displayNames(cfg);
  if (b.kind === 'custom') return b.title.trim() || names || 'Untitled invitation';
  if (b.kind === 'birthday') return b.first.trim() ? `${b.first.trim()}’s ${occasionLine(cfg)}` : occasionLine(cfg);
  if (b.kind === 'anniversary') return names ? `${names} — ${occasionLine(cfg)}` : occasionLine(cfg);
  return names || 'Untitled invitation';
};
export const monogramOf = (cfg) => {
  const b = cfg.basics;
  const m = b.monogram.trim();
  if (m) return m.split('&').map((p) => p.trim()).filter(Boolean);
  const initials = [b.first, usesSecond(b) ? b.second : ''].map((n) => [...n.trim()][0]?.toUpperCase()).filter(Boolean);
  if (initials.length) return initials;
  const t = [...b.title.trim()][0];
  return t ? [t.toUpperCase()] : [];
};
/** Who an RSVP message is addressed to. */
export const hostsLabel = (cfg) => {
  const b = cfg.basics;
  if (b.kind === 'birthday') return b.first.trim() || 'the guest of honour';
  if (b.kind === 'custom') return 'the hosts';
  return 'the couple';
};
