import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { Activo, AssetStats, EstadoActivo } from '../types';

export const useActivos = (params: Record<string, string> = {}) =>
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
      return data as Activo;
    },
    enabled: !!id,
  });

export const useActivoTimeline = (id?: string) =>
  useQuery({
    queryKey: ['activos', id, 'timeline'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/movimientos-activo/activo/${id}`);
      return data;
    },
    enabled: !!id,
  });

// Stats calculadas desde el listado real — no requiere endpoint /stats en el backend
export const useAssetStats = () =>
  useQuery<AssetStats>({
    queryKey: ['activos', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/activos', { params: { limit: 500 } });
      const items: Activo[] = data?.data ?? data ?? [];
      const counts = items.reduce((acc: Record<string, number>, a: Activo) => {
        acc[a.estado] = (acc[a.estado] ?? 0) + 1;
        return acc;
      }, {});
      return {
        disponible:    counts[EstadoActivo.DISPONIBLE]        ?? 0,
        alquiler:      counts[EstadoActivo.ALQUILADO]         ?? 0,
        mantenimiento: counts[EstadoActivo.EN_MANTENIMIENTO]  ?? 0,
        fuera_servicio:counts[EstadoActivo.FUERA_DE_SERVICIO] ?? 0,
        reservado:     counts[EstadoActivo.RESERVADO]         ?? 0,
        total: items.length,
      };
    },
    staleTime: 60_000,
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
