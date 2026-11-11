# Wedding invitation

A static, single-page wedding invitation: envelope intro, scratch-to-reveal date, couple
details, timeline, countdown, venue map, dress code, gift list and RSVP. No build step and
no dependencies; all artwork is inline SVG and CSS.

## Use it

Edit `config.js` (names, date, timeline, venue, dress code, gifts, RSVP, music), then host
the repository root on any static host. To preview locally:

```bash
npx serve
```

## RSVP

Replies go to `rsvp.endpoint` as a JSON `POST`:

```json
{ "name": "Guest Name", "attending": "yes", "guests": 2 }
```

With no endpoint, `rsvp.email` opens a pre-filled email instead. With neither set, the form
says RSVP is not configured.

## Music

Set `musicUrl` to a track you have the rights to use. It starts when the envelope is opened
and the round button toggles it. The button is hidden while `musicUrl` is empty.
