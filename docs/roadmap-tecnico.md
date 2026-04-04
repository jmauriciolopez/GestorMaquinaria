# Roadmap Técnico — Maquinaria SaaS

## Sprint 1 — ✅ Completado

### Backend
- [x] Migraciones TypeORM (synchronize: false en producción)
- [x] Health check endpoint
- [x] Rate limiting con @nestjs/throttler
- [x] Helmet para seguridad de headers

### Frontend
- [x] Dashboard con datos reales del backend
- [x] Formulario completo de nuevo alquiler (wizard 3 pasos)
- [x] Flujo de checkout/checkin desde la web
- [x] Toast notifications globales
- [x] Error boundaries en componentes críticos

### Mobile
- [x] AsyncStorage real
- [x] Scanner QR con expo-camera
- [x] Upload de fotos con expo-image-picker

## Sprint 2 — ✅ Completado

- [x] MercadoPago — preferencias, webhook, acreditación automática
- [x] Email real con SendGrid (modo real/mock configurable)
- [x] WhatsApp con Twilio (modo real/mock configurable)
- [x] Upload de fotos a S3 (local en dev, S3 en producción)
- [x] StorageService global con endpoint POST /storage/upload

## Sprint 3 — Multi-sucursal, reportes y tests

### Prioridad alta
- [ ] Tests unitarios — alquileres, penalidades, MercadoPago service
- [ ] Tests e2e del flujo completo alquiler → checkout → checkin
- [ ] Documentación de endpoints con Swagger (@nestjs/swagger)
- [ ] Notificaciones push móvil con Expo Notifications

### Prioridad media
- [ ] Panel de administración multi-sucursal
- [ ] Reportes exportables a PDF/Excel
- [ ] Dashboard con métricas por sucursal
- [ ] Transferencia de activos entre sucursales
- [ ] Caché en endpoints de catálogo (categorías, modelos, tarifas)

### Prioridad baja
- [ ] CI/CD pipeline con tests automáticos antes de deploy
- [ ] Sentry para error tracking
- [ ] Logs centralizados (CloudWatch, Datadog)

## Sprint 4 — Escala y telemetría

- [ ] Infraestructura para telemetría IoT/GPS
- [ ] API para integración con lectores QR físicos de depósito
- [ ] Webhooks para eventos críticos (vencimientos, daños)
- [ ] Onboarding automatizado de nuevos tenants

## Deuda técnica identificada

- Queries N+1 en listados con relaciones — agregar eager loading selectivo
- Tipos compartidos entre web y api — migrar a `packages/shared-types`
- `DB_LOGGING=false` a configurar en producción via env
- Swagger para documentar todos los endpoints públicos
