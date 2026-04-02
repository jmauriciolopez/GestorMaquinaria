export class AuthResponseDto {
  accessToken!: string;
  usuario!: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    tenantId: string;
    sucursalId?: string;
  };
}
