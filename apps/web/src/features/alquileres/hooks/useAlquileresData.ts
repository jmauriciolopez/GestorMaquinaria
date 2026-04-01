import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Alquiler, Cliente, Penalidad, EstadoAlquiler } from '../types';

export function useAlquileres() {
  return useQuery<Alquiler[]>({
    queryKey: ['alquileres'],
    queryFn: async () => {
      const { data } = await api.get('/alquileres');
      return data;
    },
  });
}

export function useAlquiler(id?: string) {
  return useQuery<Alquiler>({
    queryKey: ['alquileres', id],
    queryFn: async () => {
      const { data } = await api.get(`/alquileres/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useClientes() {
  return useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data } = await api.get('/clientes');
      return data;
    },
  });
}

export function useConfirmarAlquiler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/alquileres/${id}/confirmar`);
      return data;
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
    mutationFn: async ({ id, ...dto }: { id: string; activoId: string; horometroInicial: number; combustibleInicial: number; observaciones?: string }) => {
      const { data } = await api.post(`/alquileres/${id}/checkout`, dto);
      return data;
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
    mutationFn: async ({ alquilerId, ...dto }: { alquilerId: string; activoId: string; horometroFinal: number; combustibleFinal: number; observaciones?: string; danos?: any[] }) => {
      const { data } = await api.post(`/devoluciones/alquiler/${alquilerId}/checkin`, dto);
      return data;
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
      return data;
    },
    enabled: !!alquilerId,
  });
}

export function useOverridePenalidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string; montoFinal: number; motivo: string }) => {
      const { data } = await api.patch(`/penalidades/${id}/override`, dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penalidades'] });
      queryClient.invalidateQueries({ queryKey: ['alquileres'] });
    },
  });
}
