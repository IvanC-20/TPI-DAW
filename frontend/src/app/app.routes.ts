import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { TareasListado } from './proyectos/tareas/listado/tareas-listado';
import { ProyectosListado } from './proyectos/listado/proyectos-listado';
import { Estadisticas } from './estadisticas/estadisticas';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'proyectos/:id/tareas',
        component: TareasListado
    },
    {
        path: 'proyectos',
        component: ProyectosListado
    },
    {
        path: 'estadisticas',
        component: Estadisticas
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
