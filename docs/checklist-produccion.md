# Checklist de Producción — Maquinaria SaaS

## Backend

### Seguridad
- [ ] Cambiar `JWT_SECRET` por uno generado con `openssl rand -base64 64`
- [x] Migraciones TypeORM — `synchronize: false` en producción, `migrationsRun: true`
- [ ] Configurar rate limiting (`@nestjs/throttler`)
- [ ] Agregar helmet para headers HTTP seguros
- [ ] Validar que `CORS_ORIGIN` apunte solo al dominio del frontend
- [ ] Revisar que ningún endpoint con datos sensibles sea `@Public()`
- [ ] Hashear logs — no loguear passwords ni tokens

### Base de datos
- [x] Migraciones TypeORM creadas (3 migraciones: enums, tablas base, tablas operativas)
- [x] `data-source.ts` listo para CLI (`npm run migration:run`)
- [ ] Hacer backup de la DB antes de cada deploy
- [ ] Agregar índices adicionales según queries más frecuentes
- [ ] Revisar constraints de unicidad por tenant

### Performance
- [ ] Revisar queries N+1 en `findAll` con relaciones
- [ ] Agregar caché en endpoints de catálogo (categorías, modelos, tarifas)
- [ ] Paginar todos los listados en producción
- [ ] Configurar `DB_LOGGING=false` en producción

### Infraestructura
- [ ] Variables de entorno en servicio de secretos (AWS Secrets Manager, etc.)
- [x] Health check endpoint — `GET /api/v1/health` y `GET /api/v1/health/ping`
- [ ] Agregar Sentry o similar para error tracking
- [ ] Configurar logs centralizados (CloudWatch, Datadog, etc.)
- [ ] CI/CD pipeline con tests antes de deploy

## Frontend Web

- [ ] Configurar `VITE_API_URL` con URL de producción
- [ ] Build optimizado (`npm run build`)
- [ ] Configurar CDN para assets estáticos
- [ ] Agregar error boundaries en componentes críticos
- [ ] Testear flujo completo: login → alquiler → checkout → checkin

## App Mobile

- [ ] Configurar `EXPO_PUBLIC_API_URL` con URL de producción
- [ ] Build de producción con EAS Build
- [ ] Implementar `@react-native-async-storage/async-storage` real
- [ ] Implementar scanner QR con `expo-camera` o `expo-barcode-scanner`
- [ ] Implementar carga de fotos con `expo-image-picker`
- [ ] Testear en dispositivo físico Android e iOS

## Funcionalidades pendientes de completar

- [ ] Integración real de pagos (MercadoPago / Stripe)
- [ ] Implementación real de email (SendGrid / SES)
- [ ] Implementación real de WhatsApp (Twilio / Meta API)
- [ ] Scanner QR en mobile
- [ ] Upload de fotos a S3
- [ ] Dashboard con datos reales conectados al backend
- [ ] Tests unitarios y e2e
- [ ] Multi-sucursal completo con filtros por sucursal
