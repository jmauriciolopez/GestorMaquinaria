import * as XLSX from 'xlsx';
import type { Alquiler } from '../../features/alquileres/types';
import { formatFecha, formatMonto } from '../utils/formato';

export function generarExcelAlquileres(
  alquileres: Alquiler[],
  desde: string,
  hasta: string,
): void {
  const filas = alquileres.map((a, i) => ({
    '#':            i + 1,
    Cliente:        a.cliente?.nombre ?? '—',
    Estado:         a.estado,
    'Fecha inicio': formatFecha(a.fechaInicio),
    'Fin previsto': formatFecha(a.fechaFinPrevista),
    Subtotal:       Number(a.subtotal ?? 0),
    Pagado:         Number(a.totalPagado ?? 0),
    Saldo:          Number(a.subtotal ?? 0) - Number(a.totalPagado ?? 0),
  }));

  const ws = XLSX.utils.json_to_sheet(filas);

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 4 }, { wch: 28 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Alquileres');

  // Hoja resumen
  const totalMonto  = alquileres.reduce((s, a) => s + Number(a.subtotal ?? 0), 0);
  const totalPagado = alquileres.reduce((s, a) => s + Number(a.totalPagado ?? 0), 0);
  const resumen = [
    { Métrica: 'Período',          Valor: `${desde} — ${hasta}` },
    { Métrica: 'Total alquileres', Valor: alquileres.length },
    { Métrica: 'Monto total',      Valor: formatMonto(totalMonto) },
    { Métrica: 'Total cobrado',    Valor: formatMonto(totalPagado) },
    { Métrica: 'Saldo pendiente',  Valor: formatMonto(totalMonto - totalPagado) },
  ];
  const wsResumen = XLSX.utils.json_to_sheet(resumen);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  XLSX.writeFile(wb, `alquileres_${desde}_${hasta}.xlsx`);
}
