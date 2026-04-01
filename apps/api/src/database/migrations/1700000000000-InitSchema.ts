import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extensiones
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);

    // Enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE estado_activo AS ENUM (
          'disponible','reservado','alquilado','en_transito',
          'en_mantenimiento','fuera_de_servicio','perdido'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE estado_alquiler AS ENUM (
          'borrador','confirmado','entregado','devuelto_parcial',
          'devuelto','cancelado','vencido'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE estado_reserva AS ENUM (
          'pendiente','confirmada','cancelada','expirada','convertida'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE tipo_mantenimiento AS ENUM ('preventivo','correctivo');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE estado_mantenimiento AS ENUM (
          'programado','en_curso','completado','cancelado'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE tipo_penalidad AS ENUM (
          'retraso','danio','faltante','horas_extra','otro'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE estado_penalidad AS ENUM (
          'pendiente','aprobada','anulada','pagada'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE tipo_movimiento AS ENUM (
          'check_out','check_in','traslado','entrada_mantenimiento',
          'salida_mantenimiento','baja','ajuste'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE estado_pago AS ENUM (
          'pendiente','pagado','parcial','reembolsado','anulado'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE tipo_recordatorio AS ENUM (
          'vencimiento_alquiler','devolucion_pendiente',
          'mantenimiento_proximo','reserva_pendiente','pago_pendiente'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE canal_notificacion AS ENUM ('email','whatsapp','sms','push');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE IF EXISTS canal_notificacion`);
    await queryRunner.query(`DROP TYPE IF EXISTS tipo_recordatorio`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_pago`);
    await queryRunner.query(`DROP TYPE IF EXISTS tipo_movimiento`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_penalidad`);
    await queryRunner.query(`DROP TYPE IF EXISTS tipo_penalidad`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_mantenimiento`);
    await queryRunner.query(`DROP TYPE IF EXISTS tipo_mantenimiento`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_reserva`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_alquiler`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_activo`);
  }
}
