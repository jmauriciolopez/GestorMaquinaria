# Sesión completa — SaaS de alquiler de maquinaria y herramientas

## Cómo usar esta sesión

- Ejecutá los prompts **en orden**.
- Pegá **un prompt por vez** en tu IDE AI (Antigravity o similar).
- **No mezcles etapas**.
- Si el IDE rompe consistencia, usá el prompt de **corrección de rumbo** antes de seguir.
- Cada prompt está pensado para **continuar sobre lo ya generado**, sin rehacer todo.
- Objetivo: código **productivo, modular, consistente y escalable**.

---

## 0) Prompt maestro — contexto completo del sistema

Copiá este prompt al inicio de la sesión para fijar el marco general del proyecto.

```md
Actuá como un arquitecto de software senior y product builder especializado en SaaS verticales. Vas a construir un sistema real, orientado a producción, para alquiler de maquinaria, herramientas y activos operativos.

# Objetivo
Construir un sistema end-to-end con:
- Backend en NestJS
- Frontend en React + TypeScript
- App móvil en React Native con Expo
- Base de datos PostgreSQL
- Auth JWT
- Arquitectura preparada para escalar
- Trazabilidad completa de activos
- Preparación para multi-sucursal futura

# Reglas obligatorias
- Generá código real, no pseudo-código.
- No expliques teoría salvo comentarios breves dentro del código.
- No rehagas archivos ya existentes salvo que sea estrictamente necesario.
- Respetá naming consistente en toda la base.
- Mantené separación clara entre dominio, aplicación e infraestructura cuando aplique.
- Todo debe quedar listo para continuar en la siguiente etapa.
- Cuando generes archivos, listalos explícitamente.
- Si una etapa depende de otra, asumí que la etapa anterior ya fue creada.
- No uses mocks innecesarios si ya existe backend o base real.
- Usá TypeScript estricto.
- Escribí código orientado a producción.

# Dominio del sistema
SaaS de alquiler de maquinaria y herramientas para:
- dueños de rental / corralones / alquiladoras
- operadores de mostrador
- logística / depósito
- técnicos de mantenimiento
- administradores

# Problemas a resolver
- no saben dónde está cada equipo
- devoluciones fuera de tiempo
- equipos dañados sin registro
- poca trazabilidad entre salida, devolución e inspección
- dificultades para cobrar penalidades
- mantenimiento reactivo y no planificado
- stock poco confiable
- información dispersa entre planillas, WhatsApp y papel

# Funcionalidades núcleo
- catálogo de equipos y herramientas
- tracking de activos por unidad física
- estados del activo: disponible, reservado, alquilado, en tránsito, en mantenimiento, fuera de servicio, perdido
- alta de clientes
- contratos / alquileres
- reserva y check-out de activos
- check-in con inspección de devolución
- registro de daños
- penalidades por retraso, daño, faltantes y horas extra
- mantenimiento preventivo y correctivo
- disponibilidad real por sucursal
- historial completo del activo
- pagos, señas y saldo
- recordatorios y alertas mockeadas
- panel operativo con vencimientos y alertas

# Entidades principales
- cliente
- usuario
- rol
- sucursal
- categoria_activo
- modelo_activo
- activo
- activo_documento
- alquiler
- alquiler_item
- reserva
- entrega_activo
- devolucion_activo
- inspeccion_activo
- dano_activo
- penalidad
- tarifa
- mantenimiento
- orden_trabajo
- pago
- movimiento_activo
- recordatorio
- auditoria_evento

# Requisitos importantes
- cada activo físico debe tener identificador único, QR o código interno
- el sistema debe poder saber ubicación actual y último movimiento del activo
- cada alquiler puede incluir múltiples activos
- las penalidades deben calcularse con reglas configurables
- el check-out y check-in deben dejar trazabilidad operativa
- mantenimiento debe bloquear disponibilidad cuando corresponda
- preparar tenant_id / sucursal_id aunque multi-sucursal pueda quedar simple en esta versión
- almacenamiento de fotos y adjuntos preparado para migración futura a S3
- recordatorios desacoplados, inicialmente mock
- arquitectura preparada para futura telemetría GPS o IoT, sin implementarla ahora

# Stack
Backend:
- NestJS
- TypeORM
- PostgreSQL
- JWT
- class-validator

Frontend web:
- React
- TypeScript
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind o CSS modular, pero mantener consistencia

Mobile:
- React Native
- Expo
- TypeScript
- React Navigation
- TanStack Query

# Convenciones
- idioma del negocio y nombres de módulos: español consistente
- nombres técnicos de clases/archivos: kebab-case para archivos, PascalCase para clases, camelCase para variables
- endpoints REST consistentes
- DTOs separados
- módulos Nest por dominio
- componentes frontend desacoplados por feature

# Estructura objetivo del monorepo
/apps
  /api
  /web
  /mobile
/packages
  /shared-types
  /ui (opcional simple)

# Entregables esperados en esta sesión completa
- esquema SQL inicial y consistente
- backend NestJS modular
- frontend React funcional
- mobile Expo funcional
- auth JWT con roles
- tracking de activos
- alquileres con check-out y check-in
- penalidades automáticas
- mantenimiento
- pagos
- recordatorios mock
- refactor final

A partir de ahora, en cada etapa generá exactamente lo pedido, indicando archivos exactos a crear o modificar, sin reescribir todo el proyecto.
```

