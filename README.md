# Sistema de Gestión de Proyectos

Trabajo Final Integrador — Desarrollo de Aplicaciones Web 2026  
Tecnicatura Universitaria en Desarrollo Web

## Integrantes

- Iván Cáceres
- Alejandro Petricic
- Mauro Gonzalo Roth
- Soledad Spinnenhirn

## Descripción

Sistema web para la gestión de proyectos, clientes y tareas. Permite crear y administrar proyectos asociados a clientes, con sus respectivas tareas. Incluye autenticación de usuarios y funcionalidades adicionales como búsqueda avanzada, exportación de datos, estadísticas y fecha de finalización de proyectos.

## Tecnologías

- **Backend:** NestJS, TypeORM
- **Base de datos:** PostgreSQL
- **Frontend:** Angular, PrimeNG
- **Servidor:** nginx, PM2

## Requisitos previos

- Node.js 22 o superior
- PostgreSQL 16 o superior

## Configuración de la base de datos

1. Crear una base de datos llamada `gestor_de_proyectos`
2. Ejecutar el script `sql/init.sql` para crear las tablas y el usuario inicial

## Cómo correr el proyecto

### Backend

```bash
cd backend
npm install
npm run start:dev
```

El backend queda disponible en `http://localhost:3000`.  
La documentación Swagger está en `http://localhost:3000/api`.

### Frontend

```bash
cd frontend
npm install
npm start
```

El frontend queda disponible en `http://localhost:4200`.

## Usuario de prueba

| Campo   | Valor    |
|---------|----------|
| Usuario | usuario  |
| Clave   | clave    |

## Funcionalidades adicionales

- **Búsqueda avanzada:** filtrado de proyectos por nombre y estado
- **Exportación CSV:** descarga del listado de proyectos en formato CSV
- **Estadísticas:** dashboard con métricas de proyectos, tareas y clientes
- **Fecha de finalización:** definición de una fecha objetivo para cada proyecto
