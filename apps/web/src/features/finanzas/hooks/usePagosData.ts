import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/client';
import { Pago, CreatePagoDto, FinanceStats } from '../types';

// Un solo fetch de todos los pagos del tenant — sin N+1
export function usePagos(limit = 100) {
  return useQuery<Pago[]>({
    queryKey: ['pagos', 'all', limit],
    queryFn: async () => {
      const { data } = await api.get('/pagos', { params: { limit } });
      return data?.data ?? data ?? [];
    },
    staleTime: 60_000,
  });
}

export function usePagosAlquiler(alquilerId: string) {
  return useQuery<Pago[]>({
    queryKey: ['pagos', alquilerId],
    queryFn: async () => {
      const { data } = await api.get(`/pagos/alquiler/${alquilerId}`);
      return data?.data ?? data ?? [];
    },
    enabled: !!alquilerId,
  });
}

export function useRegistrarPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreatePagoDto) => {
      const { data } = await api.post('/pagos', dto);
      return data?.data ?? data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['alquileres', variables.alquilerId] });
    },
  });
}

export function useFinanceStats() {
  return useQuery<FinanceStats>({
    queryKey: ['finance-stats'],
    queryFn: async () => {
      const { data } = await api.get('/pagos/dashboard');
      return data?.data ?? data;
    },
    staleTime: 60_000,
  });
}
