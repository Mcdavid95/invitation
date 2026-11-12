// Cover illustrations, drawn in a 390 x 780 box with the horizon near y = 520.
// Each returns SVG markup built only from the constants below. Colours come from
// the theme through the sc-* classes, so every scene works with every palette.

const rand = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const sun = (x, y, r = 120) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#sun)"/>`;

/** A wavy ridge filling down to the bottom of the picture. */
function ridge(cls, y, amp, seed, step = 30) {
  const r = rand(seed);
  let d = `M-10 ${y}`;
  for (let x = -10 + step; x <= 400; x += step) d += ` Q${x - step / 2} ${(y + (r() - 0.5) * 2 * amp).toFixed(1)} ${x} ${(y + (r() - 0.5) * amp).toFixed(1)}`;
  return `<path class="${cls}" d="${d} V790 H-10z"/>`;
}
function peaks(cls, y, height, seed, n = 5) {
  const r = rand(seed);
  const w = 420 / n;
  let d = `M-15 ${y + 40}`;
  for (let i = 0; i < n; i++) {
    const x = -15 + i * w;
    d += ` L${(x + w * (0.35 + r() * 0.3)).toFixed(1)} ${(y - height * (0.55 + r() * 0.45)).toFixed(1)} L${(x + w).toFixed(1)} ${(y + r() * 26).toFixed(1)}`;
  }
  return `<path class="${cls}" d="${d} V790 H-15z"/>`;
}
const pine = (cls, x, y, h) => {
  const w = h * 0.42;
  let s = `<rect class="${cls}" x="${x - h * 0.03}" y="${y - h * 0.12}" width="${h * 0.06}" height="${h * 0.14}"/>`;
  for (let i = 0; i < 3; i++) {
    const top = y - h + i * h * 0.24;
    const half = w * (0.45 + i * 0.28) / 1;
    s += `<path class="${cls}" d="M${x} ${top} L${x + half} ${top + h * 0.42} H${x - half}z"/>`;
  }
  return s;
};
const cypress = (cls, x, y, h) => `<path class="${cls}" d="M${x} ${y - h} C${x + h * 0.16} ${y - h * 0.6} ${x + h * 0.13} ${y - h * 0.1} ${x} ${y} C${x - h * 0.13} ${y - h * 0.1} ${x - h * 0.16} ${y - h * 0.6} ${x} ${y - h}z"/>`;
const cloud = (x, y, s) => `<g class="sc-cloud" transform="translate(${x} ${y}) scale(${s})"><ellipse rx="46" ry="13"/><ellipse cx="-22" cy="-9" rx="22" ry="13"/><ellipse cx="12" cy="-13" rx="27" ry="17"/></g>`;
const waves = (y0, y1, seed) => {
  const r = rand(seed);
  let s = '';
  for (let y = y0; y < y1; y += 16) {
    const x = 20 + r() * 240;
    const w = 40 + r() * 70;
    s += `<path class="sc-line" d="M${x.toFixed(0)} ${y} q${w / 4} -4 ${w / 2} 0 t${w / 2} 0"/>`;
  }
  return s;
};

