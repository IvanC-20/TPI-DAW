import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProyectoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  idCliente?: number | null;

  @ApiProperty({ required: false, example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  fechaFinalizacion?: string | null;
}
