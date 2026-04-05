import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Alquiler } from '../../features/alquileres/types';
import { formatFecha, formatMonto } from '../utils/formato';

export function generarPDFAlquileres(
  alquileres: Alquiler[],
  desde: string,
  hasta: string,
): void {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Encabezado
  doc.setFontSize(16);
  doc.text('Reporte de Alquileres', 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Período: ${desde} — ${hasta}`, 14, 23);
  doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 14, 29);
  doc.setTextColor(0);

  // Totales resumen
  const totalMonto = alquileres.reduce((s, a) => s + Number(a.subtotal ?? 0), 0);
  const totalPagado = alquileres.reduce((s, a) => s + Number(a.totalPagado ?? 0), 0);
  doc.setFontSize(10);
  doc.text(`Total alquileres: ${alquileres.length}`, 14, 37);
  doc.text(`Monto total: ${formatMonto(totalMonto)}`, 70, 37);
  doc.text(`Total cobrado: ${formatMonto(totalPagado)}`, 140, 37);

  // Tabla
  autoTable(doc, {
    startY: 42,
    head: [['#', 'Cliente', 'Estado', 'Inicio', 'Fin previsto', 'Subtotal', 'Pagado', 'Saldo']],
    body: alquileres.map((a, i) => [
      i + 1,
      a.cliente?.nombre ?? '—',
      a.estado,
      formatFecha(a.fechaInicio),
      formatFecha(a.fechaFinPrevista),
      formatMonto(Number(a.subtotal ?? 0)),
      formatMonto(Number(a.totalPagado ?? 0)),
      formatMonto(Number(a.subtotal ?? 0) - Number(a.totalPagado ?? 0)),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
  });

  doc.save(`alquileres_${desde}_${hasta}.pdf`);
}