---

## Orden recomendado de ejecución

1. Estructura del monorepo
2. SQL inicial + decisiones de persistencia
3. Bootstrap del backend NestJS
4. Auth JWT + usuarios + roles
5. Catálogo de activos, categorías y modelos
6. Tracking de activos y movimientos
7. Clientes, tarifas y reservas
8. Alquileres + entrega/check-out
9. Devoluciones + inspección + daños
10. Penalidades y reglas de cálculo
11. Mantenimiento y bloqueo de disponibilidad
12. Web: shell, auth y layout
13. Web: activos, tablero y tracking
14. Web: alquileres, devoluciones y penalidades
15. Mobile: check-out / check-in operativo
16. Servicio de recordatorios mock + jobs preparados
17. Hardening + refactor final + checklist productivo

---

## 1) Prompt — estructura inicial del monorepo

```md
Tomando el contexto ya definido, generá la estructura inicial del proyecto como monorepo.

Objetivo: dejar una base limpia para apps api, web y mobile, con shared-types.

Generá únicamente:
- árbol de carpetas final
- package.json raíz con workspaces
- tsconfig.base.json
- .editorconfig
- .gitignore
- .env.example raíz
- README.md corto con comandos de instalación y ejecución
- package.json para apps/api
- package.json para apps/web
- package.json para apps/mobile
- package.json para packages/shared-types

Requisitos:
- usar npm workspaces
- TypeScript estricto
- scripts consistentes para dev, build, lint y test
- no agregar herramientas innecesarias
- dejar preparado el proyecto para NestJS, React Vite y Expo

Entregá:
1. lista exacta de archivos creados
2. contenido completo de cada archivo
```

---

## 2) Prompt — SQL inicial de producción

