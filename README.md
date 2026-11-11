# Sealed — digital wedding invitations

A product for building and sharing wedding invitations. People sign up, start from a design,
customise it in an editor with a live preview, publish it to a link, and collect RSVPs.

Live: https://invitation.mcdavidemereuwa95.workers.dev

## What a host can customise

- **Colours**: eight palettes, or any four colours (background, cards, accent, text).
- **Lettering**: four font pairings.
- **Cover**: an illustrated scene, or their own photo or video, with or without the arch frame.
- **Sections**: date (scratch to reveal), couple, welcome message, verse or quote, timeline,
  countdown, location with map, dress code, gifts, photo gallery, RSVP, and any number of
  custom sections. Each can be reordered, hidden, retitled, and given its own photo or video.
- **Envelope intro** and **music** (an uploaded track), both optional.
- **Link**: `/i/<name>`, editable.

## How it is built

One Cloudflare Worker, no framework and no runtime dependencies.

| Piece | Where |
| --- | --- |
| Routing, API, security headers | `src/worker.js` |
| Passwords and sessions | `src/auth.js` |
| Slug, RSVP and CSV helpers | `src/util.js` |
| Invitation schema, palettes, sanitiser (shared by Worker, editor and renderer) | `public/assets/schema.js` |
| Invitation renderer | `public/invite.html`, `public/assets/invite.{js,css}` |
| Editor, dashboard, landing, auth pages | `public/*.html`, `public/assets/*` |
| Database schema (D1) | `migrations/` |

Data lives in D1 (`users`, `sessions`, `invites`, `rsvps`, `media`); uploaded files live in the
R2 bucket `invitation-media` and are served from `/media/…` with range support.

Static files are bundled into the Worker by `scripts/build-assets.js`, which wrangler runs before
`dev` and `deploy`. `src/assets.gen.js` is its output and is not committed.

### Behaviour worth knowing

- **Every save is sanitised** against the schema on the server: unknown keys are dropped, links
  must be `https`, media must be files uploaded to this service, colours must be hex.
- **Saves are versioned.** A save from a stale tab or second device is refused with a prompt to
  reload instead of overwriting newer edits.
- **RSVPs are idempotent per guest device.** The browser keeps a random id per invitation; a
  retry, double tap or later change updates the same row. Guest counts are checked against the
  invitation's own limit on the server.
- **Uploads**: images up to 10 MB, audio 25 MB, video 80 MB, 300 MB per invitation. The served
  content type comes from the stored extension, never from the uploader. SVG is not accepted.
- **Limits**: 20 invitations per account, 3,000 replies per invitation.
- **Sessions**: 30-day `HttpOnly` cookie; only a hash of the token is stored. Eight wrong
  passwords lock sign-in for that account for 15 minutes.

### Not built yet

Email verification and password reset (there is no email provider wired in), payments or plans,
bot protection on sign-up and RSVP, and a custom domain.

## Run it locally

```bash
npm install
```

```bash
npm run db:migrate:local
```

```bash
npm run dev
```

## Test

```bash
npm test
```

## Deploy

Needs a Cloudflare API token with Workers Scripts, D1 and R2 edit, exported as
`CLOUDFLARE_API_TOKEN`, plus `CLOUDFLARE_ACCOUNT_ID`.

```bash
npm run db:migrate
```

```bash
npm run deploy
```
