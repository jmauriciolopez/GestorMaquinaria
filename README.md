# Maquinaria SaaS

Sistema de alquiler de maquinaria y herramientas — monorepo NestJS + React + Expo.

## Descripción

Plataforma SaaS para gestión de alquileres de maquinaria pesada y herramientas. Permite a corralones, alquiladoras y empresas de rental controlar su flota, registrar contratos, gestionar entregas, devoluciones, daños, penalidades y cobros — incluyendo pagos vía MercadoPago.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | NestJS 10 + TypeORM + PostgreSQL |
| Frontend web | React 18 + Vite + TanStack Query |
| App mobile | React Native + Expo 51 |
| Auth | JWT + Passport |
| Pagos | MercadoPago SDK v2 |
| Seguridad | Helmet + @nestjs/throttler |
| Jobs | @nestjs/schedule (cron) |

## Estructura del monorepo

```
/apps
  /api          → Backend NestJS
  /web          → Frontend React + Vite
  /mobile       → App Expo React Native
/packages
  /shared-types → Tipos compartidos
/infra
  /sql          → Migraciones SQL iniciales
/docs
  /checklist-produccion.md
  /roadmap-tecnico.md
```

## Módulos del backend

| Módulo | Endpoints principales |
|---|---|
| auth | `POST /auth/login` |
| usuarios | CRUD `/usuarios` |
| activos | CRUD `/activos` + filtros y paginación |
| categorias-activo | CRUD `/categorias-activo` |
| modelos-activo | CRUD `/modelos-activo` |
| movimientos-activo | `GET /movimientos-activo/activo/:id` — historial |
| clientes | CRUD `/clientes` + búsqueda |
| tarifas | CRUD `/tarifas` |
| reservas | CRUD `/reservas` + `PATCH /:id/cancelar` |
| alquileres | CRUD + `confirmar`, `checkout` |
| devoluciones | `POST /devoluciones/alquiler/:id/checkin` |
| penalidades | CRUD + `override` (admin) + cálculo por retraso |
| mantenimientos | CRUD + `iniciar`, `cerrar` |
| pagos | CRUD `/pagos` |
| mercadopago | `POST /pagos/mp/preference`, `POST /pagos/mp/webhook` |
| recordatorios | `GET /recordatorios`, `POST /:id/probar` |
| health | `GET /health`, `GET /health/ping` |

> Todos los endpoints requieren `Authorization: Bearer <token>` y `x-tenant-id`, salvo `/auth/login`, `/health*` y `/pagos/mp/webhook`.

## Funcionalidades implementadas

- ✅ Catálogo de activos con categorías, modelos y tracking de estado
- ✅ Estados: disponible, reservado, alquilado, en tránsito, en mantenimiento, fuera de servicio, perdido
- ✅ Alquileres multi-equipo con confirmación, check-out y check-in
- ✅ Registro de daños con costos estimados
- ✅ Penalidades por retraso, daño y faltante con override por admin
- ✅ Mantenimiento preventivo y correctivo con bloqueo de disponibilidad
- ✅ Pagos manuales (efectivo, transferencia, tarjeta) y vía MercadoPago
- ✅ Webhook MP — acredita pagos aprobados automáticamente
- ✅ Recordatorios con providers mock desacoplados (email, WhatsApp, SMS)
- ✅ Dashboard operativo con KPIs reales, próximas devoluciones y vencidos
- ✅ Wizard de nuevo alquiler en 3 pasos (web)
- ✅ Flujo completo checkout/checkin desde web y mobile
- ✅ App mobile con sesión persistente (AsyncStorage), scanner QR y upload de fotos
- ✅ 4 migraciones TypeORM (enums, tablas base, tablas operativas, campos MP)
- ✅ Health check con estado de DB y memoria
- ✅ Rate limiting: 10 req/seg — 200 req/min — 2000 req/hora
- ✅ Helmet para headers HTTP seguros
- ✅ Toast notifications globales en el frontend

## Requisitos

- Node >= 20
- npm >= 10
- PostgreSQL >= 15

## Instalación

```bash
npm install
```

## Variables de entorno

```bash
cp .env.example apps/api/.env
```

Editá `apps/api/.env` con tus valores. Variables clave:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/maquinaria_dev
JWT_SECRET=tu_secreto_seguro
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxx
MP_WEBHOOK_URL=https://tu-dominio/api/v1/pagos/mp/webhook
APP_URL=http://localhost:5173
```

## Desarrollo

```bash
# API (puerto 3000)
npm run dev:api

# Web (puerto 5173)
npm run dev:web

# Mobile
npm run dev:mobile
```

## Migraciones

```bash
cd apps/api

# Ver estado de migraciones
npm run migration:show

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert
```

## Build

```bash
npm run build:api
npm run build:web
```

## MercadoPago — configuración

1. Obtené tus credenciales en [mercadopago.com.ar/settings/account/credentials](https://www.mercadopago.com.ar/settings/account/credentials)
2. Configurá `MP_ACCESS_TOKEN` en `apps/api/.env`
3. Exponé el backend públicamente para el webhook: `npx ngrok http 3000`
4. Configurá `MP_WEBHOOK_URL` con la URL pública + `/api/v1/pagos/mp/webhook`
5. Registrá el webhook en MP → Configuración → Notificaciones
6. Para producción: cambiar `sandboxInitPoint` por `initPoint` en `AlquilerDetail.tsx`

## Roles disponibles

| Rol | Acceso |
|---|---|
| `admin` | Acceso total |
| `operador` | Alquileres, clientes, activos |
| `deposito` | Check-out y check-in |
| `tecnico` | Mantenimientos |

## Health check

```
GET /api/v1/health       → Estado de DB, memoria y uptime
GET /api/v1/health/ping  → Ping rápido
```

## Roadmap y checklist

- [`docs/checklist-produccion.md`](docs/checklist-produccion.md) — pendientes para ir a producción
- [`docs/roadmap-tecnico.md`](docs/roadmap-tecnico.md) — sprints planificados

**Sprint 2 pendiente:** email real (SendGrid), WhatsApp (Twilio), notificaciones push, tests unitarios.

## ⚠️ Checklist crítico antes de producción

Estas configuraciones son obligatorias antes de exponer el sistema a usuarios reales:

### 1. Secretos y credenciales

```bash
# Generar JWT_SECRET seguro
openssl rand -base64 64
```

Reemplazar en `apps/api/.env`:
```env
JWT_SECRET=<valor generado arriba>
```

### 2. CORS — restringir al dominio real

En `apps/api/.env`:
```env
CORS_ORIGIN=https://tu-dominio-frontend.com
```

### 3. Logging de DB — desactivar en producción

```env
NODE_ENV=production
DB_LOGGING=false
```

Con `NODE_ENV=production` también se deshabilita `synchronize: true` y se activa `migrationsRun: true` automáticamente.

### 4. Variables de entorno del frontend

En `apps/web/.env.production`:
```env
VITE_API_URL=https://tu-api.com
```

En `apps/mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://tu-api.com
```

### 5. Variables de entorno en servidor

No usar archivos `.env` en producción — usar el gestor de secretos de tu plataforma:
- **Railway / Render**: Variables de entorno en el dashboard
- **AWS**: Secrets Manager o Parameter Store
- **Fly.io**: `fly secrets set KEY=value`

### 6. MercadoPago — pasar a producción

En `AlquilerDetail.tsx`, cambiar:
```ts
// Sandbox (testing)
const url = result.sandboxInitPoint

// Producción
const url = result.initPoint
```

Y reemplazar credenciales en `.env`:
```env
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx   # token de producción
```
