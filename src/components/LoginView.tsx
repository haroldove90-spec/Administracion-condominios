/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, Shield, Crown, UserCheck, Smartphone, ShieldCheck, 
  LogIn, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, 
  Sparkles, KeyRound, AlertCircle, Info, QrCode
} from 'lucide-react';
import { SystemRole, SystemUserRole } from '../types';
import { dbService } from '../services/dbService';

interface LoginViewProps {
  onLogin: (role: SystemRole, initialSubSection?: 'inicio' | 'superadmin' | 'admininmobiliaria' | 'comite' | 'residente' | 'guardia') => void;
  loggedOutNotice?: boolean;
}

export default function LoginView({ onLogin, loggedOutNotice = false }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<'roles' | 'credentials'>('roles');
  
  // Credentials Form State
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick Role Profiles
  const roleProfiles = [
    {
      id: 'superadmin',
      subSection: 'superadmin' as const,
      roleType: SystemUserRole.ADMIN,
      title: '1. Super Admin',
      subtitle: 'Plataforma SaaS & Dirección General',
      name: 'Harold Anguiano',
      email: 'harold.anguiano@condominios.mx',
      icon: Crown,
      color: 'from-rose-600/30 to-red-600/10 border-rose-500/40 text-rose-400 hover:border-rose-400',
      badge: 'Acceso Total',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'admininmobiliaria',
      subSection: 'admininmobiliaria' as const,
      roleType: SystemUserRole.ADMIN,
      title: '2. Admin Condominio',
      subtitle: 'Gestión Residencial & Finanzas',
      name: 'Administración Residencial',
      email: 'admin.bosques@condominios.mx',
      icon: Building2,
      color: 'from-purple-600/30 to-indigo-600/10 border-purple-500/40 text-purple-400 hover:border-purple-400',
      badge: 'Finanzas & Operación',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      id: 'comite',
      subSection: 'comite' as const,
      roleType: SystemUserRole.AUDITOR,
      title: '3. Comité de Vigilancia',
      subtitle: 'Auditoría, Presupuestos & Actas',
      name: 'Ing. Fernando Gamboa',
      email: 'comite.vigilancia@condominios.mx',
      icon: UserCheck,
      color: 'from-amber-600/30 to-yellow-600/10 border-amber-500/40 text-amber-400 hover:border-amber-400',
      badge: 'Auditoría Condominal',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'residente',
      subSection: 'residente' as const,
      roleType: SystemUserRole.RESIDENTE,
      title: '4. Residente (PWA)',
      subtitle: 'Pases QR, Cuotas & Amenidades',
      name: 'Mariana Silva (Casa 105)',
      email: 'mariana.silva@residente.mx',
      icon: Smartphone,
      color: 'from-blue-600/30 to-cyan-600/10 border-blue-500/40 text-blue-400 hover:border-blue-400',
      badge: 'Autogestión & QR Visitas',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      id: 'guardia',
      subSection: 'guardia' as const,
      roleType: SystemUserRole.GUARD,
      title: '5. Guardia / Conserje',
      subtitle: 'Lector QR, Caseta & Bitácora',
      name: 'Oficial Ramón Valdés',
      email: 'seguridad.caseta@condominios.mx',
      icon: ShieldCheck,
      color: 'from-emerald-600/30 to-teal-600/10 border-emerald-500/40 text-emerald-400 hover:border-emerald-400',
      badge: 'Control Accesos Caseta',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    }
  ];

  const handleSelectRole = (profile: typeof roleProfiles[0]) => {
    const role: SystemRole = {
      uid: `${profile.id}-uid`,
      name: profile.name,
      email: profile.email,
      username: profile.id,
      role: profile.roleType,
      createdAt: new Date().toISOString()
    };
    onLogin(role, profile.subSection);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const cleanUser = usernameOrEmail.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanUser) {
        setErrorMessage('Por favor ingrese su usuario o correo electrónico.');
        setIsLoading(false);
        return;
      }

      // Check registered system roles
      const allRoles = await dbService.getAllSystemRoles();
      const matched = allRoles.find(r => 
        (r.email && r.email.toLowerCase() === cleanUser) ||
        (r.username && r.username.toLowerCase() === cleanUser)
      );

      if (matched) {
        // If password is set on record, check it, else allow default demo pass
        if (matched.password && matched.password !== cleanPass && cleanPass !== '123456' && cleanPass !== 'admin123') {
          setErrorMessage('Contraseña incorrecta para este usuario.');
          setIsLoading(false);
          return;
        }

        let targetSubSection: 'inicio' | 'superadmin' | 'admininmobiliaria' | 'comite' | 'residente' | 'guardia' = 'inicio';
        if (matched.role === SystemUserRole.RESIDENTE) targetSubSection = 'residente';
        else if (matched.role === SystemUserRole.GUARD) targetSubSection = 'guardia';
        else if (matched.role === SystemUserRole.AUDITOR) targetSubSection = 'comite';
        else targetSubSection = 'admininmobiliaria';

        onLogin(matched, targetSubSection);
        return;
      }

      // Quick keyword matching for easy sign-in
      if (cleanUser.includes('admin') || cleanUser === 'harold') {
        handleSelectRole(roleProfiles[0]);
        return;
      } else if (cleanUser.includes('residente') || cleanUser.includes('vecino')) {
        handleSelectRole(roleProfiles[3]);
        return;
      } else if (cleanUser.includes('guardia') || cleanUser.includes('caseta') || cleanUser.includes('seguridad')) {
        handleSelectRole(roleProfiles[4]);
        return;
      } else if (cleanUser.includes('comite')) {
        handleSelectRole(roleProfiles[2]);
        return;
      }

      // Custom generic session for entered credentials
      const customRole: SystemRole = {
        uid: `usr-${Date.now()}`,
        name: usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail,
        email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@condominio.mx`,
        username: cleanUser,
        role: SystemUserRole.ADMIN,
        createdAt: new Date().toISOString()
      };
      onLogin(customRole, 'inicio');
    } catch (err: any) {
      console.error('Error en autenticación:', err);
      setErrorMessage('Ocurrió un error al verificar credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background visual accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-5 border-b border-[#1E1E22] bg-[#101014]/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide">
              ADMINISTRACIÓN DE CONDOMINIOS
            </h1>
            <p className="text-[10.5px] text-slate-400 font-mono">
              Plataforma Integral de Gestión Residencial, Finanzas y Accesos
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1E] border border-[#2d2d32] rounded-xl text-xs font-mono text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acceso Protegido SSL / Encriptado</span>
        </div>
      </header>

      {/* Main Form Box Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-4xl space-y-6">

          {/* Signed Out Notification Banner */}
          {loggedOutNotice && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-bold animate-fade-in shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-white font-black">Sesión finalizada exitosamente</p>
                <p className="text-[11px] text-emerald-300/80 font-normal">
                  Se han cerrado todos los accesos en este dispositivo. Seleccione un perfil o ingrese sus credenciales para volver a entrar.
                </p>
              </div>
            </div>
          )}

          {/* Card Header & Selector */}
          <div className="bg-[#141417] border border-[#2d2d32] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242429] pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/15 border border-purple-500/30 rounded-full text-[10px] font-mono uppercase font-bold text-purple-300 mb-2">
                  <Sparkles className="w-3 h-3 text-purple-400" /> Portal de Inicio de Sesión
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Bienvenido al Sistema Condominal
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Selecciona tu rol operativo para ingresar directamente o autentícate con tus credenciales.
                </p>
              </div>

              {/* Mode Switch Tabs */}
              <div className="flex items-center bg-[#0D0D10] p-1.5 rounded-2xl border border-[#2d2d32] shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('roles')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'roles'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Selección de Roles</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('credentials')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'credentials'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Usuario & Contraseña</span>
                </button>
              </div>
            </div>

            {/* TAB 1: QUICK ROLE PROFILES */}
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Roles Disponibles en el Ecosistema
                  </span>
                  <span className="text-[10px] text-purple-400">
                    Clic en cualquier tarjeta para acceder de inmediato
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {roleProfiles.map((p) => {
                    const IconComponent = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectRole(p)}
                        className={`p-4 rounded-2xl border bg-gradient-to-b ${p.color} text-left transition-all duration-200 cursor-pointer hover:scale-[1.02] flex flex-col justify-between space-y-3 group shadow-lg`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white shadow-inner">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase font-mono border ${p.badgeColor}`}>
                            {p.badge}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-white group-hover:text-purple-300 transition">
                            {p.title}
                          </h3>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                            {p.subtitle}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate">{p.name}</span>
                          <span className="text-white font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition">
                            Entrar <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: CREDENTIALS LOGIN */}
            {activeTab === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-5 max-w-md mx-auto py-4">
                {errorMessage && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider font-mono">
                    Usuario o Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="admin, harold.anguiano@condominios.mx o residente"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0D0D10] border border-[#2d2d32] rounded-xl text-xs text-white placeholder-slate-600 focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider font-mono">
                      Contraseña
                    </label>
                    <span className="text-[10px] text-slate-500">Cualquier contraseña demo</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#0D0D10] border border-[#2d2d32] rounded-xl text-xs text-white placeholder-slate-600 focus:border-purple-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Demo quick credential hints */}
                <div className="p-3 bg-[#0D0D10] border border-[#242428] rounded-xl text-[11px] text-slate-400 space-y-1.5 text-left">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">
                    Accesos Rápidos Demo:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setUsernameOrEmail('admin'); setPassword('admin123'); }}
                      className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded border border-purple-500/20 text-[10px] cursor-pointer"
                    >
                      admin / admin123
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUsernameOrEmail('residente'); setPassword('123456'); }}
                      className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded border border-blue-500/20 text-[10px] cursor-pointer"
                    >
                      residente / 123456
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUsernameOrEmail('guardia'); setPassword('123456'); }}
                      className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/20 text-[10px] cursor-pointer"
                    >
                      guardia / 123456
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs rounded-xl transition cursor-pointer shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Verificando...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Ingresar al Sistema</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Quick Support & Feature Info Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3.5 bg-[#141417] border border-[#232328] rounded-2xl flex items-center justify-center gap-2 text-xs text-slate-400">
              <QrCode className="w-4 h-4 text-purple-400" />
              <span>Control de Pases QR para Visitas</span>
            </div>
            <div className="p-3.5 bg-[#141417] border border-[#232328] rounded-2xl flex items-center justify-center gap-2 text-xs text-slate-400">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Conciliación Bancaria SPEI</span>
            </div>
            <div className="p-3.5 bg-[#141417] border border-[#232328] rounded-2xl flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Bitácora de Caseta & Vigilancia</span>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="px-6 py-4 border-t border-[#1E1E22] bg-[#101014]/50 text-center text-xs text-slate-500 font-mono">
        Sistema de Administración de Condominios v2.5.0 SaaS • Seguridad Residencial & Finanzas
      </footer>
    </div>
  );
}
