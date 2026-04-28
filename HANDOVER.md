# KlippKlar – Handover

KlippKlar är ett Next.js-projekt för frisörsalonger där målet är att hantera bokningar, behandlingar och öppettider.

Projektet är byggt som ett lokalt test-/MVP-system med SQLite som databas och Next.js App Router som frontend/backend.

Projektet har även undersökt möjligheten att koppla bokningslogiken till telefonbokning via IVR/API, men detta är inte en färdig produktionsfunktion.

---

## Tech stack

- Next.js App Router
- TypeScript
- SQLite
- better-sqlite3
- Tailwind CSS
- shadcn/ui-liknande komponenter

---

## Projektstruktur

- `src/app` – Next.js routes, pages och API routes
- `src/db` – SQLite-databas, schema och databasanslutning
- `src/components` – återanvändbara UI-komponenter
- `src/services` – affärslogik, till exempel beräkning av lediga tider
- `public/audio` – ljudfiler som användes vid test av telefonflöde

---

## Databas

Projektet använder SQLite via `better-sqlite3`.

Databasen ligger i:

```txt
src/db/klippklar.db
```

Databasschemat ligger i:

```txt
src/db/schema.sql
```

Vid uppstart körs schemat idempotent med `IF NOT EXISTS`, vilket gör att tabeller skapas om de saknas utan att befintlig data raderas.

Viktiga tabeller:

- `salons` – information om salonger
- `services` – behandlingar/tjänster
- `opening_hours` – öppettider per veckodag
- `appointments` – bokningar

---

## Viktiga API routes

### Behandlingar

```http
GET /api/treatments
```

Hämtar behandlingar/tjänster från databasen.

---

### Öppettider

```http
GET /api/working-hours
```

Hämtar salongens öppettider.

```http
PUT /api/working-hours
```

Uppdaterar öppettider.

---

### Lediga tider

```http
GET /api/available-slots?date=YYYY-MM-DD&serviceId=ID&salonId=ID
```

Returnerar lediga tider baserat på:

- öppettider
- vald tjänsts längd
- befintliga bokningar

---

### Veckobokningar

```http
GET /api/appointments-week?start=YYYY-MM-DD
```

Hämtar bokningar för en vecka.

---

### Dashboard

```http
GET /api/dashboard/appointments/today
```

Hämtar dagens bokningar.

```http
GET /api/dashboard/appointments/next
```

Hämtar kommande bokningar.

---

## Slot-logik

Lediga tider beräknas i service-lagret.

Logiken tar hänsyn till:

- valt datum
- vald tjänst
- tjänstens längd i minuter
- salongens öppettider
- redan existerande bokningar
- överlappande tider

Samma slot-logik är tänkt att kunna användas både av webbgränssnittet och eventuella externa integrationer, så att bokningsreglerna inte behöver dupliceras.

---

## Experiment / framtida utveckling

Under projektet har möjligheten att koppla bokningssystemet till telefonbokning via extern IVR/API undersökts.

Tanken är att samma bokningslogik som används i webbgränssnittet även ska kunna användas av ett telefonflöde, exempelvis genom att:

- läsa upp tillgängliga behandlingar
- hämta lediga tider från API:et
- skapa bokningar via systemets befintliga bokningslogik

Detta är inte färdigställt som produktionsfunktion, men kan vara ett möjligt nästa steg.

---

## Kända begränsningar / nästa steg

- Systemet körs lokalt och är inte produktionsdeployat.
- SQLite används som lokal databas för MVP/test.
- Projektet saknar färdig produktionshantering för autentisering och roller.
- Telefonbokning via extern IVR/API är endast undersökt som möjlig vidareutveckling.
- Felhantering och edge cases kan förbättras.
- UI:t kan vidareutvecklas och anpassas bättre för mobil.
- Projektet behöver mer testning med riktiga användarscenarion.

---

## Starta projektet lokalt

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

---

## Kommentar till nästa utvecklare

Fokus i projektet har varit att bygga en fungerande MVP för bokningsflöde, öppettider och behandlingar med en enkel lokal databas.

Den viktigaste delen att förstå är kopplingen mellan:

- behandlingar
- öppettider
- befintliga bokningar
- beräkning av lediga tider

Det är denna logik som är grunden för både webbgränssnittet och eventuell framtida telefonbokning.