```md
Generá el esquema SQL inicial para PostgreSQL del sistema de alquiler de maquinaria y herramientas.

Necesito un archivo:
- infra/sql/001_init.sql

Incluir tablas y relaciones para:
- usuarios, roles, sucursales
- clientes
- categorias_activo, modelos_activo, activos
- tarifas
- reservas
- alquileres y alquiler_items
- entregas, devoluciones, inspecciones
- danos_activo
- penalidades
- mantenimientos
- pagos
- movimientos_activo
- recordatorios
- auditoria_evento
- archivos_adjuntos

Requisitos técnicos:
- claves primarias UUID
- timestamps created_at, updated_at
- soft delete donde tenga sentido con deleted_at
- índices útiles para búsqueda y operaciones
- foreign keys explícitas
- constraints de negocio razonables
- enums o check constraints para estados críticos
- soporte para tenant_id y sucursal_id
- activos con codigo_interno único y numero_serie opcional único si existe

Reglas funcionales a contemplar:
- un activo físico puede pasar por varios estados operativos
- un alquiler puede incluir múltiples activos
- un mantenimiento activo bloquea disponibilidad
- una devolución puede disparar penalidades
- pagos parciales sobre alquileres y penalidades

Entregá solo:
1. lista de archivo creado
2. contenido completo del SQL
```

---

## 3) Prompt — bootstrap del backend NestJS

```md
Tomando el SQL ya definido, generá el bootstrap inicial del backend en NestJS dentro de apps/api.

Crear únicamente:
- configuración base de NestJS
- AppModule
- módulo de configuración
- módulo de base de datos con TypeORM
- health module
- carpeta src/common para utilidades compartidas mínimas
- manejo global de validation pipe, filtros y interceptores básicos

Archivos esperados:
- apps/api/src/main.ts
- apps/api/src/app.module.ts
- apps/api/src/config/*.ts
- apps/api/src/database/*.ts
- apps/api/src/health/*
- apps/api/src/common/filters/*
- apps/api/src/common/interceptors/*
- apps/api/src/common/dto/*
- apps/api/.env.example

Requisitos:
- TypeORM configurado por variables de entorno
- prefijo global /api
- versionado simple v1
- CORS configurable
- class-validator activo
- estructura modular lista para crecer
- no generar todavía módulos de negocio complejos

Entregá:
1. lista exacta de archivos creados
2. contenido completo de cada archivo
```

---

## 4) Prompt — auth JWT + usuarios + roles

```md
Generá el módulo de autenticación y autorización completo en NestJS.

Módulos a crear:
- auth
- usuarios
- roles

Incluir:
- entidades TypeORM
- DTOs
- servicios
- controladores
- guards JWT y roles
- estrategia JWT
- login
- refresh simple si lo considerás razonable
- seed mínimo de roles y usuario admin en comentario o archivo aparte

Archivos mínimos esperados:
- apps/api/src/modules/auth/*
- apps/api/src/modules/usuarios/*
- apps/api/src/modules/roles/*

Requisitos:
- password hash con bcrypt
- JWT access token
- decorador @Roles
- endpoint de perfil /me
- usuario vinculado a sucursal principal
- naming consistente en español
- no usar código demo

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 5) Prompt — catálogo de activos

```md
Generá en NestJS los módulos de catálogo y maestros de activos.

Módulos a crear:
- categorias-activo
- modelos-activo
- activos
- archivos-adjuntos

Funcionalidad requerida:
- ABM de categorías de activo
- ABM de modelos de activo
- ABM de activos físicos por unidad
- carga de atributos clave: código interno, serie, marca, modelo, estado, sucursal, costo de reposición, valor de alquiler
- adjuntos y fotos preparados con storage local abstracto

Incluir:
- entidades TypeORM
- DTOs create/update/query
- controladores REST
- servicios
- repositorios si los separás
- validaciones de unicidad y estados

Requisitos:
- un activo representa una unidad física real
- endpoint para consultar detalle del activo con historial resumido
- endpoint de listado con filtros por estado, categoría, sucursal y texto
- no implementar aún tracking GPS
- storage desacoplado mediante interfaz para futura migración a S3

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 6) Prompt — tracking de activos y movimientos

