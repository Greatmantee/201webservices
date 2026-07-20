# 201 Web Services — Website

A static site built with plain HTML, CSS and JavaScript. No build step, no
framework, no dependencies.

```
index.html          all markup, plus a single inline SVG icon sprite
css/styles.css      design tokens + styles, organised in 11 numbered sections
js/main.js          behaviour, split into isolated init functions
assets/             favicon + portfolio screenshots
```

## Run it

Open `index.html` in a browser. That's it.

For local development with correct relative paths:

```bash
python3 -m http.server 8000     # then visit http://localhost:8000
```

## Deploy

Drag the folder into Netlify, or push to a repo and connect it. There is no
build command and no publish directory to configure — it's already static.

---

## Design direction

Minimal, flat, and built on solid colour. There are **no gradients** anywhere in
the stylesheet; every surface is a single flat value, and depth comes from
hairline borders and spacing rather than shadows or glows.

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#0B1520` | Dark sections, headings |
| `--mint` | `#2EE6A8` | The single accent |
| `--mint-deep` | `#0E9A72` | Same accent, contrast-safe on light backgrounds |
| `--paper` / `--paper-alt` | `#FFFFFF` / `#F5F8FA` | Alternating light surfaces |
| `--line` | `#E4EAF0` | Hairlines, which do most of the structural work |

Type is three faces with one job each: **Bricolage Grotesque** for display,
**Inter** for body, **JetBrains Mono** for labels and data. Everything is driven
by a fluid `clamp()` scale (`--step-xs` → `--step-5`), so there are no
per-breakpoint font-size overrides.

Every colour, size and spacing value is a custom property at the top of
`styles.css`. Rebranding the site is a matter of editing that one block.

### The hero

The right column is the **Creation Manifest** — the brand's signature element.

201 is an HTTP status code meaning "Created", so the card is built as the
response itself: `HTTP RESPONSE` label, the numeral set at logo scale with
*Created* beside it, then the manifest of what was made — project, build ID,
creation pipeline, and the provenance line *Built from first principles / Never
templates.*

The numeral is typeset, not illustrated: Bricolage Grotesque at 800 weight,
-0.055em tracking, tabular figures so the three digits sit on an even rhythm. It
renders larger than the `h1` beside it, which is deliberate — it's the first
thing the eye lands on, and it works as a brand mark independent of the page.

Accent discipline is what keeps it from reading as another SaaS card. Teal
appears in exactly four places: the live dot, the word *Created*, and the mark
and status of the one phase currently running. Everything else is neutral. The
numeral itself is ink, never teal — it's a wordmark, not a highlight.

There are no gradients. Depth is one hairline border plus one soft shadow, and
the pipeline is threaded by a 1px rail rather than boxed rows. Motion is a
10-second float, a slow pulse on the live dot, and shadow easing on hover — all
disabled under `prefers-reduced-motion`.

### Ambient depth

The hero sits on three near-invisible washes (`.hero::before`): a faint teal
behind the card, a faint ink at the top-left, and a slight floor at the bottom.

This is atmosphere, not a feature. Measured off a render, the background never
deviates more than **2.4% from pure white**, with a maximum channel spread of 4 —
below the threshold where the eye reads it as colour rather than depth. The
manifest card stays pure white, so it separates from the wash without needing a
heavier shadow.

The three values live in `:root` as `--depth-warm`, `--depth-cool` and
`--depth-floor`. If the hero ever starts reading as a coloured section, lower
them; past roughly `0.05` the wash stops being invisible. Every other section
remains flat.

### Trusted-by marquee

Thirteen client logos in `assets/logos/`, trimmed to content bounds, exported at
2x (120px tall) and saved as WebP — 373KB of PNG down to 101KB, which matters
because the strip loads eagerly (see below).

Sizing is **optical, not mechanical**. A square badge and a long wordmark set to
the same pixel height do not carry the same weight, so each logo has its own
height via `--h` on `.logo--*`: 48px for square marks, 30px for the widest
wordmarks. Adjust those values, not the images.

