import { Controller, Get, Param, Res, UseGuards, Header } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reports')
@UseGuards(RolesGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('contract/:id')
  @Roles('admin', 'operador')
  @Header('Content-Type', 'application/pdf')
  async getContract(
    @Param('id') id: string,
    @GetUsuario() u: UsuarioActivo,
    @Res() res: Response,
  ) {
    const pdf = await this.service.generateContract(id, u.tenantId);
    res.setHeader('Content-Disposition', `attachment; filename=contrato-${id.substring(0, 8)}.pdf`);
    res.send(pdf);
  }

  @Get('receipt/:id')
  @Roles('admin', 'operador')
  @Header('Content-Type', 'application/pdf')
  async getReceipt(
    @Param('id') id: string,
    @GetUsuario() u: UsuarioActivo,
    @Res() res: Response,
  ) {
    const pdf = await this.service.generatePaymentReceipt(id, u.tenantId);
    res.setHeader('Content-Disposition', `attachment; filename=recibo-pago-${id.substring(0, 8)}.pdf`);
    res.send(pdf);
  }
}
