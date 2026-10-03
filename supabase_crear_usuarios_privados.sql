-- ========================================================
-- TABLA DE ROLES Y USUARIOS DEL SISTEMA (Supabase SQL)
-- Plataforma: Administración de Condominios
-- ========================================================

-- 1. Crear tabla de roles y usuarios si no existe
CREATE TABLE IF NOT EXISTS public.system_roles (
    uid TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    phone TEXT,
    residencia_id TEXT,
    residencia_nombre TEXT,
    caseta_id TEXT,
    caseta_nombre TEXT,
    avatar TEXT
);

-- 2. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.system_roles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso para autenticación y consulta
DROP POLICY IF EXISTS "Permitir lectura de system_roles" ON public.system_roles;
CREATE POLICY "Permitir lectura de system_roles" ON public.system_roles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion y actualizacion de system_roles" ON public.system_roles;
CREATE POLICY "Permitir insercion y actualizacion de system_roles" ON public.system_roles
    FOR ALL USING (true);

-- ========================================================
-- CREACIÓN DE LAS CREDENCIALES PRIVADAS
-- ========================================================

-- Usuario 1: admin1 | Clave: Chevropar#1970
INSERT INTO public.system_roles (
    uid,
    username,
    email,
    password,
    name,
    role,
    is_active,
    created_at
) VALUES (
    'admin-admin1-uid',
    'admin1',
    'admin1@condominios.mx',
    'Chevropar#1970',
    'Administrador Principal (admin1)',
    'admin',
    true,
    now()
)
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    is_active = true,
    updated_at = now();

-- Usuario 2: haroldo90 | Contraseña: Chevropar#1970
INSERT INTO public.system_roles (
    uid,
    username,
    email,
    password,
    name,
    role,
    is_active,
    created_at
) VALUES (
    'admin-haroldo90-uid',
    'haroldo90',
    'haroldo90@condominios.mx',
    'Chevropar#1970',
    'Haroldo Anguiano (haroldo90)',
    'admin',
    true,
    now()
)
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    is_active = true,
    updated_at = now();

-- ========================================================
-- VERIFICACIÓN DE CREDENCIALES CREADAS
-- ========================================================
SELECT 
    uid,
    username,
    name,
    role,
    password,
    email,
    is_active,
    created_at
FROM public.system_roles
WHERE username IN ('admin1', 'haroldo90');
