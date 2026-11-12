#!/usr/bin/env python3
"""Synthesises the built-in music library into sounds/*.mp3.

Every track is generated from the note lists below, so nothing here is a
recording of anyone's performance. "Canon in D" follows Pachelbel's
public-domain piece; the other five are original.

Needs numpy and ffmpeg:  python3 scripts/make-sounds.py
"""
import os
import subprocess
import sys
import wave

import numpy as np

SR = 32000
OUT = os.path.join(os.path.dirname(__file__), '..', 'sounds')
rng = np.random.default_rng(7)

NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def midi(name):
    """'F#4' -> 66"""
    n = NOTE[name[0]]
    rest = name[1:]
    if rest[0] == '#':
        n, rest = n + 1, rest[1:]
    elif rest[0] == 'b':
        n, rest = n - 1, rest[1:]
    return 12 * (int(rest) + 1) + n


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------- instruments: each returns a mono float array ----------

def pluck(m, dur, bright=0.5):
    """Karplus-Strong string, computed one period at a time."""
    f = hz(m)
    n = max(2, int(round(SR / f)))
    periods = int(dur * SR / n) + 1
    buf = rng.uniform(-1, 1, n)
    # soften the excitation so high strings are not harsh
    k = int(2 + (1 - bright) * 10)
    buf = np.convolve(buf, np.ones(k) / k, mode='same')
    decay = 0.5 ** (n / (SR * (0.9 + 1.6 * (60 / max(m, 36)))))  # low strings ring longer
    out = np.empty(periods * n)
    for i in range(periods):
        out[i * n:(i + 1) * n] = buf
        buf = decay * 0.5 * (buf + np.roll(buf, 1))
    out = out[:int(dur * SR)]
    out *= np.minimum(1, np.arange(len(out)) / (0.002 * SR))
    return out / (np.abs(out).max() + 1e-9)


def struck(m, dur, partials, t60):
    """Additive tone with per-partial decay: piano and bells."""
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    out = np.zeros_like(t)
    for ratio, amp, life in partials:
        if f * ratio > SR * 0.45:
            continue
        out += amp * np.sin(2 * np.pi * f * ratio * t + rng.uniform(0, 6.28)) * np.exp(-t * 6.9 / (t60 * life))
    out *= np.minimum(1, t / 0.004)
    return out / (np.abs(out).max() + 1e-9)


def piano(m, dur):
    parts = [(1, 1, 1), (2, .5, .7), (3, .28, .5), (4, .16, .4), (5, .1, .3), (6, .06, .25), (7, .03, .2)]
    return struck(m, max(dur, 2.4), parts, 2.2 + (72 - m) * 0.03)


def bell(m, dur):
    return struck(m, max(dur, 2.2), [(1, 1, 1), (2.76, .45, .45), (5.4, .2, .25), (8.9, .08, .15)], 1.7)


def pad(m, dur):
    """Slow, breathing string-section tone."""
    n = int((dur + 1.5) * SR)
    t = np.arange(n) / SR
    f = hz(m)
    out = np.zeros(n)
    for det in (-0.004, 0, 0.0035):
        vib = 1 + 0.0025 * np.sin(2 * np.pi * (4.6 + det * 40) * t + rng.uniform(0, 6))
        ph = 2 * np.pi * np.cumsum(f * (1 + det) * vib) / SR
        for h, a in ((1, 1), (2, .42), (3, .22), (4, .1), (5, .05)):
            out += a * np.sin(h * ph)
    env = np.minimum(1, t / 1.1) * np.minimum(1, (t[-1] - t) / 1.4)
    out *= env
    return out / (np.abs(out).max() + 1e-9)


# ---------- mixing ----------

def render(events, bpm, total_beats, tail=4.0):
    """events: (instrument, beat, midi, beats, velocity, pan -1..1)"""
    spb = 60 / bpm
    n = int((total_beats * spb + tail) * SR)
    mix = np.zeros((n, 2))
    cache = {}
    for inst, beat, m, beats, vel, pan in events:
        key = (inst.__name__, m, round(beats * spb, 2))
        if key not in cache:
            cache[key] = inst(m, beats * spb)
        s = cache[key]
        i = int(beat * spb * SR)
        s = s[:n - i]
        mix[i:i + len(s), 0] += s * vel * (1 - pan) / 2
        mix[i:i + len(s), 1] += s * vel * (1 + pan) / 2
    return mix


