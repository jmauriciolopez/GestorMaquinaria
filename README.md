# Maquinaria SaaS

Sistema de alquiler de maquinaria y herramientas — monorepo.

## Estructura

```
/apps
  /api      → Backend NestJS
  /web      → Frontend React + Vite
  /mobile   → App Expo React Native
/packages
  /shared-types → Tipos compartidos
/infra
  /sql      → Migraciones SQL
```

## Requisitos

- Node >= 20
- npm >= 10
- PostgreSQL >= 15

## Instalación

```bash
npm install
```

## Desarrollo

```bash
# API
npm run dev:api

# Web
npm run dev:web

# Mobile
npm run dev:mobile
```

## Build

```bash
npm run build:api
npm run build:web
npm run build:shared
```

## Variables de entorno

Copiá `.env.example` a `.env` en la raíz y en `apps/api/`.

```bash
cp .env.example .env
cp .env.example apps/api/.env
```
