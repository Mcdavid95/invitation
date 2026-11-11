// Everything a couple needs to change lives here. No other file needs editing.
// All values below are sample content.
window.INVITE = {
  monogram: ['A', 'Z'],
  eventLine: ['You are invited to the', 'Nikkah ceremony of'],
  groom: { name: 'Ayaan', parentsLabel: 'Son of', parents: 'Mr & Mrs S. Rahman' },
  bride: { name: 'Zara', parentsLabel: 'Daughter of', parents: 'Mr & Mrs K. Malik' },

  // Local date and time of the ceremony, with the venue's UTC offset.
  dateTime: '2026-12-19T18:00:00+04:00',

  greeting: 'Dear Friends and Family',
  message: 'Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever.',

  verse: {
    arabic: 'وَخَلَقْنَاكُمْ أَزْوَاجًا',
    translation: '"And We created you in pairs."',
    reference: '(Surah An-Naba 78:8)',
  },

  // icon: arch | bride | crescent | cloche | sparkle
  timeline: [
    { time: '6:00 pm', title: 'Guest Arrival and Welcome Drinks', icon: 'arch' },
    { time: '6:30 pm', title: 'Bride Entrance', icon: 'bride' },
    { time: '7:30 pm', title: 'Salat al Isha', icon: 'crescent' },
    { time: '8:30 pm', title: 'Buffet Opening', icon: 'cloche' },
    { time: '10:00 pm', title: 'Let the Fun Begin', icon: 'sparkle' },
  ],

  venue: {
    city: 'Dubai',
    name: 'Venue Name, Ballroom',
    // Anything Google Maps can search for: a place name or "lat,lng".
    mapQuery: 'Jumeirah Beach, Dubai',
  },

  dressCode: {
    intro: 'We kindly invite our guests to dress in',
    style: 'Traditional Attire',
    outro: 'in soft pastel shades.',
    shades: ['#d9c8e8', '#f8cdb4', '#f5e0a3', '#ecc9cb', '#c3d3da', '#c9bfb2'],
    notes: [
      'Please avoid wearing beige, as it has been reserved for the bride and groom.',
      'Sage green is reserved exclusively for the bridesmaids.',
    ],
  },

  gifts: {
    message:
      'Your love, prayers, and presence mean the world to us. If you wish to bless us with a gift, we have created a gift list for your convenience.',
    listUrl: '', // link to the registry; the button is hidden while this is empty
    note: 'While we adore your little ones, we have chosen to make this an adults-only celebration. We appreciate your understanding.',
  },

  rsvp: {
    deadline: '2026-11-30',
    maxGuests: 6,
    // POST endpoint that accepts JSON (Formspree, Google Apps Script, your own API).
    endpoint: '',
    // Used when no endpoint is set: the reply opens as a pre-filled email.
    email: '',
  },

  // URL of a track you have the rights to play. The music button is hidden while this is empty.
  musicUrl: '',

  closing: 'Hope to see you there',
};
