import { useAuth } from '../auth/AuthContext';
import apiClient from '../api/client';

export const useReports = () => {
  const { user } = useAuth();

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadContract = async (alquilerId: string) => {
    try {
      const response = await apiClient.get(`/reports/contract/${alquilerId}`, {
        responseType: 'blob',
      });
      downloadBlob(response.data, `contrato-${alquilerId.split('-')[0]}.pdf`);
    } catch (error) {
      console.error('Error downloading contract:', error);
      alert('Error al descargar el contrato. Por favor intente de nuevo.');
    }
  };

  const downloadReceipt = async (pagoId: string) => {
    try {
      const response = await apiClient.get(`/reports/receipt/${pagoId}`, {
        responseType: 'blob',
      });
      downloadBlob(response.data, `recibo-${pagoId.split('-')[0]}.pdf`);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Error al descargar el recibo. Por favor intente de nuevo.');
    }
  };

  return {
    downloadContract,
    downloadReceipt,
  };
};
