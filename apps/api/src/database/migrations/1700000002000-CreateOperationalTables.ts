import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOperationalTables1700000002000 implements MigrationInterface {
  name = 'CreateOperationalTables1700000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tarifas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        modelo_id UUID REFERENCES modelos_activo(id),
        activo_id UUID REFERENCES activos(id),
        nombre VARCHAR(120) NOT NULL,
        precio_por_hora NUMERIC(10,2),
        precio_por_dia NUMERIC(10,2),
        precio_por_semana NUMERIC(10,2),
        precio_por_mes NUMERIC(10,2),
        deposito_garantia NUMERIC(10,2) DEFAULT 0,
        vigente BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS reservas (
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS reserva_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
        activo_id UUID NOT NULL REFERENCES activos(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS alquileres (
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
        subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
        total_penalidades NUMERIC(12,2) NOT NULL DEFAULT 0,
        total_pagado NUMERIC(12,2) NOT NULL DEFAULT 0,
        notas TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS alquiler_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        alquiler_id UUID NOT NULL REFERENCES alquileres(id) ON DELETE CASCADE,
        activo_id UUID NOT NULL REFERENCES activos(id),
        tarifa_id UUID REFERENCES tarifas(id),
        precio_unitario NUMERIC(10,2) NOT NULL,
        subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS entregas_activo (
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS devoluciones_activo (
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
        horas_retraso NUMERIC(8,2) DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS inspecciones_activo (
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS danos_activo (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        activo_id UUID NOT NULL REFERENCES activos(id),
        devolucion_id UUID REFERENCES devoluciones_activo(id),
        inspeccion_id UUID REFERENCES inspecciones_activo(id),
        descripcion TEXT NOT NULL,
        costo_estimado NUMERIC(10,2),
        fotos JSONB,
        resuelto BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS penalidades (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        alquiler_id UUID NOT NULL REFERENCES alquileres(id),
        activo_id UUID REFERENCES activos(id),
        tipo tipo_penalidad NOT NULL,
        estado estado_penalidad NOT NULL DEFAULT 'pendiente',
        descripcion TEXT,
        monto NUMERIC(10,2) NOT NULL,
        monto_override NUMERIC(10,2),
        usuario_aprobador_id UUID REFERENCES usuarios(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mantenimientos (
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
        costo_total NUMERIC(10,2),
        fecha_programada TIMESTAMPTZ,
        fecha_inicio TIMESTAMPTZ,
        fecha_cierre TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ordenes_trabajo (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        mantenimiento_id UUID NOT NULL REFERENCES mantenimientos(id),
        usuario_id UUID NOT NULL REFERENCES usuarios(id),
        descripcion TEXT NOT NULL,
        estado VARCHAR(40) NOT NULL DEFAULT 'pendiente',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS movimientos_activo (
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pagos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        alquiler_id UUID REFERENCES alquileres(id),
        penalidad_id UUID REFERENCES penalidades(id),
        usuario_id UUID NOT NULL REFERENCES usuarios(id),
        estado estado_pago NOT NULL DEFAULT 'pendiente',
        monto NUMERIC(12,2) NOT NULL,
        metodo_pago VARCHAR(60),
        referencia VARCHAR(120),
        fecha_pago TIMESTAMPTZ,
        notas TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS recordatorios (
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS auditoria_eventos (
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
      )
    `);

    // Índices
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_activos_tenant ON activos(tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_activos_estado ON activos(estado)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_activos_codigo ON activos(codigo_interno)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_alquileres_tenant ON alquileres(tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_alquileres_cliente ON alquileres(cliente_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_alquileres_estado ON alquileres(estado)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_alquileres_fecha_fin ON alquileres(fecha_fin_prevista)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_movimientos_activo ON movimientos_activo(activo_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_activo(created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_mantenimientos_activo ON mantenimientos(activo_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_clientes_tenant ON clientes(tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes USING gin(nombre gin_trgm_ops)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_recordatorios_enviado ON recordatorios(enviado, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_usuarios_tenant ON usuarios(tenant_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'auditoria_eventos', 'recordatorios', 'pagos', 'movimientos_activo',
      'ordenes_trabajo', 'mantenimientos', 'penalidades', 'danos_activo',
      'inspecciones_activo', 'devoluciones_activo', 'entregas_activo',
      'alquiler_items', 'alquileres', 'reserva_items', 'reservas',
      'tarifas',
    ];
    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
  }
}
