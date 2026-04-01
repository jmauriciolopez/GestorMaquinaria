import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alquiler } from '../alquileres/alquiler.entity';
import { Pago } from '../pagos/pago.entity';

// Importación específica para evitar problemas de tipos con PDFKit
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Alquiler) private readonly alquilerRepo: Repository<Alquiler>,
    @InjectRepository(Pago) private readonly pagoRepo: Repository<Pago>,
  ) {}

  async generateContract(alquilerId: string, tenantId: string): Promise<Buffer> {
    const alquiler = await this.alquilerRepo.findOne({
      where: { id: alquilerId, tenantId },
      relations: ['cliente', 'items', 'items.activo'],
    });

    if (!alquiler) throw new NotFoundException('Alquiler no encontrado');

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header Space for Logo
      doc.rect(50, 45, 120, 100).strokeColor('#cccccc').stroke();
      doc.fontSize(10).fillColor('#999999').text('ESPACIO PARA LOGO', 60, 90);

      // Branch Info
      doc.fillColor('#000000').fontSize(20).text('CONTRATO DE ALQUILER', 200, 50, { align: 'right' });
      doc.fontSize(10).text(`Nro. Contrato: ${alquiler.id.split('-')[0].toUpperCase()}`, 200, 80, { align: 'right' });
      doc.text(`Fecha Emisión: ${new Date().toLocaleDateString()}`, 200, 95, { align: 'right' });

      doc.moveDown(4);
      doc.strokeColor('#000000').lineWidth(1).moveTo(50, 160).lineTo(550, 160).stroke();

      // Client Data
      doc.fontSize(12).text('DATOS DEL CLIENTE', 50, 180);
      doc.fontSize(10).text(`Nombre: ${alquiler.cliente.nombre}`, 50, 200);
      doc.text(`Documento: ${alquiler.cliente.documento}`, 50, 215);
      doc.text(`Teléfono: ${alquiler.cliente.telefono || 'N/A'}`, 50, 230);

      // Items Table
      doc.fontSize(12).text('EQUIPOS ALQUILADOS', 50, 270);
      let y = 290;
      doc.fontSize(10).text('Ítem / Equipo', 50, y, { bold: true });
      doc.text('Serie', 230, y);
      doc.text('Precio Unit.', 350, y, { align: 'right' });
      doc.text('Subtotal', 450, y, { align: 'right' });
      
      y += 20;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;

      alquiler.items.forEach((item) => {
        doc.text(item.activo.codigoInterno, 50, y);
        doc.text(item.activo.numeroSerie || '-', 230, y);
        doc.text(`$${Number(item.precioUnitario).toLocaleString()}`, 350, y, { align: 'right' });
        doc.text(`$${Number(item.subtotal).toLocaleString()}`, 450, y, { align: 'right' });
        y += 15;
      });

      // Totals
      y += 20;
      doc.strokeColor('#eeeeee').moveTo(350, y).lineTo(550, y).stroke();
      y += 10;
      doc.fontSize(11).text('TOTAL ESTIMADO:', 350, y);
      doc.text(`USD ${Number(alquiler.subtotal).toLocaleString()}`, 450, y, { align: 'right' });

      // Legal Terms (Generic Text)
      doc.moveDown(4);
      doc.fontSize(12).text('TÉRMINOS Y CONDICIONES (PRUEBA)', 50);
      doc.fontSize(8).fillColor('#666666').text(
        'Este es un texto genérico de prueba para el contrato de alquiler. ' +
        'El arrendatario declara recibir la maquinaria en perfecto estado de funcionamiento y se compromete a devolverla en iguales condiciones. ' +
        'Cualquier daño, rotura o faltante será facturado al cliente según los costos de reposición vigentes. ' +
        'El cliente es responsable exclusivo del uso adecuado de la maquinaria y de contar con personal capacitado para su operación.'
      , { align: 'justify' });

      // Signatures
      y = doc.page.height - 150;
      doc.strokeColor('#000000').moveTo(50, y).lineTo(200, y).stroke();
      doc.moveTo(350, y).lineTo(500, y).stroke();
      doc.fontSize(10).fillColor('#000000').text('Firma Empresa', 50, y + 10, { width: 150, align: 'center' });
      doc.text('Firma Cliente', 350, y + 10, { width: 150, align: 'center' });

      doc.end();
    });
  }

  async generatePaymentReceipt(pagoId: string, tenantId: string): Promise<Buffer> {
    const pago = await this.pagoRepo.findOne({
      where: { id: pagoId, tenantId },
      relations: ['alquiler', 'alquiler.cliente'],
    });

    if (!pago) throw new NotFoundException('Pago no encontrado');

    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A5', layout: 'landscape', margin: 30 });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Border and Header
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      doc.fontSize(18).text('COMPROBANTE DE PAGO', 30, 40, { align: 'center' });
      doc.fontSize(10).text(`Nro: ${pago.id.split('-')[0].toUpperCase()}`, 30, 60, { align: 'center' });

      doc.moveDown(2);
      doc.fontSize(12).text(`Recibimos de: ${pago.alquiler.cliente.nombre}`, 40);
      doc.text(`La suma de: USD ${Number(pago.monto).toLocaleString()}`, 40);
      doc.text(`Concepto: Pago Alquiler #${pago.alquiler.id.split('-')[0].toUpperCase()}`, 40);
      doc.text(`Método: ${pago.metodoPago.toUpperCase()}`, 40);

      doc.moveDown(2);
      doc.fontSize(10).text(`Fecha: ${new Date(pago.fecha).toLocaleDateString()}`, 40, doc.page.height - 70);
      doc.text('Sello y Firma', doc.page.width - 150, doc.page.height - 70);

      doc.end();
    });
  }
}
