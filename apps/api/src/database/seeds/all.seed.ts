import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Rol } from '../../roles/rol.entity';
import { Sucursal } from '../../sucursales/sucursal.entity';
import { Usuario } from '../../usuarios/usuario.entity';

type SeedRole = {
  nombre: string;
  descripcion?: string;
  permisos: string[];
};

type SeedSucursal = {
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
};

type SeedUser = {
  nombre: string;
  email: string;
  password: string;
  rolNombre: string;
  activo?: boolean;
};

const DEFAULT_TENANT_ID = '11111111-1111-1111-1111-111111111111';
const tenantId = process.env.SEED_TENANT_ID ?? DEFAULT_TENANT_ID;

const rolesToSeed: SeedRole[] = [
  { nombre: 'admin', descripcion: 'Administrador', permisos: ['*'] },
  {
    nombre: 'operador',
    descripcion: 'Operador',
    permisos: ['activos.read', 'alquileres.read', 'alquileres.write'],
  },
];

const mainSucursal: SeedSucursal = {
  nombre: 'Sucursal Principal',
  direccion: 'Centro',
  telefono: '+57 3000000000',
  email: 'sucursal@maquinaria.com',
};

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
  const roleRepo = AppDataSource.getRepository(Rol);
  const roleMap = new Map<string, Rol>();

  for (const data of rolesToSeed) {
    let role = await roleRepo.findOne({ where: { nombre: data.nombre } });
    if (!role) {
      role = roleRepo.create(data);
      role = await roleRepo.save(role);
      console.log(`Rol creado: ${role.nombre}`);
    } else {
      role.descripcion = data.descripcion;
      role.permisos = data.permisos;
      role = await roleRepo.save(role);
      console.log(`Rol actualizado: ${role.nombre}`);
    }
    roleMap.set(role.nombre, role);
  }

  return roleMap;
}

async function ensureMainSucursal() {
  const sucursalRepo = AppDataSource.getRepository(Sucursal);
  let sucursal = await sucursalRepo.findOne({
    where: { tenantId, nombre: mainSucursal.nombre },
  });

  if (!sucursal) {
    sucursal = sucursalRepo.create({
      tenantId,
      ...mainSucursal,
      activa: true,
    });
    sucursal = await sucursalRepo.save(sucursal);
    console.log(`Sucursal creada: ${sucursal.nombre}`);
  } else {
    sucursal.direccion = mainSucursal.direccion;
    sucursal.telefono = mainSucursal.telefono;
    sucursal.email = mainSucursal.email;
    sucursal.activa = true;
    sucursal = await sucursalRepo.save(sucursal);
    console.log(`Sucursal actualizada: ${sucursal.nombre}`);
  }

  return sucursal;
}

async function ensureUsers(roleMap: Map<string, Rol>, sucursalId: string) {
  const userRepo = AppDataSource.getRepository(Usuario);

  for (const data of usersToSeed) {
    const role = roleMap.get(data.rolNombre);
    if (!role) {
      throw new Error(`Rol no encontrado para ${data.email}: ${data.rolNombre}`);
    }

    const existing = await userRepo.findOne({
      where: { tenantId, email: data.email },
    });
    const passwordHash = await bcrypt.hash(data.password, 10);

    if (!existing) {
      const created = userRepo.create({
        tenantId,
        sucursalId,
        rolId: role.id,
        nombre: data.nombre,
        email: data.email,
        passwordHash,
        activo: data.activo ?? true,
      });
      await userRepo.save(created);
      console.log(`Usuario creado: ${created.email}`);
      continue;
    }

    existing.nombre = data.nombre;
    existing.sucursalId = sucursalId;
    existing.rolId = role.id;
    existing.passwordHash = passwordHash;
    existing.activo = data.activo ?? true;
    await userRepo.save(existing);
    console.log(`Usuario actualizado: ${existing.email}`);
  }
}

async function run() {
  await AppDataSource.initialize();
  try {
    const roleMap = await ensureRoles();
    const sucursal = await ensureMainSucursal();
    await ensureUsers(roleMap, sucursal.id);
    console.log(`Seed ALL completado para tenantId=${tenantId}`);
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((error) => {
  console.error('Error ejecutando seed ALL:', error);
  process.exit(1);
});
