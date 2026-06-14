import { ApiProperty } from "@nestjs/swagger";
import { EstadosClientesEnum } from "../../enums/estados-clientes.enum";

export class ListClienteDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    nombre!: string;

    @ApiProperty()
    telefono!: string;

    @ApiProperty()
    correo!: string;

    @ApiProperty()
    estado!: EstadosClientesEnum;

}