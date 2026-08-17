/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  Building, ShieldCheck, LogOut, RefreshCcw, WifiOff, AlertTriangle, Info, Download
} from 'lucide-react';
import { auth, IS_FIREBASE_DUMMY } from './firebase';
import { dbService } from './services/dbService';
import { SystemUserRole, SystemRole } from './types';
import CondominiosDashboard from './components/CondominiosDashboard';

export const ENABLE_CONDOMINIOS_MODULE = true;

export default function App() {
  // Authentication states
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('cnls_auth_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userRole, setUserRole] = useState<SystemRole | null>(() => {
    const saved = localStorage.getItem('cnls_user_role');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Online / Offline Internet Connectivity State Enforcer
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check
    const checkConn = () => {
      if (typeof navigator !== 'undefined') {
        setIsOnline(navigator.onLine);
      }
    };
    const interval = setInterval(checkConn, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Listen to Auth State
  useEffect(() => {
    if (IS_FIREBASE_DUMMY) {
      const initDummyRole = async () => {
        setLoading(true);
        try {
          const savedUserRoleJson = localStorage.getItem('cnls_user_role');
          if (savedUserRoleJson) {
            try {
              const parsed = JSON.parse(savedUserRoleJson);
              setUserRole(parsed);
            } catch {}
          } else {
            // Default SuperAdmin / Admin role for Condominios administration
            const defaultRole: SystemRole = {
              uid: 'admin-condo-uid',
              name: 'Harold Anguiano (Administrador)',
              email: 'harold.anguiano@condominios.mx',
              username: 'harold.anguiano',
              role: SystemUserRole.ADMIN,
              createdAt: new Date().toISOString()
            };
            setUserRole(defaultRole);
            localStorage.setItem('cnls_user_role', JSON.stringify(defaultRole));
          }
        } catch (err) {
          console.error('Error initializing user role:', err);
        } finally {
          setLoading(false);
        }
      };

      initDummyRole();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        
        let roleSnap = await dbService.getSystemRole(firebaseUser.uid);
        if (!roleSnap && firebaseUser.email) {
          roleSnap = await dbService.getSystemRole(firebaseUser.email);
        }
        
        if (!roleSnap) {
          const allRoles = await dbService.getAllSystemRoles();
          const matchedByEmail = allRoles.find(r => r.email?.toLowerCase() === firebaseUser.email?.toLowerCase());
          if (matchedByEmail) {
            roleSnap = matchedByEmail;
          } else {
            const newRole: SystemRole = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Administrador',
              role: SystemUserRole.ADMIN,
              isActive: true,
              createdAt: new Date().toISOString()
            };
            await dbService.saveSystemRole(newRole);
            roleSnap = newRole;
          }
        }

        setUserRole(roleSnap);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // User Signs Out
  const handleSignOut = async () => {
    try {
      if (!IS_FIREBASE_DUMMY) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Signout Error: ', err);
    } finally {
      setUser(null);
      setUserRole(null);
      localStorage.removeItem('cnls_user_role');
      localStorage.removeItem('cnls_auth_user');
    }
  };

  if (loading) {
    return (
      <div id="full-viewport-spinner" className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-4">Cargando Administración de Condominios...</p>
      </div>
    );
  }

  return (
    <div id="integrated-app-root" className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans flex flex-col selection:bg-purple-650/30">
      {/* Condominios System as primary root interface */}
      <CondominiosDashboard 
        currentUser={userRole || {
          uid: 'admin-condo-uid',
          name: 'Harold Anguiano (Administrador)',
          email: 'harold.anguiano@condominios.mx',
          username: 'harold.anguiano',
          role: 'admin'
        }}
        onSignOut={handleSignOut}
      />

      {/* Offline Internet Connectivity Blocker Overlay */}
      {!isOnline && (
        <div 
          id="offline-blocker-overlay" 
          className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 text-center font-sans animate-fade-in"
        >
          <div className="max-w-md w-full bg-[#18181b] border-2 border-purple-600/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-purple-950/60 border-2 border-purple-500/40 rounded-3xl flex items-center justify-center mx-auto shadow-inner text-purple-400 animate-pulse">
              <WifiOff className="w-10 h-10 text-purple-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-[11px] font-mono uppercase font-bold text-purple-400 tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" /> Acceso Bloqueado
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Sin Conexión a Internet
              </h2>
              <p className="text-xs text-purple-400 font-bold leading-relaxed pt-1">
                El sistema de Administración de Condominios requiere conexión a internet.
              </p>
              <p className="text-[11.5px] text-slate-300 leading-relaxed">
                Se requiere una conexión activa a la red para sincronizar cobros, reservas de amenidades, votaciones y reportes en tiempo real con la base de datos.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-300">
              <p className="font-bold text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-purple-400 shrink-0" /> Requisito Operativo:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px] font-mono">
                <li>Sincronización en tiempo real de finanzas y pagos</li>
                <li>Actualización de amenidades y mesa de ayuda</li>
                <li>Seguridad y encriptación de datos de condóminos</li>
              </ul>
            </div>

            <div className="pt-2 space-y-3">
              <button
                id="btn-retry-internet-connection"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.onLine) {
                    setIsOnline(true);
                  } else {
                    alert('Atención: El dispositivo continúa sin conexión a internet. Por favor verifique su conexión Wi-Fi o datos móviles.');
                  }
                }}
                className="w-full py-3.5 px-6 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-2xl transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCcw className="w-4 h-4" /> Comprobar Conexión a Internet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
