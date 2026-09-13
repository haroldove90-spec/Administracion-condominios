-- ====================================================================
-- SCRIPT SQL COMPLETO Y ACTUALIZADO PARA SUPABASE
-- PLATAFORMA DE ADMINISTRACIÓN DE CONDOMINIOS CNLS SaaS v2.4.0
-- (100% IDEMPOTENTE: SE PUEDE EJECUTAR MÚLTIPLES VECES SIN ERRORES)
-- ====================================================================

-- 0. HABILITAR EXTENSIONES CRIPTOGRÁFICAS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TIPOS Y ENUMS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_user_role') THEN
    CREATE TYPE system_user_role AS ENUM (
      'admin', 'supervisor', 'guard', 'residente', 'auditor', 'condominios'
    );
  END IF;
END $$;

-- 2. TABLA SYSTEM_ROLES (USUARIOS Y CREDENCIALES DEL SISTEMA)
CREATE TABLE IF NOT EXISTS public.system_roles (
    uid TEXT PRIMARY KEY,
    id TEXT,
    email TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    username TEXT,
    password TEXT,
    "isActive" BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    "residenciaId" TEXT,
    residencia_id TEXT,
    "residenciaNombre" TEXT,
    residencia_nombre TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    phone TEXT,
    avatar TEXT
);

ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS residencia_id TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS "residenciaId" TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS residencia_nombre TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS "residenciaNombre" TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.system_roles ADD COLUMN IF NOT EXISTS avatar TEXT;

