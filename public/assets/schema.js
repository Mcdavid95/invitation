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
};
export const COLOR_KEYS = ['bg', 'paper', 'accent', 'text'];
export const COLOR_LABELS = { bg: 'Background', paper: 'Cards', accent: 'Accent', text: 'Text' };

export const FONTS = {
  classic: { label: 'Classic script', script: 'Pinyon Script', body: 'Cormorant Garamond', caps: 'Cinzel', size: 20, q: 'Pinyon+Script&family=Cormorant+Garamond:wght@400;500&family=Cinzel:wght@400;500' },
  romantic: { label: 'Romantic', script: 'Great Vibes', body: 'EB Garamond', caps: 'Cinzel', size: 19, q: 'Great+Vibes&family=EB+Garamond:wght@400;500&family=Cinzel:wght@400;500' },
  handwritten: { label: 'Handwritten', script: 'Sacramento', body: 'Lora', caps: 'Lora', size: 17, q: 'Sacramento&family=Lora:wght@400;500' },
  modern: { label: 'Modern', script: 'Italiana', body: 'Jost', caps: 'Jost', size: 17, q: 'Italiana&family=Jost:wght@300;400;500' },
};

export const ICONS = ['arch', 'bride', 'rings', 'heart', 'crescent', 'cloche', 'glass', 'cake', 'music', 'sparkle'];

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
    label: 'Names & date',
    fields: [
      f('first', 'First name'),
      f('second', 'Second name'),
      f('monogram', 'Monogram', 'text', { max: 7, help: 'Leave empty to use both initials.' }),
      f('dateTime', 'Date and time', 'datetime'),
      f('utcOffset', 'Time zone of the venue (UTC offset)', 'select', { options: OFFSETS }),
      f('closing', 'Closing line'),
    ],
  },
  intro: {
    label: 'Envelope intro',
    fields: [f('enabled', 'Open with a sealed envelope', 'bool'), f('label', 'Prompt')],
  },
  hero: {
    label: 'Cover',
    fields: [
      f('media', 'Cover photo or video', 'media', { help: 'Fills the cover. Without one, an illustrated scene is used.' }),
      f('frame', 'Frame it with an arch', 'bool'),
      f('scene', 'Illustrated scene', 'select', { options: ['skyline', 'sky'], labels: { skyline: 'Domes at sunset', sky: 'Open sky' } }),
      f('showMonogram', 'Show monogram', 'bool'),
      f('showNames', 'Show names', 'bool'),
      f('tagline', 'Line under the names'),
      f('cue', 'Scroll prompt'),
    ],
  },
  music: {
    label: 'Music',
    fields: [
      f('url', 'Track', 'audio', { help: 'Upload an audio file you have the right to use. Guests can pause it at any time.' }),
      f('autoplay', 'Start when the invitation is opened', 'bool'),
    ],
  },
};

export const SECTIONS = {
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
    case 'select': return field.options.includes(v) ? v : dflt ?? field.options[0];
    case 'colors': return (Array.isArray(v) ? v : dflt ?? []).filter((c) => HEX.test(c)).slice(0, field.max).map((c) => c.toLowerCase());
    case 'media': {
      const kind = mediaKind(v?.url);
      return kind === 'image' || kind === 'video' ? { kind, url: v.url } : null;
    }
    case 'audio': return mediaKind(v) === 'audio' ? v : '';
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
  basics: { first: '', second: '', monogram: '', dateTime: '', utcOffset: '+00:00', closing: 'Hope to see you there' },
  intro: { enabled: true, label: 'Tap to open' },
  hero: { media: null, frame: true, scene: 'sky', showMonogram: true, showNames: true, tagline: '', cue: 'Scroll down' },
  music: { url: '', autoplay: true },
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
    label: 'Timeless', note: 'Champagne and gold, Nikkah wording',
    theme: { palette: 'champagne', fonts: 'classic' },
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
    label: 'Garden', note: 'Sage green, relaxed daytime wedding',
    theme: { palette: 'sage', fonts: 'romantic' },
    hero: { scene: 'sky' },
    sections: { dress: { style: 'Garden Party Attire', outro: 'in fresh, light colours.', shades: ['#dfe8d2', '#f6e3c5', '#f3d3cf', '#d7e3ea', '#efe6d5'] } },
  },
  midnight: {
    label: 'Midnight', note: 'Navy and gold, black-tie evening',
    theme: { palette: 'midnight', fonts: 'modern' },
    hero: { scene: 'sky' },
    sections: { dress: { style: 'Black Tie', outro: '', shades: ['#141b2d', '#3a2f4a', '#5a2a35', '#2f4a45', '#d4b06a'], shadesLabel: 'Colours of the evening' }, message: { florals: false }, gifts: { florals: false } },
  },
};
export const STARTER_LIST = Object.entries(STARTERS).map(([id, s]) => ({ id, label: s.label, note: s.note, palette: s.theme.palette }));

const ORDER = ['date', 'couple', 'message', 'quote', 'timeline', 'countdown', 'location', 'dress', 'gifts', 'rsvp'];

/** A complete starting config. `basics` may carry first, second, dateTime, utcOffset. */
export function starterConfig(starter = 'timeless', basics = {}) {
  const s = STARTERS[starter] ?? STARTERS.timeless;
  return sanitizeConfig({
    basics: { ...GROUP_DEFAULTS.basics, ...basics },
    intro: GROUP_DEFAULTS.intro,
    hero: { ...GROUP_DEFAULTS.hero, ...s.hero },
    music: GROUP_DEFAULTS.music,
    theme: s.theme,
    sections: ORDER.map((type) => ({ ...newSection(type), ...(s.sections[type] ?? {}) })),
  });
}

export const SAMPLE = () =>
  starterConfig('timeless', { first: 'Ayaan', second: 'Zara', dateTime: '2027-04-17T18:00', utcOffset: '+04:00' });

export const inviteTitle = (cfg) => [cfg.basics.first, cfg.basics.second].filter(Boolean).join(' & ') || 'Untitled invitation';
export const monogramOf = (cfg) => {
  const m = cfg.basics.monogram.trim();
  if (m) return m.split('&').map((p) => p.trim()).filter(Boolean);
  return [cfg.basics.first, cfg.basics.second].map((n) => [...n.trim()][0]?.toUpperCase()).filter(Boolean);
};