Four logos (SecuraForge, SmartbillsPay, Nomxy Bites, Let's Go Drive) only exist
on their own dark backgrounds — their lettering is white or light, so stripping
the background would erase them. Those are cropped tight to the lockup and given
rounded corners so they read as intentional tiles, and they sit at a lower height
than the flat marks so a block of colour never out-weighs a plain wordmark.
Ogulagha News is kept as a full square for the same reason: its navy field is
part of the mark.

The loop is three identical tracks inside one rail that travels 33.33% — exactly
one track width. Two tracks always remain to the right of the viewport at the
reset, covering screens up to ~4600px. Verified by pixel-sampling the strip: the
largest white gap at the loop point is 102px, versus 102-122px between logos
normally, so the seam is indistinguishable.

Marquee images are deliberately **not** `loading="lazy"`. A lazy image that
hasn't decoded yet leaves a hole in a strip that is already moving; the portfolio
screenshots further down the page keep lazy loading.

Hover pauses the rail and lifts the individual logo to full opacity at 1.03
scale. Under `prefers-reduced-motion` the animation stops, the duplicate tracks
are hidden, and the logos wrap into a centred static row.

## Pages

Three pages, three hand-editable HTML files. No build step, no partials, no
generator.

| File | What it is |
| --- | --- |
| `index.html` | The single-page marketing site |
| `projects.html` | Every project, same cards and preview dialog as the homepage |
| `contact.html` | Direct channels plus the quote brief, with four contact-specific FAQs |
| `privacy.html` | Privacy policy — sticky contents, ten sections |
| `terms.html` | Terms of service — same layout, thirteen sections |

They all sit in the same folder and link to each other by filename
(`projects.html`, `index.html#services`), so the site works identically from
`file://`, from `python3 -m http.server`, and on Netlify. Netlify additionally
serves them at `/projects` and `/contact`; the `<link rel="canonical">` on each
page points at those clean URLs.

They all share the same sprite, header, drawer, footer and dialogs. Since
there are no partials, a change to any of those has to be made in every
file — worth remembering when editing the nav or footer.

## Structure notes

- **The logo** is `assets/logo.png`, exactly as supplied by the client, with
  `assets/logo-mark.png` being the same artwork with its empty transparent
  canvas trimmed so it can be sized. The mark is a single mint tone: it reads at
  14.1:1 on the brand ink and only 1.3:1 on white, so on light backgrounds it
  sits on an ink chip (`.brand--chip`) rather than being recoloured. The source
  artwork is 123x38px, which is not enough resolution to stay crisp on a 2x
  display above roughly 19px tall — an SVG or a 3x PNG would fix that.
- **Icons** are one inline `<svg>` sprite referenced via `<use>`, so each icon's
  path data appears once in the document instead of at every call site.
- **CSS** is ordered tokens → reset → layout → type → components → sections →
  responsive, with section markers. Specificity stays flat: single class
  selectors, no `!important`, no ID selectors.
- **JS** is a single IIFE with one init function per concern, each wrapped in
  try/catch at boot — a failure in the accordion can't take down the dialog.
- **The quote dialog** uses the native `<dialog>` element, so focus trapping,
  backdrop and Escape-to-close come from the platform. There's a fallback path
  for browsers without `showModal()`.

## Behaviour

| Feature | Notes |
| --- | --- |
| Sticky header | Gains a background + hairline after 24px of scroll |
| Scroll spy | Highlights the current section in the nav |
| Scroll reveal | `IntersectionObserver`, disabled under reduced-motion |
| Reviews slider | One verbatim Google review at a time, arrow + dot pagination (arrows wrap, so neither is ever dead). Only the active card is in flow, so the box is exactly as tall as the review being read — inactive cards are taken out of flow and made non-interactive, and reset to collapsed when they leave the view; per-card *Read more* collapses at a paragraph boundary via the same `grid-template-rows` animation as the FAQ; dates render relative to each `<time datetime>` and keep ageing correctly. The *Read all Google Reviews* button href is a placeholder — point it at the public Google Business profile. |
| FAQ | Seven questions ordered to answer objections before they're raised, opening with the templates question. One panel at a time; re-clicking an open one collapses it. Height animates via `grid-template-rows` with the copy fading in just behind it. Longer answers use `.faq__phases` (label/description pairs) or `.faq__list` (bullets). A closing `.faq-cta` callout links to WhatsApp with a message prefilled, deliberately offering a lower-commitment route than the brief. Buttons lift 1px with a soft shadow on hover and nudge their arrow 3px right — motion only, so all three are off under `prefers-reduced-motion`. |
| Quote dialog | Opens from any `[data-quote]` element. Service and timeline are chip groups; investment is five tier cards built on native radios (so the radiogroup semantics and arrow-key navigation come from the platform, not from script). All three feed a live **Project summary** card beside the form on desktop, stacked beneath it under 860px. Timeline is required and validated in-page — chips can't carry the platform's `required`, so an unanswered group warms its borders, reveals a message and takes focus rather than firing an alert. |
| Legal contents | The table of contents on `privacy.html` and `terms.html` is a `<details>`, so the mobile accordion needs no script — on desktop the summary is hidden by CSS, which leaves it permanently open. `initToc()` adds only the active-section highlight (one IntersectionObserver, no scroll handler) and closes the accordion after a tap on narrow screens. Anchor offset comes from `scroll-margin-top`, not JavaScript. |
| Project preview | *Start a similar project* opens WhatsApp with the viewed project's name prefilled. Cards still carry `data-url`, but nothing renders it — the live-site button was removed deliberately. |
| Mobile drawer | Closes on navigate, Escape, or resize past the breakpoint |

Any element with `data-quote` opens the quote dialog. Add
`data-service="E-commerce Stores"` and that option is preselected when it opens —
that's how the service cards work.

## Wiring up the form

The form currently validates, then logs the payload and shows a success state.
In `js/main.js`, find the `--- Wire this up to your endpoint ---` comment in
`initQuote()` and POST the `payload` object to Formspree, Netlify Forms, or your
own endpoint.

For Netlify Forms specifically, add `netlify` and `name="quote"` to the `<form>`
tag in `index.html` and it will be picked up on deploy.

## Portfolio screenshots

Real client work is never recreated in code. Drop the actual files in:

```
assets/portfolio/eniebi-foundation.png
assets/portfolio/orbit-digital.png
assets/portfolio/cryptin.png
```

Until a file exists, a labelled placeholder holds the layout instead of showing a
broken image. Swap in the real screenshot and it appears automatically.

## Accessibility

Verified in a headless browser: one `<h1>`, no skipped heading levels, every
image has alt text, every button has an accessible name, no horizontal overflow
between 320px and 1440px, visible keyboard focus throughout, and
`prefers-reduced-motion` respected. The FAQ and dialog manage `aria-expanded`,
`aria-controls` and focus return.

Content is hidden for scroll reveal only when JavaScript is confirmed present
(the `js` class on `<html>`), so the page stays fully readable if the script
fails to load.
