# Eksperiment dohvata datuma filmova

31. 10. 2026.; lokalni Node 24.22.1, read-only kopija produkcijske baze iz backupa
30. 10. Bez app inicijalizacije, migracija, scrapera ili promjena produkcije.

A koristi postojeći `getFormattedMovies`; B eksperimentalno dohvaća datume jednim
upitom za sve relevantne filmove. Tablica prikazuje početni eksperiment prije
ispravka unije datuma; implementacija opisana na kraju sada je pripremljena lokalno.

Vrijeme je fiksirano na 30. 10. 2026. u 10:00 Europe/Zagreb. Nakon zagrijavanja
izvedeno je po 50 mjerenja svake varijante, naizmjenično A/B i B/A, za svaki slučaj.

| Slučaj | Filmovi | SQL upiti A → B | Medijan obrade A → B | p95 obrade A → B |
|---|---:|---:|---:|---:|
| Branimir, datum | 20 | 22 → 3 | 16,83 → 9,22 ms | 19,64 → 11,61 ms |
| Branimir, bilo kada | 45 | 47 → 3 | 50,28 → 32,86 ms | 58,21 → 36,59 ms |
| Zagreb, datum | 24 | 26 → 3 | 24,25 → 16,09 ms | 27,08 → 18,90 ms |
| Zagreb, bilo kada | 59 | 61 → 3 | 135,62 → 111,05 ms | 143,94 → 119,36 ms |

Lokalni HTTP medijani A → B bili su redom 19,25 → 11,80; 54,20 → 35,58;
29,27 → 20,19; 140,32 → 116,40 ms. Lightweight HTTP ruta uključuje JSON
serijalizaciju, prijenos tijela i parsiranje; ne uključuje Express middleware,
TLS, kompresiju, internet, proxy ili renderiranje. Svih 400 mjerenih rezultata
funkcije i 400 HTTP rezultata dubinski je jednako (dodatno i zagrijavanja).

## Zaseban problem s datumima

Postojeći `findOne` za više kina vraća datume samo jednog kina, bez `ORDER BY`.
Unija datuma svih odabranih kina razlikuje se za 6 filmova u slučaju Zagreb/datum
i 9 za Zagreb/bilo kada. Primjer: Zaboravljeni otok vraća samo 31. 10. i 1. 11.,
dok druga odabrana kina imaju i 30. 10., 2–3. 11. te 7–8. 11.

B namjerno čuva postojeće ponašanje izborom prvog vraćenog retka po filmu.
Jednakost na ovoj bazi nije opće jamstvo izbora retka za druge SQL planove ili
nakon dodavanja indeksa. Odvojene provjere s mockom potvrdile su jednaku postojeću
TypeError pogrešku za nedostajuće retke i null datume; taj slučaj nije dio mjerenja.

## Zaključak i granice

Lokalna ušteda od oko 8–25 ms je mjerljiva. Korisnik je potvrdio da su željeno ponašanje
datumi svih odabranih kina. Zajednički dohvat i ispravak unije sada su
implementirani lokalno, bez commita ili deploymenta. Provjera uspoređuje očekivanu
uniju i dubinsku jednakost svih ostalih podataka sa starom implementacijom.

Ovo je zagrijana baza i jedan klijent na laptopu, ne test opterećenja ni mjerenje
na VPS-u. Šest novih javnih curl zahtjeva za Zagreb/bilo kada dalo je medijan
480,5 ms (414,4–610,5 ms), uz oko 83 KB komprimiranog odgovora. To su aktualni
podaci na starom produkcijskom `main`, ne A/B test niti isti zahtjev kao ranijih
~200 ms za određeni datum. Ušteda na laptopu ne jamči isti dobitak u produkciji.

Privremeni reproducibilni harness, puni izvještaj i sirovi rezultati dostupni su u
`/tmp/bettercinestar-performance/` (`benchmark.cjs`, `report.md`, `results.json`,
`public-results.json`, `semantic-edge-results.json`). Kopija baze nije u repozitoriju.
Početni harness odnosi se na izvorni kod prije ispravka (HEAD `648e8b7`),
zahtijeva postojeće server ovisnosti i pravo za localhost listen:

```sh
TZ=Europe/Zagreb BENCH_DB=/putanja/do/kopije.sqlite node /tmp/bettercinestar-performance/benchmark.cjs /putanja/do/Better-Cinestar
```

## Implementirani ispravak i provjera

Formatter sada jednim SQL upitom dohvaća `filmId` i `date` za relevantne filmove
u odabranim kinima, grupira ih po identifikatoru pretvorenom u string i vraća
sortiranu uniju bez duplikata i datuma prije danas. Nedostajući redak ili null
polje datuma sada daje `availableDates: []` umjesto rušenja endpointa. Ne mijenja
se oblik odgovora, izbor filmova/termina ni sortiranje filmova. Neiskorišteni
stari `findOne` helper zamijenjen je zajedničkim helperom.

Četiri fokusirane regresijske provjere prolaze:

```sh
node server/tests/formattedMovies.test.cjs
```

Read-only smoke na istoj kopiji provjerio je Branimir i pet zagrebačkih kina,
konkretan datum i `any`: očekivanu uniju iz baze, dubinsku jednakost svih drugih
polja prema HEAD-u, potpunu jednakost za jedno kino i stalna tri SQL upita za
20, 45, 24 i 59 filmova. Prazan izbor/nema filmova daje `[]`, bez dodatnog upita
za datume. Lokalni HTTP JSON smoke također prolazi. Unit regresija posebno
pokriva različite datume dva kina, duplikate, stare datume, brojčani/string filmId,
null i nedostajuće datume.

Završni smoke ima po deset uzoraka, služi provjeri ispravnosti i nije novi
kontrolirani A/B benchmark: medijani su redom 11,79 / 35,03 / 18,65 / 117,86 ms.
Artefakti: `/tmp/bettercinestar-performance/final-smoke.cjs` i
`final-smoke-results.json`. Smoke importira modele uz read-only vezu, ne pokreće
normalnu aplikaciju ili inicijalizaciju baze. Unija namjerno mijenja dostupne
datume za ranije pronađenih 6/9 filmova; nije predstavljena kao identičan rezultat
početnog benchmarka. Nema dokaza za jednak dobitak na javnom API-ju.
