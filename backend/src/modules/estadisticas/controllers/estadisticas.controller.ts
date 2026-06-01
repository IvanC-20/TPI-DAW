import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { EstadisticasService } from '../services/estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  async obtenerEstadisticas(): Promise<object> {
    return await this.estadisticasService.obtenerEstadisticas();
  }
}
