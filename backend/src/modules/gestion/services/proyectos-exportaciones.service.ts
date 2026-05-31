import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, ILike } from "typeorm";
import { Proyecto } from "../entities/proyecto.entity";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class ProyectosExportacionesService {

    constructor(@InjectRepository(Proyecto) private readonly repository: Repository<Proyecto>) { }

    async exportarProyectosCsv(nombre?: string, estado?: EstadosProyectosEnum): Promise<string> {

        const where: FindOptionsWhere<Proyecto> = {};
        if (nombre) where.nombre = ILike(`%${nombre}%`);
        if (estado) where.estado = estado;

        const proyectos: Proyecto[] = await this.repository.find({ where, relations: ['cliente', 'tareas'], order: { id: 'ASC' } });

        const titulo = 'Proyectos';
        const encabezado = 'ID,Nombre,Estado,Cliente,Fecha de Finalización,Tareas';

        const filas = proyectos.map((p) => {
            const cliente = p.cliente ? p.cliente.nombre : '';
            const fechaFinalizacion = p.fechaFinalizacion ?? '';
            const tareas = p.tareas?.map(t => `${t.descripcion} (${t.estado})`).join(', ') ?? '';
            return `${p.id},"${p.nombre}",${p.estado},"${cliente}","${fechaFinalizacion}","${tareas}"`;
        });

        return [titulo, encabezado, ...filas].join('\n');
    }
    
    async exportarProyectosJson(nombre?: string, estado?: EstadosProyectosEnum): Promise<string> {

        const where: FindOptionsWhere<Proyecto> = {};
        if (nombre) where.nombre = ILike(`%${nombre}%`);
        if (estado) where.estado = estado;

        const proyectos: Proyecto[] = await this.repository.find({
            where,
            relations: ['cliente', 'tareas'],
            order: { id: 'ASC' }
        });

        const data = proyectos.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            estado: p.estado,
            cliente: p.cliente ? { id: p.cliente.id, nombre: p.cliente.nombre } : null,
            fechaFinalizacion: p.fechaFinalizacion ?? null,
            tareas: p.tareas?.map(t => ({ id: t.id, descripcion: t.descripcion, estado: t.estado })) ?? []
        }));

        return JSON.stringify(data, null, 2);
    }

    async exportarProyectosExcel(nombre?: string, estado?: EstadosProyectosEnum): Promise<ArrayBuffer> {

        const where: FindOptionsWhere<Proyecto> = {};
        if (nombre) where.nombre = ILike(`%${nombre}%`);
        if (estado) where.estado = estado;

        const proyectos: Proyecto[] = await this.repository.find({
            where,
            relations: ['cliente', 'tareas'],
            order: { id: 'ASC' }
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Proyectos');

        // Encabezados
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Estado', key: 'estado', width: 15 },
            { header: 'Cliente', key: 'cliente', width: 25 },
            { header: 'Fecha Finalización', key: 'fechaFinalizacion', width: 20 },
            { header: 'Tareas', key: 'tareas', width: 50 },
        ];

        // Estilo del encabezado
        sheet.getRow(1).font = { bold: true };

        // Filas
        proyectos.forEach((p) => {
            sheet.addRow({
                id: p.id,
                nombre: p.nombre,
                estado: p.estado,
                cliente: p.cliente?.nombre ?? '',
                fechaFinalizacion: p.fechaFinalizacion ?? '',
                tareas: p.tareas?.map(t => `${t.descripcion} (${t.estado})`).join(', ') ?? ''
            });
        });

        return workbook.xlsx.writeBuffer();
    }

    async exportarProyectosPDF(nombre?: string, estado?: EstadosProyectosEnum): Promise<Buffer> {

        const where: FindOptionsWhere<Proyecto> = {};
        if (nombre) where.nombre = ILike(`%${nombre}%`);
        if (estado) where.estado = estado;

        const proyectos: Proyecto[] = await this.repository.find({
            where,
            relations: ['cliente', 'tareas'],
            order: { id: 'ASC' }
        });

        const doc = new PDFDocument({ margin: 40 });
        const chunks: Buffer[] = [];

        return new Promise<Buffer>((resolve, reject) => {
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Título
            doc.fontSize(18).text('Listado de Proyectos', { align: 'center' });
            doc.moveDown();

            // Filas
            proyectos.forEach((p, i) => {
                doc.fontSize(11).text(`${i + 1}. ${p.nombre}`);
                doc.fontSize(10)
                    .text(`   Estado: ${p.estado}`)
                    .text(`   Cliente: ${p.cliente?.nombre ?? '-'}`)
                    .text(`   Fecha de finalización: ${p.fechaFinalizacion ?? '-'}`);
                doc.moveDown(0.5);
            });

            doc.end();
        });
    }
}
