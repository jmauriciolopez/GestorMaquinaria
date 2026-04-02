import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/client';
import { Alquiler, Cliente, Penalidad } from '../types';

export function useAlquileres(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['alquileres', params],
    queryFn: async () => {
      const { data } = await api.get('/alquileres', { params });
      return data;
    },
  });
}

export function useAlquileresVencidos() {
  return useQuery<Alquiler[]>({
    queryKey: ['alquileres', 'vencidos'],
    queryFn: async () => {
      const { data } = await api.get('/alquileres', {
        params: { estado: 'entregado', limit: 100 },
      });
      const items: Alquiler[] = data?.data ?? data ?? [];
      const ahora = new Date();
      return items.filter((a) => new Date(a.fechaFinPrevista) < ahora);
    },
    staleTime: 60_000,
  });
}

export function useProximasDevolucioness() {
  return useQuery<Alquiler[]>({
    queryKey: ['alquileres', 'proximas'],
    queryFn: async () => {
      const { data } = await api.get('/alquileres', {
        params: { estado: 'entregado', limit: 100 },
      });
      const items: Alquiler[] = data?.data ?? data ?? [];
      const ahora  = new Date();
      const en48h  = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);
      return items
        .filter((a) => { const f = new Date(a.fechaFinPrevista); return f >= ahora && f <= en48h; })
        .sort((a, b) => new Date(a.fechaFinPrevista).getTime() - new Date(b.fechaFinPrevista).getTime());
    },
    staleTime: 60_000,
  });
}

export function useAlquiler(id?: string) {
  return useQuery<Alquiler>({
    queryKey: ['alquileres', id],
    queryFn: async () => {
      const { data } = await api.get(`/alquileres/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useClientes(busqueda?: string) {
  return useQuery<Cliente[]>({
    queryKey: ['clientes', busqueda],
    queryFn: async () => {
      const { data } = await api.get('/clientes', {
        params: busqueda ? { busqueda } : {},
      });
      return data?.data ?? data ?? [];
    },
  });
}

export function useCrearAlquiler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      sucursalId: string; clienteId: string;
      fechaInicio: string; fechaFinPrevista: string;
      items: { activoId: string; tarifaId?: string; precioUnitario: number; subtotal: number }[];
      notas?: string;
    }) => {
      const { data } = await api.post('/alquileres', dto);
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alquileres'] });
      queryClient.invalidateQueries({ queryKey: ['activos'] });
    },
  });
}

export function useConfirmarAlquiler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/alquileres/${id}/confirmar`);
      return data?.data ?? data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['alquileres'] });
      queryClient.invalidateQueries({ queryKey: ['alquileres', id] });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: {
      id: string; activoId: string;
      condicionSalida?: string; observaciones?: string;
      horometroInicial?: number; combustibleInicial?: number;
    }) => {
      const { data } = await api.post(`/alquileres/${id}/checkout`, dto);
      return data?.data ?? data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['alquileres'] });
      queryClient.invalidateQueries({ queryKey: ['alquileres', id] });
      queryClient.invalidateQueries({ queryKey: ['activos'] });
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ alquilerId, ...dto }: {
      alquilerId: string; activoId: string;
      condicionRetorno?: string; observaciones?: string;
      tieneDanios?: boolean; tieneRetraso?: boolean; horasRetraso?: number;
      danos?: { descripcion: string; costoEstimado?: number }[];
      horometroFinal?: number; combustibleFinal?: number;
    }) => {
      const { data } = await api.post(`/devoluciones/alquiler/${alquilerId}/checkin`, dto);
      return data?.data ?? data;
    },
    onSuccess: (_, { alquilerId }) => {
      queryClient.invalidateQueries({ queryKey: ['alquileres'] });
      queryClient.invalidateQueries({ queryKey: ['alquileres', alquilerId] });
      queryClient.invalidateQueries({ queryKey: ['activos'] });
      queryClient.invalidateQueries({ queryKey: ['penalidades', alquilerId] });
    },
  });
}

export function usePenalidades(alquilerId?: string) {
  return useQuery<Penalidad[]>({
    queryKey: ['penalidades', alquilerId],
    queryFn: async () => {
      const { data } = await api.get(`/penalidades/alquiler/${alquilerId}`);
      return data?.data ?? data ?? [];
    },
    enabled: !!alquilerId,
  });
}

export function useOverridePenalidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string; montoOverride: number; descripcion?: string }) => {
      const { data } = await api.patch(`/penalidades/${id}/override`, dto);
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penalidades'] });
      queryClient.invalidateQueries({ queryKey: ['alquileres'] });
    },
  });
}
