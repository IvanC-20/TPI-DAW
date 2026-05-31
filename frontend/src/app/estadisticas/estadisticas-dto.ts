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
}
