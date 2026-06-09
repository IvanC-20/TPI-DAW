import { Component, effect, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { MessageService } from "primeng/api";
import { ListProyectoDTO } from "./list-proyecto-dto";
import { ProyectosListadoApiClient } from "./proyectos-listado-api-client";
import { TableModule } from 'primeng/table';
import { ButtonModule } from "primeng/button";
import { Template } from "../../template/template";
import { TooltipModule } from 'primeng/tooltip';
import { GestionProyecto } from "../gestion/gestion-proyecto";
import { GestionProyectoApiClient } from "../gestion/gestion-proyecto-api-client";
import { GestionTareaApiClient } from "../tareas/gestion/gestion-tarea-api-client";
import { FormsModule } from "@angular/forms";
import { SelectModule } from "primeng/select";
import { EstadosProyectosEnum } from "../estados-proyectos-enum";
import { InputTextModule } from "primeng/inputtext";
import { Router } from "@angular/router";
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { EstadoFechaPipe } from "../../shared/pipes/estado-fecha.pipe";
import { DiasRestantesPipe } from "../../shared/pipes/dias-restantes.pipe";
import { ColorProgresoPipe } from "../../shared/pipes/color-progreso.pipe";


@Component({
  selector: "app-proyectos-listado",
  templateUrl: "./proyectos-listado.html",
  styleUrls: ["./proyectos-listado.css"],
  imports: [TableModule, ButtonModule, Template, TooltipModule,
    GestionProyecto, FormsModule, SelectModule, InputTextModule, MenuModule,
    EstadoFechaPipe, DiasRestantesPipe, ColorProgresoPipe]
})
export class ProyectosListado implements OnInit {

  private readonly messageService: MessageService = inject(MessageService);
  private readonly proyectosListadoApiClient: ProyectosListadoApiClient = inject(ProyectosListadoApiClient);
  private readonly gestionProyectoApiClient: GestionProyectoApiClient = inject(GestionProyectoApiClient);
  private readonly gestionTareaApiClient: GestionTareaApiClient = inject(GestionTareaApiClient);
  private readonly router: Router = inject(Router);

  proyectos: WritableSignal<ListProyectoDTO[]> = signal([]);
  dialogVisible: WritableSignal<boolean> = signal(false);
  proyectoSeleccionado: WritableSignal<ListProyectoDTO | null> = signal<ListProyectoDTO | null>(null);

  filtroPorNombre: WritableSignal<string> = signal('');
  filtroPorEstado: WritableSignal<string | null> = signal(null);

  readonly opciones: { label: string; value: string | null }[] = [
    { label: 'Todos', value: null },
    ...Object.values(EstadosProyectosEnum).map((e) => ({ label: e, value: e }))
  ];

  constructor() {
    effect(() => {
      if (!this.dialogVisible()) {
        this.refrescarProyectos();
      }
    });
  }

  ngOnInit(): void {
    this.refrescarProyectos();
  }

  refrescarProyectos(): void {
    this.proyectosListadoApiClient.buscarProyectos(
      this.filtroPorNombre() || undefined,
      this.filtroPorEstado() || undefined
    ).subscribe({
      next: (data) => {
        this.proyectos.set(data);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener los proyectos' });
      }
    });
  }

  buscar(): void {
    this.refrescarProyectos();
  }

  limpiarFiltros(): void {
    this.filtroPorNombre.set('');
    this.filtroPorEstado.set(null);
    this.refrescarProyectos();
  }

  crearProyecto(): void {
    this.dialogVisible.set(true);
  }

  editarProyecto(proyecto: ListProyectoDTO): void {
    this.dialogVisible.set(true);
    this.proyectoSeleccionado.set(proyecto);
  }

  duplicarProyecto(proyecto: ListProyectoDTO): void {
    const dto = {
      nombre: `${proyecto.nombre} - copia ${new Date().toLocaleDateString('es-AR')}`,
      idCliente: proyecto.cliente?.id ?? null,
      fechaFinalizacion: null
    };
    this.gestionProyectoApiClient.crearProyecto(dto).subscribe({
      next: ({ id }) => {
        const tareas = proyecto.tareas ?? [];
        if (tareas.length === 0) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto duplicado correctamente.' });
          this.refrescarProyectos();
          return;
        }
        let completadas = 0;
        for (const tarea of tareas) {
          this.gestionTareaApiClient.crearTarea(id, { descripcion: tarea.descripcion }).subscribe({
            next: () => {
              completadas++;
              if (completadas === tareas.length) {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto duplicado con sus tareas.' });
                this.refrescarProyectos();
              }
            }
          });
        }
      },
      error: (err) => {
        const detail = err.error?.statusCode >= 400 && err.error?.statusCode < 500
          ? err.error.message
          : 'Error al duplicar el proyecto.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
      }
    });
  }

  gestionarTareas(proyecto: ListProyectoDTO): void {
    this.router.navigateByUrl(`/proyectos/${proyecto.id}/tareas`);
  }

  copiarAlPortapapeles(proyecto: ListProyectoDTO): void {
    const texto = [
      `Proyecto`,
      `Nombre: ${proyecto.nombre}`,
      `Cliente: ${proyecto.cliente?.nombre || '-'}`,
      `Estado: ${proyecto.estado}`,
      `Fecha de finalización: ${proyecto.fechaFinalizacion || '-'}`,
      `Estado del plazo: ${new DiasRestantesPipe().transform(proyecto).texto}`,
      `Tareas: ${proyecto.tareas?.length ? proyecto.tareas.map(t => `${t.descripcion} (${t.estado})`).join(', ') : 'Sin tareas'}`
    ].join('\n');

    navigator.clipboard.writeText(texto).then(() => {
      this.messageService.add({ severity: 'success', summary: 'Copiado', detail: 'Datos copiados al portapapeles' });
    });
  }

  // Exportando datos
  opcionesExportar: MenuItem[] = [
    { label: 'CSV', icon: 'pi pi-file', command: () => this.exportar('csv', 'proyectos.csv') },
    { label: 'JSON', icon: 'pi pi-code', command: () => this.exportar('json', 'proyectos.json') },
    { label: 'Excel', icon: 'pi pi-file-excel', command: () => this.exportar('excel', 'proyectos.xlsx') },
    { label: 'PDF', icon: 'pi pi-file-pdf', command: () => this.exportar('pdf', 'proyectos.pdf') },
  ];
  exportar(formato: 'csv' | 'json' | 'excel' | 'pdf', nombreArchivo: string): void {
    const nombre = this.filtroPorNombre() || undefined;
    const estado = this.filtroPorEstado() || undefined;

    const request$ = {
      csv: this.proyectosListadoApiClient.exportarCSV(nombre, estado),
      json: this.proyectosListadoApiClient.exportarJSON(nombre, estado),
      excel: this.proyectosListadoApiClient.exportarExcel(nombre, estado),
      pdf: this.proyectosListadoApiClient.exportarPDF(nombre, estado)
    }[formato];

    request$.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al exportar los proyectos`
        });
      }
    });
  }
}