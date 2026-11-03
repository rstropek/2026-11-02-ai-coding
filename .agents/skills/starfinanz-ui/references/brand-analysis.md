# Brand analysis: starfinanz.de

What was extracted from the website (2026-11-03, Elementor theme CSS and
screenshots) and how each element was translated for a data-management app.
Read this when a token in `assets/theme.css` needs to change, or when a new
situation is not covered by the recipes and you need to reason from the
original brand.

## Colors on the website

| Website variable / use                                       | Value                | In the app                                      |
| ------------------------------------------------------------ | -------------------- | ----------------------------------------------- |
| `--e-global-color-primary`, CTA buttons, links, cookie title | `#AF0260`            | `primary` - all interactive elements            |
| Logo bar, accessibility focus/outline                        | `#DA0034`            | `brand-red` - logo bar in the header only       |
| Serif headlines (e.g. 404 page)                              | `#6D043A`            | `primary-strong` - page titles, active nav text |
| Text, dark footer, secondary button                          | `#292929`            | `ink`                                           |
| Warm grays                                                   | `#5C5151`, `#827373` | `ink-muted`, `ink-subtle`                       |
| Borders, button hover                                        | `#C6C1C1`, `#EBE9E9` | `line`, `line-subtle`                           |
| Light section background                                     | `#F0F4FD`            | `info-subtle`                                   |
| Neutral section background                                   | `#F5F5F5`            | `canvas`                                        |

Added for the app (not on the website): `primary-hover` (`#8A0250`),
`primary-subtle` (`#FBE9F2`), `line-strong` (`#958787`, because `#C6C1C1` has
only 1.8:1 contrast and input borders need 3:1), `surface-muted`, and the four
status colors. The status colors are deliberately standard (green, amber,
red-orange, blue) so they never compete with the brand magenta.

### Contrast (WCAG 2.2)

| Pair                               | Ratio                                                |
| ---------------------------------- | ---------------------------------------------------- |
| white on `primary`                 | 7.0:1                                                |
| `primary` on white                 | 7.0:1                                                |
| `primary` on `primary-subtle`      | 6.0:1                                                |
| `ink` on `canvas`                  | 13.3:1                                               |
| `ink-muted` on `canvas`            | 7.0:1                                                |
| `ink-subtle` on white              | 4.5:1 (on `canvas` only 4.2:1 - white surfaces only) |
| `line-strong` on white             | 3.5:1                                                |
| each status color on its `-subtle` | ≥ 5.1:1                                              |

## Typography on the website

The website uses the proprietary Sparkasse type family (licensed for the
Sparkassen-Finanzgruppe, not available to us):

- **Sparkasse Head** - bold sans for hero headlines
- **Sparkasse Serif** - large section headlines and lead paragraphs (32-64px)
- **Sparkasse Regular/Medium** - body, navigation, buttons; nav and buttons
  with `letter-spacing: 0.8px`

Substitutes (free, served via `next/font/google`, self-hosted at build time):

| Role           | Website           | App                | Why                                                                                       |
| -------------- | ----------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| UI and body    | Sparkasse Rg/Head | **Fira Sans**      | Humanist sans with a similar open, slightly technical feel; tabular figures; many weights |
| Page titles    | Sparkasse Serif   | **Source Serif 4** | Sturdy text serif with optical sizes; carries the editorial tone at 32px                  |
| Machine values | -                 | **Fira Mono**      | Matches Fira Sans; license keys need unambiguous glyphs                                   |

## Shape and depth

- Radius 8px on buttons, cards, images and the cookie dialog; pills (999px)
  for tags. Kept as is.
- Very soft, deep layered shadows on floating cards. Kept for overlays
  (`shadow-overlay`); resting cards get a much lighter `shadow-card`, because
  many deep shadows on a dense screen look noisy.
- Buttons on the website are large (24px/32px padding). Reduced to 40px
  height (32px compact) for the app.

## Layout and tone

- White header, logo left with a thin red vertical bar, navigation right with
  wide letter spacing. Kept: the bar becomes the app's wordmark and the
  active-navigation indicator.
- Generous white space, large full-bleed photos, big serif statements, number
  highlights ("30+", "410+", "20 Mio."). Only the number highlights survive,
  as key-figure cards; photos and big statements do not belong in a work tool.
- Dark `#292929` footer. Not needed in the app; `ink` is used for toasts.
- The website addresses visitors with "Sie" and puts emphasis on inclusion and
  accessibility (accessibility toolbar, "Inklusion" section). Both carry over:
  formal address in microcopy and WCAG 2.2 AA as a baseline.
