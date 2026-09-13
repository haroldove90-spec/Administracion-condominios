import React, { useState } from 'react';
import { 
  Car, 
  Heart, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  Building,
  UserCheck
} from 'lucide-react';
import { VehiculoCondominio, MascotaCondominio } from '../types';

interface VehiculosMascotasManagerProps {
  vehiculos: VehiculoCondominio[];
  mascotas: MascotaCondominio[];
  unidades: { id: string; identificador: string; propietarioNombre: string }[];
  onAgregarVehiculo: (vehiculo: VehiculoCondominio) => void;
  onAgregarMascota: (mascota: MascotaCondominio) => void;
  onActualizarVehiculoStatus?: (id: string, nuevoStatus: 'autorizado' | 'bloqueado') => void;
  onActualizarVacunaMascota?: (id: string, nuevoStatus: 'al_dia' | 'vencida') => void;
}

export const VehiculosMascotasManager: React.FC<VehiculosMascotasManagerProps> = ({
  vehiculos,
  mascotas,
  unidades,
  onAgregarVehiculo,
  onAgregarMascota,
  onActualizarVehiculoStatus,
  onActualizarVacunaMascota
}) => {
  const [activeTab, setActiveTab] = useState<'vehiculos' | 'mascotas'>('vehiculos');
  const [searchVehiculo, setSearchVehiculo] = useState('');
  const [searchMascota, setSearchMascota] = useState('');
  const [isModalVehiculoOpen, setIsModalVehiculoOpen] = useState(false);
  const [isModalMascotaOpen, setIsModalMascotaOpen] = useState(false);

  // Form Vehículo State
  const [formVehUnidad, setFormVehUnidad] = useState('');
  const [formVehPropietario, setFormVehPropietario] = useState('');
  const [formVehPlacas, setFormVehPlacas] = useState('');
  const [formVehMarca, setFormVehMarca] = useState('');
  const [formVehColor, setFormVehColor] = useState('');
  const [formVehCajon, setFormVehCajon] = useState('');
  const [formVehTipoCajon, setFormVehTipoCajon] = useState<'privado' | 'visita' | 'discapacidad'>('privado');
  const [formVehTag, setFormVehTag] = useState('');

  // Form Mascota State
  const [formMasNombre, setFormMasNombre] = useState('');
  const [formMasTipo, setFormMasTipo] = useState<'perro' | 'gato' | 'otro'>('perro');
  const [formMasRaza, setFormMasRaza] = useState('');
  const [formMasUnidad, setFormMasUnidad] = useState('');
  const [formMasDueno, setFormMasDueno] = useState('');
  const [formMasVacuna, setFormMasVacuna] = useState<'al_dia' | 'vencida' | 'pendiente'>('al_dia');
  const [formMasFoto, setFormMasFoto] = useState('');

  // Auto-fill owner on unit change
  const handleSelectVehUnidad = (uId: string) => {
    setFormVehUnidad(uId);
    const u = unidades.find(unit => unit.identificador === uId);
    if (u) setFormVehPropietario(u.propietarioNombre || '');
  };

  const handleSelectMasUnidad = (uId: string) => {
    setFormMasUnidad(uId);
    const u = unidades.find(unit => unit.identificador === uId);
    if (u) setFormMasDueno(u.propietarioNombre || '');
  };

  const handleSubmitVehiculo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVehUnidad || !formVehPlacas) {
      alert('Por favor indica la unidad y placas del vehículo.');
      return;
    }

    const nuevoVehiculo: VehiculoCondominio = {
      id: 'veh-' + Date.now(),
      unidad: formVehUnidad,
      propietario: formVehPropietario || 'Propietario',
      placas: formVehPlacas.toUpperCase().trim(),
      marcaModelo: formVehMarca || 'Auto Particular',
      color: formVehColor || 'No especificado',
      cajonAsignado: formVehCajon || 'C-01',
      tipoCajon: formVehTipoCajon,
      tagRfid: formVehTag || `RFID-${Math.floor(1000 + Math.random() * 9000)}`,
      estatus: 'autorizado'
    };

    onAgregarVehiculo(nuevoVehiculo);
    setIsModalVehiculoOpen(false);
    // Reset
    setFormVehPlacas('');
    setFormVehMarca('');
    setFormVehColor('');
    setFormVehCajon('');
    setFormVehTag('');
  };

  const handleSubmitMascota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMasNombre || !formMasUnidad) {
      alert('Por favor indica el nombre de la mascota y la unidad.');
      return;
    }

    const nuevaMascota: MascotaCondominio = {
      id: 'masc-' + Date.now(),
      nombre: formMasNombre,
      tipo: formMasTipo,
      raza: formMasRaza || 'Mestizo',
      unidad: formMasUnidad,
      dueno: formMasDueno || 'Residente',
      vacunaAntirrabica: formMasVacuna,
      fechaUltimaVacuna: new Date().toISOString().split('T')[0],
      fotoUrl: formMasFoto || (formMasTipo === 'perro' 
        ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=60' 
        : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=60')
    };

    onAgregarMascota(nuevaMascota);
    setIsModalMascotaOpen(false);
    // Reset
    setFormMasNombre('');
    setFormMasRaza('');
    setFormMasFoto('');
  };

  // Filtrados
  const filteredVehiculos = vehiculos.filter(v => 
    v.placas.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
    v.unidad.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
    v.propietario.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
    v.cajonAsignado.toLowerCase().includes(searchVehiculo.toLowerCase())
  );

  const filteredMascotas = mascotas.filter(m => 
    m.nombre.toLowerCase().includes(searchMascota.toLowerCase()) ||
    m.unidad.toLowerCase().includes(searchMascota.toLowerCase()) ||
    m.dueno.toLowerCase().includes(searchMascota.toLowerCase()) ||
    m.raza.toLowerCase().includes(searchMascota.toLowerCase())
  );

  const totalVacunasVencidas = mascotas.filter(m => m.vacunaAntirrabica === 'vencida').length;

  return (
    <div className="space-y-6 text-left">
      
      {/* Selector Superior: Vehículos vs Mascotas */}
      <div className="bg-[#1E1E22] border border-[#2d2d32] rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2d32] pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('vehiculos')}
              className={`px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'vehiculos'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                  : 'bg-[#141417] text-slate-400 hover:text-white border border-[#27272A]'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Vehículos & Cajones ({vehiculos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('mascotas')}
              className={`px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 transition cursor-pointer relative ${
                activeTab === 'mascotas'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                  : 'bg-[#141417] text-slate-400 hover:text-white border border-[#27272A]'
              }`}
            >
              <Heart className="w-4 h-4 text-pink-400" />
              <span>Padrón de Mascotas ({mascotas.length})</span>
              {totalVacunasVencidas > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 absolute -top-1 -right-1 ring-2 ring-[#1E1E22] animate-pulse"></span>
              )}
            </button>
          </div>

          <div>
            {activeTab === 'vehiculos' ? (
              <button
                onClick={() => setIsModalVehiculoOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Vehículo</span>
              </button>
            ) : (
              <button
                onClick={() => setIsModalMascotaOpen(true)}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Mascota</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 1: VEHÍCULOS Y CAJONES DE ESTACIONAMIENTO */}
        {/* ========================================================================= */}
        {activeTab === 'vehiculos' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por placas, cajón o unidad..."
                  value={searchVehiculo}
                  onChange={(e) => setSearchVehiculo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#141417] border border-[#2d2d32] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="text-xs text-slate-400">
                Total Cajones Asignados: <strong className="text-white">{vehiculos.length}</strong>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#27272A] rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#141417] text-slate-400 uppercase font-black text-[10px] border-b border-[#2d2d32]">
                  <tr>
                    <th className="py-3 px-4">Placas Vehiculares</th>
                    <th className="py-3 px-4">Unidad & Propietario</th>
                    <th className="py-3 px-4">Modelo & Color</th>
                    <th className="py-3 px-4">Cajón Asignado</th>
                    <th className="py-3 px-4">Tag RFID / Marbete</th>
                    <th className="py-3 px-4 text-center">Estatus</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {filteredVehiculos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">
                        No hay vehículos registrados que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredVehiculos.map(veh => (
                      <tr key={veh.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          <span className="font-mono font-black text-white text-xs bg-[#27272A] px-2.5 py-1 rounded-md border border-[#3f3f46]">
                            {veh.placas}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{veh.unidad}</div>
                          <div className="text-[11px] text-slate-400">{veh.propietario}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200 font-semibold">{veh.marcaModelo}</div>
                          <div className="text-[10px] text-slate-400">{veh.color}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Cajón {veh.cajonAsignado} ({veh.tipoCajon})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {veh.tagRfid || 'Sin tag'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {veh.estatus === 'autorizado' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Autorizado ✓
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                              Bloqueado ✕
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {onActualizarVehiculoStatus && (
                            <button
                              onClick={() => onActualizarVehiculoStatus(
                                veh.id, 
                                veh.estatus === 'autorizado' ? 'bloqueado' : 'autorizado'
                              )}
                              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                            >
                              {veh.estatus === 'autorizado' ? 'Restringir' : 'Reactivar'}
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
        )}

        {/* ========================================================================= */}
        {/* SECCIÓN 2: PADRÓN DE MASCOTAS Y VACUNACIÓN */}
        {/* ========================================================================= */}
        {activeTab === 'mascotas' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, raza o departamento..."
                  value={searchMascota}
                  onChange={(e) => setSearchMascota(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#141417] border border-[#2d2d32] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {totalVacunasVencidas > 0 && (
                <div className="flex items-center gap-2 text-xs bg-red-500/15 text-red-400 px-3 py-1.5 rounded-xl border border-red-500/30">
                  <AlertTriangle className="w-4 h-4" />
                  <span><strong>{totalVacunasVencidas} mascota(s)</strong> con vacuna antirrábica vencida</span>
                </div>
              )}
            </div>

            {/* Grid de Tarjetas de Mascotas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMascotas.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500">
                  No hay mascotas registradas actualmente en el condominio.
                </div>
              ) : (
                filteredMascotas.map(masc => (
                  <div key={masc.id} className="p-4 bg-[#141417] border border-[#27272A] rounded-2xl space-y-3 relative hover:border-[#3f3f46] transition">
                    <div className="flex items-center gap-3">
                      <img
                        src={masc.fotoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=60'}
                        alt={masc.nombre}
                        className="w-12 h-12 rounded-xl object-cover border border-[#2d2d32]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{masc.nombre}</h4>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#27272A] text-slate-300 rounded font-bold">
                            {masc.tipo}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{masc.raza} • {masc.unidad}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#232326] space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Dueño Responsable:</span>
                        <strong className="text-slate-200">{masc.dueno}</strong>
                      </div>

                      <div className="flex justify-between items-center text-slate-400">
                        <span>Vacuna Antirrábica:</span>
                        {masc.vacunaAntirrabica === 'al_dia' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Al Día ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            Vencida ⚠
                          </span>
                        )}
                      </div>

                      {masc.fechaUltimaVacuna && (
                        <div className="text-[10px] text-slate-500 text-right">
                          Última dosis: {masc.fechaUltimaVacuna}
                        </div>
                      )}
                    </div>

                    {onActualizarVacunaMascota && (
                      <div className="pt-1 text-right">
                        <button
                          onClick={() => onActualizarVacunaMascota(
                            masc.id, 
                            masc.vacunaAntirrabica === 'al_dia' ? 'vencida' : 'al_dia'
                          )}
                          className="text-[10px] text-pink-400 hover:text-pink-300 underline cursor-pointer"
                        >
                          {masc.vacunaAntirrabica === 'al_dia' ? 'Marcar vacuna por renovar' : 'Actualizar vacuna ✓'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: Registro de Vehículo */}
      {isModalVehiculoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181B] border border-[#2d2d32] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-[#2d2d32] pb-3">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-purple-400" />
                Registrar Vehículo y Asignar Cajón
              </h4>
              <button onClick={() => setIsModalVehiculoOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitVehiculo} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Unidad Condominal *</label>
                <select
                  value={formVehUnidad}
                  onChange={(e) => handleSelectVehUnidad(e.target.value)}
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">-- Seleccionar Unidad --</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.identificador}>{u.identificador} - {u.propietarioNombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Propietario / Residente</label>
                <input
                  type="text"
                  value={formVehPropietario}
                  onChange={(e) => setFormVehPropietario(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Placas *</label>
                  <input
                    type="text"
                    value={formVehPlacas}
                    onChange={(e) => setFormVehPlacas(e.target.value)}
                    placeholder="Ej. ABC-123-D"
                    className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white font-mono uppercase font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cajón Asignado</label>
                  <input
                    type="text"
                    value={formVehCajon}
                    onChange={(e) => setFormVehCajon(e.target.value)}
                    placeholder="Ej. B-12"
                    className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Marca / Modelo</label>
                  <input
                    type="text"
                    value={formVehMarca}
                    onChange={(e) => setFormVehMarca(e.target.value)}
                    placeholder="Ej. Mazda 3"
                    className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Color</label>
                  <input
                    type="text"
                    value={formVehColor}
                    onChange={(e) => setFormVehColor(e.target.value)}
                    placeholder="Ej. Gris Oxford"
                    className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tag RFID / Marbete de Acceso</label>
                <input
                  type="text"
                  value={formVehTag}
                  onChange={(e) => setFormVehTag(e.target.value)}
                  placeholder="Ej. TAG-8812"
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#2d2d32]">
                <button
                  type="button"
                  onClick={() => setIsModalVehiculoOpen(false)}
                  className="px-4 py-2 bg-[#27272A] text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg"
                >
                  Guardar Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Registro de Mascota */}
      {isModalMascotaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181B] border border-[#2d2d32] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-[#2d2d32] pb-3">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Registrar Mascota en el Padrón
              </h4>
              <button onClick={() => setIsModalMascotaOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitMascota} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Unidad Condominal *</label>
                <select
                  value={formMasUnidad}
                  onChange={(e) => handleSelectMasUnidad(e.target.value)}
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                  required
                >
                  <option value="">-- Seleccionar Unidad --</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.identificador}>{u.identificador} - {u.propietarioNombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre Mascota *</label>
                  <input
                    type="text"
                    value={formMasNombre}
                    onChange={(e) => setFormMasNombre(e.target.value)}
                    placeholder="Ej. Rocky"
                    className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tipo</label>
                  <select
                    value={formMasTipo}
                    onChange={(e) => setFormMasTipo(e.target.value as any)}
                    className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white"
                  >
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Raza</label>
                <input
                  type="text"
                  value={formMasRaza}
                  onChange={(e) => setFormMasRaza(e.target.value)}
                  placeholder="Ej. Golden Retriever"
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Dueño Responsable</label>
                <input
                  type="text"
                  value={formMasDueno}
                  onChange={(e) => setFormMasDueno(e.target.value)}
                  placeholder="Nombre del tutor"
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Estatus Vacuna Antirrábica</label>
                <select
                  value={formMasVacuna}
                  onChange={(e) => setFormMasVacuna(e.target.value as any)}
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white"
                >
                  <option value="al_dia">Al Día (Vigente) ✓</option>
                  <option value="vencida">Vencida (Requiere Vacunación) ⚠</option>
                  <option value="pendiente">Pendiente de Acreditar</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">URL de Foto de la Mascota</label>
                <input
                  type="text"
                  value={formMasFoto}
                  onChange={(e) => setFormMasFoto(e.target.value)}
                  placeholder="https://... (Foto para identificación)"
                  className="w-full bg-[#141417] border border-[#2d2d32] rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#2d2d32]">
                <button
                  type="button"
                  onClick={() => setIsModalMascotaOpen(false)}
                  className="px-4 py-2 bg-[#27272A] text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold shadow-lg"
                >
                  Guardar Mascota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
