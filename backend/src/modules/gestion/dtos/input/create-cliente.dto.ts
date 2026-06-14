import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEmail } from "class-validator";

export class CreateClienteDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty() 
    telefono!: string;

    @ApiProperty()
    @IsEmail() 
    @IsNotEmpty()
    correo!: string;

}