def reverb(x, seconds=2.2, wet=0.28):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.empty_like(x)
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    for ch in range(2):
        ir = rng.normal(0, 1, n) * np.exp(-t * 6.9 / seconds)
        ir[:int(0.012 * SR)] = 0
        ir = np.convolve(ir, np.ones(6) / 6, mode='same')  # darker tail
        y = np.fft.irfft(np.fft.rfft(x[:, ch], size) * np.fft.rfft(ir, size), size)[:len(x)]
        out[:, ch] = x[:, ch] + wet * y / (np.abs(y).max() + 1e-9) * np.abs(x[:, ch]).max()
    return out


def save(name, x):
    x = reverb(x)
    fade = int(3.0 * SR)
    x[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
    x[:int(0.03 * SR)] *= np.linspace(0, 1, int(0.03 * SR))[:, None]
    x = x / np.abs(x).max() * 0.82
    os.makedirs(OUT, exist_ok=True)
    wav = os.path.join(OUT, f'{name}.wav')
    with wave.open(wav, 'w') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())
    mp3 = os.path.join(OUT, f'{name}.mp3')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '96k', '-ar', '32000', mp3], check=True)
    os.remove(wav)
    print(f'{name}.mp3  {len(x) / SR:5.1f}s  {os.path.getsize(mp3) / 1024:5.0f} KB')


def seq(inst, start, notes, vel=0.5, pan=0.0, hold=None):
    """notes: list of (name | None, beats). Returns events and the end beat."""
    ev = []
    b = start
    for name, beats in notes:
        if name:
            ev.append((inst, b, midi(name), hold or beats, vel, pan))
        b += beats
    return ev, b


# ---------- tracks ----------

def canon():
    chords = [('D3', 'D F# A'), ('A2', 'A C# E'), ('B2', 'B D F#'), ('F#2', 'F# A C#'), ('G2', 'G B D'), ('D2', 'D F# A'), ('G2', 'G B D'), ('A2', 'A C# E')]
    line_a = ['F#5', 'E5', 'D5', 'C#5', 'B4', 'A4', 'B4', 'C#5']
    line_b = ['D5', 'C#5', 'B4', 'A4', 'G4', 'F#4', 'G4', 'E4']
    run = ['D5 F#5 A5 G5', 'F#5 D5 F#5 E5', 'D5 B4 D5 A4', 'G4 B4 A4 G4', 'F#4 D4 E4 F#4', 'G4 A4 B4 G4', 'B4 G4 B4 D5', 'C#5 E5 A4 C#5']
    ev = []
    for cyc in range(5):
        for i, (bass, tones) in enumerate(chords):
            b = cyc * 16 + i * 2
            ev.append((pluck, b, midi(bass), 2, .55, -.15))
            names = tones.split()
            arp = [names[0] + '3', names[1] + '3', names[2] + '3', names[1] + '4'] if cyc < 4 else [names[0] + '3', names[2] + '3']
            for k, nm in enumerate(arp):
                ev.append((pluck, b + k * (2 / len(arp)), midi(nm), 1.5, .26, .25))
            if cyc in (1, 2):
                ev.append((pluck, b, midi(line_a[i]), 2, .5, .1))
            if cyc == 2:
                ev.append((pluck, b, midi(line_b[i]), 2, .36, -.3))
            if cyc == 3:
                for k, nm in enumerate(run[i].split()):
                    ev.append((pluck, b + k * .5, midi(nm), 1, .44, .1))
            if cyc == 4:
                ev.append((pluck, b, midi(line_b[i]), 2, .42, .1))
    for nm in ('D2', 'A2', 'D3', 'F#3', 'A3', 'D4', 'F#4'):
        ev.append((pluck, 80 + .08 * len(ev) % 1, midi(nm), 4, .4, 0))
    save('canon', render(ev, 58, 82))


