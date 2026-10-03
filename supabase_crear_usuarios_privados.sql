-- ========================================================
-- SCRIPT CORREGIDO Y COMPATIBLE PARA SUPABASE
-- Plataforma: Administración de Condominios
-- ========================================================

-- 1. Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.system_roles (
    uid TEXT PRIMARY KEY,
    username TEXT,
    email TEXT,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Asegurar que las columnas necesarias existan en caso de que la tabla ya existiera previamente
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 3. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.system_roles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acceso para lectura y escritura
DROP POLICY IF EXISTS "Permitir lectura de system_roles" ON public.system_roles;
CREATE POLICY "Permitir lectura de system_roles" ON public.system_roles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion y actualizacion de system_roles" ON public.system_roles;
CREATE POLICY "Permitir insercion y actualizacion de system_roles" ON public.system_roles
    FOR ALL USING (true);

-- 5. Limpiar registros previos con estos usuarios para evitar duplicados
DELETE FROM public.system_roles 
WHERE username IN ('admin1', 'haroldo90') 
   OR uid IN ('admin-admin1-uid', 'admin-haroldo90-uid');

-- 6. Insertar las credenciales solicitadas
INSERT INTO public.system_roles (
    uid,
    username,
    email,
    password,
    name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    'admin-admin1-uid',
    'admin1',
    'admin1@condominios.mx',
    'Chevropar#1970',
    'Administrador Principal (admin1)',
    'admin',
    true,
    now(),
    now()
),
(
    'admin-haroldo90-uid',
    'haroldo90',
    'haroldo90@condominios.mx',
    'Chevropar#1970',
    'Haroldo Anguiano (haroldo90)',
    'admin',
    true,
    now(),
    now()
);

-- ========================================================
-- 7. VERIFICAR QUE SE HAYAN CREADO CORRECTAMENTE
-- ========================================================
SELECT 
    uid,
    username,
    name,
    role,
    password,
    is_active
FROM public.system_roles
WHERE username IN ('admin1', 'haroldo90');
