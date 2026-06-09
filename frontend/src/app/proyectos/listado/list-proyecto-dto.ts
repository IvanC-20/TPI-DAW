import { ListClienteDTO } from "../clientes/listado/list-cliente-dto";
import { ListTareaDTO } from "../tareas/listado/list-tarea-dto";

export interface ListProyectoDTO {
    id: number;
    nombre: string;
    estado: string;
    cliente: ListClienteDTO;
    fechaFinalizacion: string | null;
    totalTareas: number;
    tareasFinalizadas: number;
    tareas: ListTareaDTO[];
}