export const SCENE_ART = {
  skyline: () => `${sun(286, 520, 130)}
    <g id="sk"><g class="sc-p">
      <rect x="60" y="500" width="270" height="46"/><path d="M150 500c-6-34 12-56 45-66 33 10 51 32 45 66z"/>
      <path d="M92 500c-3-14 5-24 18-28 13 4 21 14 18 28zM262 500c-3-14 5-24 18-28 13 4 21 14 18 28z"/>
      <path d="M72 546V420l5-14 5 14v126zM308 546V420l5-14 5 14v126z"/></g>
      <path class="sc-line" d="M195 434v-18M70 446h14M70 472h14M306 446h14M306 472h14"/>
      <path class="sc-b" d="M100 546v-22a8 8 0 0 1 16 0v22M128 546v-22a8 8 0 0 1 16 0v22M187 546v-26a8 8 0 0 1 16 0v26M246 546v-22a8 8 0 0 1 16 0v22M274 546v-22a8 8 0 0 1 16 0v22"/></g>
    <use href="#sk" transform="matrix(1 0 0 -.7 0 928)" opacity=".28"/>`,

  sky: () => `${sun(250, 480, 150)}${cloud(120, 420, 1)}${cloud(290, 400, 0.7)}${cloud(200, 500, 1.2)}${cloud(300, 560, 0.9)}${cloud(90, 580, 0.8)}${cloud(250, 190, 0.5)}`,

  mountains: () => `${sun(270, 430, 130)}${peaks('sc-a', 470, 150, 11, 4)}${peaks('sc-b', 520, 120, 23, 5)}${peaks('sc-c', 580, 90, 5, 6)}${ridge('sc-d', 640, 14, 9)}`,

  beach: () => `${sun(195, 500, 140)}<circle class="sc-p" cx="195" cy="500" r="34"/>
    <rect class="sc-b" x="-10" y="520" width="410" height="270"/>${waves(534, 610, 3)}
    <path class="sc-a" d="M-10 640 C90 600 210 650 400 606 V790 H-10z"/>
    <g class="sc-d"><path d="M96 650 C92 590 100 520 122 462 l7 3 C112 524 106 590 110 650z"/>
      <path d="M124 464 c-34-22-66-12-84 8 28-12 56-10 84-8zM124 464 c-22-36-56-44-80-36 30 2 58 14 80 36zM124 464 c6-40 38-58 66-56-26 10-48 28-66 56zM124 464 c30-22 66-16 84 4-28-10-56-8-84-4zM124 464 c26 2 48 22 54 46-16-22-34-36-54-46z"/></g>`,

  garden: () => `${sun(260, 450, 130)}${ridge('sc-a', 520, 16, 4, 60)}
    ${cypress('sc-b', 78, 560, 150)}${cypress('sc-b', 312, 560, 150)}${cypress('sc-c', 108, 580, 110)}${cypress('sc-c', 282, 580, 110)}
    <g class="sc-p"><path d="M150 580V490M240 580V490M165 580V494M225 580V494" fill="none"/><path d="M140 492c0-34 24-56 55-64 31 8 55 30 55 64z"/><rect x="134" y="488" width="122" height="8" rx="3"/><rect x="140" y="576" width="110" height="8" rx="3"/></g>
    <path class="sc-line" d="M195 428v-14"/>${ridge('sc-b', 590, 10, 8, 50)}${ridge('sc-c', 640, 12, 2, 40)}`,

  night: () => {
    const r = rand(42);
    let s = '';
    for (let i = 0; i < 70; i++) s += `<circle class="sc-star" cx="${(r() * 390).toFixed(0)}" cy="${(110 + r() * 430).toFixed(0)}" r="${(0.5 + r() * 1.3).toFixed(1)}" opacity="${(0.35 + r() * 0.65).toFixed(2)}"/>`;
    for (const [x, y, k] of [[110, 400, 7], [300, 210, 5], [150, 470, 6], [85, 520, 4]]) s += `<path class="sc-star" d="M${x} ${y - k} q1 ${k - 1} ${k} ${k} q-${k - 1} 1 -${k} ${k} q-1 -${k - 1} -${k} -${k} q${k - 1} -1 ${k} -${k}z"/>`;
    return `${sun(262, 452, 110)}<path class="sc-p" d="M278 414a44 44 0 1 0 30 76a36 36 0 0 1-30-76z"/>${s}${ridge('sc-b', 560, 26, 6, 70)}${ridge('sc-c', 610, 18, 3, 50)}${ridge('sc-d', 660, 10, 5, 40)}`;
  },

  city: () => {
    const row = (cls, seed, base, minH, maxH, win) => {
      const r = rand(seed);
      let s = '';
      for (let x = -6; x < 392;) {
        const w = 22 + r() * 30;
        const h = minH + r() * (maxH - minH);
        s += `<rect class="${cls}" x="${x.toFixed(0)}" y="${(base - h).toFixed(0)}" width="${(w + 1).toFixed(0)}" height="${(h + 300).toFixed(0)}"/>`;
        if (r() > 0.6) s += `<rect class="${cls}" x="${(x + w / 2 - 1).toFixed(0)}" y="${(base - h - 18).toFixed(0)}" width="2" height="18"/>`;
        if (win) for (let wy = base - h + 8; wy < base - 6; wy += 13) for (let wx = x + 5; wx < x + w - 5; wx += 9) if (r() > 0.45) s += `<rect class="sc-win" x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="3.500" height="6"/>`;
        x += w + 2;
      }
      return s;
    };
    return `${sun(240, 470, 150)}${row('sc-a', 12, 560, 60, 190)}${row('sc-b', 31, 590, 40, 150, true)}${row('sc-c', 7, 640, 20, 80, true)}`;
  },

  chapel: () => `${sun(280, 440, 130)}${ridge('sc-a', 540, 20, 14, 70)}
    <path class="sc-b" d="M-10 620 C80 540 300 520 400 600 V790 H-10z"/>
    <g class="sc-p"><path d="M150 560v-58l40-30 40 30v58z"/><path d="M230 560v-40h36v40z"/><path d="M178 502v-52l12-52 12 52v52z"/></g>
    <path class="sc-line" d="M190 398v-14"/><path class="sc-b" d="M182 560v-24a8 8 0 0 1 16 0v24zM240 548v-14a5 5 0 0 1 10 0v14z"/><circle class="sc-b" cx="190" cy="486" r="6"/>
    ${cypress('sc-c', 120, 572, 70)}${cypress('sc-c', 286, 566, 60)}${ridge('sc-c', 640, 12, 21, 50)}`,

  forest: () => {
    const layer = (cls, seed, y, h, n) => {
      const r = rand(seed);
      let s = '';
      for (let i = 0; i < n; i++) s += pine(cls, -10 + (i + r() * 0.6) * (410 / n), y + r() * 18, h * (0.7 + r() * 0.5));
      return s;
    };
    return `${sun(200, 420, 150)}${peaks('sc-a', 500, 110, 8, 4)}${layer('sc-b', 3, 560, 110, 12)}${ridge('sc-b', 560, 6, 2)}${layer('sc-c', 17, 620, 150, 9)}${ridge('sc-c', 620, 6, 4)}${layer('sc-d', 29, 700, 190, 7)}`;
  },

  hills: () => {
    const rows = (y, seed) => {
      const r = rand(seed);
      let s = '';
      for (let i = 0; i < 9; i++) s += `<path class="sc-line" d="M${-20 + i * 50} ${y + 70} Q${120 + i * 20} ${y + 10 + r() * 6} ${200 + i * 26} ${y - 6}"/>`;
      return s;
    };
    return `${sun(110, 430, 130)}${ridge('sc-a', 500, 22, 5, 90)}
      <path class="sc-b" d="M-10 560 C100 500 240 500 400 560 V790 H-10z"/>
      <g class="sc-p"><path d="M236 520v-26h44v26z"/><path d="M230 496l28-16 28 16z"/><path d="M280 520v-40h14v40z"/></g>
      ${cypress('sc-c', 220, 524, 56)}${cypress('sc-c', 304, 526, 64)}${cypress('sc-c', 318, 528, 44)}
      <path class="sc-c" d="M-10 640 C120 570 280 590 400 640 V790 H-10z"/>${rows(600, 3)}`;
  },

  lake: () => `${sun(195, 470, 140)}
    <g id="lk">${peaks('sc-a', 500, 150, 19, 4)}${peaks('sc-b', 520, 90, 27, 6)}</g>
    <rect class="sc-water" x="-10" y="528" width="410" height="262"/>
    <use href="#lk" transform="matrix(1 0 0 -.55 0 818)" opacity=".3"/>${waves(545, 640, 12)}
    <g class="sc-d"><path d="M170 606h52l-8 10h-36z"/><path d="M196 606v-34l18 30z"/></g>`,

  blossom: () => {
    const r = rand(5);
    // Branches rise from the lower corners so they frame the names instead of crossing them.
    let s = '<path class="sc-branch" d="M30 700 C50 600 90 500 160 410 M62 590 C90 570 120 566 146 572 M96 512 C90 480 74 462 56 452"/>'
      + '<path class="sc-branch" d="M360 700 C340 600 300 500 230 410 M328 590 C300 570 270 566 244 572 M294 512 C300 480 316 462 334 452"/>';
    const spots = [[160, 410, 34], [146, 572, 28], [56, 452, 28], [84, 536, 24], [46, 640, 26], [120, 462, 22], [230, 410, 34], [244, 572, 28], [334, 452, 28], [306, 536, 24], [344, 640, 26], [270, 462, 22]];
    for (const [x, y, d] of spots) s += `<use href="#flower" x="${x - d / 2}" y="${y - d / 2}" width="${d}" height="${d}"/>`;
    for (let i = 0; i < 16; i++) s += `<ellipse class="sc-petal" cx="${(140 + r() * 110).toFixed(0)}" cy="${(440 + r() * 190).toFixed(0)}" rx="5" ry="2.600" transform="rotate(${(r() * 50 - 25).toFixed(0)} 195 520)" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`;
    return `${sun(195, 480, 160)}${s}`;
  },
};

