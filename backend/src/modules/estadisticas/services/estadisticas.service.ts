import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Proyecto } from "../../gestion/entities/proyecto.entity";
import { Tarea } from "../../gestion/entities/tarea.entity";
import { Cliente } from "../../gestion/entities/cliente.entity";
import { EstadosProyectosEnum } from "../../gestion/enums/estados-proyectos.enum";
import { EstadosTareasEnum } from "../../gestion/enums/estados-tareas.enum";
import { EstadosClientesEnum } from "../../gestion/enums/estados-clientes.enum";

@Injectable()
export class EstadisticasService {

    constructor(
        @InjectRepository(Proyecto) private readonly proyectosRepository: Repository<Proyecto>,
        @InjectRepository(Tarea) private readonly tareasRepository: Repository<Tarea>,
        @InjectRepository(Cliente) private readonly clientesRepository: Repository<Cliente>
    ) { }

    async obtenerEstadisticas(): Promise<object> {

        const totalProyectos = await this.proyectosRepository.count();
        const proyectosActivos = await this.proyectosRepository.count({ where: { estado: EstadosProyectosEnum.ACTIVO } });
        const proyectosFinalizados = await this.proyectosRepository.count({ where: { estado: EstadosProyectosEnum.FINALIZADO } });
        const proyectosBaja = await this.proyectosRepository.count({ where: { estado: EstadosProyectosEnum.BAJA } });

        const totalTareas = await this.tareasRepository.count();
        const tareasPendientes = await this.tareasRepository.count({ where: { estado: EstadosTareasEnum.PENDIENTE } });
        const tareasFinalizadas = await this.tareasRepository.count({ where: { estado: EstadosTareasEnum.FINALIZADA } });
        const tareasBaja = await this.tareasRepository.count({ where: { estado: EstadosTareasEnum.BAJA } });

        const totalClientes = await this.clientesRepository.count();
        const clientesActivos = await this.clientesRepository.count({ where: { estado: EstadosClientesEnum.ACTIVO } });
        const clientesBaja = await this.clientesRepository.count({ where: { estado: EstadosClientesEnum.BAJA } });

        const proyectosConTareas = await this.proyectosRepository.find({
            where: { estado: EstadosProyectosEnum.ACTIVO },
            relations: ['tareas'],
            order: { nombre: 'ASC' }
        });

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        let plazoRetrasados = 0;
        let plazoVenceHoy = 0;
        let plazoEnTiempo = 0;
        let plazoSinFecha = 0;

        const progresoProyectos = proyectosConTareas.map(p => {
            if (p.fechaFinalizacion) {
                const fecha = new Date(p.fechaFinalizacion + 'T00:00:00');
                const dias = Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                if (dias < 0) plazoRetrasados++;
                else if (dias === 0) plazoVenceHoy++;
                else plazoEnTiempo++;
            } else {
                plazoSinFecha++;
            }

            const total = p.tareas?.length ?? 0;
            const finalizadas = p.tareas?.filter(t => t.estado === EstadosTareasEnum.FINALIZADA).length ?? 0;
            const pendientes = p.tareas?.filter(t => t.estado === EstadosTareasEnum.PENDIENTE).length ?? 0;
            return {
                nombre: p.nombre,
                progreso: total > 0 ? Math.round((finalizadas / total) * 100) : 0,
                pendientes,
                finalizadas,
                total
            };
        });

        return {
            proyectos: {
                total: totalProyectos,
                activos: proyectosActivos,
                finalizados: proyectosFinalizados,
                baja: proyectosBaja
            },
            tareas: {
                total: totalTareas,
                pendientes: tareasPendientes,
                finalizadas: tareasFinalizadas,
                baja: tareasBaja
            },
            clientes: {
                total: totalClientes,
                activos: clientesActivos,
                baja: clientesBaja
            },
            plazo: {
                retrasados: plazoRetrasados,
                venceHoy: plazoVenceHoy,
                enTiempo: plazoEnTiempo,
                sinFecha: plazoSinFecha
            },
            progresoProyectos
        };
    }

}
