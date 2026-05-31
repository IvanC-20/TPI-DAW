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

        const totalTareas = await this.tareasRepository.count();
        const tareasPendientes = await this.tareasRepository.count({ where: { estado: EstadosTareasEnum.PENDIENTE } });
        const tareasFinalizadas = await this.tareasRepository.count({ where: { estado: EstadosTareasEnum.FINALIZADA } });

        const proyectosBaja = await this.proyectosRepository.count({ where: { estado: EstadosProyectosEnum.BAJA } });
        const tareasBaja = await this.tareasRepository.count({ where: { estado: EstadosTareasEnum.BAJA } });

        const totalClientes = await this.clientesRepository.count();
        const clientesActivos = await this.clientesRepository.count({ where: { estado: EstadosClientesEnum.ACTIVO } });
        const clientesBaja = await this.clientesRepository.count({ where: { estado: EstadosClientesEnum.BAJA } });

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
            }
        };
    }

}