def reverie():
    prog = ['C3 G3 C4 E4', 'G2 D3 B3 D4', 'A2 E3 A3 C4', 'F2 C3 A3 C4', 'A2 E3 C4 E4', 'F2 C3 A3 C4', 'C3 G3 E4 G4', 'G2 D3 B3 D4']
    tune = [
        [('E5', 2), ('G5', 1), ('E5', 1)], [('D5', 2), ('B4', 2)], [('C5', 2), ('E5', 1), ('C5', 1)], [('A4', 3), (None, 1)],
        [('C5', 2), ('E5', 2)], [('F5', 2), ('A5', 1), ('G5', 1)], [('E5', 3), ('D5', 1)], [('D5', 4)],
    ]
    tune2 = [
        [('G5', 1), ('E5', 1), ('C5', 1), ('E5', 1)], [('G5', 2), ('D5', 2)], [('E5', 1), ('C5', 1), ('A4', 1), ('C5', 1)], [('F5', 2), ('C5', 2)],
        [('E5', 2), ('A5', 2)], [('A5', 1), ('G5', 1), ('F5', 1), ('C5', 1)], [('E5', 2), ('G5', 2)], [('D5', 2), ('B4', 2)],
    ]
    ev = []
    for rep, melody in enumerate([None, tune, tune2, tune]):
        for bar, chord in enumerate(prog):
            b = (rep * 8 + bar) * 4
            for k, nm in enumerate(chord.split() + chord.split()[1:3] + chord.split()[1:2] + chord.split()[2:3]):
                ev.append((piano, b + k * .5, midi(nm), 2, .3 if k else .42, -.2))
            if melody:
                e, _ = seq(piano, b, melody[bar], vel=.6, pan=.2)
                ev += e
    for nm in ('C3', 'G3', 'C4', 'E4', 'C5'):
        ev.append((piano, 128, midi(nm), 4, .42, 0))
    save('reverie', render(ev, 72, 130))


def musicbox():
    prog = [('F4', 'A4 C5'), ('C4', 'G4 C5'), ('D4', 'F4 A4'), ('Bb3', 'F4 Bb4'), ('F4', 'A4 C5'), ('G4', 'Bb4 D5'), ('C4', 'G4 Bb4'), ('F4', 'A4 C5')]
    tune = [
        [('A5', 2), ('C6', 1)], [('G5', 1), ('E5', 1), ('G5', 1)], [('F5', 2), ('A5', 1)], [('D5', 3)],
        [('C6', 1), ('A5', 1), ('F5', 1)], [('D6', 2), ('Bb5', 1)], [('C6', 1), ('Bb5', 1), ('G5', 1)], [('F5', 3)],
    ]
    tune2 = [
        [('C6', 1), ('A5', 1), ('C6', 1)], [('E6', 2), ('C6', 1)], [('D6', 1), ('A5', 1), ('F5', 1)], [('F5', 2), ('D5', 1)],
        [('A5', 2), ('C6', 1)], [('Bb5', 1), ('D6', 1), ('G5', 1)], [('E5', 1), ('G5', 1), ('Bb5', 1)], [('A5', 3)],
    ]
    ev = []
    for rep, melody in enumerate([tune, tune2, tune, tune2]):
        for bar, (bass, top) in enumerate(prog):
            b = (rep * 8 + bar) * 3
            ev.append((bell, b, midi(bass), 3, .34, -.25))
            for k, nm in enumerate(top.split()):
                ev.append((bell, b + 1 + k, midi(nm), 2, .2, -.1))
            e, _ = seq(bell, b, melody[bar], vel=.52, pan=.25)
            ev += e
    for k, nm in enumerate(('F4', 'A4', 'C5', 'F5', 'A5', 'C6', 'F6')):
        ev.append((bell, 96 + k * .33, midi(nm), 4, .4, 0))
    save('musicbox', render(ev, 104, 100))


def strings():
    prog = ['D3 A3 F#4 A4 C#5', 'B2 F#3 D4 A4 B4', 'G2 D3 B3 F#4 A4', 'A2 E3 C#4 E4 A4', 'D3 A3 F#4 A4 D5', 'B2 F#3 D4 F#4 B4', 'E3 B3 G4 B4 D5', 'A2 E3 C#4 G4 A4']
    lead = [[('F#5', 4), ('E5', 2), ('D5', 2)], [('D5', 6), ('F#5', 2)], [('B5', 4), ('A5', 4)], [('E5', 8)],
            [('A5', 4), ('F#5', 2), ('A5', 2)], [('B5', 6), ('A5', 2)], [('G5', 4), ('B5', 4)], [('A5', 8)]]
    ev = []
    for rep in range(2):
        for bar, chord in enumerate(prog):
            b = (rep * 8 + bar) * 8
            for k, nm in enumerate(chord.split()):
                ev.append((pad, b, midi(nm), 8, .3 if k else .42, (k - 2) * .22))
            if rep or bar > 1:
                e, _ = seq(pad, b, lead[bar], vel=.34, pan=.1)
                ev += e
    for k, nm in enumerate('D3 A3 D4 F#4 A4 D5'.split()):
        ev.append((pad, 128, midi(nm), 6, .34, (k - 2.5) * .2))
    save('strings', render(ev, 120, 134, tail=5))


