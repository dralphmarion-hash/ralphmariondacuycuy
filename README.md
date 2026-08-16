# Ralph Marion Dacuycuy — portfolio

Personal portfolio and résumé for **Ralph Marion Dacuycuy**, Content Moderator
(Subject Matter Expert) working in trust & safety and customer experience.

**Live:** https://dralphmarion-hash.github.io/ralphmariondacuycuy/

---

## Stack

Hand-written HTML, CSS and vanilla JavaScript. **No build step, no framework, no
dependencies.** What is in the repository is exactly what is served.

That is a deliberate choice rather than a limitation: the site is a single page
plus a résumé, so a bundler would add tooling and a base-path problem without
buying anything. Everything ships as static files that GitHub Pages serves directly.

| Concern | Approach |
| --- | --- |
| Fonts | Instrument Serif + Inter, self-hosted `woff2` (latin subset, ~89 KB total), preloaded |
| JavaScript | ~11 KB, no libraries — scroll reveal, scroll-spy, mobile nav, form validation |
| Images | Pre-sized JPEGs with `srcset`; portrait derived from the source photo |
| Contact form | [FormSubmit](https://formsubmit.co) AJAX endpoint — no backend, no API key |
| Résumé PDF | Generated from `resume.html` via the browser's print stylesheet |

## Layout

```
index.html                  one-page portfolio
resume.html                 web résumé (also the source document for the PDF)
404.html                    self-contained error page, no external assets
.nojekyll                   serve files as-is, skip Jekyll processing
assets/
  css/site.css              portfolio styles
  css/resume.css            résumé screen + print styles
  js/site.js                all interactive behaviour
  fonts/                    self-hosted woff2
  img/                      portrait, favicons, Open Graph image
  docs/                     Ralph-Marion-Dacuycuy-Resume.pdf
```

## Local preview

Any static server works; the site needs no build. For example:

```bash
python3 -m http.server 8000    # then open http://localhost:8000
```

Opening `index.html` straight from the filesystem mostly works, but the contact
form will not — FormSubmit rejects `file://` origins.

## Deployment

GitHub Pages, **Settings → Pages → Source: "Deploy from a branch" → `main` / `/ (root)`**.
No workflow or build is involved; pushing to `main` publishes.

`404.html` is served by GitHub Pages for any unknown path under the project site,
including deep ones. Because relative URLs would resolve against a directory that
does not exist, that page carries its own styles inline and its two links use the
project base path. **If the repository is ever renamed, update those two links**
and the canonical/Open Graph URLs in `index.html` and `resume.html`.

## Regenerating the résumé PDF

`assets/docs/Ralph-Marion-Dacuycuy-Resume.pdf` is printed from `resume.html`, so the
two never drift. To rebuild after editing the résumé, print `resume.html` to PDF
(A4, background graphics on, headers/footers off) and save over the existing file.

The print stylesheet at the bottom of `assets/css/resume.css` is tuned to fit one
page. Headings use light letter-spacing on purpose — wide tracking makes PDF text
extract one character at a time, which trips up applicant tracking systems.

## Contact form

Posts to `https://formsubmit.co/ajax/dralphmarion@gmail.com`. There is no API key
and no secret in this repository — FormSubmit addresses the endpoint by e-mail
address and verifies the submitting origin.

The form degrades gracefully: without JavaScript the `<form>` still posts natively
to the same service, and any failure surfaces the direct e-mail address instead.

**One-time setup:** FormSubmit requires the mailbox owner to click an *Activate
Form* link in the e-mail it sends on the first submission. Until that happens,
submissions return a "needs activation" response and visitors are shown the direct
e-mail fallback.

## Content

Every factual claim on this site comes from Ralph's CV or from a certificate that
links to its own verification page. Nothing is embellished. Deliberate omissions:

- Home street address — only the city is shown.
- Named referees and their phone numbers — replaced with "references available on
  request", since publishing third parties' personal contact details is not ours to do.
