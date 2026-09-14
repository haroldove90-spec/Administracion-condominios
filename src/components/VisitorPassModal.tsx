import React from 'react';
import { QrCode, CheckCircle2, Building2, User, Car, Clock, ShieldCheck, Share2, Send, Download, X } from 'lucide-react';

export interface VisitorPassData {
  id: string;
  visitorName: string;
  condo: string;
  type: string;
  plate?: string;
  phone?: string;
  token: string;
  validUntil: string;
  status: 'valido' | 'usado' | 'revocado';
  createdAt: string;
  hostName?: string;
}

interface VisitorPassModalProps {
  pass: VisitorPassData | null;
  onClose: () => void;
  onSimulateGuardScan?: (token: string) => void;
}

export default function VisitorPassModal({ pass, onClose, onSimulateGuardScan }: VisitorPassModalProps) {
  if (!pass) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pass.token)}`;

  const cleanPhone = (pass.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
  const passUrl = `${window.location.origin}${window.location.pathname}?pass=${encodeURIComponent(pass.token)}`;

  const waText = `🎫 *PASE DE ACCESO DIGITAL - CONDOMINIO*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👋 ¡Hola *${pass.visitorName}*!\n` +
    `Te comparto tu pase oficial de ingreso autorizado:\n\n` +
    `🏠 *Destino:* ${pass.condo}\n` +
    `🚘 *Vehículo / Placas:* ${pass.plate || 'Peatonal'}\n` +
    `📋 *Tipo:* ${pass.type}\n` +
    `⏱️ *Vigencia:* ${pass.validUntil}\n\n` +
    `📲 *Tu Código QR de Acceso:* ${pass.token}\n` +
    `Abre este enlace y muéstralo al guardia en la caseta:\n` +
    `🔗 ${passUrl}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Residencial Bosques • Control de Seguridad y Accesos._`;

  const waDirectUrl = formattedPhone 
    ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(waText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#18181D] border border-blue-500/40 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col text-left">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/40 p-4 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <div>
              <h4 className="text-xs font-black text-white uppercase font-mono tracking-wider">Residencial Bosques</h4>
              <p className="text-[9px] text-blue-200 font-mono">Pase de Acceso Digital</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pass Content Body */}
        <div className="p-5 space-y-4 text-center">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase font-mono tracking-wider border shadow-sm ${
            pass.status === 'valido'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : pass.status === 'usado'
              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          }">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{pass.status === 'valido' ? '✓ PASE AUTORIZADO' : pass.status === 'usado' ? 'PASE UTILIZADO' : '✕ PASE REVOCADO'}</span>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-2xl shadow-xl inline-block border-2 border-slate-200">
            <img
              src={qrImageUrl}
              alt="Código QR de Acceso"
              className="w-44 h-44 mx-auto"
            />
          </div>

          {/* Token Display */}
          <div className="bg-[#121215] p-2.5 rounded-xl border border-slate-800">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">Folio de Acceso / Token</p>
            <p className="text-sm font-black text-emerald-400 font-mono tracking-wider">{pass.token}</p>
          </div>

          {/* Visitor & Destination Details */}
          <div className="bg-[#141418] p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <User className="w-3.5 h-3.5 text-blue-400" /> Visitante:
              </span>
              <span className="font-bold text-white text-[12px]">{pass.visitorName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-purple-400" /> Destino:
              </span>
              <span className="font-bold text-blue-300 font-mono">{pass.condo}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Car className="w-3.5 h-3.5 text-amber-400" /> Auto / Placas:
              </span>
              <span className="font-bold text-slate-200 font-mono">{pass.plate || 'Peatonal'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Vigencia:
              </span>
              <span className="font-bold text-emerald-300 text-[11px] font-mono">{pass.validUntil}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Muestra este código al vigilante en la caseta de seguridad para autorizar tu ingreso.
          </p>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <a
              href={waDirectUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Send className="w-4 h-4" />
              <span>{pass.phone ? `Enviar por WhatsApp al ${pass.phone}` : 'Compartir por WhatsApp'}</span>
            </a>

            {onSimulateGuardScan && (
              <button
                type="button"
                onClick={() => {
                  onSimulateGuardScan(pass.token);
                  onClose();
                }}
                className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Simular Escaneo Inmediato en Caseta</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
