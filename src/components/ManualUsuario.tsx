import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Shield, 
  Users, 
  Home, 
  Smartphone, 
  ScanLine, 
  MessageSquare, 
  AlertTriangle, 
  ChevronRight, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ClipboardCheck, 
  FileText, 
  DollarSign, 
  Landmark, 
  Calendar, 
  Package, 
  Building2, 
  CheckCheck, 
  Download 
} from 'lucide-react';

interface ManualUsuarioProps {
  onGoToTab?: (tab: string) => void;
}

export const ManualUsuario: React.FC<ManualUsuarioProps> = ({ onGoToTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'roles' | 'propiedades' | 'finanzas' | 'conciliacion' | 'amenidades' | 'caseta' | 'comunicacion'>('all');

  const manualSteps = [
    {
      id: 'step-1',
      category: 'roles',
      title: '1. Arquitectura Multi-Rol y Acceso al Sistema',
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      tag: 'Seguridad & Roles',
      description: 'Conoce los 5 paneles integrados en la plataforma y cómo cambiar de perfil según la responsabilidad.',
      points: [
        {
          title: 'Panel 1: Super Administrador (SaaS Owner)',
          text: 'Supervisión global de todos los condominios registrados, control de clientes, métricas financieras de licencias (MRR, ARR, Churn Rate) y auditoría de accesos.'
        },
        {
          title: 'Panel 2: Administrador del Condominio / Inmobiliaria',
          text: 'Gestión diaria del desarrollo: catálogo de torres y departamentos, cobro de cuotas, conciliación bancaria SPEI, personal operativo y mesa de ayuda.'
        },
        {
          title: 'Panel 3: Comité de Vigilancia',
          text: 'Auditoría financiera independiente, revisión de estados de cuenta vs presupuestos extraordinarios y validación de actas de asamblea con firma digital.'
        },
        {
          title: 'Panel 4: Residente / Propietario (PWA Móvil)',
          text: 'Portal de autogestión para consultar adeudos, descargar recibos, generar pases QR para invitados por WhatsApp, reservar amenidades y votar en asambleas.'
        },
        {
          title: 'Panel 5: Caseta de Seguridad & Conserje',
          text: 'Control de visitas en vivo con alerta inmediata de morosidad, bitácora de guardias por turno y registro de paquetería (Amazon, Mercado Libre, etc.).'
        }
      ],
      tip: 'Puedes alternar rápidamente entre roles utilizando el menú de hamburguesa en la esquina superior izquierda o el botón "Cambiar Rol".'
    },
    {
      id: 'step-2',
      category: 'propiedades',
      title: '2. Estructura Inmobiliaria y Catálogo de Residentes',
      icon: <Building2 className="w-5 h-5 text-blue-400" />,
      tag: 'Gestión de Unidades',
      description: 'Configura la distribución física del condominio (Torres, Secciones, Lotes) y vincula a los residentes y personal.',
      points: [
        {
          title: 'Alta de Torres, Manzanas o Lotes',
          text: 'En la pestaña "1. Comunidad & Propiedades", registra la estructura seleccionando el tipo (Torre, Manzana, Lote, Cluster), asigna el nombre y la cantidad de departamentos o casas.'
        },
        {
          title: 'Padrón de Residentes',
          text: 'Registra a propietarios e inquilinos asignándoles su unidad específica. El sistema monitoreará automáticamente su estatus de pago (Al día ✓ o Moroso ⚠).'
        },
        {
          title: 'Personal Operativo y de Caseta',
          text: 'Registra a los guardias de seguridad, técnicos de mantenimiento y personal de limpieza con sus respectivos turnos (Matutino, Vespertino, Nocturno, 24x24).'
        }
      ],
      tip: 'Al registrar una unidad con formato claro (ej. "Torre A - Depto 102"), los módulos de conciliación y caseta identificarán automáticamente las referencias de pago y visitas.'
    },
    {
      id: 'step-3',
      category: 'finanzas',
      title: '3. Finanzas, Emisión de Cuotas y Cobranza',
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      tag: 'Control Financiero',
      description: 'Emisión de cargos ordinarios y extraordinarios, estados de cuenta y monitoreo de cartera vencida.',
      points: [
        {
          title: 'Emisión de Cuotas Comunales',
          text: 'En la pestaña "2. Finanzas & Cobranza", utiliza el formulario "Emitir Nueva Cuota". Selecciona la unidad, nombre del residente, concepto (ej. Mantenimiento mensual), monto y fecha límite de pago.'
        },
        {
          title: 'Seguimiento de Pagos y Filtros',
          text: 'Filtra las cuotas por estatus (Todos, Pagado, Pendiente, Vencido). Los residentes con pagos vencidos son etiquetados automáticamente como morosos en todo el sistema.'
        },
        {
          title: 'Recepción de Pagos y Pasarela',
          text: 'Los residentes pueden abonar con tarjeta de crédito/débito o transferencia SPEI. Como administrador puedes registrar el pago manual o usar la pasarela integrada.'
        },
        {
          title: 'Emisión de Estados de Cuenta Oficiales',
          text: 'Presiona el botón "Estado 📄" en cualquier registro para visualizar e imprimir el comprobante detallado con código QR y desglose de recargos.'
        }
      ],
      tip: 'Mantén las fechas de vencimiento al día. El sistema calcula automáticamente el recargo por mora según las reglas configuradas.'
    },
    {
      id: 'step-4',
      category: 'conciliacion',
      title: '4. Módulo de Conciliación Bancaria (SPEI / Depósitos)',
      icon: <Landmark className="w-5 h-5 text-purple-400" />,
      tag: 'Finanzas Automatizadas',
      description: 'Aprende paso a paso cómo cruzar los extractos bancarios con los saldos de los residentes para conciliar cuentas en segundos.',
      points: [
        {
          title: 'Paso 1: Recepción del Movimiento Bancario',
          text: 'Accede a "3. Conciliación Bancaria". Verás la lista de movimientos registrados en la cuenta bancaria del condominio (fecha, concepto bancario, referencia SPEI y monto en pesos).'
        },
        {
          title: 'Paso 2: Registro Manual o Importación de Extracto',
          text: 'Para agregar un nuevo depósito, utiliza el formulario superior "Registrar Movimiento Bancario". Captura la referencia del banco (ej. SPEI-88210), el concepto, el monto exacto y selecciona la unidad sugerida.'
        },
        {
          title: 'Paso 3: Auto-Conciliación Inteligente',
          text: 'Presiona el botón "Auto-Conciliar por Referencia ⚡". El algoritmo cruzará las claves de rastreo y montos con los adeudos pendientes, liquidando automáticamente los que coincidan.'
        },
        {
          title: 'Paso 4: Conciliación Manual Unitaria',
          text: 'En caso de transferencias sin referencia clara, selecciona en la tabla la unidad correspondiente mediante el menú desplegable y presiona "Conciliar Pago ✓". El sistema cambiará el estatus a "Conciliado", liquidará la cuota en el módulo de pagos y emitirá un folio oficial de recibo.'
        },
        {
          title: 'Paso 5: Reversión y Exportación',
          text: 'Si cometiste un error, presiona "Revertir ↺" para desconciliar el pago. Además, puedes presionar "Exportar a Excel / CSV 📊" para entregar el reporte financiero al Comité de Vigilancia.'
        }
      ],
      tip: 'Solicita a los residentes colocar siempre el número de su departamento (ej. "D-102") en el concepto de su transferencia SPEI para que la auto-conciliación sea 100% inmediata.'
    },
    {
      id: 'step-5',
      category: 'amenidades',
      title: '5. Reservación de Amenidades y Control de Aforos',
      icon: <Calendar className="w-5 h-5 text-amber-400" />,
      tag: 'Operación & Convivencia',
      description: 'Gestión inteligente de áreas comunes (Alberca, Salón de Eventos, Asadores, Canchas).',
      points: [
        {
          title: 'Calendario de Disponibilidad',
          text: 'Los residentes y el administrador pueden seleccionar el espacio, la fecha y el horario deseado. El sistema bloquea empalmes de reservas de forma automática.'
        },
        {
          title: 'Bloqueo Automático a Morosos',
          text: 'Si una unidad presenta adeudos pendientes o vencidos, el sistema restringe automáticamente la reserva de áreas comunes hasta que regularice su situación contable.'
        },
        {
          title: 'Aprobación y Confirmación',
          text: 'El administrador puede validar o confirmar las reservas, generando un pase de uso con términos y condiciones del reglamento del condominio.'
        }
      ],
      tip: 'Puedes configurar cuotas de recuperación o depósitos en garantía para el salón de eventos en el catálogo de amenidades.'
    },
    {
      id: 'step-6',
      category: 'caseta',
      title: '6. Seguridad en Caseta, Pases QR y Paquetería',
      icon: <ScanLine className="w-5 h-5 text-emerald-400" />,
      tag: 'Seguridad 24/7',
      description: 'Flujo operativo para guardias de caseta: validación de pases QR, control de accesos y encomiendas.',
      points: [
        {
          title: 'Pases de Visita QR desde la App',
          text: 'El residente genera un código QR temporal con el nombre del visitante y placas vehiculares, y lo comparte con un solo clic por WhatsApp.'
        },
        {
          title: 'Escaneo y Verificación en Caseta',
          text: 'El oficial de guardia escanea el QR del visitante. La pantalla muestra en verde el acceso autorizado o alerta en rojo si el pase ha expirado.'
        },
        {
          title: 'Alerta de Restricción de Morosidad',
          text: 'Si el departamento visitado tiene cuotas vencidas, el oficial verá una alerta especial en pantalla para solicitar registro adicional según el reglamento.'
        },
        {
          title: 'Recepción de Paquetería',
          text: 'El guardia registra los paquetes que llegan de paqueterías (DHL, FedEx, Amazon), notificando al residente y registrando la firma de entrega.'
        }
      ],
      tip: 'Los guardias pueden registrar incidencias y cambios de turno en la "Bitácora Digital" para mantener un historial auditable sin papel.'
    },
    {
      id: 'step-7',
      category: 'comunicacion',
      title: '7. Comunicación, Avisos y Votaciones de Asamblea',
      icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
      tag: 'Comunidad & Acuerdos',
      description: 'Muro de noticias oficial, asambleas virtuales con votación electrónica y actas digitales.',
      points: [
        {
          title: 'Muro de Boletines y Avisos',
          text: 'Publica comunicados oficiales (mantenimientos programados, avisos de seguridad, avisos de corte de agua) visibles al instante en la app de los condóminos.'
        },
        {
          title: 'Encuestas y Votaciones Electrónicas',
          text: 'Somete a votación proyectos y mejoras (ej. pintura de fachadas, automatización de portones). El sistema contabiliza los votos en tiempo real.'
        },
        {
          title: 'Bóveda de Actas y Documentos',
          text: 'El Comité y la Administración pueden subir contratos con proveedores, reglamentos interiores y actas firmadas digitalmente para consulta transparente.'
        }
      ],
      tip: 'Utiliza las votaciones electrónicas para medir la aprobación previa de presupuestos extraordinarios antes de convocar a asamblea presencial.'
    }
  ];

  // Filtering logic
  const filteredSteps = manualSteps.filter(step => {
    const matchesSearch = 
      step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.points.some(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.text.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || step.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="manual-usuario-module" className="bg-[#1E1E22] border border-[#2d2d32] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden font-sans text-left animate-fade-in">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 blur-3xl rounded-full pointer-events-none"></div>
      
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#2d2d32] gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Manual del Usuario del Administrador</h2>
              <span className="px-2 py-0.5 text-[9px] bg-purple-500/20 text-purple-300 font-extrabold uppercase rounded-full border border-purple-500/30 font-mono">
                Activo v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Guía completa, interactiva y paso a paso para la operación eficiente del sistema de administración de condominios.
            </p>
          </div>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          {onGoToTab && (
            <button
              onClick={() => onGoToTab('conciliacion')}
              className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-lg shadow-purple-900/30"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Ir a Conciliación Bancaria →</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="manual-search-input"
            type="text"
            placeholder="Buscar tema (ej. conciliación bancaria, cuotas, pases QR, torres)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#141417] border border-[#2d2d32] text-white text-xs sm:text-sm rounded-xl focus:border-purple-500 focus:outline-hidden font-sans placeholder:text-slate-500"
          />
        </div>
        
        {/* Category Filters Pill Box */}
        <div className="flex flex-wrap gap-1.5 self-start md:self-auto">
          {[
            { id: 'all', label: 'Todos los Temas' },
            { id: 'roles', label: '1. Roles' },
            { id: 'propiedades', label: '2. Propiedades' },
            { id: 'finanzas', label: '3. Finanzas' },
            { id: 'conciliacion', label: '4. Conciliación SPEI' },
            { id: 'amenidades', label: '5. Amenidades' },
            { id: 'caseta', label: '6. Caseta & QR' },
            { id: 'comunicacion', label: '7. Comunicación' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold transition uppercase cursor-pointer ${
                activeCategory === cat.id 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-[#141417] text-slate-400 hover:text-white border border-[#2d2d32]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Content Steps Grid */}
      <div className="mt-6 space-y-4">
        {filteredSteps.length > 0 ? (
          filteredSteps.map((step) => (
            <div 
              key={step.id} 
              className="bg-[#141417] border border-[#232326] hover:border-purple-500/40 rounded-2xl p-5 sm:p-6 transition-all duration-200"
            >
              {/* Step Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1E1E22] border border-[#2d2d32] flex items-center justify-center">
                    {step.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    {step.title}
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 bg-purple-500/15 text-purple-300 rounded-md border border-purple-500/20">
                  {step.tag}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4 font-sans">
                {step.description}
              </p>

              {/* Step Key Points */}
              <div className="space-y-3 border-l-2 border-purple-500/50 pl-4 ml-1">
                {step.points.map((point, pIndex) => (
                  <div key={pIndex} className="relative">
                    {/* Bullet marker */}
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-purple-400"></div>
                    
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {point.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mt-0.5 font-sans">
                      {point.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pro-Tip Box */}
              <div className="mt-4 p-3.5 bg-purple-950/20 border border-purple-500/20 rounded-xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-purple-200 font-sans leading-relaxed">
                  <strong>💡 Recomendación Operativa:</strong> {step.tip}
                </p>
              </div>

              {/* Special shortcut button for Conciliación Bancaria step */}
              {step.category === 'conciliacion' && onGoToTab && (
                <div className="mt-3 pt-3 border-t border-[#232326] flex justify-end">
                  <button
                    onClick={() => onGoToTab('conciliacion')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Landmark className="w-3.5 h-3.5" /> Abrir Módulo de Conciliación Bancaria Ahora
                  </button>
                </div>
              )}

            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-[#141417] rounded-2xl border border-dashed border-[#2d2d32]">
            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-xs text-slate-300">No encontramos resultados para tu búsqueda.</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} 
              className="mt-3 text-xs text-purple-400 hover:underline font-bold"
            >
              Limpiar filtros y ver todos los temas
            </button>
          </div>
        )}
      </div>

      {/* Quick Summary Reference Card */}
      <div className="mt-8 bg-[#141417] border border-[#2d2d32] rounded-2xl p-5 relative">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider font-mono">
            Flujo Rápido de Operación Diaria para el Administrador
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#1E1E22] border border-[#2d2d32] rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-purple-400 font-mono">Paso 1: Al iniciar el mes</span>
            <p className="font-bold text-white text-xs">Generar Cuotas</p>
            <p className="text-[10.5px] text-slate-400">Emite los cargos del mes por torre o departamento con fecha de vencimiento.</p>
          </div>

          <div className="p-3 bg-[#1E1E22] border border-[#2d2d32] rounded-2xl rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 font-mono">Paso 2: A diario</span>
            <p className="font-bold text-white text-xs">Conciliar SPEI</p>
            <p className="text-[10.5px] text-slate-400">Cruza los depósitos bancarios recibidos con las unidades para acreditar pagos.</p>
          </div>

          <div className="p-3 bg-[#1E1E22] border border-[#2d2d32] rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-amber-400 font-mono">Paso 3: Al corte de fecha</span>
            <p className="font-bold text-white text-xs">Supervisar Morosos</p>
            <p className="text-[10.5px] text-slate-400">El sistema restringe pases de visita y reservas de amenidades a unidades en mora.</p>
          </div>

          <div className="p-3 bg-[#1E1E22] border border-[#2d2d32] rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-blue-400 font-mono">Paso 4: Fin de mes</span>
            <p className="font-bold text-white text-xs">Reportes a Comité</p>
            <p className="text-[10.5px] text-slate-400">Exporta a Excel o PDF la balanza de ingresos, egresos y conciliación bancaria.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

