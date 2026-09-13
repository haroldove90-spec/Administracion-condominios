-- ====================================================================
-- SCRIPT DE ACTUALIZACIÓN SUPABASE v2.5.0
-- MÓDULOS: MULTAS/INFRACCIONES, VEHÍCULOS/ESTACIONAMIENTO Y MASCOTAS
-- Compatible con PostgreSQL 14+ y Supabase (Idempotente)
-- ====================================================================

-- 0. HABILITAR EXTENSIÓN CRIPTOGRÁFICA SI NO EXISTE
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. TABLA MULTAS E INFRACCIONES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.multas (
    id TEXT PRIMARY KEY DEFAULT ('inf-' || substr(md5(random()::text), 1, 8)),
    condo TEXT NOT NULL,
    residente TEXT,
    categoria TEXT NOT NULL,
    monto NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    descripcion TEXT,
    evidencia_url TEXT,
    estatus TEXT NOT NULL DEFAULT 'pendiente',
    folio TEXT,
    cargada_en_estado_cuenta BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compatibilidad defensiva: Asegurar columnas si la tabla ya existía
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS condo TEXT;
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS residente TEXT;
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS categoria TEXT;
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS monto NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS fecha DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS evidencia_url TEXT;
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS estatus TEXT DEFAULT 'pendiente';
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS folio TEXT;
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS cargada_en_estado_cuenta BOOLEAN DEFAULT false;
ALTER TABLE public.multas ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_multas_condo ON public.multas(condo);
CREATE INDEX IF NOT EXISTS idx_multas_estatus ON public.multas(estatus);

-- ====================================================================
-- 2. TABLA VEHÍCULOS Y CONTROL DE ESTACIONAMIENTO / TAGS RFID
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.vehiculos (
    id TEXT PRIMARY KEY DEFAULT ('veh-' || substr(md5(random()::text), 1, 8)),
    condo TEXT NOT NULL,
    propietario TEXT,
    placas TEXT NOT NULL,
    marca_modelo TEXT,
    color TEXT,
    cajon_asignado TEXT,
    tipo_cajon TEXT DEFAULT 'privado',
    tag_rfid TEXT,
    status TEXT NOT NULL DEFAULT 'autorizado',
    fecha_registro DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compatibilidad defensiva
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS condo TEXT;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS propietario TEXT;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS placas TEXT;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS marca_modelo TEXT;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS cajon_asignado TEXT;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS tipo_cajon TEXT DEFAULT 'privado';
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS tag_rfid TEXT;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'autorizado';
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS fecha_registro DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_vehiculos_placas ON public.vehiculos(placas);
CREATE INDEX IF NOT EXISTS idx_vehiculos_condo ON public.vehiculos(condo);

-- ====================================================================
-- 3. TABLA MASCOTAS CONDOMINALES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.mascotas (
    id TEXT PRIMARY KEY DEFAULT ('mas-' || substr(md5(random()::text), 1, 8)),
    condo TEXT NOT NULL,
    dueno TEXT,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'perro',
    raza TEXT,
    color TEXT,
    estatus_vacunacion TEXT DEFAULT 'al_dia',
    fecha_ultima_vacuna DATE,
    numero_chip TEXT,
    foto_url TEXT,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compatibilidad defensiva
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS condo TEXT;
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS dueno TEXT;
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'perro';
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS raza TEXT;
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS estatus_vacunacion TEXT DEFAULT 'al_dia';
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS fecha_ultima_vacuna DATE;
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS numero_chip TEXT;
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE public.mascotas ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_mascotas_condo ON public.mascotas(condo);

-- ====================================================================
-- 4. SEGURIDAD Y PERMISOS RLS
-- ====================================================================
ALTER TABLE public.multas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.multas TO anon, authenticated, service_role;
GRANT ALL ON public.vehiculos TO anon, authenticated, service_role;
GRANT ALL ON public.mascotas TO anon, authenticated, service_role;

-- ====================================================================
-- 5. CONFIRMACIÓN
-- ====================================================================
SELECT 'Tablas public.multas, public.vehiculos y public.mascotas creadas y actualizadas exitosamente en Supabase' AS resultado;
