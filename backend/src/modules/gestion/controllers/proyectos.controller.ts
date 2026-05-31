import { Body, Controller, Get, Param, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { CreateProyectoDto } from "../dtos/input/create-proyecto.dto";
import { UpdateProyectoDto } from "../dtos/input/update-proyecto.dto";
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { ListProyectoDTO } from "../dtos/output/list-proyecto.dto";
import { ProyectoDTO } from "../dtos/output/proyecto.dto";
import { ProyectosService } from "../services/proyectos.service";
import { ProyectosExportacionesService } from "../services/proyectos-exportaciones.service";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";
import type { Response } from "express";

@Controller('proyectos')
export class ProyectosController {

    constructor(
        private readonly proyectosService: ProyectosService,
        private readonly proyectosExportacionesService: ProyectosExportacionesService
    ) { }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Post()
    async crearProyecto(@Body() dto: CreateProyectoDto): Promise<{ id: number }> {
        return await this.proyectosService.crearProyecto(dto);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Put(':id')
    async actualizarProyecto(@Body() dto: UpdateProyectoDto, @Param('id') id: number): Promise<void> {
        await this.proyectosService.actualizarProyecto(id, dto);
    }


    @ApiBearerAuth()
    @ApiOkResponse({ type: ListProyectoDTO, isArray: true })
    @ApiQuery({ name: 'nombre', required: false })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosProyectosEnum })
    @UseGuards(AuthGuard)
    @Get()
    async obtenerProyectos(
        @Query('nombre') nombre?: string,
        @Query('estado') estado?: EstadosProyectosEnum
    ): Promise<ListProyectoDTO[]> {
        return await this.proyectosService.obtenerProyectos(nombre, estado);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get(':id')
    async obtenerProyecto(@Param('id') id: number): Promise<ProyectoDTO> {
        return await this.proyectosService.obtenerProyecto(id);
    }

    @ApiBearerAuth()
    @ApiQuery({ name: 'nombre', required: false })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosProyectosEnum })
    @UseGuards(AuthGuard)
    @Get('exportar/csv')
    async exportarCsv(
        @Query('nombre') nombre?: string,
        @Query('estado') estado?: EstadosProyectosEnum,
        @Res() res?: Response
    ): Promise<void> {
        const csv = await this.proyectosExportacionesService.exportarProyectosCsv(nombre, estado);
        res!.setHeader('Content-Type', 'text/csv');
        res!.setHeader('Content-Disposition', 'attachment; filename="proyectos.csv"');
        res!.send(csv);
    }


    @ApiBearerAuth()
    @ApiQuery({ name: 'nombre', required: false })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosProyectosEnum })
    @UseGuards(AuthGuard)
    @Get('exportar/json')
    async exportarJson(
        @Query('nombre') nombre?: string,
        @Query('estado') estado?: EstadosProyectosEnum,
        @Res() res?: Response
    ): Promise<void> {
        const json = await this.proyectosExportacionesService.exportarProyectosJson(nombre, estado);
        res!.setHeader('Content-Type', 'application/json');
        res!.setHeader('Content-Disposition', 'attachment; filename="proyectos.json"');
        res!.send(json);
    }


    @ApiBearerAuth()
    @ApiQuery({ name: 'nombre', required: false })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosProyectosEnum })
    @UseGuards(AuthGuard)
    @Get('exportar/excel')
    async exportarExcel(
        @Query('nombre') nombre?: string,
        @Query('estado') estado?: EstadosProyectosEnum,
        @Res() res?: Response
    ): Promise<void> {
        const buffer = await this.proyectosExportacionesService.exportarProyectosExcel(nombre, estado);
        res!.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res!.setHeader('Content-Disposition', 'attachment; filename="proyectos.xlsx"');
        res!.send(buffer);
    }

    @ApiBearerAuth()
    @ApiQuery({ name: 'nombre', required: false })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosProyectosEnum })
    @UseGuards(AuthGuard)
    @Get('exportar/pdf')
    async exportarPdf(
        @Query('nombre') nombre?: string,
        @Query('estado') estado?: EstadosProyectosEnum,
        @Res() res?: Response
    ): Promise<void> {
        const buffer = await this.proyectosExportacionesService.exportarProyectosPDF(nombre, estado);
        res!.setHeader('Content-Type', 'application/pdf');
        res!.setHeader('Content-Disposition', 'attachment; filename="proyectos.pdf"');
        res!.send(buffer);
    }
}