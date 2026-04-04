import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMercadoPagoCampos1700000003000 implements MigrationInterface {
  name = 'AddMercadoPagoCampos1700000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar método mercadopago al enum si no existe
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE metodo_pago ADD VALUE IF NOT EXISTS 'mercadopago';
      EXCEPTION WHEN others THEN NULL; END $$
    `).catch(() => {
      // Si el enum no existe como tipo PostgreSQL, lo maneja TypeORM
    });

    // Agregar columnas MP a pagos
    await queryRunner.query(`
      ALTER TABLE pagos
        ADD COLUMN IF NOT EXISTS mp_preference_id TEXT,
        ADD COLUMN IF NOT EXISTS mp_payment_id TEXT,
        ADD COLUMN IF NOT EXISTS mp_status VARCHAR(40),
        ADD COLUMN IF NOT EXISTS mp_external_reference TEXT,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    `);

    // Índice para búsqueda por external_reference
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_pagos_mp_external_ref
      ON pagos(mp_external_reference)
      WHERE mp_external_reference IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_pagos_mp_external_ref`);
    await queryRunner.query(`
      ALTER TABLE pagos
        DROP COLUMN IF EXISTS mp_preference_id,
        DROP COLUMN IF EXISTS mp_payment_id,
        DROP COLUMN IF EXISTS mp_status,
        DROP COLUMN IF EXISTS mp_external_reference,
        DROP COLUMN IF EXISTS updated_at
    `);
  }
}
