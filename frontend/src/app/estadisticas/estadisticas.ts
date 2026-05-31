import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { MessageService } from "primeng/api";
import { Template } from "../template/template";
import { EstadisticasApiClient } from "./estadisticas-api-client";
import { EstadisticasDTO } from "./estadisticas-dto";
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";

@Component({
    selector: "app-estadisticas",
    templateUrl: "./estadisticas.html",
    styleUrls: ["./estadisticas.css"],
    imports: [Template, CardModule, ChartModule]
})
export class Estadisticas implements OnInit {

    private readonly messageService: MessageService = inject(MessageService);
    private readonly estadisticasApiClient: EstadisticasApiClient = inject(EstadisticasApiClient);

    estadisticas: WritableSignal<EstadisticasDTO | null> = signal(null);

    datosProyectos: WritableSignal<object> = signal({});
    datosTareas: WritableSignal<object> = signal({});

    readonly opcionesGrafico = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 20,
                    usePointStyle: false
                }
            }
        }
    };

    ngOnInit(): void {
        this.estadisticasApiClient.obtenerEstadisticas().subscribe({
            next: (data) => {
                this.estadisticas.set(data);
                this.datosProyectos.set({
                    labels: ['Activos', 'Finalizados', 'Baja'],
                    datasets: [{
                        data: [data.proyectos.activos, data.proyectos.finalizados, data.proyectos.baja],
                        backgroundColor: ['#16a34a', '#2563eb', '#dc2626']
                    }]
                });
                this.datosTareas.set({
                    labels: ['Pendientes', 'Finalizadas', 'Baja'],
                    datasets: [{
                        data: [data.tareas.pendientes, data.tareas.finalizadas, data.tareas.baja],
                        backgroundColor: ['#d97706', '#2563eb', '#dc2626']
                    }]
                });
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener las estadísticas' });
            }
        });
    }

}
