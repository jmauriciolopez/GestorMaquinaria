import apiClient from './client';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
};

export const activosApi = {
  buscar: (codigo: string) =>
    apiClient.get('/activos', { params: { busqueda: codigo } }),
  findOne: (id: string) => apiClient.get(`/activos/${id}`),
};

export const alquileresApi = {
  findAll: (params?: Record<string, string>) =>
    apiClient.get('/alquileres', { params }),
  findOne: (id: string) => apiClient.get(`/alquileres/${id}`),
  checkOut: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/alquileres/${id}/checkout`, data),
};

export const devolucionesApi = {
  checkIn: (alquilerId: string, data: Record<string, unknown>) =>
    apiClient.post(`/devoluciones/alquiler/${alquilerId}/checkin`, data),
};

export const movimientosApi = {
  historial: (activoId: string) =>
    apiClient.get(`/movimientos-activo/activo/${activoId}`),
};
