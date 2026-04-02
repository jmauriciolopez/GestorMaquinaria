import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { Cliente, ClientePayload } from '../types';

export const useClientes = (busqueda?: string) =>
  useQuery<Cliente[]>({
    queryKey: ['clientes', busqueda ?? ''],
    queryFn: async () => {
      const { data } = await apiClient.get('/clientes', {
        params: busqueda ? { busqueda } : {},
      });
      return data?.data ?? data ?? [];
    },
  });

export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ClientePayload) => {
      const { data } = await apiClient.post('/clientes', payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};

export const useUpdateCliente = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ClientePayload) => {
      if (!id) throw new Error('ID de cliente requerido para actualizar');
      const { data } = await apiClient.patch(`/clientes/${id}`, payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};

export const useDeleteCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/clientes/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};
