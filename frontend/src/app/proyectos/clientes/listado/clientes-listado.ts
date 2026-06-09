import { Component, effect, inject, model, ModelSignal, OnInit, signal, WritableSignal } from "@angular/core";
import { MessageService } from "primeng/api";
import { TableModule } from 'primeng/table';
import { ButtonModule } from "primeng/button";
import { ClientesListadoApiClient } from "./clientes-listado-api-client";
import { ListClienteDTO } from "./list-cliente-dto";
import { DialogModule } from "primeng/dialog";
import { GestionCliente } from "../gestion/gestion-cliente";
import { TooltipModule } from "primeng/tooltip";
import { SelectModule } from "primeng/select";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: "app-clientes-listado",
  templateUrl: "./clientes-listado.html",
  styleUrls: ["./clientes-listado.css"],
  imports: [TableModule, ButtonModule, DialogModule, GestionCliente, TooltipModule, SelectModule, FormsModule, InputTextModule]
})
export class ClientesListado implements OnInit {

  private readonly messageService: MessageService = inject(MessageService);

  visible: ModelSignal<boolean> = model(false);

  private readonly clientesListadoApiClient: ClientesListadoApiClient = inject(ClientesListadoApiClient);

  todosLosClientes: WritableSignal<ListClienteDTO[]> = signal([]);

  filtroNombre: WritableSignal<string> = signal('');
  filtroEstado: WritableSignal<string | null> = signal(null);

  readonly opcionesFiltro = [
    { label: 'Todos', value: null },
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Baja', value: 'BAJA' }
  ];

  get clientes(): ListClienteDTO[] {
    let lista = this.todosLosClientes();
    const nombre = this.filtroNombre().toLowerCase().trim();
    const estado = this.filtroEstado();
    if (nombre) lista = lista.filter(c => c.nombre.toLowerCase().includes(nombre));
    if (estado) lista = lista.filter(c => c.estado === estado);
    return lista;
  }

  limpiarFiltros(): void {
    this.filtroNombre.set('');
    this.filtroEstado.set(null);
  }

  dialogVisible: WritableSignal<boolean> = signal(false);

  clienteSeleccionado: WritableSignal<ListClienteDTO | null> = signal<ListClienteDTO | null>(null);

  constructor() {
    effect(() => {
      if (!this.dialogVisible()) {
        this.refrescarClientes();
      }
    });
  }

  ngOnInit(): void {
    this.refrescarClientes();
  }

  refrescarClientes(): void {
    this.clientesListadoApiClient.buscarClientes().subscribe({
      next: (data) => {
        this.todosLosClientes.set(data);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener los clientes' });
      }
    });
  }

  crearCliente(): void {
    this.dialogVisible.set(true);
  }

  editarCliente(cliente: ListClienteDTO): void {
    this.dialogVisible.set(true);
    this.clienteSeleccionado.set(cliente);
  }

  copiarAlPortapapeles(cliente: ListClienteDTO): void {
    const texto = `Cliente\nNombre: ${cliente.nombre}\nEstado: ${cliente.estado}`;
    navigator.clipboard.writeText(texto).then(() => {
      this.messageService.add({ severity: 'success', summary: 'Copiado', detail: 'Datos copiados al portapapeles' });
    });
  }

  abrirDialog(): void {
    this.dialogVisible.set(true);
  }

}