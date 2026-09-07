-- ====================================================================
-- SCRIPT SEGURO DE LIMPIEZA TOTAL DE DATOS DE PRUEBA EN SUPABASE
-- (100% SEGURO: Solo borra si la tabla existe, nunca arroja error de relación)
-- ====================================================================

DO $$
BEGIN
  -- 1. Eliminar Condominios y Clientes de Demostración
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clientes_condominio') THEN
    DELETE FROM public.clientes_condominio 
    WHERE id IN ('cli-1', 'cli-2', 'cli-3', 'cli-4') 
       OR nombre ILIKE '%Chapultepec%' 
       OR nombre ILIKE '%Bosques del Portal%' 
       OR nombre ILIKE '%Torres Alameda%' 
       OR nombre ILIKE '%Puerta del Sol%'
       OR nombre ILIKE '%Paseo de las Palmas%'
       OR nombre ILIKE '%Valle Oriente%';
  END IF;

  -- 2. Eliminar Residencias de Demostración
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'residencias') THEN
    DELETE FROM public.residencias 
    WHERE id IN ('cli-1', 'cli-2', 'cli-3', 'cli-4') 
       OR nombre ILIKE '%Chapultepec%' 
       OR nombre ILIKE '%Bosques del Portal%' 
       OR nombre ILIKE '%Torres Alameda%' 
       OR nombre ILIKE '%Puerta del Sol%'
       OR nombre ILIKE '%Paseo de las Palmas%'
       OR nombre ILIKE '%Valle Oriente%';
  END IF;

  -- 3. Eliminar Estructuras Inmobiliarias de Demostración
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'estructuras_inmobiliarias') THEN
    DELETE FROM public.estructuras_inmobiliarias 
    WHERE id IN ('est-1', 'est-2', 'est-3')
       OR nombre ILIKE '%Paseo de las Palmas%'
       OR nombre ILIKE '%Valle Oriente%'
       OR nombre ILIKE '%Cluster Lomas%';
  END IF;

  -- 4. Eliminar Residentes y Unidades de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'residentes_condominio') THEN
    DELETE FROM public.residentes_condominio WHERE id IN ('res-1', 'res-2', 'res-3', 'res-4');
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'unidades') THEN
    DELETE FROM public.unidades WHERE id IN ('uni-1', 'uni-2', 'uni-3', 'uni-4');
  END IF;

  -- 5. Eliminar Pagos y Cuotas de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pagos_cuotas') THEN
    DELETE FROM public.pagos_cuotas WHERE id IN ('pay-1', 'pay-2', 'pay-3', 'pay-4', 'pay-5');
  END IF;

  -- 6. Eliminar Reglas de Cuotas de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reglas_cuotas') THEN
    DELETE FROM public.reglas_cuotas WHERE id IN ('cuo-1', 'cuo-2');
  END IF;

  -- 7. Eliminar Egresos de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'egresos_condominio') THEN
    DELETE FROM public.egresos_condominio WHERE id IN ('egr-1', 'egr-2', 'egr-3');
  END IF;

  -- 8. Eliminar Paquetería de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'paqueteria') THEN
    DELETE FROM public.paqueteria WHERE id IN ('pkg-1', 'pkg-2', 'pkg-3');
  END IF;

  -- 9. Eliminar Bitácora de Guardia de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bitacora_guardia') THEN
    DELETE FROM public.bitacora_guardia WHERE id IN ('bit-1', 'bit-2', 'bit-3');
  END IF;

  -- 10. Eliminar Reservaciones de Amenidades de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reservaciones_amenidades') THEN
    DELETE FROM public.reservaciones_amenidades WHERE id IN ('resv-1', 'resv-2');
  END IF;

  -- 11. Eliminar Tickets y Órdenes de Trabajo de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ordenes_trabajo') THEN
    DELETE FROM public.ordenes_trabajo WHERE id IN ('tkt-1', 'tkt-2', 'tkt-3');
  END IF;

  -- 12. Eliminar Comunicados de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comunicados') THEN
    DELETE FROM public.comunicados WHERE id IN ('bul-1', 'bul-2');
  END IF;

  -- 13. Eliminar Receptores Fiscales de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fiscal_receptors') THEN
    DELETE FROM public.fiscal_receptors WHERE id IN ('rec-1', 'rec-2', 'rec-3');
  END IF;

  -- 14. Eliminar Cobros SaaS de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cobros_saas') THEN
    DELETE FROM public.cobros_saas WHERE id LIKE 'cbr-%';
  END IF;

  -- 15. Eliminar Tickets de Soporte Interno de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'soporte_tickets') THEN
    DELETE FROM public.soporte_tickets WHERE id LIKE 'tkt-%';
  END IF;

  -- 16. Eliminar Logs de Auditoría de Prueba
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    DELETE FROM public.audit_logs WHERE id LIKE 'log-%';
  END IF;
END $$;

SELECT 'Limpieza total de datos de prueba completada exitosamente' AS resultado;
