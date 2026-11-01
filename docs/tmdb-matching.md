# TMDB matching

## Matching rules

- Prefer a valid integer `productionYear`, then `nationwideStart`, then
  `releaseDate`. Candidates must fall within ±2 years of the chosen year.
- For CineStar `Opera`/`Balet` listings, also compare the work title after a
  `Royal Ballet & Opera YYYY/YY:` prefix.
- If regular searches leave a film unmatched, check alternative titles and
  directors for up to three dated candidates per language, deduplicated by ID.
  Accept one qualifying ID with an exact normalized alternative title, a matching
  director and a release within the year window. Ambiguity or incomplete lookups
  leave the film unmatched.

Production-year priority fixes reruns such as Inception: CineStar's local start
is in 2026, but its production year correctly identifies the 2010 film (27205).
Alternative-title recovery finds **8½ (422)** from `Otto e Mezzo` and Federico Fellini.

## Validation

Comparisons on 1 November 2026 used frozen TMDB responses and expected IDs verified
against directors and supporting metadata.

| Current 59-record CineStar sample | Correct | Wrong | Unmatched |
| --- | ---: | ---: | ---: |
| Original matcher | 41 | 6 | 12 |
| Production-year priority | 50 | 0 | 9 |
| Plus alternative-title recovery | 51 | 0 | 8 |

Recovery retains all 50 correct IDs and adds one identity request across the 59
listings. The eight remaining listings are stage broadcasts. The year window
protects the 2026 Moana remake and Ramayana from older namesakes.

Eight additional film inputs from cinema programmes and a broadcaster improve
from 5 correct / 1 wrong / 2 unmatched to 7 / 1 / 0. Recovery finds **Seven Samurai
(346)** and **Kiki's Delivery Service (16859)** from their romanized Japanese titles.
Live enrichment confirmed these two films, 8½ and the Digger control.

Both older 34-record snapshots retain all previously correct IDs: 28 / 1 / 5
with archived candidates and 31 / 2 / 1 with fresh candidates. These are targeted
development samples; validation on a new CineStar repertoire is the next check.

## Regression data

Run `npm test --prefix scraper`.

- `tests/fixtures/tmdb-regressions.json`: 15 verified cases covering production
  year, RBO prefixes and existing correct matches.
- `tests/fixtures/tmdb-recovery.json`: three alternative-title recoveries and
  Digger as a control, with source provenance, first-page candidates and identity
  fields. Enrichment tests cover ambiguity, missing metadata, lookup failures and
  the request limit.

Full API responses, experiment scripts and reports are saved locally in the
ignored `scraper/tests/artifacts/` directory.

## Known limitations

The external input `Seven` still selects **Seven Years in Tibet (978)** instead
of **Se7en (807)**. A localized-query experiment recovers the right film, but its
strict director gate also rejects Digger (1248832): CineStar spells its director
`Alejandro G. Inairritu`, TMDB `Alejandro G. Iñárritu`. Source errors need to be
accounted for before applying such a gate to existing matches.

Further research prioritizes films over specialized stage-broadcast retrieval.
