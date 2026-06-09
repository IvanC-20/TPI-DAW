import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'diasRestantes', standalone: true })
export class DiasRestantesPipe implements PipeTransform {
    transform(proyecto: { fechaFinalizacion: string | null; estado: string }): { texto: string; clase: string } {
        if (!proyecto.fechaFinalizacion) {
            return { texto: '-', clase: '' };
        }
        if (proyecto.estado === 'FINALIZADO' || proyecto.estado === 'BAJA') {
            return { texto: '-', clase: '' };
        }
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fecha = new Date(proyecto.fechaFinalizacion + 'T00:00:00');
        const dias = Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        const pluralDia = (n: number) => n === 1 ? 'día' : 'días';
        if (dias < 0) {
            const d = Math.abs(dias);
            return { texto: `Retrasado ${d} ${pluralDia(d)}`, clase: 'retrasado' };
        }
        if (dias === 0) {
            return { texto: 'Vence hoy', clase: 'vence-hoy' };
        }
        const restante = dias === 1 ? 'restante' : 'restantes';
        return { texto: `${dias} ${pluralDia(dias)} ${restante}`, clase: 'en-tiempo' };
    }
}
