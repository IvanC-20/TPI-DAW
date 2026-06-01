import { ListClienteDTO } from "../clientes/listado/list-cliente-dto";

export interface ListProyectoDTO {
    seleccionado?: boolean;
    id: number;
    nombre: string;
    estado: string;
    cliente: ListClienteDTO;
    fechaFinalizacion: string | null;
}