```md
Generá el módulo de tracking de activos y movimientos operativos.

Módulo a crear:
- movimientos-activo

Funcionalidad requerida:
- registrar cambios de estado del activo
- registrar ubicación operativa actual
- registrar eventos: alta, reserva, entrega, devolución, mantenimiento, transferencia, baja
- consultar línea de tiempo del activo
- exponer último movimiento y ubicación actual

Requisitos de negocio:
- no permitir movimiento inconsistente con el estado actual
- toda transición debe quedar auditada
- cada movimiento debe guardar usuario responsable, sucursal y observaciones
- preparar soporte para QR en activo sin implementar scanner real

Endpoints mínimos:
- POST /movimientos-activo
- GET /movimientos-activo/activo/:activoId
- GET /activos/:id/ubicacion-actual
- GET /activos/:id/historial

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 7) Prompt — clientes, tarifas y reservas

```md
Generá los módulos de clientes, tarifas y reservas.

Módulos a crear:
- clientes
- tarifas
- reservas

Funcionalidad requerida:
- ABM de clientes empresa o persona
- tarifas por categoría, modelo o activo individual
- reservas con fecha/hora de retiro y devolución estimada
- validación de disponibilidad para reservar
- estados de reserva: pendiente, confirmada, cancelada, vencida, convertida

Requisitos:
- cliente con datos fiscales y contactos básicos
- reserva con múltiples activos o selección por categoría cuando no se asigna unidad todavía
- si se reserva activo específico, bloquear disponibilidad temporal
- endpoints listos para convertir reserva en alquiler

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 8) Prompt — alquileres + entrega/check-out

```md
Generá el módulo de alquileres con salida operativa de activos.

Módulo a crear:
- alquileres

Funcionalidad requerida:
- crear alquiler desde cero o desde reserva
- agregar múltiples alquiler_items
- calcular importe base estimado
- registrar check-out / entrega
- cambiar estado de activos a alquilado
- generar comprobante simple en JSON DTO o estructura imprimible, sin PDF aún

Reglas:
- no permitir alquilar activos no disponibles
- registrar fecha/hora real de salida
- registrar responsable de entrega
- guardar observaciones de salida y checklist inicial
- movimientos de activo deben actualizarse automáticamente

Endpoints mínimos:
- POST /alquileres
- POST /alquileres/:id/entregar
- GET /alquileres/:id
- GET /alquileres
- PATCH /alquileres/:id/cancelar

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 9) Prompt — devoluciones + inspección + daños

```md
Generá la lógica completa de devolución y control de estado al regreso.

Extender módulo:
- alquileres

Crear o agregar:
- devolucion-activo
- inspeccion-activo
- dano-activo

Funcionalidad requerida:
- registrar devolución parcial o total de alquiler
- check-in por activo
- inspección con checklist configurable simple
- registro de daños, faltantes, suciedad o horas extra
- adjuntar fotos de devolución
- actualizar estado del activo según resultado: disponible, mantenimiento, fuera de servicio

Reglas:
- una devolución puede ser parcial
- si hay daño severo, activo no vuelve a disponible
- cada devolución debe dejar evidencia y usuario responsable
- generar base para futuras penalidades

Endpoints mínimos:
- POST /alquileres/:id/devolver
- POST /alquileres/:id/inspeccionar
- POST /alquileres/:id/danos
- GET /alquileres/:id/devoluciones

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 10) Prompt — penalidades y reglas de cálculo

```md
Generá el módulo de penalidades y su motor de cálculo básico.

Módulo a crear:
- penalidades

Funcionalidad requerida:
- penalidad por retraso
- penalidad por daño
- penalidad por faltante de accesorio
- penalidad por suciedad o limpieza
- penalidad por horas extra o uso excedido si aplica
- recalcular penalidades de un alquiler

Requisitos:
- reglas configurables por sucursal o globales mediante entidad simple
- posibilidad de monto fijo o porcentaje
- vincular penalidad con alquiler, activo y daño si corresponde
- exponer breakdown de cálculo
- permitir override manual auditado por usuario autorizado

Endpoints mínimos:
- POST /penalidades/recalcular/:alquilerId
- PATCH /penalidades/:id/override
- GET /penalidades/alquiler/:alquilerId

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 11) Prompt — mantenimiento y bloqueo de disponibilidad

```md
Generá el módulo de mantenimiento de activos.

