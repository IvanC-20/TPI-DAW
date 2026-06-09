import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'estadoFecha', standalone: true })
export class EstadoFechaPipe implements PipeTransform {
    transform(fechaFinalizacion: string | null): string {
        return fechaFinalizacion ?? '-';
    }
}
