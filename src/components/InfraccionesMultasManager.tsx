import React, { useState } from 'react';
import { 
  Scale, 
  AlertTriangle, 
  PlusCircle, 
  CheckCircle2, 
  Camera, 
  DollarSign, 
  Search, 
  Filter, 
  FileText, 
  ShieldAlert, 
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { InfraccionMulta } from '../types';

interface InfraccionesMultasManagerProps {
  infracciones: InfraccionMulta[];
  unidades: { id: string; identificador: string; propietarioNombre: string }[];
  onAgregarInfraccion: (infraccion: InfraccionMulta) => void;
  onCargarAEstadoCuenta: (infraccionId: string) => void;
  onCambiarEstatus: (infraccionId: string, nuevoEstatus: InfraccionMulta['estatus']) => void;
  onEliminarInfraccion?: (infraccionId: string) => void;
}

const CATEGORIAS_INFRACCION = [
  { nombre: 'Ruido excesivo / Fiestas fuera de horario', montoDefault: 1500 },
  { nombre: 'Invasión de cajón de estacionamiento ajeno', montoDefault: 1200 },
  { nombre: 'Mascotas sin correa / Heces sin recoger', montoDefault: 800 },
  { nombre: 'Basura en pasillos o áreas comunes', montoDefault: 600 },
  { nombre: 'Daños materiales a infraestructura comunal', montoDefault: 2500 },
  { nombre: 'Exceso de velocidad vehicular dentro del condominio', montoDefault: 1000 },
  { nombre: 'Uso indebido de amenidades o alberca', montoDefault: 1000 },
  { nombre: 'Otra infracción al Reglamento Interno', montoDefault: 500 }
];

export const InfraccionesMultasManager: React.FC<InfraccionesMultasManagerProps> = ({
  infracciones,
  unidades,
  onAgregarInfraccion,
  onCargarAEstadoCuenta,
  onCambiarEstatus,
  onEliminarInfraccion
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroEstatus, setFiltroEstatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form State
  const [formUnidad, setFormUnidad] = useState('');
  const [formResidente, setFormResidente] = useState('');
  const [formCategoria, setFormCategoria] = useState(CATEGORIAS_INFRACCION[0].nombre);
  const [formMonto, setFormMonto] = useState<number>(CATEGORIAS_INFRACCION[0].montoDefault);
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formEvidenciaUrl, setFormEvidenciaUrl] = useState('');

  // Auto-fill resident name when selecting unit
  const handleSelectUnidad = (unidadIdent: string) => {
    setFormUnidad(unidadIdent);
    const u = unidades.find(unit => unit.identificador === unidadIdent);
    if (u) {
      setFormResidente(u.propietarioNombre || '');
    }
  };

  const handleSelectCategoria = (catNombre: string) => {
    setFormCategoria(catNombre);
    const cat = CATEGORIAS_INFRACCION.find(c => c.nombre === catNombre);
    if (cat) {
      setFormMonto(cat.montoDefault);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUnidad) {
      alert('Por favor selecciona la unidad condominal infractora.');
      return;
    }

    const nuevaInfraccion: InfraccionMulta = {
      id: 'inf-' + Date.now(),
      folio: `INF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      unidad: formUnidad,
      residente: formResidente || 'Residente',
      categoria: formCategoria,
      monto: Number(formMonto) || 500,
      descripcion: formDescripcion || 'Infracción al reglamento de convivencia comunal.',
      evidenciaUrl: formEvidenciaUrl || 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=500&auto=format&fit=crop&q=60',
      fecha: new Date().toISOString().split('T')[0],
      estatus: 'pendiente',
      cargadaAEstadoCuenta: false
    };

    onAgregarInfraccion(nuevaInfraccion);
    setIsModalOpen(false);
    // Reset
    setFormDescripcion('');
    setFormEvidenciaUrl('');
  };

  // Filtrado
  const filteredInfracciones = infracciones.filter(inf => {
    const matchesStatus = filtroEstatus === 'todos' || inf.estatus === filtroEstatus;
    const matchesSearch = 
      inf.unidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.residente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.folio.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPendientes = infracciones.filter(i => i.estatus === 'pendiente').reduce((acc, i) => acc + Number(i.monto), 0);
  const totalCobradas = infracciones.filter(i => i.estatus === 'pagada').reduce((acc, i) => acc + Number(i.monto), 0);

  return (
    <div className="space-y-6 text-left">
      
      {/* Banner Superior & Acciones */}
      <div className="bg-[#1E1E22] border border-[#2d2d32] rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2d32] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Módulo de Infracciones, Multas & Reglamento</h3>
                <span className="px-2 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 font-extrabold uppercase rounded border border-amber-500/30">
                  Jurídico
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Levantamiento de faltas con evidencia fotográfica y cargo automático a estado de cuenta
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Levantar Infracción</span>
          </button>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-[#141417] border border-[#27272A] rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">Infracciones Registradas</span>
            <div className="text-xl font-black text-white mt-1">{infracciones.length} folios</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Historial acumulado del condominio</p>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-amber-400">Por Cobrar en Estado de Cuenta</span>
            <div className="text-xl font-black text-amber-400 mt-1">${totalPendientes.toLocaleString()}</div>
            <p className="text-[10px] text-amber-300/80 mt-0.5">Pendientes de pago o en aclaración</p>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Multas Cobradas con Éxito</span>
            <div className="text-xl font-black text-emerald-400 mt-1">${totalCobradas.toLocaleString()}</div>
            <p className="text-[10px] text-emerald-300/80 mt-0.5">Ingresadas a caja o cuenta bancaria</p>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Depto, Residente o Folio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#141417] border border-[#2d2d32] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['todos', 'pendiente', 'pagada', 'en_aclaracion', 'condonada'].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroEstatus(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer capitalize ${
                  filtroEstatus === status
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-[#141417] text-slate-400 hover:text-white border border-[#27272A]'
                }`}
              >
                {status === 'en_aclaracion' ? 'En Aclaración' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Infracciones */}
      <div className="bg-[#1E1E22] border border-[#2d2d32] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#141417] text-slate-400 uppercase font-black text-[10px] border-b border-[#2d2d32]">
              <tr>
                <th className="py-3 px-4">Folio / Fecha</th>
                <th className="py-3 px-4">Unidad & Residente</th>
                <th className="py-3 px-4">Motivo / Reglamento</th>
                <th className="py-3 px-4 text-center">Evidencia</th>
                <th className="py-3 px-4 text-right">Sanción</th>
                <th className="py-3 px-4 text-center">Estatus</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {filteredInfracciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron infracciones registradas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredInfracciones.map((inf) => (
                  <tr key={inf.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-[11px]">{inf.folio}</div>
                      <div className="text-[10px] text-slate-400">{inf.fecha}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{inf.unidad}</div>
                      <div className="text-[11px] text-slate-400">{inf.residente}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-amber-400">{inf.categoria}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{inf.descripcion}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {inf.evidenciaUrl ? (
                        <a
                          href={inf.evidenciaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-bold bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/30"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Ver Foto</span>
                        </a>
                      ) : (
                        <span className="text-slate-600 text-[10px]">Sin foto</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-amber-300">
                      ${Number(inf.monto).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {inf.estatus === 'pendiente' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Pendiente
                        </span>
                      )}
                      {inf.estatus === 'pagada' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Pagada ✓
                        </span>
                      )}
                      {inf.estatus === 'en_aclaracion' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          En Aclaración
                        </span>
                      )}
                      {inf.estatus === 'condonada' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
                          Condonada
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {inf.estatus === 'pendiente' && !inf.cargadaAEstadoCuenta && (
                        <button
                          onClick={() => onCargarAEstadoCuenta(inf.id)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold shadow transition cursor-pointer"
                          title="Cargar cargo de multa al recibo del departamento"
                        >
                          + Cargar a Recibo
                        </button>
                      )}
                      {inf.estatus === 'pendiente' && (
                        <button
                          onClick={() => onCambiarEstatus(inf.id, 'pagada')}
                          className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          title="Marcar como cobrada"
                        >
                          Cobrar ✓
                        </button>
                      )}
                      {inf.estatus === 'pendiente' && (
                        <button
                          onClick={() => onCambiarEstatus(inf.id, 'condonada')}
                          className="px-2 py-1 bg-slate-700/40 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          title="Condonar falta por el Comité"
                        >
                          Condonar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Levantar Nueva Infracción */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181B] border border-[#2d2d32] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-[#2d2d32] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="text-base font-black text-white">Levantar Infracción al Reglamento</h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Unidad Condominal Infractora *</label>
                <select
                  value={formUnidad}
                  onChange={(e) => handleSelectUnidad(e.target.value)}
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">-- Seleccionar Departamento o Casa --</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.identificador}>
                      {u.identificador} - {u.propietarioNombre || 'Sin nombre'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre del Infractor / Residente</label>
                <input
                  type="text"
                  value={formResidente}
                  onChange={(e) => setFormResidente(e.target.value)}
                  placeholder="Ej. Juan Carlos López"
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Categoría de la Infracción *</label>
                <select
                  value={formCategoria}
                  onChange={(e) => handleSelectCategoria(e.target.value)}
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {CATEGORIAS_INFRACCION.map(c => (
                    <option key={c.nombre} value={c.nombre}>
                      {c.nombre} (Sanción sugerida: ${c.montoDefault})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Monto de la Sanción Económica ($MXN) *</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    value={formMonto}
                    onChange={(e) => setFormMonto(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl pl-9 pr-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Descripción de los Hechos / Testigos</label>
                <textarea
                  rows={3}
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  placeholder="Detallar hora exacta, testigos o afectaciones causadas..."
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">URL de Evidencia Fotográfica o Documental</label>
                <input
                  type="text"
                  value={formEvidenciaUrl}
                  onChange={(e) => setFormEvidenciaUrl(e.target.value)}
                  placeholder="https://... (Foto capturada en caseta o por vigilancia)"
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#2d2d32]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#27272A] text-slate-300 hover:text-white rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  Registrar Folio de Multa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
