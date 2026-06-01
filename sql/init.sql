CREATE TYPE estados_usuarios AS ENUM ('ACTIVO','BAJA');
CREATE TYPE estados_clientes AS ENUM ('ACTIVO','BAJA');
CREATE TYPE estados_proyectos AS ENUM ('ACTIVO','FINALIZADO','BAJA');
CREATE TYPE estados_tareas AS ENUM ('PENDIENTE','FINALIZADA','BAJA');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    clave TEXT NOT NULL,
    estado estados_usuarios NOT NULL
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    estado estados_clientes NOT NULL
);

CREATE TABLE proyectos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    estado estados_proyectos NOT NULL,
    id_cliente INT,
    fecha_finalizacion DATE,
    CONSTRAINT fk_proyectos_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes (id)
);

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    estado estados_tareas NOT NULL,
    id_proyecto INT NOT NULL,
    CONSTRAINT fk_tareas_proyecto
        FOREIGN KEY (id_proyecto)
        REFERENCES proyectos (id)
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

INSERT INTO usuarios (nombre, clave, estado) VALUES ('usuario', crypt('clave', gen_salt('bf', 10)), 'ACTIVO');

INSERT INTO clientes (nombre, estado) VALUES
('Banco Nacional', 'ACTIVO'),
('Ministerio de Educación', 'ACTIVO'),
('Hospital Central', 'ACTIVO'),
('Municipalidad de Córdoba', 'ACTIVO'),
('Supermercados Norte', 'ACTIVO'),
('Aerolíneas del Sur', 'ACTIVO'),
('Universidad Nacional', 'ACTIVO'),
('Constructora Andina', 'ACTIVO'),
('Farmacéutica Vita', 'ACTIVO'),
('Medios del Litoral', 'BAJA');

INSERT INTO proyectos (nombre, estado, id_cliente, fecha_finalizacion) VALUES
('Sistema de turnos online', 'ACTIVO', 1, '2026-08-15'),
('Rediseño de imagen corporativa', 'ACTIVO', 2, '2026-07-01'),
('App de gestión de camas', 'ACTIVO', 3, NULL),
('Portal de trámites municipales', 'ACTIVO', 4, '2026-09-30'),
('E-commerce mayorista', 'ACTIVO', 5, '2026-11-20'),
('Sistema de check-in automático', 'FINALIZADO', 6, '2026-02-28'),
('Plataforma de aulas virtuales', 'ACTIVO', 7, '2027-03-01'),
('Control de obra en tiempo real', 'ACTIVO', 8, NULL),
('App de recetas y stock', 'ACTIVO', 9, '2026-10-10'),
('CRM periodístico', 'BAJA', 10, NULL),
('Módulo de pagos digitales', 'ACTIVO', 1, '2026-12-01'),
('Intranet educativa', 'FINALIZADO', 2, '2026-01-15'),
('Historia clínica electrónica', 'ACTIVO', 3, '2027-01-01'),
('Sistema de multas online', 'ACTIVO', 4, NULL),
('Fidelización de clientes', 'ACTIVO', 5, '2026-08-01'),
('Gestión de equipaje', 'ACTIVO', 6, '2026-09-15'),
('Repositorio académico', 'ACTIVO', 7, NULL),
('Presupuestador de obras', 'ACTIVO', 8, '2026-07-20'),
('Control de vencimientos', 'FINALIZADO', 9, '2025-12-01'),
('Newsletter automatizado', 'BAJA', 10, NULL),
('Autenticación biométrica', 'ACTIVO', 1, '2026-11-11'),
('Gestión de becas', 'ACTIVO', 2, '2026-10-01'),
('Agenda médica digital', 'ACTIVO', 3, '2026-08-30'),
('Mapa de obras públicas', 'ACTIVO', 4, NULL),
('Logística de entregas', 'ACTIVO', 5, '2026-09-01'),
('Panel de vuelos en tiempo real', 'FINALIZADO', 6, '2026-03-10'),
('Evaluaciones online', 'ACTIVO', 7, '2026-12-15'),
('Cotizador de materiales', 'ACTIVO', 8, NULL),
('Trazabilidad de medicamentos', 'ACTIVO', 9, '2027-02-01'),
('Archivo digital de noticias', 'BAJA', 10, NULL),
('Simulador de créditos', 'ACTIVO', 1, '2026-10-20'),
('Sistema de admisión universitaria', 'ACTIVO', 2, '2026-11-30'),
('Telemedicina', 'ACTIVO', 3, NULL),
('App de denuncias ciudadanas', 'ACTIVO', 4, '2026-07-15'),
('Inventario centralizado', 'ACTIVO', 5, '2026-08-20'),
('Gestión de tripulaciones', 'ACTIVO', 6, NULL),
('Plataforma de posgrados', 'ACTIVO', 7, '2027-04-01'),
('Seguimiento de inspecciones', 'ACTIVO', 8, '2026-09-10'),
('Sistema de alertas de stock', 'FINALIZADO', 9, '2026-01-30'),
('Portal de suscriptores', 'BAJA', 10, NULL),
('Onboarding digital', 'ACTIVO', 1, '2026-12-20'),
('Gestión de convenios', 'ACTIVO', 2, NULL),
('Turnero de urgencias', 'ACTIVO', 3, '2026-08-05'),
('Catastro digital', 'ACTIVO', 4, '2027-01-15'),
('App de ofertas del día', 'ACTIVO', 5, '2026-07-30'),
('Sistema de reclamos', 'ACTIVO', 6, NULL),
('Campus virtual mobile', 'ACTIVO', 7, '2026-10-25'),
('Gestión de subcontratistas', 'ACTIVO', 8, '2026-11-05'),
('Farmacovigilancia', 'ACTIVO', 9, NULL),
('Redacción colaborativa', 'BAJA', 10, NULL);