def waltz():
    prog = [('G2', 'B3 D4'), ('G2', 'B3 D4'), ('D3', 'A3 C4'), ('D3', 'F#3 C4'), ('E3', 'G3 B3'), ('C3', 'G3 C4'), ('D3', 'F#3 A3'), ('G2', 'B3 D4'),
            ('C3', 'E4 G4'), ('G2', 'B3 D4'), ('A2', 'C4 E4'), ('D3', 'A3 C4'), ('G2', 'B3 D4'), ('E3', 'G3 B3'), ('D3', 'F#3 C4'), ('G2', 'B3 D4')]
    tune = [
        [('D5', 2), ('G5', 1)], [('B5', 2), ('A5', 1)], [('F#5', 2), ('A5', 1)], [('D5', 3)], [('E5', 1), ('G5', 1), ('B5', 1)], [('C6', 2), ('B5', 1)], [('A5', 1), ('F#5', 1), ('A5', 1)], [('G5', 3)],
        [('E5', 2), ('G5', 1)], [('D5', 2), ('B4', 1)], [('C5', 1), ('E5', 1), ('A5', 1)], [('F#5', 3)], [('G5', 1), ('B5', 1), ('D6', 1)], [('B5', 2), ('G5', 1)], [('A5', 2), ('F#5', 1)], [('G5', 3)],
    ]
    ev = []
    for rep in range(3):
        for bar, (bass, top) in enumerate(prog):
            b = (rep * 16 + bar) * 3
            ev.append((piano, b, midi(bass), 2, .46, -.2))
            for beat in (1, 2):
                for nm in top.split():
                    ev.append((piano, b + beat, midi(nm), 1, .2, -.1))
            if rep:
                e, _ = seq(piano, b, tune[bar], vel=.58, pan=.2)
                ev += e
                if rep == 2:  # second time, doubled an octave below
                    ev += [(i, bb, m - 12, d, .3, .0) for i, bb, m, d, v, p in e]
    for nm in ('G2', 'D3', 'G3', 'B3', 'D4', 'G4'):
        ev.append((piano, 144, midi(nm), 4, .4, 0))
    save('waltz', render(ev, 132, 147))


def serenade():
    prog = ['A2 E3 A3 C4 E4', 'F2 C3 A3 C4 F4', 'C3 G3 C4 E4 G4', 'G2 D3 B3 D4 G4', 'A2 E3 A3 C4 E4', 'D3 A3 D4 F4 A4', 'E2 B2 G#3 B3 E4', 'A2 E3 A3 C4 E4']
    pattern = [0, 2, 3, 4, 2, 3, 4, 3]
    tune = [[('E5', 2), ('A5', 2)], [('A5', 1), ('G5', 1), ('F5', 2)], [('E5', 2), ('G5', 2)], [('D5', 3), ('B4', 1)],
            [('C5', 2), ('E5', 2)], [('F5', 2), ('A5', 1), ('F5', 1)], [('E5', 2), ('G#5', 2)], [('A5', 4)]]
    ev = []
    for rep in range(4):
        for bar, chord in enumerate(prog):
            names = chord.split()
            b = (rep * 8 + bar) * 4
            for k, idx in enumerate(pattern):
                ev.append((pluck, b + k * .5, midi(names[idx]), 2 if k else 4, .44 if not k else .27, -.15 + idx * .08))
            if rep in (1, 3):
                e, _ = seq(pluck, b, tune[bar], vel=.52, pan=.2)
                ev += e
            if rep == 2:
                e, _ = seq(pluck, b, [(n, d) for n, d in tune[bar]], vel=.4, pan=.2)
                ev += [(i, bb, m - 12, d, v, p) for i, bb, m, d, v, p in e]
    for k, nm in enumerate('A2 E3 A3 C4 E4 A4'.split()):
        ev.append((pluck, 128 + k * .12, midi(nm), 5, .44, 0))
    save('serenade', render(ev, 84, 132))


TRACKS = {'canon': canon, 'reverie': reverie, 'musicbox': musicbox, 'strings': strings, 'waltz': waltz, 'serenade': serenade}

if __name__ == '__main__':
    for name in sys.argv[1:] or TRACKS:
        TRACKS[name]()