Módulo a crear:
- mantenimientos

Funcionalidad requerida:
- crear mantenimiento preventivo o correctivo
- registrar orden de trabajo simple
- bloquear disponibilidad del activo mientras está en mantenimiento
- registrar diagnóstico, tareas, repuestos y costo
- cerrar mantenimiento y devolver activo a disponible o fuera de servicio
- consultar historial técnico por activo

Reglas:
- no iniciar mantenimiento si el activo está alquilado salvo excepción administrada
- si el mantenimiento queda abierto, el activo no puede reservarse ni alquilarse
- toda apertura y cierre debe generar movimiento_activo

Endpoints mínimos:
- POST /mantenimientos
- PATCH /mantenimientos/:id/iniciar
- PATCH /mantenimientos/:id/cerrar
- GET /mantenimientos/activo/:activoId
- GET /mantenimientos

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 12) Prompt — frontend web base: shell, auth y layout

```md
Generá la base del frontend web en React + TypeScript dentro de apps/web.

Objetivo:
- dejar autenticación, layout y base de navegación operativa

Crear:
- bootstrap de Vite + React + TS
- router
- cliente API
- manejo de auth con JWT
- layout principal con sidebar y topbar
- páginas iniciales vacías pero conectadas para dashboard, activos, clientes, alquileres, devoluciones, mantenimiento, penalidades y configuración

Requisitos:
- TanStack Query
- React Router
- formularios con React Hook Form + Zod donde haga falta
- no usar Redux salvo necesidad real
- guardar token de forma simple y consistente
- componentes y features separados
- base visual sobria y operativa

Entregá:
1. lista exacta de archivos creados
2. contenido completo de cada archivo
```

---

## 13) Prompt — frontend web: tablero, activos y tracking

```md
Sobre el frontend ya creado, implementá las pantallas reales de operación para activos.

Pantallas a crear:
- dashboard operativo
- listado de activos
- detalle de activo
- historial / timeline del activo
- formulario de alta / edición de activo

Requisitos funcionales:
- dashboard con cards de activos disponibles, alquilados, vencidos, en mantenimiento y devoluciones pendientes
- tabla con filtros por estado, sucursal, categoría y búsqueda
- detalle del activo con datos clave, ubicación actual, último movimiento y historial
- mostrar alertas visuales si el activo está vencido o con mantenimiento abierto
- todo conectado al backend real

Componentes mínimos:
- tabla reusable
- badge de estado
- timeline de movimientos
- drawer o modal para formularios

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 14) Prompt — frontend web: alquileres, devoluciones y penalidades

```md
Implementá en React las pantallas operativas de alquiler.

Pantallas a crear:
- listado de alquileres
- detalle de alquiler
- flujo de entrega/check-out
- flujo de devolución/check-in
- panel de penalidades del alquiler
- pantalla simple de clientes

Requisitos:
- crear alquiler con múltiples activos
- entregar alquiler con checklist inicial
- devolver parcial o total
- cargar daños y observaciones
- visualizar penalidades calculadas y permitir override si el usuario tiene rol administrador
- mostrar pagos y saldo pendiente
- navegación consistente con lo ya generado

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 15) Prompt — app móvil Expo para operación en campo

```md
Generá la app móvil en React Native con Expo enfocada en operación de depósito y campo.

Objetivo:
- permitir check-out, check-in e inspecciones rápidas

Pantallas mínimas:
- login
- dashboard operativo móvil
- listado de alquileres pendientes de entrega
- detalle de alquiler
- check-out por activo
- check-in por activo
- inspección con checklist y observaciones
- carga de fotos local mockeada lista para conectar a backend
- consulta rápida de activo por código manual

Requisitos:
- React Navigation
- TanStack Query
- cliente API reutilizable
- TypeScript estricto
- UI simple y rápida para uso operativo
- no implementar scanner QR real todavía, pero dejar interfaz preparada

Entregá:
1. lista exacta de archivos creados
2. contenido completo de cada archivo
```

