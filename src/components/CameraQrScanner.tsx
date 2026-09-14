import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, RefreshCw, X, Image as ImageIcon, AlertCircle, CheckCircle2, Sparkles, Volume2 } from 'lucide-react';

interface CameraQrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (token: string) => void;
  sampleTokens?: Array<{ label: string; token: string }>;
}

export default function CameraQrScanner({
  isOpen,
  onClose,
  onScan,
  sampleTokens = []
}: CameraQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCameraError, setHasCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [detectedToken, setDetectedToken] = useState<string | null>(null);

  // Synthesize a quick beep using Web Audio API on scan success
  const playBeep = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio autoplay might be restricted, non-critical
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const handleScanSuccess = useCallback((token: string) => {
    playBeep();
    setDetectedToken(token);
    stopCamera();
    setTimeout(() => {
      onScan(token);
    }, 450);
  }, [onScan, playBeep, stopCamera]);

  // Frame scanner loop using jsQR
  const scanVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });

    if (code && code.data && code.data.trim().length > 0) {
      handleScanSuccess(code.data.trim());
      return;
    }

    animFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
  }, [handleScanSuccess]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setHasCameraError(null);
    setDetectedToken(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCameraError('Este navegador o dispositivo no soporta acceso directo a cámara web. Puedes subir una captura del QR o ingresar el token.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
        setIsCameraActive(true);
        animFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setHasCameraError('Permiso de cámara denegado en el navegador. Para activarla, permite el acceso a la cámara en los ajustes del sitio o usa la opción de subir foto.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setHasCameraError('No se detectó ninguna cámara disponible en este dispositivo. Puedes usar la opción de subir imagen del QR.');
      } else {
        setHasCameraError(`No se pudo acceder a la cámara (${err.message || 'Error desconocido'}).`);
      }
    }
  }, [facingMode, scanVideoFrame, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Handle file photo decode (when user selects an image with QR)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          handleScanSuccess(code.data.trim());
        } else {
          alert('No se detectó ningún código QR legible en la imagen seleccionada. Intenta con otra foto más enfocada.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#18181C] border border-[#303038] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-[#1F1F24] border-b border-[#2D2D35] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                Escáner Óptico de Caseta
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] rounded font-mono">
                  En Vivo
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Apunta la cámara del dispositivo móvil al código QR del visitante</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Cerrar escáner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay Box & Laser */}
          {isCameraActive && !detectedToken && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Dimmed background around target area */}
              <div className="relative w-56 h-56 border-2 border-emerald-400 rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.35)] overflow-hidden flex flex-col justify-between p-2">
                {/* Corner markers */}
                <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Animated Green Laser Line */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse my-auto" />
              </div>
              <p className="mt-4 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-[11px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                Alinea el QR dentro del marco
              </p>
            </div>
          )}

          {/* Success Flash Overlay */}
          {detectedToken && (
            <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <p className="text-base font-black text-white">¡Código QR Detectado!</p>
              <p className="text-xs text-emerald-200 font-mono mt-1 max-w-xs break-all bg-emerald-900/60 p-2 rounded-xl border border-emerald-500/40">
                {detectedToken}
              </p>
              <p className="text-[11px] text-slate-300 mt-2">Validando con la bitácora de pases...</p>
            </div>
          )}

          {/* Camera Error Message */}
          {hasCameraError && (
            <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-sm font-bold text-white max-w-xs">{hasCameraError}</p>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reintentar Cámara
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Subir Foto de QR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scanner Action Controls */}
        <div className="p-4 bg-[#18181C] space-y-3 border-t border-[#2D2D35]">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
              }}
              disabled={!isCameraActive}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Voltear Cámara ({facingMode === 'environment' ? 'Trasera' : 'Frontal'})</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Subir Foto QR</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Quick Test Bar for instant verification */}
          {sampleTokens.length > 0 && (
            <div className="pt-2 border-t border-[#282830]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Prueba Rápida con Pase Generado
                </span>
                <span className="text-[9px] text-slate-500 font-mono">1 clic</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sampleTokens.map((st, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleScanSuccess(st.token)}
                    className="px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-bold font-mono transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
