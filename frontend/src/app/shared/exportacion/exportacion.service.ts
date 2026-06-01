import { Injectable } from "@angular/core";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

@Injectable({
    providedIn: 'root'
})
export class ExportacionService {

    exportarCSV(datos: object[], nombreArchivo: string): void {
        const headers = Object.keys(datos[0]);
        const filas = datos.map(d => Object.values(d).join(','));
        const csv = [headers.join(','), ...filas].join('\n');
        this.descargar(new Blob([csv], { type: 'text/csv' }), nombreArchivo);
    }

    exportarJSON(datos: object[], nombreArchivo: string): void {
        const json = JSON.stringify(datos, null, 2);
        this.descargar(new Blob([json], { type: 'application/json' }), nombreArchivo);
    }

    exportarExcel(datos: object[], nombreArchivo: string): void {
        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
        XLSX.writeFile(libro, nombreArchivo);
    }

    exportarPDF(datos: object[], columnas: string[], nombreArchivo: string): void {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [columnas],
            body: datos.map(d => Object.values(d).map(v => v ?? '-'))
        });
        doc.save(nombreArchivo);
    }

    private descargar(blob: Blob, nombreArchivo: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}