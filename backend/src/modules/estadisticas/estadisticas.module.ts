import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Proyecto } from "../gestion/entities/proyecto.entity";
import { Tarea } from "../gestion/entities/tarea.entity";
import { Cliente } from "../gestion/entities/cliente.entity";
import { EstadisticasService } from "./services/estadisticas.service";
import { EstadisticasController } from "./controllers/estadisticas.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Proyecto, Tarea, Cliente]),
        AuthModule
    ],
    controllers: [EstadisticasController],
    providers: [EstadisticasService]
})
export class EstadisticasModule { }
