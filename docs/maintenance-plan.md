# Plan održavanja BetterCinestara

## Cilj i granice

Očuvati izgled, karakter i većinu postojećeg koda osobnog projekta, uz ciljane
promjene za sigurnost i jednostavnije održavanje. Podatke o filmovima i projekcijama možemo
ponovno prikupiti scraperom; staru analitiku ne trebamo čuvati.

## Potvrđeno stanje

Početno stanje i rezultati rada provjereni 30. 10. 2026. Promjene aplikacije su
na branchu `codex/minor-ai-improvements`; produkcija još koristi `main`.

- Lokalno: Node **24.22.1**, npm **11.19.1**. Frontend radi s javnim API-jem;
  lokalni backend, baza i scraper nisu potrebni za UI rad.
- Frontend build i postojeći TMDB matching testovi prolaze. `svelte-check`
  je popravljen s početnih **53 greške i 5 upozorenja** na **0/0**.
- API već podržava više kina: jedan zahtjev za svih 16 kina vratio je 25 filmova
  i 305 projekcija, oko 403 KB za 456 ms. To je pojedinačno mjerenje.
- Produkcija: Coolify je nadograđen s **v4.0.0-beta.418** preko **4.0.1** na **4.5.3**.
  Dashboard, health i realtime WebSocket provjereni; aplikacija nije ponovno deployana.
  Aplikacija koristi Docker Compose iz `/docker-compose.yml`, granu `main`
  i konfigurirani ref `HEAD`. Aktivni commit nije potvrđen; povijest deploya je prazna.
- Web je na `https://bettercinestar.com`, API na `https://api.bettercinestar.com`.
  DNS i HTTP odgovori upućuju na isključen Cloudflare proxy; dashboard nije provjeren.
- SSH je dostupan. Aktivni volumen završava s `_server-sqlite-data` (bez `-2`),
  montiran je na `/app/data`; produkcija koristi `DB_SCHEMA_VERSION=2` i `FORCE_DB_RESET=false`.
- Jednokratni backup Coolify konfiguracije/ključeva, PostgreSQL-a i aplikacijske SQLite
  baze provjeren je i spremljen na VPS i lokalno u zaštićenu mapu izvan repozitorija:
  `~/.local/share/bettercinestar-maintenance/backups/20261030T102121Z/`.
- Produkcijska scraper tajna potvrđeno nije default. Postojeći ispis konfiguracije
  u server logove namjerno ostaje prema korisnikovoj odluci.
- Nadograđene ovisnosti: audit nema high/critical nalaza. Preostali low/moderate
  nalazi uglavnom su tooling i UUID put koji nije pronađen u pregledanom korištenju.
- Svježi server i scraper Docker imagei izgrađeni su i provjereni na VPS-u:
  Node **24.22.2**, Puppeteer **25.16.0**, SQLite **6.0.1** uz source build.

## Planirani zahvati

1. [x] **Deployment osnova:** backup, potvrda mounta i produkcijskih postavki,
   nadogradnja Coolifyja i provjera dostupnosti aplikacije.
2. [x] **Sigurnost konfiguracije:** uklonjen javno poznati fallback scraper tajne;
   prazne i placeholder vrijednosti se odbijaju. Postojeći logovi ostaju.
3. [x] **Osnova koda:** Node 24, uklonjene pogrešne Svelte upute i popravljene
   greške provjere tipova. Docker `init` sprječava nakupljanje Chromium zombie procesa.
4. [x] **Uklanjanje analitike:** uklonjeni middleware, endpoint, dashboard, model
   i postavke; startup ciljano i idempotentno briše povijesnu tablicu i podatke.
   Test potvrđuje očuvanje filmova, projekcija i datuma bez promjene verzije sheme.
5. [x] **Ovisnosti:** ažurirani frontend, server i scraper, uključujući migracije
   SQLitea 6, Zoda 4 i Puppeteera 25. Bez `--force` i dependency overrides.
6. [ ] **Prvi posjet:** prikazati korisnu ponudu odmah i pojednostavniti odabir lokacije.
   Kandidati su sva kina kao početni prikaz i odabir cijelog grada jednim klikom;
   konačno ponašanje još treba dogovoriti. Sačuvati spremljene korisničke odabire.
7. [ ] **Cloudflare:** potvrditi DNS i TLS postavke, uključiti proxy za web i API
   te provjeriti HTTPS i svježinu podataka. Bez dodavanja analitičkog beacona.
8. [ ] **Trajno održavanje:** dopuniti README provjerenim deployment informacijama
   i dodati minimalne automatske provjere nakon što lokalne provjere prolaze.

Koraci 3–5 su implementirani i provjereni na branchu.
Koraci 6–8 odgođeni su za zaseban nastavak; README se sada usklađuje samo s
promjenama nužnima za pokretanje. Produkcijsko brisanje stare analitike slijedi
pri deploymentu nove aplikacije, bez promjene produkcijske verzije sheme `2`.

## Otvorene odluke i provjera uspjeha

- Ograničavanje javnog API-ja još nije dogovoreno. Endpoint za sjedala pokreće
  Chromium, a red čekanja nije ograničen; Cloudflare proxy sam to ne rješava.
- Provjere su prošle: frontend check/build i prikaz/sjedala u pregledniku,
  migracija SQLite baze, scraper testovi, izolirani API/upload/seating/cache smoke,
  te read-only dohvat filmova i sjedala iz CineStara za jedno kino bez uploada.
  Audit: client 6 low + 2 moderate, server 2 moderate, scraper 0.
- Jednokratni test uklanjanja analitike izvršen je tijekom provjere i potom uklonjen;
  startup migracija ostaje u aplikaciji za prvi deployment.
- Formatter je usklađen i radi. Puna lint naredba još prijavljuje **38 ESLint nalaza**
  u frontend kodu; njihovo čišćenje ostaje za korak 8.
- Coolify update, Node update i npm update zasebni su zahvati. Referentne upute:
  [Coolify sigurnosno izdanje i migracija stare bete](https://github.com/coollabsio/coolify/releases/tag/v4.4.7),
  [nadogradnja instance](https://coolify.io/docs/core/instance-management/update).
- Svaka promjena treba imati odgovarajuću provjeru: build i tipovi za frontend,
  osnovni API pozivi za server, matching testovi i kontrolirano prikupljanje podataka
  za scraper. Prije produkcije provjeriti filmove, termine, sjedala i redovito osvježavanje.
- Nema vizualnih promjena osim dogovorenog poboljšanja prvog posjeta. Dokument
  sadrži samo operativne činjenice i ciljeve; nikakve tajne ili vrijednosti ključeva.
