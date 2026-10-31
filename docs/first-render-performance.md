# Prvi prikaz: sažetak pokusa

Mjereno 31. listopada 2026. Cilj je bio pronaći malu optimizaciju s mjerljivim
dobitkom, uz isti izgled i ponašanje, bez novih ovisnosti i deploya.

## Što je isprobano

| Pokus | Nalaz | Odluka |
| --- | --- | --- |
| Odgoda Google Fonts CSS-a | CSS je već stizao prije aplikacijskog JavaScripta. Probni FCP: 2.048 → 2.056 ms, bez dobitka. | Uklonjeno. |
| Zstd/gzip u Caddyju | Lokalni FCP bolji 38,4 %, ali javni deployment već šalje komprimirani JS preko Cloudflarea. Provjereni chunk `jm60YVVm.js`: 23.761 B nekomprimiran, 8.890 B uz `Content-Encoding: br`. Dodatni produkcijski dobitak nije potvrđen. | Uklonjeno; Caddy konfiguracija ostaje ista. |
| Odgoda udaljenih postera i njihovih pozadina, uz rezerviranje prostora | Manje početnih zahtjeva, raniji prikaz najvećeg elementa i manje pomicanja sadržaja. | Zadržano u ovom commitu. |

Samo `loading="lazy"` ne bi bio dovoljan jer CSS pozadina također dohvaća
poster. Prvi poster učitava se odmah, a ostale preglednik dohvaća blizu zaslona:
u testu ukupno 3 na mobitelu i 9 na desktopu. Ti brojevi nisu fiksirani u kodu.

## Uvjeti usporedbe postera

Produkcijski buildovi prije/poslije, Chrome 156 i lokalni Caddy 2.10.2;
**gzip uključen u obje varijante**. Isti snimljeni API odgovori, fontovi,
32 filma i odabir kina, datuma i sortiranja.

Mreža: 1,6 Mbit/s download i 150 ms latencije; CPU usporen 4×. Svaki uzorak
počinje novim profilom i praznom predmemorijom. Pet uzoraka po varijanti na
390 × 844 i tri na 1365 × 900, uz izmjenu redoslijeda prije/poslije, bez skrolanja.

## Rezultati

Vremena i CLS su medijani. Prijenos uključuje HTTP zaglavlja.

| Mjera | Mobitel prije → poslije | Desktop prije → poslije |
| --- | --- | --- |
| LCP — najveći element | 4.304 → 3.376 ms (**−21,6 %**) | 4.336 → 4.032 ms (**−7,0 %**) |
| FCP — prvi sadržaj | 1.264 → 1.232 ms | 1.248 → 1.252 ms |
| CLS — pomaci sadržaja | 0,2032 → 0,0118 | 0,1751 → 0,0066 |
| Početni prijenos | 2,33 → 0,46 MB (**−80,2 %**) | 2,33 → 0,92 MB |
| Početno učitani posteri | 32 → 3 | 32 → 9 |

Svih pet optimiziranih mobilnih LCP-a (3.360–3.392 ms) bilo je brže od svih
pet početnih (4.240–4.548 ms). Isto vrijedi za desktop: 3.980–4.128 ms prema
4.292–4.344 ms. **Za FCP nema jasnog dobitka.**

Ovo su laboratorijski rezultati, ne mjerenje nakon deploya; ne oponašaju cijeli
produkcijski DNS/TLS/CDN lanac. Dobitak postera izmjeren je uz kompresiju na
obje strane i ne ovisi o prethodnom pokusu Caddyja.

## Provjere

- Skrolanjem se učitaju sva 32 postera i njihove pozadine. Konačna geometrija
  ostaje jednaka, uključujući postere s omjerom različitim od 2:3.
- Mobilni i desktop prikaz te Cinestar zamjenska slika: početni zaslon, puna
  stranica nakon skrolanja, proširena kartica i izbornik s FAQ-om — ukupno
  **12 usporedbi identičnih piksel po piksel**.
- Prolaze kontrole datuma, sortiranja i lokacije, proširenje/sažimanje kartice,
  izbornik i FAQ; bez grešaka JavaScripta i neuspjelih zahtjeva.
- `npm run check` prolazi: postojeći testovi, lint, Svelte/TypeScript provjera
  (0 grešaka i upozorenja) i produkcijski build.

Sirovi rezultati i snimke spremljeni su privremeno u
`/tmp/bettercinestar-posters/`; nisu dio commita.
