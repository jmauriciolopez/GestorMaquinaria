import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Pago } from '../../features/finanzas/types';
import type { Penalidad } from '../../features/alquileres/types';
import { formatFecha, formatMonto } from '../utils/formato';

export function generarPDFFinanciero(
  pagos: Pago[],
  penalidades: Penalidad[],
  desde: string,
  hasta: string,
): void {
  const doc = new jsPDF({ orientation: 'portrait' });

  // Encabezado
  doc.setFontSize(16);
  doc.text('Reporte Financiero', 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Período: ${desde} — ${hasta}`, 14, 23);
  doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 14, 29);
  doc.setTextColor(0);

  // Resumen
  const totalCobrado    = pagos.reduce((s, p) => s + Number(p.monto ?? 0), 0);
  const totalPenalidades = penalidades.reduce((s, p) => s + Number(p.montoFinal ?? 0), 0);

  doc.setFillColor(37, 99, 235);
  doc.setTextColor(255);
  doc.rect(14, 35, 182, 8, 'F');
  doc.setFontSize(9);
  doc.text('RESUMEN', 16, 40.5);
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Pagos recibidos: ${pagos.length}`, 14, 50);
  doc.text(`Total cobrado: ${formatMonto(totalCobrado)}`, 14, 57);
  doc.text(`Penalidades: ${penalidades.length}`, 110, 50);
  doc.text(`Monto penalidades: ${formatMonto(totalPenalidades)}`, 110, 57);

  // Tabla pagos
  doc.setFontSize(12);
  doc.text('Pagos', 14, 68);
  autoTable(doc, {
    startY: 72,
    head: [['Fecha', 'Alquiler', 'Método', 'Monto', 'Estado MP']],
    body: pagos.map(p => [
      formatFecha(p.fecha),
      p.alquilerId?.slice(-6).toUpperCase() ?? '—',
      p.metodoPago ?? '—',
      formatMonto(Number(p.monto ?? 0)),
      p.mpStatus ?? '—',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
  });

  // Tabla penalidades
  const finalY = (doc as any).lastAutoTable?.finalY ?? 150;
  doc.setFontSize(12);
  doc.text('Penalidades', 14, finalY + 12);
  autoTable(doc, {
    startY: finalY + 16,
    head: [['Alquiler', 'Motivo', 'Monto original', 'Monto final', 'Estado']],
    body: penalidades.map(p => [
      p.alquilerId?.slice(-6).toUpperCase() ?? '—',
      p.motivo ?? '—',
      formatMonto(Number(p.montoOriginal ?? 0)),
      formatMonto(Number(p.montoFinal ?? 0)),
      p.estado ?? '—',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [220, 38, 38] },
    alternateRowStyles: { fillColor: [255, 241, 242] },
  });

  doc.save(`financiero_${desde}_${hasta}.pdf`);
}
