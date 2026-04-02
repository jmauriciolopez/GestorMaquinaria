import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { Activo, AssetStats, EstadoActivo, MovimientoActivo } from '../types';

export const useActivos = (params: Record<string, string | number> = {}) =>
  useQuery({
    queryKey: ['activos', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/activos', { params });
      return data;
    },
  });

export const useActivo = (id?: string) =>
  useQuery({
    queryKey: ['activos', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/activos/${id}`);
      return data?.data ?? data as Activo;
    },
    enabled: !!id,
  });

export const useActivoTimeline = (id?: string) =>
  useQuery({
    queryKey: ['activos', id, 'timeline'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/movimientos-activo/activo/${id}`);
      return (data?.data ?? data ?? []) as MovimientoActivo[];
    },
    enabled: !!id,
  });

export const useAssetStats = () =>
  useQuery<AssetStats>({
    queryKey: ['activos', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/activos/stats');
      const raw: Record<string, number> = data?.data ?? data ?? {};
      return {
        disponible:     raw[EstadoActivo.DISPONIBLE]        ?? 0,
        alquiler:       raw[EstadoActivo.ALQUILADO]         ?? 0,
        mantenimiento:  raw[EstadoActivo.EN_MANTENIMIENTO]  ?? 0,
        fuera_servicio: raw[EstadoActivo.FUERA_DE_SERVICIO] ?? 0,
        reservado:      raw[EstadoActivo.RESERVADO]         ?? 0,
        total: Object.values(raw).reduce((a, b) => a + b, 0),
      };
    },
    staleTime: 30_000,
  });

export const useActivosDisponibles = () =>
  useQuery<Activo[]>({
    queryKey: ['activos', 'disponibles'],
    queryFn: async () => {
      const { data } = await apiClient.get('/activos', {
        params: { estado: 'disponible', limit: 200 },
      });
      return (data?.data ?? data ?? []) as Activo[];
    },
  });

export const useCategorias = () =>
  useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data } = await apiClient.get('/categorias-activo');
      return data?.data ?? data ?? [];
    },
    staleTime: 300_000,
  });

export const useModelos = (categoriaId?: string) =>
  useQuery({
    queryKey: ['modelos', categoriaId],
    queryFn: async () => {
      const { data } = await apiClient.get('/modelos-activo', {
        params: categoriaId ? { categoriaId } : {},
      });
      return data?.data ?? data ?? [];
    },
    staleTime: 300_000,
  });

export const useSucursales = () =>
  useQuery({
    queryKey: ['sucursales'],
    queryFn: async () => {
      const { data } = await apiClient.get('/sucursales');
      return data?.data ?? data ?? [];
    },
    staleTime: 300_000,
  });

export const useMutateActivo = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Activo>) => {
      if (id) return apiClient.patch(`/activos/${id}`, payload);
      return apiClient.post('/activos', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activos'] });
    },
  });
};

export const useDeleteActivo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/activos/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activos'] });
    },
  });
};
