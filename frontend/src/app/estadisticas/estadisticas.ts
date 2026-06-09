import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { MessageService } from "primeng/api";
import { Template } from "../template/template";
import { EstadisticasApiClient } from "./estadisticas-api-client";
import { EstadisticasDTO } from "./estadisticas-dto";
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";
import { ColorProgresoPipe } from "../shared/pipes/color-progreso.pipe";

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

    // Valores animados
    aProyectosTotal     = signal(0);
    aProyectosActivos   = signal(0);
    aProyectosFinalizados = signal(0);
    aProyectosBaja      = signal(0);
    aTareasTotal        = signal(0);
    aTareasPendientes   = signal(0);
    aTareasFinalizadas  = signal(0);
    aTareasBaja         = signal(0);
    aClientesTotal      = signal(0);
    aClientesActivos    = signal(0);
    aClientesBaja       = signal(0);

    private animar(signal: WritableSignal<number>, destino: number, duracion = 1000): void {
        const pasos = 40;
        const intervalo = duracion / pasos;
        let actual = 0;
        const timer = setInterval(() => {
            actual++;
            signal.set(Math.round((actual / pasos) * destino));
            if (actual >= pasos) {
                signal.set(destino);
                clearInterval(timer);
            }
        }, intervalo);
    }

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
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#cbd5e1' } },
            x: { grid: { color: '#cbd5e1' } }
        }
    };

    readonly opcionesBarrasHorizontales = {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, max: 100, ticks: { callback: (v: any) => v + '%' }, grid: { color: '#cbd5e1' } },
            y: { grid: { color: '#cbd5e1' } }
        }
    };

    readonly opcionesBarrasApiladas = {
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } } },
        scales: {
            x: { stacked: true, grid: { color: '#cbd5e1' } },
            y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#cbd5e1' } }
        }
    };

    ngOnInit(): void {
        this.estadisticasApiClient.obtenerEstadisticas().subscribe({
            next: (data) => {
                this.estadisticas.set(data);

                this.animar(this.aProyectosTotal, data.proyectos.total);
                this.animar(this.aProyectosActivos, data.proyectos.activos);
                this.animar(this.aProyectosFinalizados, data.proyectos.finalizados);
                this.animar(this.aProyectosBaja, data.proyectos.baja);
                this.animar(this.aTareasTotal, data.tareas.total);
                this.animar(this.aTareasPendientes, data.tareas.pendientes);
                this.animar(this.aTareasFinalizadas, data.tareas.finalizadas);
                this.animar(this.aTareasBaja, data.tareas.baja);
                this.animar(this.aClientesTotal, data.clientes.total);
                this.animar(this.aClientesActivos, data.clientes.activos);
                this.animar(this.aClientesBaja, data.clientes.baja);

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
                        data: data.progresoProyectos.map(p => p.total === 0 ? 0 : p.progreso === 0 ? 2 : p.progreso),
                        backgroundColor: data.progresoProyectos.map(p => new ColorProgresoPipe().transform({ totalTareas: p.total, tareasFinalizadas: p.finalizadas })),
                        borderRadius: 4
                    }]
                });

                this.datosTareasPorProyecto.set({
                    labels: nombres,
                    datasets: [
                        { label: 'Pendientes', data: data.progresoProyectos.map(p => p.pendientes), backgroundColor: '#d97706', borderColor: '#ffffff', borderWidth: 2 },
                        { label: 'Finalizadas', data: data.progresoProyectos.map(p => p.finalizadas), backgroundColor: '#2563eb', borderColor: '#ffffff', borderWidth: 2 },
                        { label: 'Baja', data: data.progresoProyectos.map(p => p.total - p.pendientes - p.finalizadas), backgroundColor: '#dc2626', borderColor: '#ffffff', borderWidth: 2 }
                    ]
                });
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener las estadísticas' });
            }
        });
    }

}
