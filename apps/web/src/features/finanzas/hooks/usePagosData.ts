import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Pago, CreatePagoDto, FinanceStats } from '../types';

export function usePagosAlquiler(alquilerId: string) {
  return useQuery<Pago[]>({
    queryKey: ['pagos', alquilerId],
    queryFn: async () => {
      const { data } = await api.get(`/pagos/alquiler/${alquilerId}`);
      return data;
    },
    enabled: !!alquilerId,
  });
}

export function useRegistrarPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePagoDto) => {
      const { data } = await api.post('/pagos', dto);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pagos', variables.alquilerId] });
      queryClient.invalidateQueries({ queryKey: ['alquileres', variables.alquilerId] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
    },
  });
}

export function useFinanceStats() {
  return useQuery<FinanceStats>({
    queryKey: ['finance-stats'],
    queryFn: async () => {
      const { data } = await api.get('/pagos/dashboard');
      return data;
    },
  });
}
