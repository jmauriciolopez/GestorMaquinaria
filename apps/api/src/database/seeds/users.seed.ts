import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Rol } from '../../roles/rol.entity';
import { Usuario } from '../../usuarios/usuario.entity';

type SeedUser = {
  nombre: string;
  email: string;
  password: string;
  rolNombre: string;
  activo?: boolean;
};

const DEFAULT_TENANT_ID = '11111111-1111-1111-1111-111111111111';
const tenantId = process.env.SEED_TENANT_ID ?? DEFAULT_TENANT_ID;

const usersToSeed: SeedUser[] = [
  {
    nombre: 'Administrador',
    email: 'admin@maquinaria.com',
    password: 'Admin123!',
    rolNombre: 'admin',
    activo: true,
  },
  {
    nombre: 'Operador',
    email: 'operador@maquinaria.com',
    password: 'Operador123!',
    rolNombre: 'operador',
    activo: true,
  },
];

async function ensureRoles() {
  const repo = AppDataSource.getRepository(Rol);
  const rolesBase = [
    { nombre: 'admin', descripcion: 'Administrador', permisos: ['*'] },
    {
      nombre: 'operador',
      descripcion: 'Operador',
      permisos: ['activos.read', 'alquileres.read', 'alquileres.write'],
    },
  ];

  const roleMap = new Map<string, Rol>();
  for (const roleData of rolesBase) {
    let role = await repo.findOne({ where: { nombre: roleData.nombre } });
    if (!role) {
      role = repo.create(roleData);
      role = await repo.save(role);
      console.log(`Rol creado: ${role.nombre}`);
    }
    roleMap.set(role.nombre, role);
  }

  return roleMap;
}

async function seedUsers() {
  await AppDataSource.initialize();
  try {
    const roles = await ensureRoles();
    const repo = AppDataSource.getRepository(Usuario);

    for (const userData of usersToSeed) {
      const rol = roles.get(userData.rolNombre);
      if (!rol) {
        throw new Error(`No existe rol para ${userData.email}: ${userData.rolNombre}`);
      }

      const existing = await repo.findOne({
        where: { tenantId, email: userData.email },
      });

      const passwordHash = await bcrypt.hash(userData.password, 10);
      if (existing) {
        existing.nombre = userData.nombre;
        existing.rolId = rol.id;
        existing.passwordHash = passwordHash;
        existing.activo = userData.activo ?? true;
        await repo.save(existing);
        console.log(`Usuario actualizado: ${existing.email}`);
      } else {
        const created = repo.create({
          tenantId,
          nombre: userData.nombre,
          email: userData.email,
          passwordHash,
          activo: userData.activo ?? true,
          rolId: rol.id,
        });
        await repo.save(created);
        console.log(`Usuario creado: ${created.email}`);
      }
    }

    console.log(`Seed de usuarios completado para tenantId=${tenantId}`);
  } finally {
    await AppDataSource.destroy();
  }
}

seedUsers().catch((error) => {
  console.error('Error ejecutando seed de usuarios:', error);
  process.exit(1);
});
