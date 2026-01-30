# Multi-Kategorie Rezervační Systém

Rezervační systém s podporou různých kategorií podniků: Restaurace, Wellness & Spa, Kadeřnictví, Fitness.

## 🚀 Quick Start

### 1. Instalace závislostí

```bash
npm install
```

### 2. Nastavení prostředí

Zkopírujte `.env.example` na `.env` a nastavte:

```env
DATABASE_URL="postgresql://reservation_user:reservation_pass@localhost:5432/reservation_system"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<vygenerujte pomocí: openssl rand -base64 32>"
RESEND_API_KEY="<váš Resend API klíč pro emaily>"
```

### 3. Spuštění databáze

```bash
# Spustit Docker Desktop, pak:
npm run db:setup    # Spustí PostgreSQL kontejner
npm run db:migrate  # Vytvoří tabulky
npm run db:seed     # Naplní testovacími daty
```

### 4. Spuštění aplikace

```bash
npm run dev
```

Aplikace běží na [http://localhost:3000](http://localhost:3000)

## 👥 Testovací účty

Po spuštění `npm run db:seed` máte k dispozici 4 testovací účty:

| Kategorie | Email | Heslo | Slug | Admin Panel |
|-----------|-------|-------|------|-------------|
| 🍽️ Restaurace | restaurant@test.cz | password123 | restaurant-test | [Admin](http://localhost:3000/admin) |
| 💆 Wellness | wellness@test.cz | password123 | wellness-test | [Admin](http://localhost:3000/admin) |
| ✂️ Kadeřnictví | barbershop@test.cz | password123 | barbershop-test | [Admin](http://localhost:3000/admin) |
| 🏋️ Fitness | fitness@test.cz | password123 | fitness-test | [Admin](http://localhost:3000/admin) |

## 🌐 Veřejné booking stránky

- Restaurace: [http://localhost:3000/restaurant-test](http://localhost:3000/restaurant-test)
- Wellness: [http://localhost:3000/wellness-test](http://localhost:3000/wellness-test)
- Kadeřnictví: [http://localhost:3000/barbershop-test](http://localhost:3000/barbershop-test)
- Fitness: [http://localhost:3000/fitness-test](http://localhost:3000/fitness-test)

## 📦 Technologie

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Databáze**: PostgreSQL (Docker) + Prisma ORM
- **Autentizace**: NextAuth.js
- **Email**: Resend
- **Styling**: Tailwind CSS

## 🗄️ Databázové schema

### Hlavní tabulky

- `tenants` - Provozovatelé (s category a categoryData)
- `users` - Uživatelé pro přihlášení
- `services` - Služby
- `bookings` - Rezervace (s bookingData pro category-specific info)
- `working_hours` - Pracovní hodiny
- `blocked_times` - Blokované termíny

### Multi-kategorie podpora

Každý tenant má:
- `category` - ENUM: RESTAURANT | WELLNESS_SPA | BARBERSHOP | FITNESS_SPORT
- `categoryData` - JSON pole s category-specific daty:
  - **Restaurace**: `{ tableCount, seatingCapacity, cuisineType }`
  - **Wellness**: `{ roomCount, procedureTypes, therapists }`
  - **Kadeřnictví**: `{ chairCount, stylists }`
  - **Fitness**: `{ trainers, activityTypes, groupSizeLimit }`

## 📝 Užitečné příkazy

```bash
# Databáze
npm run db:setup      # Spustit PostgreSQL v Dockeru
npm run db:migrate    # Spustit migrace
npm run db:seed       # Naplnit testovacími daty
npm run db:studio     # Otevřít Prisma Studio (GUI pro DB)
npm run db:reset      # Reset databáze (smaže všechna data!)

# Development
npm run dev           # Spustit dev server
npm run build         # Vytvořit production build
npm run start         # Spustit production server
npm run lint          # Spustit linter
```

## 🏗️ Struktura projektu

```
reservation-system/
├── prisma/
│   ├── schema.prisma     # Databázové schéma
│   ├── migrations/       # Migrace
│   └── seed.ts          # Seed data
├── src/
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── admin/       # Admin panel
│   │   └── [tenant]/    # Veřejný booking
│   ├── lib/
│   │   ├── categories/  # Category-specific logika
│   │   ├── types.ts     # TypeScript typy
│   │   ├── auth.ts      # NextAuth config
│   │   └── prisma.ts    # Prisma client
│   └── components/
│       ├── admin/       # Admin komponenty
│       ├── booking/     # Booking komponenty (TODO)
│       └── ui/          # UI komponenty
├── docker-compose.yml   # PostgreSQL setup
└── .env                # Environment variables
```

## 🎯 TODO - Další fáze

- [ ] **FÁZE 5**: Category UI komponenty
  - [ ] RestaurantBooking.tsx - výběr stolu
  - [ ] WellnessBooking.tsx - výběr procedury/místnosti
  - [ ] BarbershopBooking.tsx - výběr stylisty
  - [ ] FitnessBooking.tsx - výběr trenéra/aktivity

- [ ] **FÁZE 6**: Rozšíření admin panelu
  - [ ] Tab "Kategorie" v nastavení
  - [ ] Category-specific settings komponenty
  - [ ] Zobrazení category dat v rezervacích

## 🔒 Bezpečnost

- Všechna hesla jsou hashována pomocí bcrypt
- Admin routes jsou chráněny NextAuth middleware
- Session je uložena v JWT tokenu
- Tenant isolation - každý uživatel vidí pouze své data

## 📧 Email notifikace

Systém automaticky posílá emaily při vytvoření rezervace:
- **Zákazníkovi**: Potvrzení rezervace s detaily
- **Provozovateli**: Notifikace o nové rezervaci

Pro produkci je potřeba nastavit `RESEND_API_KEY` v `.env`.

## 🐛 Debugging

### Prisma Studio
```bash
npm run db:studio
```
Otevře GUI pro prohlížení a editaci dat v databázi.

### Logs
- Aplikační logy: Konzole dev serveru
- Databázové logy: `docker logs reservation-db`

## 📄 Licence

MIT
