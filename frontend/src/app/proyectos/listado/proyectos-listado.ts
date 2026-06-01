import { Component, effect, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { MessageService } from "primeng/api";
import { ListProyectoDTO } from "./list-proyecto-dto";
import { ProyectosListadoApiClient } from "./proyectos-listado-api-client";
import { TableModule } from 'primeng/table';
import { ButtonModule } from "primeng/button";
import { Template } from "../../template/template";
import { TooltipModule } from 'primeng/tooltip';
import { GestionProyecto } from "../gestion/gestion-proyecto";
import { FormsModule } from "@angular/forms";
import { SelectModule } from "primeng/select";
import { EstadosProyectosEnum } from "../estados-proyectos-enum";
import { InputTextModule } from "primeng/inputtext";
import { Router } from "@angular/router";
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { FuzzySearch } from "../../shared/fuzzy-search/fuzzy-search";
import { CheckboxModule } from "primeng/checkbox";
import { ExportacionService } from "../../shared/exportacion/exportacion.service";


@Component({
  selector: "app-proyectos-listado",
  templateUrl: "./proyectos-listado.html",
  styleUrls: ["./proyectos-listado.css"],
  imports: [
    TableModule,
    ButtonModule,
    Template,
    TooltipModule,
    GestionProyecto,
    FormsModule,
    SelectModule,
    InputTextModule,
    MenuModule,
    FuzzySearch,
    CheckboxModule
  ]
})

export class ProyectosListado implements OnInit {

  private readonly messageService: MessageService = inject(MessageService);
  private readonly proyectosListadoApiClient: ProyectosListadoApiClient = inject(ProyectosListadoApiClient);
  private readonly router: Router = inject(Router);
  protected todosLosProyectos: ListProyectoDTO[] = [];
  protected proyectosFiltradosPorEstado: ListProyectoDTO[] = [];
  private readonly exportacionService: ExportacionService = inject(ExportacionService);

  proyectos: WritableSignal<ListProyectoDTO[]> = signal([]);
  dialogVisible: WritableSignal<boolean> = signal(false);
  proyectoSeleccionado: WritableSignal<ListProyectoDTO | null> = signal<ListProyectoDTO | null>(null);


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
    this.proyectosListadoApiClient.buscarProyectos().subscribe({
      next: (data) => {
        this.todosLosProyectos = data;
        this.proyectosFiltradosPorEstado = data;
        this.proyectos.set(data);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener los proyectos' });
      }
    });
  }

  seleccionarTodos: boolean = false;

  toggleSeleccionarTodos(): void {
    this.proyectos().forEach(p => p.seleccionado = this.seleccionarTodos);
  }

  crearProyecto(): void {
    this.dialogVisible.set(true);
  }

  editarProyecto(proyecto: ListProyectoDTO): void {
    this.dialogVisible.set(true);
    this.proyectoSeleccionado.set(proyecto);
  }

  gestionarTareas(proyecto: ListProyectoDTO): void {
    this.router.navigateByUrl(`/proyectos/${proyecto.id}/tareas`);
  }

  estadoFecha(proyecto: ListProyectoDTO): { texto: string; clase: string } {
    if (!proyecto.fechaFinalizacion) {
      return { texto: '-', clase: '' };
    }
    if (proyecto.estado === EstadosProyectosEnum.FINALIZADO || proyecto.estado === EstadosProyectosEnum.BAJA) {
      return { texto: proyecto.fechaFinalizacion, clase: '' };
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(proyecto.fechaFinalizacion + 'T00:00:00');
    const dias = Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (dias < 0) {
      return { texto: `Retrasado ${Math.abs(dias)} días`, clase: 'retrasado' };
    }
    if (dias === 0) {
      return { texto: 'Vence hoy', clase: 'vence-hoy' };
    }
    return { texto: `${dias} días`, clase: 'en-tiempo' };
  }

  copiarAlPortapapeles(proyecto: ListProyectoDTO): void {
    const texto = [
      `Proyecto`,
      `Nombre: ${proyecto.nombre}`,
      `Cliente: ${proyecto.cliente?.nombre || '-'}`,
      `Estado: ${proyecto.estado}`,
      `Fecha de finalización: ${proyecto.fechaFinalizacion || '-'}`
    ].join('\n');

    navigator.clipboard.writeText(texto).then(() => {
      this.messageService.add({ severity: 'success', summary: 'Copiado', detail: 'Datos copiados al portapapeles' });
    });
  }

  // Exportando datos
  opcionesExportar: MenuItem[] = [
    { label: 'CSV', icon: 'pi pi-file', command: () => this.exportar('csv') },
    { label: 'JSON', icon: 'pi pi-code', command: () => this.exportar('json') },
    { label: 'Excel', icon: 'pi pi-file-excel', command: () => this.exportar('excel') },
    { label: 'PDF', icon: 'pi pi-file-pdf', command: () => this.exportar('pdf') },
];

exportar(formato: 'csv' | 'json' | 'excel' | 'pdf'): void {
    const datos = this.proyectos().map(p => ({
        nombre: p.nombre,
        cliente: p.cliente?.nombre ?? '-',
        estado: p.estado,
        fechaFinalizacion: p.fechaFinalizacion ?? '-'
    }));

    switch (formato) {
        case 'csv':
            this.exportacionService.exportarCSV(datos, 'proyectos.csv');
            break;
        case 'json':
            this.exportacionService.exportarJSON(datos, 'proyectos.json');
            break;
        case 'excel':
            this.exportacionService.exportarExcel(datos, 'proyectos.xlsx');
            break;
        case 'pdf':
            this.exportacionService.exportarPDF(datos, ['Nombre', 'Cliente', 'Estado', 'Fecha de Finalización'], 'proyectos.pdf');
            break;
    }
}

  onResultados(resultados: ListProyectoDTO[]): void {
    this.proyectos.set(resultados);
  }


}