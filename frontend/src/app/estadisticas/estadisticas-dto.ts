export interface EstadisticasDTO {
    proyectos: {
        total: number;
        activos: number;
        finalizados: number;
        baja: number;
    };
    tareas: {
        total: number;
        pendientes: number;
        finalizadas: number;
        baja: number;
    };
    clientes: {
        total: number;
        activos: number;
        baja: number;
    };
    plazo: {
        retrasados: number;
        venceHoy: number;
        enTiempo: number;
        sinFecha: number;
    };
    progresoProyectos: {
        nombre: string;
        progreso: number;
        pendientes: number;
        finalizadas: number;
        total: number;
    }[];
}
