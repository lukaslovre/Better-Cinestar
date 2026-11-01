# TMDB matching

## Matching rules

- Prefer a valid integer `productionYear`, then `nationwideStart`, then
  `releaseDate`. Candidates must fall within ±2 years of the chosen year.
- For CineStar `Opera`/`Balet` listings, also compare the work title after a
  `Royal Ballet & Opera YYYY/YY:` prefix. Results retain the full TMDB title.

CineStar lists **Inception (2010)** with a local start in November 2026. Using the
local start excluded TMDB **27205** and selected an unrelated 2026 film.
Production-year priority also fixes Paprika, Hitchcock's Spellbound, The Wizard of
Oz, A Nightmare on Elm Street and Rocky.

## Validation

On 1 November 2026, local and VPS scrapes returned the same 59 CineStar film IDs.
Expected IDs were verified using directors and supporting metadata. Comparisons
used frozen TMDB responses.

| Current 59-record sample | Verified correct | Wrong | Unmatched |
| --- | ---: | ---: | ---: |
| Previous matcher | 41 | 6 | 12 |
| Production-year priority | 50 | 0 | 9 |

All 41 previously correct matches were retained, including the 2026 Moana remake.
The year change also recovered Mulholland Drive, Caligari and Rock Dog 3.
Removing the year window selected a 1976 Ramayana over the intended 2026 film.

Two snapshots of an older 34-record source sample provided additional controls.
The RBO alias recovered Giselle in the archived candidates and corrected Woolf
Works in the fresh candidates. All previously correct IDs were retained in both
snapshots. These results describe the development samples used to choose the rules.

## Regression data

Run the offline tests with `npm test --prefix scraper`.

`tests/fixtures/tmdb-regressions.json` contains 15 verified regression cases and
positive controls. Each entry records the CineStar input, expected TMDB ID,
identity evidence, candidate fields and snapshot provenance. Tests assert the
selected ID using the real matcher.

To add a case, verify the intended film or recording and capture its input,
candidates and expected ID. Archived RBO candidates cover the stage after year
filtering; retrieval tests require full search responses.

Full research responses, logs, reports and the original replay dataset are saved
locally in the git-ignored `scraper/tests/artifacts/`.

## Remaining work

- **8½ (422):** `Otto e Mezzo` finds the right candidate, whose regular titles are
  `8½`. A recovery experiment using its alternative title and director succeeded.
  Implementing this requires additional details requests.
- **Eight RBO listings:** the generic source title `RBO 2026 2027` needs a
  season-catalogue query and verification of the specific recorded performance.
- **Candidate retrieval:** the older Magic Flute/Giselle examples need search
  results beyond the first page.
