import * as XLSX from 'xlsx';
import type { Pago } from '../../features/finanzas/types';
import type { Penalidad } from '../../features/alquileres/types';
import { formatFecha, formatMonto } from '../utils/formato';

export function generarExcelFinanciero(
  pagos: Pago[],
  penalidades: Penalidad[],
  desde: string,
  hasta: string,
): void {
  const wb = XLSX.utils.book_new();

  // Hoja Pagos
  const filasPagos = pagos.map((p, i) => ({
    '#':         i + 1,
    Fecha:       formatFecha(p.fecha),
    Alquiler:    p.alquilerId?.slice(-6).toUpperCase() ?? '—',
    Método:      p.metodoPago ?? '—',
    Monto:       Number(p.monto ?? 0),
    'Estado MP': p.mpStatus ?? '—',
    Referencia:  p.referencia ?? '—',
  }));
  const wsPagos = XLSX.utils.json_to_sheet(filasPagos);
  wsPagos['!cols'] = [
    { wch: 4 }, { wch: 14 }, { wch: 12 }, { wch: 16 },
    { wch: 14 }, { wch: 12 }, { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPagos, 'Pagos');

  // Hoja Penalidades
  const filasPenalidades = penalidades.map((p, i) => ({
    '#':             i + 1,
    Alquiler:        p.alquilerId?.slice(-6).toUpperCase() ?? '—',
    Motivo:          p.motivo ?? '—',
    'Monto original': Number(p.montoOriginal ?? 0),
    'Monto final':    Number(p.montoFinal ?? 0),
    Estado:          p.estado ?? '—',
  }));
  const wsPenalidades = XLSX.utils.json_to_sheet(filasPenalidades);
  wsPenalidades['!cols'] = [
    { wch: 4 }, { wch: 12 }, { wch: 28 },
    { wch: 16 }, { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPenalidades, 'Penalidades');

  // Hoja Resumen
  const totalPagos       = pagos.reduce((s, p) => s + Number(p.monto ?? 0), 0);
  const totalPenalidades = penalidades.reduce((s, p) => s + Number(p.montoFinal ?? 0), 0);
  const resumen = [
    { Métrica: 'Período',           Valor: `${desde} — ${hasta}` },
    { Métrica: 'Total pagos',       Valor: pagos.length },
    { Métrica: 'Monto cobrado',     Valor: formatMonto(totalPagos) },
    { Métrica: 'Total penalidades', Valor: penalidades.length },
    { Métrica: 'Monto penalidades', Valor: formatMonto(totalPenalidades) },
    { Métrica: 'Resultado neto',    Valor: formatMonto(totalPagos - totalPenalidades) },
  ];
  const wsResumen = XLSX.utils.json_to_sheet(resumen);
  wsResumen['!cols'] = [{ wch: 22 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  XLSX.writeFile(wb, `financiero_${desde}_${hasta}.xlsx`);
}
