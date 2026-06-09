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
    datosClientes: WritableSignal<object> = signal({});
    datosPlazo: WritableSignal<object> = signal({});
    datosProgreso: WritableSignal<object> = signal({});
    datosTareasPorProyecto: WritableSignal<object> = signal({});

    readonly opcionesDonut = {
        plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } }
        }
    };

    readonly opcionesBarras = {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    };

    readonly opcionesBarrasHorizontales = {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, max: 100, ticks: { callback: (v: any) => v + '%' } } }
    };

    readonly opcionesBarrasApiladas = {
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } } },
        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } } }
    };

    ngOnInit(): void {
        this.estadisticasApiClient.obtenerEstadisticas().subscribe({
            next: (data) => {
                this.estadisticas.set(data);

                this.datosProyectos.set({
                    labels: ['Activos', 'Finalizados', 'Baja'],
                    datasets: [{ data: [data.proyectos.activos, data.proyectos.finalizados, data.proyectos.baja], backgroundColor: ['#16a34a', '#2563eb', '#dc2626'] }]
                });

                this.datosTareas.set({
                    labels: ['Pendientes', 'Finalizadas', 'Baja'],
                    datasets: [{ data: [data.tareas.pendientes, data.tareas.finalizadas, data.tareas.baja], backgroundColor: ['#d97706', '#2563eb', '#dc2626'] }]
                });

                this.datosClientes.set({
                    labels: ['Activos', 'Baja'],
                    datasets: [{ data: [data.clientes.activos, data.clientes.baja], backgroundColor: ['#16a34a', '#dc2626'] }]
                });

                this.datosPlazo.set({
                    labels: ['Retrasados', 'Vence hoy', 'En tiempo', 'Sin fecha'],
                    datasets: [{
                        data: [data.plazo.retrasados, data.plazo.venceHoy, data.plazo.enTiempo, data.plazo.sinFecha],
                        backgroundColor: ['#dc2626', '#d97706', '#16a34a', '#9ca3af']
                    }]
                });

                const nombres = data.progresoProyectos.map(p => p.nombre.length > 15 ? p.nombre.substring(0, 15) + '…' : p.nombre);

                this.datosProgreso.set({
                    labels: nombres,
                    datasets: [{
                        label: 'Progreso %',
                        data: data.progresoProyectos.map(p => p.progreso),
                        backgroundColor: data.progresoProyectos.map(p => p.progreso >= 71 ? '#16a34a' : p.progreso >= 31 ? '#d97706' : '#9ca3af'),
                        borderRadius: 4
                    }]
                });

                this.datosTareasPorProyecto.set({
                    labels: nombres,
                    datasets: [
                        { label: 'Pendientes', data: data.progresoProyectos.map(p => p.pendientes), backgroundColor: '#d97706' },
                        { label: 'Finalizadas', data: data.progresoProyectos.map(p => p.finalizadas), backgroundColor: '#2563eb' },
                        { label: 'Baja', data: data.progresoProyectos.map(p => p.total - p.pendientes - p.finalizadas), backgroundColor: '#dc2626' }
                    ]
                });
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener las estadísticas' });
            }
        });
    }

}
