This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Databas

Projektet använder SQLite via `better-sqlite3`.

Den lokala databasfilen ligger i:

`src/db/klippklar.db`

Databasfilen är inte inkluderad i Git eftersom den är lokal utvecklingsdata.

När projektet startas skapas tabellerna från:

`src/db/schema.sql`

Observera att ingen testdata/seed-data ingår. För att testa projektet behöver man lägga in tjänster och öppettider via applikationen eller direkt i databasen.