---

## 16) Prompt — recordatorios mock + jobs preparados

```md
Generá la infraestructura de recordatorios y alertas operativas en el backend.

Módulo a crear:
- recordatorios

Objetivo:
- notificar alquileres próximos a vencer, devoluciones vencidas, mantenimientos próximos y reservas pendientes

Incluir:
- entidad recordatorio
- servicio de generación de recordatorios
- providers desacoplados para email, WhatsApp y SMS en modo mock
- cron o scheduler preparado
- logs claros de envío
- endpoints de prueba manual

Reglas:
- no acoplar la lógica de negocio al canal de envío
- dejar interfaz para futura integración real
- soportar plantillas simples

Entregá:
1. lista exacta de archivos creados o modificados
2. contenido completo de cada archivo
```

---

## 17) Prompt — refactor final, hardening y checklist productivo

```md
Hacé un refactor final integral del sistema completo ya generado, sin cambiar la funcionalidad principal.

Objetivo:
- dejar el proyecto consistente, mantenible y listo para seguir creciendo

Revisar y ajustar:
- imports rotos
- duplicación de tipos
- naming inconsistente
- validaciones faltantes
- manejo de errores
- tipado compartido entre apps cuando convenga
- DTOs redundantes
- servicios demasiado acoplados
- endpoints inconsistentes
- formularios frontend repetidos
- estados operativos mal resueltos
- guards y roles faltantes
- queries N+1 evitables
- configuración de entornos

Además generar:
- checklist final de producción en docs/checklist-produccion.md
- checklist de próximos pasos en docs/roadmap-tecnico.md

Entregá:
1. lista exacta de archivos creados o modificados
2. diff o contenido final completo de los archivos ajustados
3. checklist final
```

---

## Prompt de corrección de rumbo

Usalo cuando el IDE empiece a mezclar capas, romper nombres o rehacer partes ya cerradas.

```md
Detené el desvío y corregí el rumbo.

Contexto:
Estamos construyendo un SaaS de alquiler de maquinaria y herramientas con NestJS + React + PostgreSQL + Expo, por etapas incrementales.

Problemas observados en tu última salida:
- mezclaste responsabilidades entre capas
- cambiaste nombres ya definidos
- reescribiste partes fuera del alcance pedido
- introdujiste inconsistencias con entidades, endpoints o tipos

A partir de ahora:
- respetá estrictamente lo ya construido
- no rehagas archivos no pedidos
- mantené naming consistente en español de negocio
- generá solo los archivos exactos de esta etapa
- si necesitás modificar algo previo, hacelo de forma mínima y explícita
- priorizá continuidad sobre rediseño
- entregá código listo para producción, no demo

Rehacé únicamente la etapa actual correctamente.
Primero listá:
1. archivos a crear o modificar
2. justificación mínima de cada cambio en una línea
3. luego el contenido completo final
```

---

## Sugerencia de uso en Antigravity

Secuencia práctica:

1. Pegá el **Prompt maestro**.
2. Ejecutá los prompts **1 a 17** en orden.
3. Si algo se rompe, pegá el **prompt de corrección de rumbo**.
4. No saltees primero SQL y backend, porque frontend y mobile dependen de ese contrato.
5. Cuando cierres backend, recién ahí avanzá con web y después mobile.

---

## Resultado esperado al final

Vas a tener una base sólida para un producto tipo:

**“Tracking de activos + alquiler + penalidades”**

con foco en:
- saber dónde está cada equipo
- controlar entregas y devoluciones
- registrar daños con evidencia
- bloquear disponibilidad por mantenimiento
- cobrar penalidades con trazabilidad
- operar varias sucursales a futuro sin rehacer la arquitectura
