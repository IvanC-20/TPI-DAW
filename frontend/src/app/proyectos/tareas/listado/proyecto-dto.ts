import { EstadosProyectosEnum } from "../../../proyectos/estados-proyectos-enum";
import { ListTareaDTO } from "./list-tarea-dto";

export interface ProyectoDTO{
    nombre: string;
    cliente: string;
    estado: EstadosProyectosEnum;
    fechaFinalizacion: string | null;
    tareas: ListTareaDTO[];
}