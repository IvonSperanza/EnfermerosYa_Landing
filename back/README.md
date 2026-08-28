# EnfermerosYa — Backend (Node.js + Express + PostgreSQL)

API y capa de datos del proyecto. El frontend vive en `../front`.

## Stack
- Node.js + Express
- PostgreSQL (driver `pg`)
- SQL plano con migraciones (`.sql`) y scripts

## Estructura
```
back/
├── db/
│   └── schema.sql          # Esquema completo: tablas, tipos, FK, índices, triggers
├── scripts/
│   ├── createDb.js         # Crea la base de datos
│   ├── migrate.js          # Aplica schema.sql
│   └── seed.js             # Datos de ejemplo
└── src/
    ├── server.js           # Punto de entrada
    ├── app.js              # App Express
    ├── db/pool.js          # Pool de conexiones
    └── routes/             # auth, professionals, appointments, patients
```

## Modelo de datos (tablas)
- `users` — usuario único (login, rol patient/professional/admin)
- `professional_profiles` → FK `users`
- `patient_profiles` → FK `users`
- `specialties`, `services` — catálogo
- `verification_documents` — verificación del profesional
- `appointments` → FK profesional + paciente (+ `services`)
- `availability_weekly`, `availability_blocked_dates`, `availability_leaves`, `availability_settings`
- `payments` → FK `appointments`
- `conversations`, `messages`
- `documents` — documentos médicos del paciente
- `notifications` → FK `users`

Todas las PK son UUID (`gen_random_uuid()`).

## Configuración
```bash
cp .env.example .env   # ajustá PGPASSWORD etc.
npm install
```

## Setup de la base
```bash
npm run db:setup     # createDb + migrate + seed
# o paso a paso:
npm run db:create
npm run db:migrate
npm run db:seed
```

## Correr
```bash
npm run dev      # http://localhost:4000
```

## Endpoints (provisionales)
- `GET  /api/health` — estado de la API y conexión a la base
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET  /api/professionals`, `GET /api/professionals/:id`, `GET /api/professionals/:id/services`
- `GET/POST /api/appointments`, `PATCH /api/appointments/:id`
- `GET  /api/patients`, `GET /api/patients/:id`
