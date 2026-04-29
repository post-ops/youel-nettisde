# Molat Barbershop — booking-nettside

Profesjonell booking-nettside for **Molat Barbershop** (herrefrisør).
Kunder velger ledige tider i sanntid; bookingen synkroniseres til frisørens
Google Kalender og trigger e-postvarsling både til frisøren og kunden.
Eget admin-panel for å blokkere dager (sykdom/ferie) og avbestille bookinger.

## Funksjoner

- 🗓️  **Sanntidskalender** med 30-min slots, åpningstider per ukedag.
- 📲 **Booking** med navn, telefon og e-post (norsk +47-validering).
- 🔄 **Google Kalender-sync** via service account.
- 📧 **E-postvarsling** (Resend) til frisør og kunde.
- 🔐 **Admin-panel** — passordbeskyttet, blokker dager/tider, avbestill.
- 🎨 Mørk, elegant design (navy + gull) bygget med Tailwind v4 + shadcn-style.

## Tech-stack

| Lag        | Valg                                          |
|------------|-----------------------------------------------|
| Framework  | Next.js 16 (App Router, Turbopack)            |
| UI         | React 19, Tailwind v4, Radix Primitives       |
| Database   | Prisma 6 + SQLite (dev) / PostgreSQL (prod)   |
| Auth       | Auth.js v5 (Credentials)                      |
| Kalender   | googleapis (service account)                  |
| E-post     | Resend                                        |
| Tester     | Vitest                                        |

## Hurtigstart (lokalt)

```bash
# 1. Installer
npm install

# 2. Lag DB
npm run db:push

# 3. Seed admin-bruker
npm run seed:admin -- molat@example.no <passord>

# 4. Sett env-variabler (kopier .env.example til .env og fyll inn)
cp .env.example .env

# 5. Start dev-server
npm run dev
```

Åpne `http://localhost:3000`.

| Side                   | URL                          |
|------------------------|------------------------------|
| Forside                | `/`                          |
| Booking                | `/booking`                   |
| Admin (innlogging)     | `/admin/login`               |
| Admin dashboard        | `/admin`                     |

## Tester

```bash
npm test            # kjør én gang
npm run test:watch  # watch-modus
```

Slot-generatoren har testdekning for åpningstider, helger, blokker, lead-time
og overlappende bookinger (`src/lib/slots.test.ts`).

## Konfigurasjon

Alt forretningslogisk — åpningstider, slot-størrelse, pris — bor i
`src/lib/config.ts`. Endre der for å endre oppførsel.

### .env-variabler

| Navn                                  | Beskrivelse                                            |
|---------------------------------------|--------------------------------------------------------|
| `DATABASE_URL`                        | SQLite lokalt (`file:./dev.db`) / Postgres i prod      |
| `AUTH_SECRET`                         | NextAuth secret (kjør `openssl rand -base64 32`)       |
| `AUTH_URL`                            | Public URL                                             |
| `GOOGLE_CALENDAR_ID`                  | Frisørens kalender-ID                                  |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`        | Service account e-post                                 |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`  | Hele private key (med `\n` eller raw)                  |
| `RESEND_API_KEY`                      | Resend API-nøkkel                                      |
| `OWNER_EMAIL`                         | Mottaker for booking-varsler                           |
| `FROM_EMAIL`                          | Avsenderadresse                                        |
| `TIMEZONE`                            | Europe/Oslo (default)                                  |

Hvis Google Calendar eller Resend mangler env, **logges en advarsel og funksjonen hopper over uten å feile bookingen** — nettsiden virker likevel lokalt.

### Google Calendar — oppsett

1. Opprett et prosjekt i Google Cloud Console.
2. Aktiver Google Calendar API.
3. Opprett en *service account* og last ned JSON-nøkkel.
4. Sett `GOOGLE_SERVICE_ACCOUNT_EMAIL` og `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   fra JSON-filen.
5. I frisørens Google Kalender → *Settings → Share with specific people* →
   legg til service-account-eposten med rettighet **"Make changes to events"**.
6. Sett `GOOGLE_CALENDAR_ID` til kalenderens ID (f.eks. e-postadresse til
   eieren, eller en custom kalender-ID).

### Resend — oppsett

1. Opprett konto på [resend.com](https://resend.com).
2. Verifiser domenet og lag en API-nøkkel.
3. Under utvikling kan du bruke `onboarding@resend.dev` som FROM_EMAIL og
   teste til din egen e-post.

## Admin-panel

- Logg inn med admin-eposten du seedet (steg 3).
- **Oversikt**: dagens og kommende bookinger, aktive blokker.
- **Bookinger**: tabell, avbestill (sender e-post + sletter Google-event).
- **Blokker**: hel dag eller tidsrom (sykdom, ferie, lunsj).

For å lage en ny admin: kjør `npm run seed:admin -- <epost> <passord>` igjen
(samme epost = passordet oppdateres).

## Deploy til Google Cloud (Cloud Run + Cloud SQL)

> Lokalt bruker vi SQLite; for produksjon anbefales **Cloud SQL (PostgreSQL)**.

### 1. Bytt til PostgreSQL i `prisma/schema.prisma`

```diff
- provider = "sqlite"
+ provider = "postgresql"
```

### 2. Opprett Cloud SQL-instans (PostgreSQL)

```bash
gcloud sql instances create molat-db \
  --database-version=POSTGRES_16 --tier=db-f1-micro --region=europe-north1
gcloud sql databases create molat --instance=molat-db
gcloud sql users create molat-app --instance=molat-db --password=...
```

### 3. Bygg og deploy til Cloud Run

```bash
# Build & push
gcloud builds submit --tag gcr.io/$PROJECT/molat-booking

# Deploy
gcloud run deploy molat-booking \
  --image gcr.io/$PROJECT/molat-booking \
  --region europe-north1 \
  --allow-unauthenticated \
  --add-cloudsql-instances $PROJECT:europe-north1:molat-db \
  --set-env-vars "DATABASE_URL=postgresql://molat-app:...@/molat?host=/cloudsql/$PROJECT:europe-north1:molat-db" \
  --set-env-vars "AUTH_SECRET=...,AUTH_URL=https://din-domene,GOOGLE_CALENDAR_ID=...,GOOGLE_SERVICE_ACCOUNT_EMAIL=...,RESEND_API_KEY=..." \
  --set-secrets "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=google-pk:latest"
```

### 4. Kjør migrasjoner mot Cloud SQL

```bash
DATABASE_URL=... npx prisma migrate deploy
DATABASE_URL=... npm run seed:admin -- frisor@molat.no <passord>
```

### 5. Domene

- Map domene i Cloud Run-konsollen.
- Oppdater DNS hos registrar med oppgitt CNAME/A-record.

## Bilder

- `public/logo.png` — hovedlogo (kommer fra `Gemini_Generated_Image_e7prlne7prlne7pr.png`)
- `public/hero.jpg`, `public/gallery/*.jpg` — generert fra collage-bildet med
  `npx tsx scripts/prepare-images.ts`. Kjør på nytt om bildene byttes.

## Skript

```bash
npm run dev               # Next.js dev-server (Turbopack)
npm run build             # Prod-build
npm run start             # Start prod-build
npm test                  # Vitest
npm run db:push           # Synk DB-schema
npm run db:studio         # Prisma Studio (DB-GUI)
npm run seed:admin        # Opprett/oppdater admin-bruker
```
