import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ListProyectoDTO } from "./list-proyecto-dto";
import { HttpClient, HttpParams } from "@angular/common/http";


@Injectable({
    providedIn: 'root'
})
export class ProyectosListadoApiClient {

    private readonly httpClient = inject(HttpClient);

    buscarProyectos(nombre?: string, estado?: string): Observable<ListProyectoDTO[]> {
        let params = new HttpParams();
        if (nombre) {
            params = params.set('nombre', nombre);
        }
        if (estado) {
            params = params.set('estado', estado);
        }
        return this.httpClient.get<ListProyectoDTO[]>('/api/v1/proyectos', { params });
    }

    exportarCSV(nombre?: string, estado?: string): Observable<Blob> {
        let params = new HttpParams();
        if (nombre) {
            params = params.set('nombre', nombre);
        }
        if (estado) {
            params = params.set('estado', estado);
        }
        return this.httpClient.get('/api/v1/proyectos/exportar/csv', { params, responseType: 'blob' });
    }

    exportarJSON(nombre?: string, estado?: string): Observable<Blob> {
        let params = new HttpParams();
        if (nombre) {
            params = params.set('nombre', nombre);
        }
        if (estado) {
            params = params.set('estado', estado);
        }
        return this.httpClient.get('/api/v1/proyectos/exportar/json', { params, responseType: 'blob' });
    }

    exportarExcel(nombre?: string, estado?: string): Observable<Blob> {
        let params = new HttpParams();
        if (nombre) {
            params = params.set('nombre', nombre);
        }
        if (estado) {
            params = params.set('estado', estado);
        }
        return this.httpClient.get('/api/v1/proyectos/exportar/excel', { params, responseType: 'blob' });
    }

    exportarPDF(nombre?: string, estado?: string): Observable<Blob> {
    let params = new HttpParams();
    if (nombre) {
        params = params.set('nombre', nombre);
    }
    if (estado) {
        params = params.set('estado', estado);
    }
    return this.httpClient.get('/api/v1/proyectos/exportar/pdf', { params, responseType: 'blob' });
}
}