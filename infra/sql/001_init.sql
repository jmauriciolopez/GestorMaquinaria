-- ============================================================
-- 001_init.sql — Esquema inicial de producción
-- Sistema de alquiler de maquinaria y herramientas
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE estado_activo AS ENUM (
  'disponible', 'reservado', 'alquilado', 'en_transito',
  'en_mantenimiento', 'fuera_de_servicio', 'perdido'
);

CREATE TYPE estado_alquiler AS ENUM (
  'borrador', 'confirmado', 'entregado', 'devuelto_parcial',
  'devuelto', 'cancelado', 'vencido'
);

CREATE TYPE estado_reserva AS ENUM (
  'pendiente', 'confirmada', 'cancelada', 'expirada', 'convertida'
);

CREATE TYPE tipo_mantenimiento AS ENUM ('preventivo', 'correctivo');

CREATE TYPE estado_mantenimiento AS ENUM (
  'programado', 'en_curso', 'completado', 'cancelado'
);

CREATE TYPE tipo_penalidad AS ENUM (
  'retraso', 'danio', 'faltante', 'horas_extra', 'otro'
);

CREATE TYPE estado_penalidad AS ENUM (
  'pendiente', 'aprobada', 'anulada', 'pagada'
);

CREATE TYPE tipo_movimiento AS ENUM (
  'check_out', 'check_in', 'traslado', 'entrada_mantenimiento',
  'salida_mantenimiento', 'baja', 'ajuste'
);

CREATE TYPE estado_pago AS ENUM (
  'pendiente', 'pagado', 'parcial', 'reembolsado', 'anulado'
);

CREATE TYPE tipo_recordatorio AS ENUM (
  'vencimiento_alquiler', 'devolucion_pendiente', 'mantenimiento_proximo',
  'reserva_pendiente', 'pago_pendiente'
);

CREATE TYPE canal_notificacion AS ENUM ('email', 'whatsapp', 'sms', 'push');

-- ============================================================
-- SUCURSALES Y USUARIOS
-- ============================================================

CREATE TABLE sucursales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(30),
  email VARCHAR(120),
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(60) NOT NULL UNIQUE,
  descripcion TEXT,
  permisos JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  sucursal_id UUID REFERENCES sucursales(id),
  rol_id UUID NOT NULL REFERENCES roles(id),
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (tenant_id, email)
);

-- ============================================================
-- CLIENTES
-- ============================================================

CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  razon_social VARCHAR(120),
  documento VARCHAR(30),
  tipo_documento VARCHAR(20),
  email VARCHAR(120),
  telefono VARCHAR(30),
  direccion TEXT,
  notas TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================
-- CATÁLOGO DE ACTIVOS
-- ============================================================

CREATE TABLE categorias_activo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE modelos_activo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  categoria_id UUID NOT NULL REFERENCES categorias_activo(id),
  nombre VARCHAR(120) NOT NULL,
  marca VARCHAR(80),
  descripcion TEXT,
  especificaciones JSONB,
  imagen_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE activos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  modelo_id UUID NOT NULL REFERENCES modelos_activo(id),
  codigo_interno VARCHAR(60) NOT NULL,
  numero_serie VARCHAR(120),
  estado estado_activo NOT NULL DEFAULT 'disponible',
  ubicacion_actual TEXT,
  anno_fabricacion INT,
  fecha_adquisicion DATE,
  valor_adquisicion NUMERIC(12, 2),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (tenant_id, codigo_interno),
  UNIQUE (tenant_id, numero_serie)
);

CREATE TABLE activos_documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activo_id UUID NOT NULL REFERENCES activos(id) ON DELETE CASCADE,
  tipo VARCHAR(60) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TARIFAS
-- ============================================================

CREATE TABLE tarifas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  modelo_id UUID REFERENCES modelos_activo(id),
  activo_id UUID REFERENCES activos(id),
  nombre VARCHAR(120) NOT NULL,
  precio_por_hora NUMERIC(10, 2),
  precio_por_dia NUMERIC(10, 2),
  precio_por_semana NUMERIC(10, 2),
  precio_por_mes NUMERIC(10, 2),
  deposito_garantia NUMERIC(10, 2) DEFAULT 0,
  vigente BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RESERVAS
-- ============================================================

CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  estado estado_reserva NOT NULL DEFAULT 'pendiente',
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reserva_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  activo_id UUID NOT NULL REFERENCES activos(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALQUILERES
-- ============================================================

CREATE TABLE alquileres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  reserva_id UUID REFERENCES reservas(id),
  estado estado_alquiler NOT NULL DEFAULT 'borrador',
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin_prevista TIMESTAMPTZ NOT NULL,
  fecha_fin_real TIMESTAMPTZ,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_penalidades NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_pagado NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alquiler_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alquiler_id UUID NOT NULL REFERENCES alquileres(id) ON DELETE CASCADE,
  activo_id UUID NOT NULL REFERENCES activos(id),
  tarifa_id UUID REFERENCES tarifas(id),
  precio_unitario NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ENTREGAS Y DEVOLUCIONES
-- ============================================================

CREATE TABLE entregas_activo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alquiler_id UUID NOT NULL REFERENCES alquileres(id),
  activo_id UUID NOT NULL REFERENCES activos(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  fecha_entrega TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  condicion_salida TEXT,
  checklist_salida JSONB,
  fotos_salida JSONB,
  firma_cliente TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE devoluciones_activo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alquiler_id UUID NOT NULL REFERENCES alquileres(id),
  activo_id UUID NOT NULL REFERENCES activos(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  fecha_devolucion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  condicion_retorno TEXT,
  checklist_retorno JSONB,
  fotos_retorno JSONB,
  observaciones TEXT,
  tiene_danios BOOLEAN NOT NULL DEFAULT FALSE,
  tiene_retraso BOOLEAN NOT NULL DEFAULT FALSE,
  horas_retraso NUMERIC(8, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inspecciones_activo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activo_id UUID NOT NULL REFERENCES activos(id),
  devolucion_id UUID REFERENCES devoluciones_activo(id),
  mantenimiento_id UUID,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resultado TEXT,
  observaciones TEXT,
  fotos JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE danos_activo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activo_id UUID NOT NULL REFERENCES activos(id),
  devolucion_id UUID REFERENCES devoluciones_activo(id),
  inspeccion_id UUID REFERENCES inspecciones_activo(id),
  descripcion TEXT NOT NULL,
  costo_estimado NUMERIC(10, 2),
  fotos JSONB,
  resuelto BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PENALIDADES
-- ============================================================

CREATE TABLE penalidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  alquiler_id UUID NOT NULL REFERENCES alquileres(id),
  activo_id UUID REFERENCES activos(id),
  tipo tipo_penalidad NOT NULL,
  estado estado_penalidad NOT NULL DEFAULT 'pendiente',
  descripcion TEXT,
  monto NUMERIC(10, 2) NOT NULL,
  monto_override NUMERIC(10, 2),
  usuario_aprobador_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MANTENIMIENTO
-- ============================================================

CREATE TABLE mantenimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  activo_id UUID NOT NULL REFERENCES activos(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  tipo tipo_mantenimiento NOT NULL,
  estado estado_mantenimiento NOT NULL DEFAULT 'programado',
  titulo VARCHAR(160) NOT NULL,
  descripcion TEXT,
  diagnostico TEXT,
  tareas_realizadas TEXT,
  repuestos_usados JSONB,
  costo_total NUMERIC(10, 2),
  fecha_programada TIMESTAMPTZ,
  fecha_inicio TIMESTAMPTZ,
  fecha_cierre TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ordenes_trabajo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mantenimiento_id UUID NOT NULL REFERENCES mantenimientos(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  descripcion TEXT NOT NULL,
  estado VARCHAR(40) NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAGOS
-- ============================================================

CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  alquiler_id UUID REFERENCES alquileres(id),
  penalidad_id UUID REFERENCES penalidades(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  estado estado_pago NOT NULL DEFAULT 'pendiente',
  monto NUMERIC(12, 2) NOT NULL,
  metodo_pago VARCHAR(60),
  referencia VARCHAR(120),
  fecha_pago TIMESTAMPTZ,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MOVIMIENTOS DE ACTIVO
-- ============================================================

CREATE TABLE movimientos_activo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activo_id UUID NOT NULL REFERENCES activos(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  alquiler_id UUID REFERENCES alquileres(id),
  mantenimiento_id UUID REFERENCES mantenimientos(id),
  tipo tipo_movimiento NOT NULL,
  estado_anterior estado_activo,
  estado_nuevo estado_activo NOT NULL,
  ubicacion_origen TEXT,
  ubicacion_destino TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RECORDATORIOS
-- ============================================================

CREATE TABLE recordatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  tipo tipo_recordatorio NOT NULL,
  canal canal_notificacion NOT NULL DEFAULT 'email',
  destinatario VARCHAR(160) NOT NULL,
  referencia_id UUID,
  referencia_tipo VARCHAR(60),
  asunto VARCHAR(200),
  cuerpo TEXT,
  enviado BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_envio TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ARCHIVOS ADJUNTOS
-- ============================================================

CREATE TABLE archivos_adjuntos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  referencia_id UUID NOT NULL,
  referencia_tipo VARCHAR(60) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  mime_type VARCHAR(80),
  tamano_bytes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDITORÍA
-- ============================================================

CREATE TABLE auditoria_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  entidad VARCHAR(80) NOT NULL,
  entidad_id UUID,
  accion VARCHAR(60) NOT NULL,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Activos
CREATE INDEX idx_activos_tenant ON activos(tenant_id);
CREATE INDEX idx_activos_sucursal ON activos(sucursal_id);
CREATE INDEX idx_activos_estado ON activos(estado);
CREATE INDEX idx_activos_codigo ON activos(codigo_interno);
CREATE INDEX idx_activos_modelo ON activos(modelo_id);

-- Alquileres
CREATE INDEX idx_alquileres_tenant ON alquileres(tenant_id);
CREATE INDEX idx_alquileres_cliente ON alquileres(cliente_id);
CREATE INDEX idx_alquileres_estado ON alquileres(estado);
CREATE INDEX idx_alquileres_fecha_fin ON alquileres(fecha_fin_prevista);

-- Movimientos
CREATE INDEX idx_movimientos_activo ON movimientos_activo(activo_id);
CREATE INDEX idx_movimientos_fecha ON movimientos_activo(created_at);

-- Mantenimientos
CREATE INDEX idx_mantenimientos_activo ON mantenimientos(activo_id);
CREATE INDEX idx_mantenimientos_estado ON mantenimientos(estado);

-- Clientes
CREATE INDEX idx_clientes_tenant ON clientes(tenant_id);
CREATE INDEX idx_clientes_nombre ON clientes USING gin(nombre gin_trgm_ops);

-- Usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);

-- Recordatorios
CREATE INDEX idx_recordatorios_enviado ON recordatorios(enviado, created_at);
CREATE INDEX idx_recordatorios_referencia ON recordatorios(referencia_id);

-- Auditoría
CREATE INDEX idx_auditoria_entidad ON auditoria_eventos(entidad, entidad_id);
CREATE INDEX idx_auditoria_usuario ON auditoria_eventos(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_eventos(created_at);
