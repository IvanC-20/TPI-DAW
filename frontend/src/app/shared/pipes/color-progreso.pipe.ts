import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'colorProgreso', standalone: true })
export class ColorProgresoPipe implements PipeTransform {
    transform(proyecto: { totalTareas: number; tareasFinalizadas: number }): string {
        if (proyecto.totalTareas === 0) return '#9ca3af';
        const pct = (proyecto.tareasFinalizadas / proyecto.totalTareas) * 100;
        if (pct <= 30) return '#dc2626';
        if (pct <= 70) return '#d97706';
        return '#16a34a';
    }
}
