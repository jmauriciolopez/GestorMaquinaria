import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { Activo, AssetStats } from '../types';

export const useActivos = (params: any = {}) => {
  return useQuery({
    queryKey: ['activos', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/activos', { params });
      return data; // Assumes PaginatedResult<Activo>
    },
  });
};

export const useActivo = (id: string | undefined) => {
  return useQuery({
    queryKey: ['activos', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get(`/activos/${id}`);
      return data as Activo;
    },
    enabled: !!id,
  });
};

export const useActivoTimeline = (id: string | undefined) => {
  return useQuery({
    queryKey: ['activos', id, 'timeline'],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await apiClient.get(`/movimientos-activo/activo/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useAssetStats = () => {
  return useQuery({
    queryKey: ['activos', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/activos/stats');
      return data as AssetStats;
    },
  });
};

export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data } = await apiClient.get('/categorias-activo');
      return data;
    },
  });
};

export const useModelos = (categoriaId?: string) => {
  return useQuery({
    queryKey: ['modelos', categoriaId],
    queryFn: async () => {
      const params = categoriaId ? { categoriaId } : {};
      const { data } = await apiClient.get('/modelos-activo', { params });
      return data;
    },
  });
};

export const useSucursales = () => {
  return useQuery({
    queryKey: ['sucursales'],
    queryFn: async () => {
      const { data } = await apiClient.get('/sucursales');
      return data;
    },
  });
};

export const useMutateActivo = (id?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      if (id) {
        return apiClient.patch(`/activos/${id}`, data);
      }
      return apiClient.post('/activos', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activos'] });
    },
  });
};
