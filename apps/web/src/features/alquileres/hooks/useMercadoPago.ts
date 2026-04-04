import { useMutation } from '@tanstack/react-query';
import api from '../../../api/client';

interface PreferenciaResult {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  pagoId: string;
}

export function usePagarConMP() {
  return useMutation({
    mutationFn: async (dto: {
      alquilerId: string;
      monto: number;
      descripcion: string;
    }): Promise<PreferenciaResult> => {
      const { data } = await api.post('/pagos/mp/preference', dto);
      return data?.data ?? data;
    },
  });
}