// The opening each frame leaves in the 390 x 780 wall. Arch is the ornate multi-foil shape.
const ARCH = 'M52 780V330c0-22 12-30 22-44-6-26 10-40 28-52-2-24 16-36 36-48 6-26 34-38 57-70 23 32 51 44 57 70 20 12 38 24 36 48 18 12 34 26 28 52 10 14 22 22 22 44v450';
const ARCH_OUTER = 'M40 780V326c0-24 12-34 20-46-4-28 12-44 30-56 0-26 18-40 38-52 8-28 40-44 67-80 27 36 59 52 67 80 20 12 38 26 38 52 18 12 34 28 30 56 8 12 20 22 20 46v454';
export const FRAME_ART = {
  arch: () => `<path fill="url(#stone)" fill-rule="evenodd" d="M0 0h390v780H0z${ARCH}z"/>
    <g fill="none" stroke="url(#gold)"><path stroke-width="2" d="${ARCH}"/><path stroke-width=".8" opacity=".7" d="${ARCH_OUTER}"/></g>
    <use href="#lantern" x="6" y="0" width="34" height="170"/><use href="#lantern" x="350" y="0" width="34" height="170"/>`,
  round: () => `<path fill="url(#stone)" fill-rule="evenodd" d="M0 0h390v780H0zM48 780V270a147 147 0 0 1 294 0v510z"/>
    <g fill="none" stroke="url(#gold)"><path stroke-width="2" d="M48 780V270a147 147 0 0 1 294 0v510"/><path stroke-width=".8" opacity=".7" d="M36 780V270a159 159 0 0 1 318 0v510"/></g>`,
  oval: () => `<path fill="url(#stone)" fill-rule="evenodd" d="M0 0h390v780H0zM195 86a150 262 0 0 1 0 524a150 262 0 0 1 0-524z"/>
    <g fill="none" stroke="url(#gold)"><ellipse cx="195" cy="348" rx="150" ry="262" stroke-width="2"/><ellipse cx="195" cy="348" rx="161" ry="273" stroke-width=".8" opacity=".7"/></g>`,
  none: () => '',
};
