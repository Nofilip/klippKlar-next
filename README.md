# KlippKlar

KlippKlar är ett Next.js-projekt för frisörsalonger. Projektet hanterar bokningar, behandlingar och öppettider med en lokal SQLite-databas.

Projektet är byggt som ett lokalt test-/MVP-system inom ramen för LIA.

## Tech stack

- Next.js App Router
- TypeScript
- SQLite
- better-sqlite3
- Tailwind CSS

## Getting Started

Installera dependencies:

```bash
npm install
```

Starta utvecklingsservern:

```bash
npm run dev
```

Öppna projektet i webbläsaren:

```txt
http://localhost:3000
```

## Databas

Projektet använder SQLite via `better-sqlite3`.

Den lokala databasfilen ligger i:

```txt
src/db/klippklar.db
```

Databasfilen är inte inkluderad i Git eftersom den är lokal utvecklingsdata.

När projektet startas skapas tabellerna från:

```txt
src/db/schema.sql
```

Observera att ingen testdata/seed-data ingår. För att testa projektet behöver man lägga in tjänster och öppettider via applikationen eller direkt i databasen.

## Mer dokumentation

Se även:

```txt
HANDOVER.md
```

för mer information om projektstruktur, API routes, slot-logik och möjliga nästa steg.
