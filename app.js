(() => {
  const C = window.INVITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const pad = (n) => String(n).padStart(2, '0');
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // "2026-12-19..." -> "19 December 2026", read straight from the string so the viewer's time zone can't shift the day.
  const longDate = (iso) => {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  };

  /* ---------- Text from config ---------- */
  for (const n of $$('[data-t]')) {
    const v = n.dataset.t.split('.').reduce((o, k) => o?.[k], C);
    if (Array.isArray(v)) {
      v.forEach((line, i) => {
        if (i) n.append(el('br'));
        n.append(line);
      });
    } else n.textContent = v ?? '';
  }
  for (const n of $$('.mono')) {
    n.append(C.monogram[0], el('small', '', '&'), C.monogram[1]);
  }
  $('.hero-names').textContent = `${C.groom.name} & ${C.bride.name}`;
  document.title = `${C.groom.name} & ${C.bride.name} — Wedding Invitation`;
  for (const n of $$('.deadline')) n.textContent = longDate(C.rsvp.deadline);

  /* ---------- Envelope ---------- */
  const intro = $('#intro');
  const openIntro = () => {
    if (intro.classList.contains('open')) return;
    intro.classList.add('open');
    document.body.classList.remove('locked');
    intro.setAttribute('aria-hidden', 'true');
    intro.removeAttribute('tabindex');
    if (audio) toggleMusic(true); // the tap is the user gesture browsers require for playback
  };
  intro.addEventListener('click', openIntro);
  intro.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openIntro();
    }
  });

  /* ---------- Music ---------- */
  const musicBtn = $('#music');
  let audio = null;
  function toggleMusic(on) {
    const play = on ?? audio.paused;
    if (play) audio.play().catch(() => {});
    else audio.pause();
  }
  if (C.musicUrl) {
    audio = new Audio(C.musicUrl);
    audio.loop = true;
    audio.preload = 'none';
    musicBtn.hidden = false;
    const sync = () => {
      musicBtn.setAttribute('aria-pressed', String(!audio.paused));
      musicBtn.setAttribute('aria-label', audio.paused ? 'Play music' : 'Pause music');
    };
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    musicBtn.addEventListener('click', () => toggleMusic());
  }

  /* ---------- Scratch cards ---------- */
  const [yy, mm, dd] = C.dateTime.slice(0, 10).split('-');
  const row = $('.scratch-row');
  for (const [label, value] of [['Day', dd], ['Month', mm], ['Year', yy]]) {
    const wrap = el('div');
    const card = el('div', 'scratch');
    const canvas = el('canvas');
    canvas.setAttribute('role', 'button');
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', `Reveal the ${label.toLowerCase()}`);
    const val = el('b', '', value);
    val.setAttribute('aria-hidden', 'true');
    card.append(val, canvas);
    wrap.append(card, el('p', 'scratch-label', label));
    row.append(wrap);
    initScratch(card, canvas, val);
  }

  function initScratch(card, canvas, val) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let size = 0;
    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = Math.round(card.clientWidth * dpr);
      if (!size) return;
      canvas.width = canvas.height = size;
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, '#f3dfb4');
      g.addColorStop(0.35, '#fbf0d4');
      g.addColorStop(0.7, '#dcbb7c');
      g.addColorStop(1, '#c7a25f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = size / 60;
      for (let i = -size; i < size; i += size / 5) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + size, size);
        ctx.stroke();
      }
    };
    paint();
    const done = () => {
      if (card.classList.contains('done')) return;
      card.classList.add('done');
      val.removeAttribute('aria-hidden');
      canvas.tabIndex = -1;
      canvas.setAttribute('aria-hidden', 'true');
    };
    // The foil is only repainted before any scratching, so a resize never wipes progress.
    let touched = false;
    new ResizeObserver(() => {
      if (!touched && !card.classList.contains('done')) paint();
    }).observe(card);

    let last = null;
    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * size, y: ((e.clientY - r.top) / r.height) * size };
    };
    const scratch = (e) => {
      const p = pos(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = size * 0.24;
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo((last ?? p).x, (last ?? p).y);
      ctx.lineTo(p.x + 0.01, p.y);
      ctx.stroke();
      last = p;
    };
    const cleared = () => {
      const data = ctx.getImageData(0, 0, size, size).data;
      let clear = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 64) {
        total++;
        if (data[i] < 40) clear++;
      }
      return clear / total;
    };
    canvas.addEventListener('pointerdown', (e) => {
      touched = true;
      canvas.setPointerCapture(e.pointerId);
      last = null;
      scratch(e);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (canvas.hasPointerCapture(e.pointerId)) scratch(e);
    });
    const end = () => {
      last = null;
      if (cleared() > 0.45) done();
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        done();
      }
    });
  }

  /* ---------- Timeline ---------- */
  const SVG = 'http://www.w3.org/2000/svg';
  const tl = $('.timeline');
  for (const item of C.timeline) {
    const li = el('li', 'reveal');
    const icon = el('div', 't-icon');
    const svg = document.createElementNS(SVG, 'svg');
    const use = document.createElementNS(SVG, 'use');
    use.setAttribute('href', `#i-${item.icon}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.append(use);
    icon.append(svg);
    const text = el('div');
    text.append(el('p', 't-time script', item.time), el('p', 't-title', item.title));
    li.append(icon, text);
    tl.append(li);
  }

  /* ---------- Countdown ---------- */
  const target = new Date(C.dateTime).getTime();
  const cells = Object.fromEntries($$('[data-c]').map((n) => [n.dataset.c, n]));
  const tick = () => {
    const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    cells.d.textContent = pad(Math.floor(s / 86400));
    cells.h.textContent = pad(Math.floor(s / 3600) % 24);
    cells.m.textContent = pad(Math.floor(s / 60) % 60);
    cells.s.textContent = pad(s % 60);
  };
  if (Number.isFinite(target)) {
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Location, dress code, gifts ---------- */
  const q = encodeURIComponent(C.venue.mapQuery);
  $('.map-frame iframe').src = `https://www.google.com/maps?q=${q}&output=embed`;
  $('#directions').href = `https://www.google.com/maps/search/?api=1&query=${q}`;

  for (const shade of C.dressCode.shades) {
    const li = el('li');
    li.style.background = shade;
    $('.shades').append(li);
  }
  for (const note of C.dressCode.notes) $('.notes').append(el('p', '', note));

  const giftLink = $('#gift-link');
  if (C.gifts.listUrl) giftLink.href = C.gifts.listUrl;
  else giftLink.hidden = true;

  /* ---------- RSVP ---------- */
  const dialog = $('#rsvp-dialog');
  const form = $('#rsvp-form');
  const thanks = $('.thanks', dialog);
  const msg = $('.form-msg', form);
  const submit = $('button[type=submit]', form);
  const guests = form.elements.guests;
  for (let i = 1; i <= C.rsvp.maxGuests; i++) guests.append(new Option(i, i));

  $('#open-rsvp').addEventListener('click', () => dialog.showModal());
  for (const b of $$('.close, .close-thanks', dialog)) b.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  form.addEventListener('input', () => {
    msg.textContent = '';
  });
  form.addEventListener('change', () => {
    $('#guests-field').hidden = form.elements.attending.value === 'no';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    const name = form.elements.name.value.trim();
    const attending = form.elements.attending.value;
    if (!name || !attending) {
      msg.textContent = 'Please enter your name and let us know if you can come.';
      return;
    }
    const reply = { name, attending, guests: attending === 'yes' ? Number(guests.value) : 0 };
    msg.textContent = '';

    if (C.rsvp.endpoint) {
      submit.disabled = true;
      submit.textContent = 'Sending…';
      try {
        const res = await fetch(C.rsvp.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(reply),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        msg.textContent = 'Sorry, your reply could not be sent. Please try again.';
        submit.disabled = false;
        submit.textContent = 'Submit';
        return;
      }
    } else if (C.rsvp.email) {
      const body = `Name: ${reply.name}\nAttending: ${attending === 'yes' ? 'Yes' : 'No'}\nGuests: ${reply.guests}`;
      location.href = `mailto:${C.rsvp.email}?subject=${encodeURIComponent(`RSVP — ${reply.name}`)}&body=${encodeURIComponent(body)}`;
    } else {
      msg.textContent = 'RSVP is not set up yet: add rsvp.endpoint or rsvp.email in config.js.';
      return;
    }
    $('.thanks-text', thanks).textContent =
      attending === 'yes' ? 'We look forward to celebrating with you.' : 'We will miss you. Thank you for letting us know.';
    form.hidden = true;
    thanks.hidden = false;
  });

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15 },
  );
  for (const n of $$('.reveal')) io.observe(n);
})();
