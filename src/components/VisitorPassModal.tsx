import React, { useState } from 'react';
import { CheckCircle2, Building2, User, Car, Clock, ShieldCheck, Send, Download, X, Copy, Image as ImageIcon, Share2 } from 'lucide-react';
import {
  downloadPassImage,
  sharePassImageOrFallback,
  copyPassImageToClipboard,
  getCleanWhatsAppText
} from '../utils/passImageGenerator';

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

  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [copiedImgFeedback, setCopiedImgFeedback] = useState(false);
  const [copiedTokenFeedback, setCopiedTokenFeedback] = useState(false);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pass.token)}`;

  const cleanPhone = (pass.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
  const cleanWaText = getCleanWhatsAppText(pass);

  const waDirectUrl = formattedPhone 
    ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(cleanWaText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanWaText)}`;

  const handleDownloadImage = async () => {
    try {
      setIsGeneratingImg(true);
      await downloadPassImage(pass);
    } catch (err) {
      console.error('Error downloading pass image:', err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleShareImage = async () => {
    try {
      setIsGeneratingImg(true);
      await sharePassImageOrFallback(pass);
    } catch (err) {
      console.error('Error sharing pass image:', err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      setIsGeneratingImg(true);
      const success = await copyPassImageToClipboard(pass);
      if (success) {
        setCopiedImgFeedback(true);
        setTimeout(() => setCopiedImgFeedback(false), 2500);
      } else {
        // Fallback to download
        await downloadPassImage(pass);
      }
    } catch (err) {
      console.error('Error copying pass image:', err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const hostName = pass.hostName || 'Mariana Silva (Residente Acreditado)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#18181D] border border-emerald-500/40 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col text-left max-h-[92vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#16222F] to-slate-900 p-4 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase font-mono tracking-wider">Pase Oficial de Acceso</h4>
              <p className="text-[10px] text-emerald-300 font-mono">Residencial Bosques • Control de Caseta</p>
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
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase font-mono tracking-wider border shadow-sm ${
            pass.status === 'valido'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : pass.status === 'usado'
              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{pass.status === 'valido' ? '✓ PASE AUTORIZADO' : pass.status === 'usado' ? 'PASE YA UTILIZADO' : '✕ PASE REVOCADO'}</span>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-3.5 rounded-2xl shadow-xl inline-block border-2 border-slate-200 relative group">
            <img
              src={qrImageUrl}
              alt="Código QR de Acceso"
              className="w-40 h-40 mx-auto"
            />
            <span className="block text-[9px] font-mono text-slate-500 mt-1 uppercase font-bold tracking-wider">
              Lector QR de Caseta
            </span>
          </div>

          {/* Token Display */}
          <div className="bg-[#121215] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between px-3">
            <div className="text-left">
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">Folio de Acceso / Token</p>
              <p className="text-xs font-black text-emerald-400 font-mono tracking-wider">{pass.token}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(pass.token);
                  setCopiedTokenFeedback(true);
                  setTimeout(() => setCopiedTokenFeedback(false), 2000);
                }
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 transition cursor-pointer flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedTokenFeedback ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          {/* Visitor & Destination Global Details */}
          <div className="bg-[#141418] p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <User className="w-3.5 h-3.5 text-blue-400" /> Autoriza (Residente):
              </span>
              <span className="font-bold text-sky-300 text-[11px]">{hostName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-purple-400" /> Destino:
              </span>
              <span className="font-bold text-white font-mono">{pass.condo}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Visitante:
              </span>
              <span className="font-black text-emerald-300 text-[12px]">{pass.visitorName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Car className="w-3.5 h-3.5 text-amber-400" /> Auto / Placas:
              </span>
              <span className="font-bold text-slate-200 font-mono">{pass.plate || 'Peatonal'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Vigencia / Duración:
              </span>
              <span className="font-bold text-emerald-300 text-[11px] font-mono">{pass.validUntil}</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-[10px] text-slate-400 leading-relaxed text-center">
            <span className="text-emerald-400 font-bold">Sin enlaces de acceso:</span> El visitante no requiere registrarse ni ingresar al sistema. Únicamente debe mostrar la imagen del código QR al oficial en caseta.
          </div>

          {/* Action Buttons: Image Generation & Sharing */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleShareImage}
              disabled={isGeneratingImg}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <Send className="w-4 h-4" />
              <span>{isGeneratingImg ? 'Generando Tarjeta...' : (pass.phone ? `Compartir Imagen a WhatsApp (+52 ${pass.phone})` : 'Compartir Imagen del Pase por WhatsApp')}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={isGeneratingImg}
                className="py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Descargar Imagen .PNG</span>
              </button>

              <button
                type="button"
                onClick={handleCopyImage}
                disabled={isGeneratingImg}
                className="py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{copiedImgFeedback ? '¡Imagen Copiada!' : 'Copiar Imagen'}</span>
              </button>
            </div>

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
