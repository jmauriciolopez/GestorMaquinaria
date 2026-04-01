import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1700000001000 implements MigrationInterface {
  name = 'CreateTables1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sucursales (
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nombre VARCHAR(60) NOT NULL UNIQUE,
        descripcion TEXT,
        permisos JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS clientes (
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categorias_activo (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        nombre VARCHAR(120) NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS modelos_activo (
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS activos (
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
        valor_adquisicion NUMERIC(12,2),
        notas TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ,
        UNIQUE (tenant_id, codigo_interno)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS activos`);
    await queryRunner.query(`DROP TABLE IF EXISTS modelos_activo`);
    await queryRunner.query(`DROP TABLE IF EXISTS categorias_activo`);
    await queryRunner.query(`DROP TABLE IF EXISTS clientes`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuarios`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles`);
    await queryRunner.query(`DROP TABLE IF EXISTS sucursales`);
  }
}