-- 3. TABLA CLIENTES_CONDOMINIO (SaaS SuperAdmin & Condominios Registrados)
CREATE TABLE IF NOT EXISTS public.clientes_condominio (
    id TEXT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    administrador VARCHAR(255),
    correo VARCHAR(255),
    telefono VARCHAR(100),
    plan VARCHAR(50) DEFAULT 'Premium',
    limite_departamentos INT DEFAULT 100,
    "limiteDepartamentos" INT DEFAULT 100,
    limite_usuarios INT DEFAULT 15,
    "limiteUsuarios" INT DEFAULT 15,
    limite_almacenamiento NUMERIC(10,2) DEFAULT 20.0,
    "limiteAlmacenamiento" NUMERIC(10,2) DEFAULT 20.0,
    uso_departamentos INT DEFAULT 0,
    "usoDepartamentos" INT DEFAULT 0,
    uso_usuarios INT DEFAULT 1,
    "usoUsuarios" INT DEFAULT 1,
    uso_almacenamiento NUMERIC(10,2) DEFAULT 0.1,
    "usoAlmacenamiento" NUMERIC(10,2) DEFAULT 0.1,
    status VARCHAR(50) DEFAULT 'activo',
    fecha_registro DATE DEFAULT CURRENT_DATE,
    "fechaRegistro" DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.clientes_condominio ADD COLUMN IF NOT EXISTS "limiteDepartamentos" INT DEFAULT 100;
ALTER TABLE public.clientes_condominio ADD COLUMN IF NOT EXISTS "limiteUsuarios" INT DEFAULT 15;
ALTER TABLE public.clientes_condominio ADD COLUMN IF NOT EXISTS "limiteAlmacenamiento" NUMERIC(10,2) DEFAULT 20.0;
ALTER TABLE public.clientes_condominio ADD COLUMN IF NOT EXISTS "usoDepartamentos" INT DEFAULT 0;
ALTER TABLE public.clientes_condominio ADD COLUMN IF NOT EXISTS "usoUsuarios" INT DEFAULT 1;
ALTER TABLE public.clientes_condominio ADD COLUMN IF NOT EXISTS "usoAlmacenamiento" NUMERIC(10,2) DEFAULT 0.1;
ALTER TABLE public.clientes_condominio ADD COLUMN IF NOT EXISTS "fechaRegistro" DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.clientes_condominio ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. TABLA RESIDENCIAS (Condominios y Fraccionamientos)
CREATE TABLE IF NOT EXISTS public.residencias (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    administrador TEXT,
    "numResidencias" INTEGER DEFAULT 1,
    num_residencias INTEGER DEFAULT 1,
    "isActive" BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.residencias ADD COLUMN IF NOT EXISTS administrador TEXT;
ALTER TABLE public.residencias ADD COLUMN IF NOT EXISTS "numResidencias" INTEGER DEFAULT 1;
ALTER TABLE public.residencias ADD COLUMN IF NOT EXISTS num_residencias INTEGER DEFAULT 1;
ALTER TABLE public.residencias ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE public.residencias ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.residencias ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.residencias ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.residencias ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.residencias ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. TABLA ESTRUCTURAS INMOBILIARIAS (Torres, Manzanas, Lotes, Clusters)
CREATE TABLE IF NOT EXISTS public.estructuras_inmobiliarias (
    id TEXT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    unidades_count INT DEFAULT 0,
    "unidadesCount" INT DEFAULT 0,
    unidades_detalle TEXT,
    "unidadesDetalle" TEXT,
    status VARCHAR(30) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.estructuras_inmobiliarias ADD COLUMN IF NOT EXISTS "unidadesCount" INT DEFAULT 0;
ALTER TABLE public.estructuras_inmobiliarias ADD COLUMN IF NOT EXISTS "unidadesDetalle" TEXT;
ALTER TABLE public.estructuras_inmobiliarias ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'activo';
ALTER TABLE public.estructuras_inmobiliarias ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. TABLA UNIDADES Y DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS public.unidades (
    id TEXT PRIMARY KEY,
    estructura_id TEXT,
    "estructuraId" TEXT,
    identificador VARCHAR(50) NOT NULL,
    propietario_nombre VARCHAR(150),
    "propietarioNombre" VARCHAR(150),
    mantenimiento_cuota NUMERIC(12,2) DEFAULT 0.00,
    "mantenimientoCuota" NUMERIC(12,2) DEFAULT 0.00,
    estatus_morosidad VARCHAR(30) DEFAULT 'al_dia',
    "estatusMorosidad" VARCHAR(30) DEFAULT 'al_dia',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA RESIDENTES CONDOMINIO
CREATE TABLE IF NOT EXISTS public.residentes_condominio (
    id TEXT PRIMARY KEY,
    unidad_id TEXT,
    nombre VARCHAR(150) NOT NULL,
    unidad VARCHAR(100) NOT NULL,
    tipo_residente VARCHAR(30) DEFAULT 'propietario',
    "tipoResidente" VARCHAR(30) DEFAULT 'propietario',
    correo VARCHAR(150),
    telefono VARCHAR(50),
    status VARCHAR(30) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLA PERSONAL INTERNO
CREATE TABLE IF NOT EXISTS public.personal_interno (
    id TEXT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    turno VARCHAR(50),
    telefono VARCHAR(50),
    status VARCHAR(30) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLA REGLAS Y CUOTAS
CREATE TABLE IF NOT EXISTS public.reglas_cuotas (
    id TEXT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    periodicidad VARCHAR(50) DEFAULT 'Mensual',
    recargo_porcentaje NUMERIC(5,2) DEFAULT 0.00,
    "recargoPorcentaje" NUMERIC(5,2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'activa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABLA PAGOS CUOTAS (FINANZAS Y ESTADOS DE CUENTA)
CREATE TABLE IF NOT EXISTS public.pagos_cuotas (
    id TEXT PRIMARY KEY,
    condo VARCHAR(100),
    resident VARCHAR(150),
    unidad VARCHAR(100),
    concepto VARCHAR(200) NOT NULL,
    amount NUMERIC(12,2) DEFAULT 0.00,
    monto NUMERIC(12,2) DEFAULT 0.00,
    due_date DATE,
    "dueDate" DATE,
    fecha_pago DATE DEFAULT CURRENT_DATE,
    "paymentDate" DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'pagado',
    estatus VARCHAR(30) DEFAULT 'pagado',
    payment_method VARCHAR(100),
    "paymentMethod" VARCHAR(100),
    comprobante_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TABLA CONCILIACIÓN BANCARIA
CREATE TABLE IF NOT EXISTS public.conciliacion_bancaria (
    id TEXT PRIMARY KEY,
    fecha DATE DEFAULT CURRENT_DATE,
    concepto_banco TEXT NOT NULL,
    "conceptoBanco" TEXT,
    monto NUMERIC(12,2) NOT NULL,
    referencia VARCHAR(100),
    estatus VARCHAR(30) DEFAULT 'pendiente',
    unidad_matcheada VARCHAR(100),
    "unidadMatcheada" VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABLA EGRESOS CONDOMINIO (PROVEEDORES Y FACTURAS)
CREATE TABLE IF NOT EXISTS public.egresos_condominio (
    id TEXT PRIMARY KEY,
    proveedor VARCHAR(150) NOT NULL,
    concepto VARCHAR(200) NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    factura_xml_pdf BOOLEAN DEFAULT true,
    "facturaXmlPdf" BOOLEAN DEFAULT true,
    estatus VARCHAR(30) DEFAULT 'pagado',
    status VARCHAR(30) DEFAULT 'pagado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. TABLA AMENIDADES Y RESERVACIONES
CREATE TABLE IF NOT EXISTS public.amenidades (
    id TEXT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cuota NUMERIC(12,2) DEFAULT 0.00,
    capacidad_max INT DEFAULT 0,
    horario VARCHAR(100),
    estatus VARCHAR(30) DEFAULT 'disponible'
);

CREATE TABLE IF NOT EXISTS public.reservaciones_amenidades (
    id TEXT PRIMARY KEY,
    amenidad_nombre VARCHAR(100),
    "amenityName" VARCHAR(100),
    residente VARCHAR(150),
    resident VARCHAR(150),
    condo VARCHAR(50),
    fecha DATE NOT NULL,
    date DATE,
    horario VARCHAR(50),
    "timeSlot" VARCHAR(50),
    estatus VARCHAR(30) DEFAULT 'confirmado',
    status VARCHAR(30) DEFAULT 'confirmado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. TABLA ÓRDENES DE TRABAJO Y TICKETS
CREATE TABLE IF NOT EXISTS public.ordenes_trabajo (
    id TEXT PRIMARY KEY,
    folio VARCHAR(50),
    condo VARCHAR(100),
    category VARCHAR(100),
    categoria VARCHAR(100),
    description TEXT,
    descripcion TEXT,
    priority VARCHAR(20) DEFAULT 'media',
    prioridad VARCHAR(20) DEFAULT 'media',
    status VARCHAR(30) DEFAULT 'abierto',
    estatus VARCHAR(30) DEFAULT 'abierto',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. TABLA COMUNICADOS Y BOLETINES
CREATE TABLE IF NOT EXISTS public.comunicados (
    id TEXT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    title VARCHAR(200),
    contenido TEXT NOT NULL,
    content TEXT,
    fecha DATE DEFAULT CURRENT_DATE,
    date DATE DEFAULT CURRENT_DATE,
    category VARCHAR(50) DEFAULT 'comunidad',
    categoria VARCHAR(50) DEFAULT 'comunidad',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. TABLA ENCUESTAS Y VOTACIONES DE ASAMBLEAS
CREATE TABLE IF NOT EXISTS public.encuestas_votaciones (
    id TEXT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    opciones JSONB DEFAULT '[]'::jsonb,
    fecha_cierre DATE,
    estatus VARCHAR(30) DEFAULT 'activa',
    total_votos INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. TABLA PRESUPUESTOS EXTRAORDINARIOS (COMITÉ)
CREATE TABLE IF NOT EXISTS public.presupuestos_extraordinarios (
    id TEXT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    monto_estimado NUMERIC(12,2) NOT NULL,
    "montoEstimado" NUMERIC(12,2),
    recaudado NUMERIC(12,2) DEFAULT 0.00,
    estatus VARCHAR(30) DEFAULT 'en_recaudacion',
    fecha_limite DATE,
    "fechaLimite" DATE,
    votos_favor INT DEFAULT 0,
    "votosFavor" INT DEFAULT 0,
    votos_contra INT DEFAULT 0,
    "votosContra" INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. TABLA ACTAS DE ASAMBLEA
CREATE TABLE IF NOT EXISTS public.actas_asamblea (
    id TEXT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    tipo VARCHAR(50) DEFAULT 'Ordinaria',
    asistencia_quorum VARCHAR(50),
    "asistenciaQuorum" VARCHAR(50),
    acuerdos TEXT,
    documento_url TEXT,
    "documentoUrl" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. TABLA PAQUETERÍA
CREATE TABLE IF NOT EXISTS public.paqueteria (
    id TEXT PRIMARY KEY,
    condo VARCHAR(50) NOT NULL,
    resident VARCHAR(150) NOT NULL,
    carrier VARCHAR(100),
    "trackingNumber" VARCHAR(100),
    tracking_number VARCHAR(100),
    "receivedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(30) DEFAULT 'en_recepcion',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. TABLA BITÁCORA GUARDIA Y SEGURIDAD
CREATE TABLE IF NOT EXISTS public.bitacora_guardia (
    id TEXT PRIMARY KEY,
    "guardiaNombre" VARCHAR(150),
    guardia_nombre VARCHAR(150),
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    "fechaHora" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. TABLA VISITAS PENDIENTES Y ACCESOS
CREATE TABLE IF NOT EXISTS public.visitas_pendientes (
    id TEXT PRIMARY KEY,
    visitante_nombre VARCHAR(150),
    "visitanteNombre" VARCHAR(150),
    condo_destino VARCHAR(100),
    "condoDestino" VARCHAR(100),
    tipo_visita VARCHAR(50) DEFAULT 'Invitado',
    "tipoVisita" VARCHAR(50) DEFAULT 'Invitado',
    placas VARCHAR(50),
    estatus VARCHAR(30) DEFAULT 'en_espera',
    tiene_restriccion_moroso BOOLEAN DEFAULT false,
    "tieneRestriccionMoroso" BOOLEAN DEFAULT false,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "fechaHora" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. TABLA INVITADOS FRECUENTES
CREATE TABLE IF NOT EXISTS public.invitados_frecuentes (
    id TEXT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    relacion VARCHAR(100),
    dias_permitidos VARCHAR(150),
    "diasPermitidos" VARCHAR(150),
    placas VARCHAR(50),
    estatus VARCHAR(30) DEFAULT 'activo',
    residente_id TEXT,
    condo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. TABLA RECEPTORES FISCALES (CFDI 4.0)
CREATE TABLE IF NOT EXISTS public.fiscal_receptors (
    id TEXT PRIMARY KEY,
    condo VARCHAR(100),
    rfc VARCHAR(20) NOT NULL,
    razon_social VARCHAR(200) NOT NULL,
    "razonSocial" VARCHAR(200),
    cp VARCHAR(10) NOT NULL,
    regimen VARCHAR(20) NOT NULL,
    uso_cfdi VARCHAR(20) NOT NULL,
    "usoCfdi" VARCHAR(20),
    status VARCHAR(30) DEFAULT 'verificado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. TABLA COBROS SAAS (SUPERADMIN LICENCIAS)
CREATE TABLE IF NOT EXISTS public.cobros_saas (
    id TEXT PRIMARY KEY,
    condo_nombre VARCHAR(150) NOT NULL,
    "condoNombre" VARCHAR(150),
    plan VARCHAR(50) DEFAULT 'Premium',
    monto NUMERIC(12,2) NOT NULL,
    fecha_cobro DATE DEFAULT CURRENT_DATE,
    "fechaCobro" DATE DEFAULT CURRENT_DATE,
    estatus VARCHAR(30) DEFAULT 'cobrado',
    metodo VARCHAR(100) DEFAULT 'SPEI / Stripe',
    folio_factura VARCHAR(50),
    "folioFactura" VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. TABLA SOPORTE TICKETS (SOPORTE INTERNO SAAS)
CREATE TABLE IF NOT EXISTS public.soporte_tickets (
    id TEXT PRIMARY KEY,
    condo_nombre VARCHAR(150) NOT NULL,
    "condoNombre" VARCHAR(150),
    asunto VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'Plataforma',
    prioridad VARCHAR(20) DEFAULT 'media',
    estatus VARCHAR(30) DEFAULT 'abierto',
    fecha DATE DEFAULT CURRENT_DATE,
    descripcion TEXT,
    respuesta TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 26. TABLA AUDIT LOGS (AUDITORÍA DEL SISTEMA)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp VARCHAR(50),
    nivel VARCHAR(20) DEFAULT 'info',
    usuario VARCHAR(150),
    condominio VARCHAR(150),
    accion TEXT NOT NULL,
    ip VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 27. TABLA MULTAS E INFRACCIONES
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

-- 28. TABLA VEHÍCULOS Y CONTROL DE ESTACIONAMIENTO
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

-- 29. TABLA MASCOTAS CONDOMINALES
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
-- PERMISOS Y CONTROL DE ACCESO
-- ====================================================================
-- Desactivar Row Level Security (RLS) en todas las tablas para permitir
-- acceso directo a los clientes autorizados de la plataforma.
ALTER TABLE public.system_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_condominio DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.residencias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estructuras_inmobiliarias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.residentes_condominio DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_interno DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reglas_cuotas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_cuotas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conciliacion_bancaria DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.egresos_condominio DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservaciones_amenidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_trabajo DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas_votaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos_extraordinarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.actas_asamblea DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.paqueteria DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitacora_guardia DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas_pendientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitados_frecuentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_receptors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobros_saas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.soporte_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.multas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas DISABLE ROW LEVEL SECURITY;

-- Asignar permisos completos a anon, authenticated y service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ====================================================================
-- USUARIOS ADMINISTRADORES INICIALES (LOGIN SEGURO)
-- ====================================================================
INSERT INTO public.system_roles (
  uid, name, email, username, role, "isActive", is_active, password, "createdAt", created_at
)
VALUES 
(
  'condo-harold-uid',
  'Harold Anguiano (Administrador)',
  'harold.anguiano@condominios.local',
  'harold.anguiano',
  'admin',
  true,
  true,
  'Chevropar#1970',
  NOW(),
  NOW()
),
(
  'condo-admin-uid',
  'Administrador de Condominios',
  'admin@condominios.local',
  'admin',
  'admin',
  true,
  true,
  'Admin_123',
  NOW(),
  NOW()
)
ON CONFLICT (uid) DO UPDATE 
SET 
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "isActive" = true,
  is_active = true;

SELECT 'Base de datos de Condominios CNLS configurada y actualizada exitosamente' AS resultado;
