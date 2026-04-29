# Molat Frisør — booking-nettside

Profesjonell booking-nettside for **Molat Frisør** (herrefrisør).
Kunder velger ledige tider i sanntid; bestillingen synkroniseres til frisørens
Google Kalender og trigger e-postvarsling til både frisøren og kunden.
Eget admin-panel + live in-place editing av tekst og bilder direkte på siden.

## Funksjoner

- 🗓️ **Sanntidskalender** med 30-min slots, åpningstider per ukedag
- 📲 **Bestilling** med navn, telefon, e-post (norsk +47-validering), 4 tjenester
- 🔄 **Google Kalender-sync** via service account
- 📧 **E-postvarsling** (Resend) til frisør og kunde
- 🔐 **Admin-panel** — passordbeskyttet, blokker dager/tider, avbestill
- ✏️ **Live editering** — klikk-å-rediger tekst og dra-og-slipp bilder rett på siden
- 🎨 Mørk, elegant design (navy + gull) bygget med Tailwind v4 + Radix

## Tech-stack

| Lag        | Valg                                          |
|------------|-----------------------------------------------|
| Framework  | Next.js 16 (App Router, Turbopack)            |
| UI         | React 19, Tailwind v4, Radix Primitives       |
| Database   | Prisma 6 + PostgreSQL                         |
| Auth       | Auth.js v5 (Credentials)                      |
| Bilde-lagring | Vercel Blob (prod) / lokal disk (dev)      |
| Kalender   | googleapis (service account)                  |
| E-post     | Resend                                        |
| Tester     | Vitest                                        |

---

## Lokal utvikling

Du trenger en PostgreSQL-database. Letteste:

- **Neon** (gratis): https://neon.tech → opprett DB → kopier connection string
- **Supabase** (gratis): https://supabase.com
- **Docker**: `docker run -d --name molat-pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=molat postgres:16`

```bash
# 1. Installer
npm install

# 2. Sett env-variabler
cp .env.example .env
# Rediger .env og sett DATABASE_URL + AUTH_SECRET

# 3. Lag DB-skjema
npm run db:push

# 4. Seed admin-bruker
npm run seed:admin -- molat@example.no <passord>

# 5. Start dev-server
npm run dev
```

Åpne `http://localhost:3000`. Login: `/admin/login`.

---

## Deploy til Vercel (anbefalt)

### 1. Push til GitHub
```bash
git push -u origin main
```

### 2. Importer i Vercel
- Gå til https://vercel.com/new → velg GitHub-repoet → klikk **Deploy** (det vil feile første gang fordi DATABASE_URL mangler — det fikser vi i steg 3).

### 3. Sett opp database (Vercel Postgres / Neon)
- I Vercel-prosjektet: **Storage** → **Create Database** → velg *Neon* (eller *Marketplace → Postgres*).
- Velg samme region som Vercel-prosjektet.
- `DATABASE_URL` blir auto-injectet i prosjektets env-vars.

### 4. Sett opp bilde-lagring (Vercel Blob)
- I Vercel-prosjektet: **Storage** → **Create Database** → velg **Blob**.
- `BLOB_READ_WRITE_TOKEN` blir auto-injectet.

### 5. Sett resterende env-vars
I **Settings → Environment Variables**:

| Navn | Verdi |
|---|---|
| `AUTH_SECRET` | Generer med `openssl rand -base64 32` |
| `AUTH_URL` | `https://din-vercel-url.vercel.app` (eller eget domene) |
| `RESEND_API_KEY` | Fra resend.com (valgfritt — appen virker uten) |
| `OWNER_EMAIL` | Frisørens e-post |
| `FROM_EMAIL` | `Molat Frisør <booking@dittdomene.no>` |
| `GOOGLE_CALENDAR_ID` | Frisørens kalender-ID (valgfritt) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account-epost (valgfritt) |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Hele private key (valgfritt) |

### 6. Redeploy
- **Deployments** → siste deploy → **Redeploy**
- Build kjører `prisma db push` automatisk og lager skjemaet i Postgres.

### 7. Seed admin-bruker (engangs, fra lokal maskin)
```bash
DATABASE_URL="<din-vercel-postgres-url>" npm run seed:admin -- frisor@molat.no <passord>
```
Connection-stringen henter du fra Vercel Storage → Postgres → `.env.local` tab.

### 8. Domene
**Settings → Domains** → legg til ditt eget domene → følg DNS-instruksjonene.

---

## Tester

```bash
npm test            # kjør én gang
npm run test:watch  # watch-modus
```

Slot-generatoren har testdekning for åpningstider, helger, blokker, lead-time
og overlappende bookinger (`src/lib/slots.test.ts`).

---

## Konfigurasjon

Alt forretningslogisk — åpningstider, slot-størrelse, tjenester/priser — bor i
`src/lib/config.ts`. Endre der for å endre oppførsel.

### Tjenester (priser)

Defineres i `SERVICES`-arrayet i `src/lib/config.ts`. Endre navn, varighet eller
pris — booking-flyten tilpasses automatisk.

### Åpningstider

`OPENING_HOURS` i `src/lib/config.ts`. Per ukedag: `{open, close}` eller `null`
for stengt.

---

## Admin-panel

- `/admin/login` — innlogging
- `/admin` — oversikt (dagens bestillinger, kommende uke, blokker)
- `/admin/bookings` — alle bestillinger, avbestill
- `/admin/blocks` — blokker dag/tidsrom (sykdom, ferie, lunsj)
- `/admin/content` — rediger tekst på alle sider (også via inline-editing)
- `/admin/images` — bytt galleri-bilder

### Live in-place editing

Når innlogget admin er på forsiden eller booking-siden, vises en flytende
verktøylinje nederst. Klikk **"Rediger nettsiden"** → klikk på tekst for å
endre, hold over bilder for å bytte dem ut. Endringer lagres rett til DB.

---

## Skript

```bash
npm run dev               # Next.js dev-server (Turbopack)
npm run build             # Prisma generate + db push + Next build (Vercel)
npm run start             # Start prod-build
npm test                  # Vitest
npm run db:push           # Synk DB-skjema
npm run db:studio         # Prisma Studio (DB-GUI)
npm run seed:admin        # Opprett/oppdater admin-bruker
```
