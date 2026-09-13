import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Building, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  ShieldCheck, 
  Calendar,
  Layers,
  PieChart
} from 'lucide-react';
import { InfraccionMulta } from '../types';

interface PaymentData {
  id: string;
  condo: string;
  resident: string;
  concept: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentMethod?: string;
  paymentDate?: string;
}

interface EgresoData {
  id: string;
  proveedor: string;
  concepto: string;
  monto: number;
  categoria: string;
  fecha: string;
  facturaXmlPdf?: boolean;
  estatus?: string;
}

interface UnidadData {
  id: string;
  identificador: string;
  propietarioNombre: string;
  mantenimientoCuota: number;
  estatusMorosidad: string;
}

interface ReporteFinancieroAsambleaProps {
  isOpen: boolean;
  onClose: () => void;
  condominioNombre: string;
  administradorNombre: string;
  payments: PaymentData[];
  egresos: EgresoData[];
  unidades: UnidadData[];
  infracciones?: InfraccionMulta[];
}

export const ReporteFinancieroAsamblea: React.FC<ReporteFinancieroAsambleaProps> = ({
  isOpen,
  onClose,
  condominioNombre,
  administradorNombre,
  payments,
  egresos,
  unidades,
  infracciones = []
}) => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'actual' | 'bimestral' | 'anual'>('actual');

  if (!isOpen) return null;

  // Calculos Financieros Consolidados
  const totalEmitido = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalRecaudado = payments
    .filter(p => p.status === 'pagado')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalVencido = payments
    .filter(p => p.status === 'vencido' || p.status === 'pendiente')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const totalEgresos = egresos.reduce((acc, e) => acc + (Number(e.monto) || 0), 0);
  const balanceNeto = totalRecaudado - totalEgresos;
  const tasaRecaudacion = totalEmitido > 0 ? Math.round((totalRecaudado / totalEmitido) * 100) : 100;

  // Total Multas Pendientes de Cobro
  const totalMultasPendientes = infracciones
    .filter(inf => inf.estatus === 'pendiente')
    .reduce((acc, inf) => acc + (Number(inf.monto) || 0), 0);

  // Semáforo de Morosidad por Unidad
  const unidadesConStatus = unidades.map(u => {
    const pagosUnidad = payments.filter(p => 
      p.condo.toLowerCase().includes(u.identificador.toLowerCase()) || 
      u.identificador.toLowerCase().includes(p.condo.toLowerCase())
    );
    const tieneVencidos = pagosUnidad.some(p => p.status === 'vencido');
    const saldoAdeudado = pagosUnidad
      .filter(p => p.status === 'vencido' || p.status === 'pendiente')
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);
    
    // Meses adeudados aproximados
    const meses = u.mantenimientoCuota > 0 ? Math.ceil(saldoAdeudado / u.mantenimientoCuota) : (saldoAdeudado > 0 ? 1 : 0);

    let riesgo: 'verde' | 'amarillo' | 'rojo' = 'verde';
    if (meses >= 2 || u.estatusMorosidad === 'moroso') {
      riesgo = 'rojo';
    } else if (meses === 1 || saldoAdeudado > 0) {
      riesgo = 'amarillo';
    }

    return {
      ...u,
      saldoAdeudado,
      meses,
      riesgo
    };
  });

  const unidadesVerdes = unidadesConStatus.filter(u => u.riesgo === 'verde').length;
  const unidadesAmarillas = unidadesConStatus.filter(u => u.riesgo === 'amarillo').length;
  const unidadesRojas = unidadesConStatus.filter(u => u.riesgo === 'rojo').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ['INFORME FINANCIERO OFICIAL - ASAMBLEA ORDINARIA'],
      ['Condominio:', condominioNombre],
      ['Administrador:', administradorNombre],
      ['Fecha de Emisión:', new Date().toLocaleDateString('es-MX')],
      [''],
      ['RESUMEN EJECUTIVO'],
      ['Total Cuotas Emitidas', `$${totalEmitido.toLocaleString()}`],
      ['Total Recaudado', `$${totalRecaudado.toLocaleString()}`],
      ['Cartera Vencida (Adeudos)', `$${totalVencido.toLocaleString()}`],
      ['Egresos Operativos Totales', `$${totalEgresos.toLocaleString()}`],
      ['Superávit / Balance Neto', `$${balanceNeto.toLocaleString()}`],
      ['Tasa de Eficacia en Cobranza', `${tasaRecaudacion}%`],
      [''],
      ['ANTIGÜEDAD DE SALDOS Y MOROSIDAD POR UNIDAD'],
      ['Unidad / Depto', 'Propietario', 'Cuota Ordinaria', 'Saldo Vencido', 'Meses Adeudados', 'Semáforo de Riesgo'],
      ...unidadesConStatus.map(u => [
        u.identificador,
        u.propietarioNombre || 'No asignado',
        `$${u.mantenimientoCuota}`,
        `$${u.saldoAdeudado}`,
        u.meses.toString(),
        u.riesgo === 'verde' ? 'AL DIA (VERDE)' : u.riesgo === 'amarillo' ? 'PREVENTIVO 1 MES (AMARILLO)' : 'MOROSO GRAVE (ROJO)'
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Asamblea_${condominioNombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Contenedor Principal del Documento */}
      <div className="bg-[#18181B] border border-[#2d2d32] rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-10 text-white font-sans text-left relative print:max-w-none print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black print:p-8">
        
        {/* Barra Superior de Herramientas (Oculta en Impresión) */}
        <div className="flex flex-wrap items-center justify-between pb-6 border-b border-[#2d2d32] gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Dossier Financiero Oficial para Asamblea</h2>
              <p className="text-xs text-slate-400">Rendición de cuentas, balance operativo y semáforo de morosidad institucional</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-[#27272A] hover:bg-[#323238] text-slate-200 text-xs font-semibold rounded-xl border border-[#3f3f46] flex items-center gap-1.5 cursor-pointer transition"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-[#27272A] hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-xl transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DOCUMENTO FORMAL (Diseño Apto para Impresión y Pantalla) */}
        {/* ========================================================================= */}
        <div className="mt-6 space-y-8 print:mt-0 print:space-y-6">
          
          {/* Membrete Institucional */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2d2d32] print:border-gray-300 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 print:bg-gray-100 print:text-gray-800 rounded-md border border-purple-500/30 print:border-gray-300">
                  Documento Oficial de Asamblea
                </span>
                <span className="text-xs text-slate-400 print:text-gray-500">Folio: DOS-{new Date().getFullYear()}-01</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-2 text-white print:text-black tracking-tight">
                {condominioNombre}
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                Régimen de Propiedad en Condominio | Asamblea General Ordinaria de Condóminos
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 text-xs text-slate-300 print:text-gray-700">
              <p><strong className="text-white print:text-black">Administrador Responsable:</strong> {administradorNombre}</p>
              <p><strong className="text-white print:text-black">Fecha de Corte:</strong> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong className="text-white print:text-black">Quórum Registrado:</strong> {unidades.length} Unidades Inmobiliarias</p>
            </div>
          </div>

          {/* Resumen Ejecutivo de Cifras Clave (Bento Grid) */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 print:text-purple-700 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              1. Estado de Resultados y Balance Operativo
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
              <div className="p-4 bg-[#141417] print:bg-gray-50 border border-[#27272A] print:border-gray-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Presupuesto Emitido</span>
                <div className="text-lg sm:text-xl font-black text-white print:text-black mt-1">
                  ${totalEmitido.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Cuotas ordinarias del mes</div>
              </div>

              <div className="p-4 bg-emerald-500/10 print:bg-emerald-50 border border-emerald-500/30 print:border-emerald-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-emerald-400 print:text-emerald-700">Ingresos Recaudados</span>
                <div className="text-lg sm:text-xl font-black text-emerald-400 print:text-emerald-700 mt-1">
                  ${totalRecaudado.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-300 font-bold mt-1">Tasa Cobranza: {tasaRecaudacion}%</div>
              </div>

              <div className="p-4 bg-[#141417] print:bg-gray-50 border border-[#27272A] print:border-gray-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Egresos Operativos</span>
                <div className="text-lg sm:text-xl font-black text-amber-400 print:text-amber-700 mt-1">
                  ${totalEgresos.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{egresos.length} facturas pagadas</div>
              </div>

              <div className="p-4 bg-purple-500/10 print:bg-purple-50 border border-purple-500/30 print:border-purple-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-purple-400 print:text-purple-700">Superávit Operativo</span>
                <div className="text-lg sm:text-xl font-black text-purple-300 print:text-purple-900 mt-1">
                  ${balanceNeto.toLocaleString()}
                </div>
                <div className="text-[10px] text-purple-300 mt-1">Saldo neto disponible en bancos</div>
              </div>
            </div>
          </div>

          {/* Semáforo de Morosidad y Antigüedad de Saldos */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                2. Antigüedad de Saldos y Semáforo de Morosidad por Unidad
              </h3>
              
              {/* Resumen Semáforo */}
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 print:border-emerald-300">
                  ● Al día: {unidadesVerdes}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 print:border-amber-300">
                  ● Alerta (1 mes): {unidadesAmarillas}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 font-bold border border-red-500/30 print:border-red-300">
                  ● Crítico (2+ meses): {unidadesRojas}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#27272A] print:border-gray-300 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#141417] print:bg-gray-100 text-slate-400 print:text-gray-700 uppercase font-black text-[10px] border-b border-[#27272A] print:border-gray-300">
                  <tr>
                    <th className="py-3 px-4">Unidad / Depto</th>
                    <th className="py-3 px-4">Propietario Registrado</th>
                    <th className="py-3 px-4 text-right">Cuota Base</th>
                    <th className="py-3 px-4 text-center">Meses Adeudados</th>
                    <th className="py-3 px-4 text-right">Saldo Total Vencido</th>
                    <th className="py-3 px-4 text-center">Estatus Semáforo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A] print:divide-gray-200">
                  {unidadesConStatus.slice(0, 15).map((u, i) => (
                    <tr key={u.id || i} className="hover:bg-white/[0.02] print:hover:bg-transparent">
                      <td className="py-2.5 px-4 font-bold text-white print:text-black">{u.identificador}</td>
                      <td className="py-2.5 px-4 text-slate-300 print:text-gray-700">{u.propietarioNombre || 'Propietario'}</td>
                      <td className="py-2.5 px-4 text-right text-slate-400 print:text-gray-600 font-mono">${u.mantenimientoCuota.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-center font-bold">
                        {u.meses > 0 ? (
                          <span className="text-amber-400 print:text-amber-700">{u.meses} mes(es)</span>
                        ) : (
                          <span className="text-emerald-400 print:text-emerald-700">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-black">
                        {u.saldoAdeudado > 0 ? (
                          <span className="text-red-400 print:text-red-700">${u.saldoAdeudado.toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-400 print:text-emerald-700">$0.00</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {u.riesgo === 'verde' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 print:bg-emerald-100 print:text-emerald-800">
                            ✓ Al corriente
                          </span>
                        )}
                        {u.riesgo === 'amarillo' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 print:bg-amber-100 print:text-amber-800">
                            ⚠ Recordatorio
                          </span>
                        )}
                        {u.riesgo === 'rojo' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 print:bg-red-100 print:text-red-800">
                            ⛔ Jurídico / Bloqueo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {unidadesConStatus.length > 15 && (
              <p className="text-[10px] text-slate-500 print:text-gray-500 italic text-right">
                * Mostrando primeras 15 de {unidadesConStatus.length} unidades. Exportar a CSV para el listado completo.
              </p>
            )}
          </div>

          {/* Desglose de Egresos Principales */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              3. Desglose de Gastos y Facturas de Proveedores
            </h3>
            <div className="overflow-x-auto border border-[#27272A] print:border-gray-300 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#141417] print:bg-gray-100 text-slate-400 print:text-gray-700 uppercase font-black text-[10px] border-b border-[#27272A] print:border-gray-300">
                  <tr>
                    <th className="py-2.5 px-4">Fecha</th>
                    <th className="py-2.5 px-4">Proveedor / Empresa</th>
                    <th className="py-2.5 px-4">Concepto del Gasto</th>
                    <th className="py-2.5 px-4">Categoría</th>
                    <th className="py-2.5 px-4 text-right">Monto Pagado</th>
                    <th className="py-2.5 px-4 text-center">Factura SAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A] print:divide-gray-200">
                  {egresos.slice(0, 6).map((eg, i) => (
                    <tr key={eg.id || i}>
                      <td className="py-2 px-4 text-slate-400 print:text-gray-600 font-mono text-[11px]">{eg.fecha}</td>
                      <td className="py-2 px-4 font-bold text-white print:text-black">{eg.proveedor}</td>
                      <td className="py-2 px-4 text-slate-300 print:text-gray-700">{eg.concepto}</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#27272A] print:bg-gray-200 text-slate-300 print:text-gray-800">
                          {eg.categoria}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-white print:text-black">
                        ${Number(eg.monto).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold">XML / PDF ✓</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloque Legal de Aprobación y Firmas */}
          <div className="pt-8 border-t border-[#2d2d32] print:border-gray-400 space-y-6">
            <p className="text-[11px] text-slate-400 print:text-gray-600 text-center max-w-3xl mx-auto italic">
              «El presente informe financiero ha sido elaborado conforme a los estados de cuenta bancarios, facturas fiscales y registros del sistema de administración de condominios, poniéndose a disposición de la Asamblea General y del Comité de Vigilancia para su debida aprobación.»
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 text-center text-xs">
              <div className="space-y-2">
                <div className="border-b border-dashed border-slate-500 print:border-gray-400 w-4/5 mx-auto pb-6"></div>
                <p className="font-black text-white print:text-black">{administradorNombre}</p>
                <p className="text-[10px] text-slate-400 print:text-gray-600">Administrador General del Condominio</p>
                <p className="text-[9px] text-purple-400 print:text-purple-700">Firma y Certificación</p>
              </div>

              <div className="space-y-2">
                <div className="border-b border-dashed border-slate-500 print:border-gray-400 w-4/5 mx-auto pb-6"></div>
                <p className="font-black text-white print:text-black">Presidente del Comité</p>
                <p className="text-[10px] text-slate-400 print:text-gray-600">Comité de Vigilancia y Fiscalización</p>
                <p className="text-[9px] text-emerald-400 print:text-emerald-700">Visto Bueno y Aprobación</p>
              </div>

              <div className="space-y-2">
                <div className="border-b border-dashed border-slate-500 print:border-gray-400 w-4/5 mx-auto pb-6"></div>
                <p className="font-black text-white print:text-black">Vocal de Finanzas</p>
                <p className="text-[10px] text-slate-400 print:text-gray-600">Mesa Directiva del Condominio</p>
                <p className="text-[9px] text-blue-400 print:text-blue-700">Revisión de Quórum</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
