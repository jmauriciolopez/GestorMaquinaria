# Roadmap Técnico — Maquinaria SaaS

## Sprint 1 — Producción mínima viable (próximas 2 semanas)

### Backend
- [ ] Migraciones TypeORM (reemplazar `synchronize: true`)
- [ ] Health check endpoint
- [ ] Rate limiting con `@nestjs/throttler`
- [ ] Helmet para seguridad de headers
- [ ] Tests unitarios de servicios críticos (alquileres, penalidades)

### Frontend
- [ ] Conectar Dashboard con datos reales del backend
- [ ] Formulario completo de nuevo alquiler con selección de activos
- [ ] Flujo de checkout/checkin desde la web
- [ ] Manejo de errores global (toast notifications)

### Mobile
- [ ] Integrar AsyncStorage real
- [ ] Scanner QR con expo-camera
- [ ] Upload de fotos en check-out/check-in

## Sprint 2 — Pagos y notificaciones reales

- [ ] Integrar MercadoPago para cobros de alquileres y penalidades
- [ ] Email real con SendGrid (reemplazar mock)
- [ ] WhatsApp con Twilio o Meta Cloud API (reemplazar mock)
- [ ] Notificaciones push con Expo Notifications

## Sprint 3 — Multi-sucursal y reportes

- [ ] Panel de administración multi-sucursal
- [ ] Reportes exportables a PDF/Excel
- [ ] Dashboard con métricas por sucursal
- [ ] Transferencia de activos entre sucursales

## Sprint 4 — Escala y telemetría

- [ ] Preparar infraestructura para telemetría IoT/GPS
- [ ] API para integración con lectores QR físicos
- [ ] Webhooks para eventos críticos (vencimientos, daños)
- [ ] Onboarding de nuevos tenants automatizado

## Deuda técnica identificada

- Queries N+1 en listados con relaciones — agregar eager loading selectivo
- `BaseEntity` heredado sin `deletedAt` en algunas entidades — revisar entidad por entidad
- Tipos compartidos entre web y api — migrar a `packages/shared-types`
- Tests e2e del flujo completo de alquiler
- Documentación de endpoints con Swagger (`@nestjs/swagger`)
