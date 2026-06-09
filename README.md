# Sistema de Gestión de Proyectos

Trabajo Final Integrador — Desarrollo de Aplicaciones Web 2026  
Tecnicatura Universitaria en Desarrollo Web

## Integrantes

- Iván Cáceres
- Alejandro Petricic
- Mauro Gonzalo Roth
- Soledad Spinnenhirn

## Descripción

Sistema web para la gestión de proyectos, clientes y tareas. Permite crear y administrar proyectos asociados a clientes, con sus respectivas tareas. Incluye autenticación de usuarios y funcionalidades adicionales como búsqueda avanzada, exportación de datos, estadísticas, modo oscuro, entre otras.

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

- **Búsqueda avanzada:** filtrado de proyectos, tareas y clientes por nombre y estado en tiempo real
- **Exportaciones en varios formatos:** descarga del listado de proyectos en formato CSV, JSON, Excel y PDF
- **Estadísticas:** dashboard con métricas y 6 gráficos de proyectos, tareas y clientes
- **Fecha de finalización:** definición de una fecha objetivo para cada proyecto con indicador de días restantes
- **Barra de progreso:** visualización del porcentaje de tareas finalizadas por proyecto
- **Ordenamiento por columna:** en todas las tablas del sistema
- **Duplicar proyecto:** crea una copia de un proyecto con todas sus tareas
- **Copiar datos:** copia la información de cualquier fila al portapapeles
- **Modo oscuro:** toggle en el header con persistencia entre sesiones
- **Diseño responsive:** adaptado a distintas resoluciones de pantalla
