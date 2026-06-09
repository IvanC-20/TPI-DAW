import { Component, computed, effect, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { ListTareaDTO } from "./list-tarea-dto";
import { TableModule } from 'primeng/table';
import { ButtonModule } from "primeng/button";
import { Template } from "../../../template/template";
import { TooltipModule } from 'primeng/tooltip';
import { GestionTarea } from "../gestion/gestion-tarea";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { SelectModule } from "primeng/select";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { ActivatedRoute, Router } from "@angular/router";
import { ProyectoApiClient } from "./proyecto-api-client";
import { ProyectoDTO } from "./proyecto-dto";
import { GestionTareaApiClient } from "../gestion/gestion-tarea-api-client";

@Component({
  selector: "app-tareas-listado",
  templateUrl: "./tareas-listado.html",
  styleUrls: ["./tareas-listado.css"],
  imports: [TableModule, ButtonModule, Template, TooltipModule, GestionTarea, ConfirmDialogModule, SelectModule, FormsModule, InputTextModule],
  providers: [ConfirmationService]
})
export class TareasListado implements OnInit {

  private readonly messageService: MessageService = inject(MessageService);
  private readonly confirmationService: ConfirmationService = inject(ConfirmationService);
  private readonly proyectoApiClient: ProyectoApiClient = inject(ProyectoApiClient);
  private readonly gestionTareaApiClient: GestionTareaApiClient = inject(GestionTareaApiClient);

  proyecto: WritableSignal<ProyectoDTO | null> = signal(null);

  filtroNombre: WritableSignal<string> = signal('');
  filtroEstado: WritableSignal<string | null> = signal(null);

  readonly opcionesFiltro = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Finalizada', value: 'FINALIZADA' },
    { label: 'Baja', value: 'BAJA' }
  ];

  tareas: Signal<ListTareaDTO[]> = computed(() => {
    let todas = this.proyecto()?.tareas || [];
    const nombre = this.filtroNombre().toLowerCase().trim();
    const estado = this.filtroEstado();
    if (nombre) todas = todas.filter(t => t.descripcion.toLowerCase().includes(nombre));
    if (estado) todas = todas.filter(t => t.estado === estado);
    return todas;
  });

  limpiarFiltros(): void {
    this.filtroNombre.set('');
    this.filtroEstado.set(null);
  }

  tareasPendientes: Signal<number> = computed(() =>
    this.tareas().filter(t => t.estado === 'PENDIENTE').length
  );

  tareasFinalizadas: Signal<number> = computed(() =>
    this.tareas().filter(t => t.estado === 'FINALIZADA').length
  );

  tareasBaja: Signal<number> = computed(() =>
    this.tareas().filter(t => t.estado === 'BAJA').length
  );

  dialogVisible: WritableSignal<boolean> = signal(false);

  tareaSeleccionada: WritableSignal<ListTareaDTO | null> = signal<ListTareaDTO | null>(null);

  readonly router: Router = inject(Router);

  readonly idProyecto: WritableSignal<number | null> = signal<number | null>(null);

  private readonly route = inject(ActivatedRoute);

  constructor() {
    effect(() => {
      if (!this.dialogVisible()) {
        this.refreshProyecto();
      }
    });
    this.idProyecto.set(Number(this.route.snapshot.paramMap.get('id')));

    if (this.idProyecto() === null) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Id de proyecto no válido' });
      this.router.navigateByUrl("/proyectos");
    }

  }

  ngOnInit(): void {
    this.refreshProyecto();
  }

  refreshProyecto(): void {
    this.proyectoApiClient.buscarProyecto(this.idProyecto()).subscribe({
      next: (data) => {
        this.proyecto.set(data);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener el proyecto' });
      }
    });
  }

  crearTarea(): void {
    this.dialogVisible.set(true);
  }

  editarTarea(tarea: ListTareaDTO): void {
    this.dialogVisible.set(true);
    this.tareaSeleccionada.set(tarea);
  }

  abrirDialog(): void {
    this.dialogVisible.set(true);
  }

  copiarAlPortapapeles(tarea: ListTareaDTO): void {
    const texto = `Tarea\nNombre: ${tarea.descripcion}\nEstado: ${tarea.estado}${tarea.nombreProyecto ? '\nProyecto: ' + tarea.nombreProyecto : ''}`;
    navigator.clipboard.writeText(texto).then(() => {
      this.messageService.add({ severity: 'success', summary: 'Copiado', detail: 'Datos copiados al portapapeles' });
    });
  }

  eliminarTarea(tarea: ListTareaDTO): void {
    this.confirmationService.confirm({
      message: `¿Estás segura de que querés eliminar la tarea "${tarea.descripcion}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-info',
      accept: () => {
        this.gestionTareaApiClient.eliminarTarea(this.idProyecto(), tarea.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tarea eliminada correctamente.' });
            this.refreshProyecto();
          },
          error: (err) => {
            const detail = err.error?.statusCode >= 400 && err.error?.statusCode < 500
              ? err.error.message
              : 'Ha ocurrido un error al eliminar la tarea';
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
          }
        });
      }
    });
  }

}