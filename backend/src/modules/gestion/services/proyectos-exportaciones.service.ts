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

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const margin = 40;
      const pageWidth = doc.page.width - margin * 2;

      // Columnas: proporciones relativas
      const cols = [
        { label: 'ID', width: 0.05 },
        { label: 'Nombre', width: 0.22 },
        { label: 'Estado', width: 0.12 },
        { label: 'Cliente', width: 0.18 },
        { label: 'Fecha Finalización', width: 0.15 },
        { label: 'Tareas', width: 0.28 },
      ].map(c => ({ ...c, width: c.width * pageWidth }));

      const rowHeight = 20;
      const headerHeight = 24;
      const fontSize = 8;

      // Título
      doc.fontSize(16).font('Helvetica-Bold').text('Listado de Proyectos', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica').fillColor('#666666')
        .text(`Generado el ${new Date().toLocaleDateString('es-AR')}`, { align: 'center' });
      doc.moveDown(1);

      const drawRow = (y: number, values: string[], isHeader = false, isEven = false) => {
        let x = margin;
        const height = isHeader ? headerHeight : rowHeight;

        // Fondo
        if (isHeader) {
          doc.rect(x, y, pageWidth, height).fill('#2c3e50');
        } else if (isEven) {
          doc.rect(x, y, pageWidth, height).fill('#f5f5f5');
        }

        // Texto y bordes
        cols.forEach((col, i) => {
          // Borde
          doc.rect(x, y, col.width, height).stroke('#cccccc');

          // Texto
          doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(fontSize)
            .fillColor(isHeader ? '#ffffff' : '#333333')
            .text(values[i] ?? '', x + 4, y + (height - fontSize) / 2, {
              width: col.width - 8,
              ellipsis: true,
              lineBreak: false
            });

          x += col.width;
        });
      };

      // Encabezado
      let y = doc.y;
      drawRow(y, cols.map(c => c.label), true);
      y += headerHeight;

      // Filas de datos
      proyectos.forEach((p, i) => {
        // Nueva página si no entra
        if (y + rowHeight > doc.page.height - margin) {
          doc.addPage();
          y = margin;
          drawRow(y, cols.map(c => c.label), true);
          y += headerHeight;
        }

        const tareas = p.tareas?.map(t => `${t.descripcion} (${t.estado})`).join(', ') ?? '-';

        drawRow(y, [
          String(p.id),
          p.nombre,
          p.estado,
          p.cliente?.nombre ?? '-',
          p.fechaFinalizacion ?? '-',
          tareas
        ], false, i % 2 === 0);

        y += rowHeight;
      });

      doc.end();
    });
  }
}
