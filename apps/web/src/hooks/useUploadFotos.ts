import { useMutation } from '@tanstack/react-query';
import api from '../api/client';

export function useUploadFotos() {
  return useMutation({
    mutationFn: async (archivos: { base64: string; mimeType: string }[]): Promise<string[]> => {
      const { data } = await api.post('/storage/upload', { archivos });
      return (data as any)?.data?.urls ?? (data as any)?.urls ?? [];
    },
  });
}

// Convierte un File del browser a base64
export async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve({ base64: reader.result as string, mimeType: file.type });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
