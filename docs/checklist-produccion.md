# Checklist de Producción — Maquinaria SaaS

## Backend

### Seguridad
- [ ] Cambiar `JWT_SECRET` por uno generado con `openssl rand -base64 64`
- [x] Migraciones TypeORM — `synchronize: false` en producción, `migrationsRun: true`
- [x] Rate limiting — `@nestjs/throttler` (10/seg, 200/min, 2000/hora)
- [x] Helmet — headers HTTP seguros
- [ ] Validar que `CORS_ORIGIN` apunte solo al dominio del frontend
- [ ] Revisar que ningún endpoint con datos sensibles sea `@Public()`
- [ ] Hashear logs — no loguear passwords ni tokens

### Base de datos
- [x] Migraciones TypeORM creadas (4 migraciones)
- [x] `data-source.ts` listo para CLI (`npm run migration:run`)
- [ ] Hacer backup de la DB antes de cada deploy
- [ ] Agregar índices adicionales según queries más frecuentes

### Performance
- [ ] Revisar queries N+1 en `findAll` con relaciones
- [ ] Agregar caché en endpoints de catálogo (categorías, modelos, tarifas)
- [ ] Configurar `DB_LOGGING=false` en producción

### Infraestructura
- [ ] Variables de entorno en servicio de secretos
- [x] Health check endpoint
- [ ] Agregar Sentry o similar para error tracking
- [ ] CI/CD pipeline con tests antes de deploy

## Frontend Web

- [ ] Configurar `VITE_API_URL` con URL de producción
- [ ] Build optimizado (`npm run build`)
- [ ] Configurar CDN para assets estáticos
- [x] Error boundaries en componentes críticos
- [x] Dashboard con datos reales del backend
- [x] Formulario completo de nuevo alquiler
- [x] Flujo de checkout/checkin desde la web
- [x] Manejo de errores global (toast notifications)

## App Mobile

- [ ] Configurar `EXPO_PUBLIC_API_URL` con URL de producción
- [ ] Build de producción con EAS Build
- [x] AsyncStorage real
- [x] Scanner QR con expo-camera
- [x] Carga de fotos con expo-image-picker
- [ ] Testear en dispositivo físico Android e iOS

## Funcionalidades completadas

- [x] MercadoPago — preferencias, webhook, acreditación automática
- [x] Email real con SendGrid (activar con `NOTIFICACIONES_MODO=real`)
- [x] WhatsApp real con Twilio (activar con `NOTIFICACIONES_MODO=real`)
- [x] Upload de fotos — local en dev, S3 en producción (activar con `NOTIFICACIONES_MODO=real`)
- [x] Error boundaries en frontend web

## Pendientes Sprint 3+

- [ ] Tests unitarios y e2e
- [ ] Multi-sucursal completo con filtros por sucursal
- [ ] Reportes exportables a PDF/Excel
- [ ] Swagger / documentación de endpoints
- [ ] Notificaciones push móvil (Expo Notifications)
