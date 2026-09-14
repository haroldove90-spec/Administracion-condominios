import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import confetti from 'canvas-confetti';
import {
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  X,
  FileSpreadsheet,
  Building,
  Landmark,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Printer
} from 'lucide-react';
import { ConciliacionBancaria, PaymentRecord } from '../types';

export interface BankStatementMovement {
  id: string;
  fecha: string;
  referencia: string;
  concepto: string;
  monto: number;
  tipo: 'abono' | 'cargo';
  unidadSugerida: string;
  propietario: string;
  estatusMatch: 'exacto' | 'parcial' | 'informativo';
}

export const MOVIMIENTOS_DEMO_BANCO: BankStatementMovement[] = [
  {
    id: 'mov-1',
    fecha: '2026-07-25',
    referencia: 'SPEI-902148',
    concepto: 'SPEI RECIBIDO BBVA - MARIANA SILVA CUOTA CASA 105',
    monto: 2500,
    tipo: 'abono',
    unidadSugerida: 'Casa 105',
    propietario: 'Mariana Silva',
    estatusMatch: 'exacto'
  },
  {
    id: 'mov-2',
    fecha: '2026-07-24',
    referencia: 'PRACT-44102',
    concepto: 'DEP PRACTICAJA SUC 0842 - TORRE A DEPTO 102 MANTENIMIENTO',
    monto: 2500,
    tipo: 'abono',
    unidadSugerida: 'Torre A - Depto 102',
    propietario: 'Alejandro Ruiz',
    estatusMatch: 'exacto'
  },
  {
    id: 'mov-3',
    fecha: '2026-07-23',
    referencia: 'SPEI-554109',
    concepto: 'SPEI BANORTE - CARLOS MENDOZA MTTO Y FONDO RESERVA C108',
    monto: 3000,
    tipo: 'abono',
    unidadSugerida: 'Casa 108',
    propietario: 'Carlos Mendoza',
    estatusMatch: 'exacto'
  },
  {
    id: 'mov-4',
    fecha: '2026-07-22',
    referencia: 'TRANS-881203',
    concepto: 'TRANSF INTERBANCARIA SANTANDER - CLUSTER LOTE 12 MTTO',
    monto: 2500,
    tipo: 'abono',
    unidadSugerida: 'Cluster Lote 12',
    propietario: 'Familia Morales',
    estatusMatch: 'exacto'
  },
  {
    id: 'mov-5',
    fecha: '2026-07-21',
    referencia: 'SPEI-992014',
    concepto: 'SPEI RECIBIDO - HAROLDO PAGO CUOTA TORRE B 201',
    monto: 2500,
    tipo: 'abono',
    unidadSugerida: 'Torre B - Depto 201',
    propietario: 'Haroldo González',
    estatusMatch: 'exacto'
  },
  {
    id: 'mov-6',
    fecha: '2026-07-20',
    referencia: 'SPEI-774011',
    concepto: 'SPEI RECIBIDO BANAMEX - MTTO EXTRA ALBERCA Y JARDIN LOTE 45',
    monto: 1200,
    tipo: 'abono',
    unidadSugerida: 'Lote 45',
    propietario: 'Sofía Valenzuela',
    estatusMatch: 'exacto'
  },
  {
    id: 'mov-7',
    fecha: '2026-07-19',
    referencia: 'COM-00128',
    concepto: 'COMISION MANEJO DE CUENTA BANCARIA + IVA JULIO',
    monto: 348,
    tipo: 'cargo',
    unidadSugerida: 'Gasto Bancario General',
    propietario: 'Institución Bancaria',
    estatusMatch: 'informativo'
  }
];

interface SimuladorConciliacionBancariaProps {
  onApplyConciliacion: (movimientos: BankStatementMovement[]) => void;
  availableUnits: string[];
}

export default function SimuladorConciliacionBancaria({
  onApplyConciliacion,
  availableUnits
}: SimuladorConciliacionBancariaProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    date: string;
  } | null>(null);
  const [parsedMovements, setParsedMovements] = useState<BankStatementMovement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState<boolean>(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Generador de PDF oficial con jsPDF y jsPDF-AutoTable
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Cabecera bancaria azul elegante
      doc.setFillColor(11, 39, 90); // BBVA Blue Navy
      doc.rect(0, 0, 210, 32, 'F');

      // Nombre del banco
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('BBVA MÉXICO S.A.', 14, 14);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('INSTITUCIÓN DE BANCA MÚLTIPLE • GRUPO FINANCIERO BBVA MÉXICO', 14, 20);
      doc.text('ESTADO DE CUENTA INTEGRAL • BANCA EMPRESARIAL CONDOMINIOS', 14, 25);

      doc.setFontSize(8);
      doc.text('FOLIO FISCAL: BBVA-EDC-2026-07-88914', 135, 14);
      doc.text('FECHA DE EMISIÓN: 31/07/2026', 135, 19);
      doc.text('MONEDA: PESOS MEXICANOS (MXN)', 135, 24);

      // Datos del Titular / Condominio
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(14, 38, 182, 30, 2, 2, 'F');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('CLIENTE TITULAR DE LA CUENTA:', 18, 45);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('RESIDENCIAL BOSQUES DEL LAGO A.C.', 18, 51);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('R.F.C.: RBL180422MN3', 18, 57);
      doc.text('RÉGIMEN: PERSONAS MORALES CON FINES NO LUCRATIVOS', 18, 62);

      doc.setFont('helvetica', 'bold');
      doc.text('CUENTA:', 125, 45);
      doc.setFont('helvetica', 'normal');
      doc.text('0123984712', 145, 45);

      doc.setFont('helvetica', 'bold');
      doc.text('CLABE SPEI:', 125, 51);
      doc.setFont('helvetica', 'normal');
      doc.text('012 180 00123984712 9', 145, 51);

      doc.setFont('helvetica', 'bold');
      doc.text('SUCURSAL:', 125, 57);
      doc.setFont('helvetica', 'normal');
      doc.text('0842 - Bosques Residencial', 145, 57);

      doc.setFont('helvetica', 'bold');
      doc.text('PERIODO:', 125, 62);
      doc.setFont('helvetica', 'normal');
      doc.text('01/07/2026 al 31/07/2026', 145, 62);

      // Resumen Financiero
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(14, 72, 182, 18, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text('SALDO INICIAL: $40,000.00', 20, 82);
      doc.setTextColor(16, 185, 129);
      doc.text('TOTAL ABONOS (SPEI): +$14,200.00', 65, 82);
      doc.setTextColor(239, 68, 68);
      doc.text('TOTAL CARGOS: -$348.00', 122, 82);
      doc.setTextColor(15, 23, 42);
      doc.text('SALDO FINAL: $53,852.00', 160, 82);

      // Tabla de Movimientos
      const tableRows = MOVIMIENTOS_DEMO_BANCO.map(m => [
        m.fecha,
        m.referencia,
        m.concepto,
        m.tipo === 'cargo' ? `$${m.monto.toLocaleString('es-MX')}.00` : '-',
        m.tipo === 'abono' ? `$${m.monto.toLocaleString('es-MX')}.00` : '-',
        m.unidadSugerida
      ]);

      autoTable(doc, {
        startY: 94,
        head: [['FECHA', 'REF. SPEI', 'CONCEPTO / REMITENTE', 'CARGOS', 'ABONOS', 'UNIDAD CONDOMINAL']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [11, 39, 90],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 2.5
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 70 },
          3: { cellWidth: 20, halign: 'right', textColor: [220, 38, 38] },
          4: { cellWidth: 22, halign: 'right', textColor: [16, 185, 129], fontStyle: 'bold' },
          5: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
        },
        foot: [[
          'TOTALES',
          '7 Movs.',
          'Conciliación Condominio',
          '$348.00',
          '$14,200.00',
          '6 Cuotas Identificadas'
        ]],
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontSize: 8,
          fontStyle: 'bold'
        }
      });

      // Pie de página y Sello Digital Oficial
      const finalY = (doc as any).lastAutoTable?.finalY || 210;
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('SELLO DIGITAL DE CERTIFICACIÓN BANCARIA:', 14, finalY + 10);
      doc.setFont('courier', 'normal');
      doc.text(
        'bK9xQ2Lm7PnW4vRt9Z1jKlOp8QeRtYuI3oPzXc7VbNm12a45d6f8gh9JkLmNoPqRsTuVwXyZ0123456789==',
        14,
        finalY + 14
      );
      doc.setFont('helvetica', 'italic');
      doc.text(
        '* Documento digital generado para propósitos de simulación y auditoría de cobranza condominal.',
        14,
        finalY + 20
      );

      doc.save('Estado_De_Cuenta_BBVA_Condominio_Julio2026.pdf');
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Hubo un inconveniente al generar el PDF. Generando archivo de respaldo.');
    }
  };

  // Descarga en formato Excel / CSV estructurado
  const handleDownloadCSV = () => {
    const headers = ['Fecha,Referencia_SPEI,Concepto_Bancario,Monto,Tipo,Unidad_Sugerida,Propietario\n'];
    const rows = MOVIMIENTOS_DEMO_BANCO.map(m => 
      `"${m.fecha}","${m.referencia}","${m.concepto.replace(/"/g, '""')}",${m.monto},"${m.tipo}","${m.unidadSugerida}","${m.propietario}"\n`
    );
    const csvContent = '\uFEFF' + headers.concat(rows).join('');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Extracto_Bancario_BBVA_Condominio_Julio2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Procesar archivo subido (simulación de carga de PDF/Excel/CSV)
  const processUploadedFile = (file: File) => {
    setUploadedFile({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || file.name.split('.').pop()?.toUpperCase() || 'DOCUMENTO',
      date: new Date().toLocaleTimeString('es-MX')
    });

    setIsProcessing(true);
    setSimulationSuccess(false);
    setSimulationLog(['Leyendo extracto bancario cargado...', `Archivo detectado: ${file.name}`]);

    setTimeout(() => {
      // Cargamos los movimientos identificados
      setParsedMovements(MOVIMIENTOS_DEMO_BANCO);
      setSimulationLog(prev => [
        ...prev,
        '✓ Estructura de extracto bancario validada correctamente.',
        '✓ 7 transacciones bancarias detectadas (6 abonos SPEI y 1 cargo por comisión).',
        '✓ Cruce predictivo: 6 de 6 abonos tienen referencia condominal exacta.'
      ]);
      setIsProcessing(false);
    }, 900);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Ejecutar la simulación de conciliación
  const handleRunSimulation = () => {
    setIsProcessing(true);
    setSimulationLog([
      '⚡ INICIANDO SIMULACIÓN DE CONCILIACIÓN BANCARIA SPEI...',
      '1/4 Cruzando claves de rastreo SPEI con el catálogo de residentes...',
      '2/4 Verificando montos de $2,500.00 contra cuotas de mantenimiento vigentes...',
      '3/4 Liquidando adeudos de Mariana Silva (Casa 105), Alejandro Ruiz (102), Carlos Mendoza (108)...',
      '4/4 Generando folios fiscales auditables y recibos digitales oficiales...'
    ]);

    setTimeout(() => {
      setIsProcessing(false);
      setSimulationSuccess(true);
      onApplyConciliacion(parsedMovements.length > 0 ? parsedMovements : MOVIMIENTOS_DEMO_BANCO);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }, 1400);
  };

  return (
    <div className="bg-[#18181C] border border-purple-500/30 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
      
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#282830] pb-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Simulador de Demostración para Clientes
              </span>
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Estado de Cuenta Realista PDF & Excel
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              Prueba de Conciliación Bancaria con Archivo Ficticio
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5 leading-relaxed">
              Descarga el estado de cuenta bancario de prueba (PDF o Excel), súbelo al sistema y ejecuta el cruce automático en vivo para demostrarle al cliente cómo se concilian las cuotas de mantenimiento sin esfuerzo.
            </p>
          </div>
        </div>

        {/* Action Buttons: Download PDF, Excel, and Preview */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-950/50"
            title="Descargar Estado de Cuenta en PDF"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF Bancario</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/50"
            title="Descargar en formato Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Excel (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3 py-2.5 bg-[#1F1F26] hover:bg-[#2A2A33] text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-purple-400" />
            <span>Ver Estado de Cuenta</span>
          </button>
        </div>
      </div>

      {/* Step Guide Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#1F1F24] border border-[#2d2d35] rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-mono font-black flex items-center justify-center shrink-0 text-xs">
            1
          </div>
          <div className="text-xs">
            <p className="font-bold text-white">Descarga el PDF de prueba</p>
            <p className="text-[11px] text-slate-400">Generado con depósitos SPEI de condóminos.</p>
          </div>
        </div>

        <div className="p-3.5 bg-[#1F1F24] border border-[#2d2d35] rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-mono font-black flex items-center justify-center shrink-0 text-xs">
            2
          </div>
          <div className="text-xs">
            <p className="font-bold text-white">Súbelo a la zona de carga</p>
            <p className="text-[11px] text-slate-400">Arrastra el archivo o haz clic para subirlo.</p>
          </div>
        </div>

        <div className="p-3.5 bg-[#1F1F24] border border-[#2d2d35] rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-black flex items-center justify-center shrink-0 text-xs">
            3
          </div>
          <div className="text-xs">
            <p className="font-bold text-white">Ejecuta la simulación</p>
            <p className="text-[11px] text-slate-400">Mira cómo se concilian 6 cuotas automáticamente.</p>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center transition cursor-pointer relative overflow-hidden flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-purple-400 bg-purple-950/30 scale-[1.01]'
            : uploadedFile
            ? 'border-emerald-500/50 bg-emerald-950/20'
            : 'border-slate-700 hover:border-purple-500/60 bg-[#141417]/80 hover:bg-[#1C1C22]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="hidden"
        />

        {uploadedFile ? (
          <div className="space-y-2 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-black text-white">{uploadedFile.name}</p>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                {uploadedFile.size} • {uploadedFile.type} • Cargado a las {uploadedFile.date}
              </p>
            </div>
            <p className="text-xs text-slate-300">
              Haz clic para cambiar de archivo o arrastra otro estado de cuenta bancario
            </p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-white">
                Arrastra aquí tu Estado de Cuenta (PDF, Excel o CSV)
              </p>
              <p className="text-xs text-slate-400">
                o haz clic para examinar archivos desde tu computadora
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] text-slate-300 font-mono">
              <span>Formatos soportados:</span>
              <strong className="text-blue-400">.PDF</strong>
              <strong className="text-emerald-400">.CSV</strong>
              <strong className="text-emerald-400">.XLSX</strong>
            </div>
          </>
        )}
      </div>

      {/* Auto-Match Preview & Execution Console */}
      {(uploadedFile || parsedMovements.length > 0) && (
        <div className="bg-[#141418] border border-[#2A2A33] rounded-3xl p-5 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23232A] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-black text-white">
                  Extracto Reconocido: {parsedMovements.length || MOVIMIENTOS_DEMO_BANCO.length} Transacciones Bancarias
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                El motor financiero analizó los conceptos y encontró correspondencia con los condóminos del residencial:
              </p>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleRunSimulation}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-purple-950/60 shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: isProcessing ? '1s' : '0s' }} />
              <span>{isProcessing ? 'Procesando Cruce...' : '⚡ Ejecutar Conciliación Automática'}</span>
            </button>
          </div>

          {/* List of Matched Movements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {(parsedMovements.length > 0 ? parsedMovements : MOVIMIENTOS_DEMO_BANCO).map((mov) => (
              <div
                key={mov.id}
                className="p-3 bg-[#1C1C22] border border-[#282830] rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-slate-400 text-[10px]">{mov.fecha}</span>
                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded font-mono text-[9px]">
                      {mov.referencia}
                    </span>
                    {mov.tipo === 'abono' ? (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold text-[9px]">
                        Abono SPEI
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded font-bold text-[9px]">
                        Comisión
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-white truncate">{mov.concepto}</p>
                  <p className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Building className="w-3 h-3 text-emerald-400" />
                    <span>Match Unidad: <strong className="text-emerald-300">{mov.unidadSugerida}</strong> ({mov.propietario})</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className={`font-mono font-black text-sm ${mov.tipo === 'abono' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mov.tipo === 'abono' ? `+$${mov.monto.toLocaleString('es-MX')}.00` : `-$${mov.monto.toLocaleString('es-MX')}.00`}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">100% Match</span>
                </div>
              </div>
            ))}
          </div>

          {/* Success Summary Alert */}
          {simulationSuccess && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl space-y-2 animate-fade-in text-left">
              <div className="flex items-center gap-2 text-emerald-300 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>¡Conciliación Bancaria Ejecutada Exitosamente para Demostración!</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Se acreditaron <strong>$14,200.00 MXN</strong> en cuotas condominales, se actualizaron los saldos de <strong>6 unidades</strong> a estatus "Pagado", y se emitieron los recibos digitales de cobranza con folios únicos en la bitácora bancaria.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 bg-emerald-900/60 rounded-lg text-emerald-200 border border-emerald-500/30">
                  Mariana Silva (Casa 105) → Folio REC-SPEI-902148
                </span>
                <span className="px-2.5 py-1 bg-emerald-900/60 rounded-lg text-emerald-200 border border-emerald-500/30">
                  Alejandro Ruiz (102) → Folio REC-SPEI-0044102
                </span>
                <span className="px-2.5 py-1 bg-emerald-900/60 rounded-lg text-emerald-200 border border-emerald-500/30">
                  Carlos Mendoza (108) → Folio REC-SPEI-554109
                </span>
              </div>
            </div>
          )}

          {/* Activity Console Log */}
          {simulationLog.length > 0 && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              {simulationLog.map((log, index) => (
                <p key={index} className="text-emerald-400/90">{log}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: PREVISUALIZADOR DEL ESTADO DE CUENTA FICTICIO */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#121316] border border-slate-700 w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#1B1C22] border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    Estado de Cuenta Bancario de Prueba
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] rounded font-mono">
                      BBVA México
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Residencial Bosques del Lago A.C. • Julio 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Simulated Bank Paper Statement Canvas */}
            <div className="p-6 overflow-y-auto space-y-6 bg-slate-900 text-slate-200 font-sans">
              
              {/* Paper Header */}
              <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-3">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-blue-900">BBVA MÉXICO</h2>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                      Institución de Banca Múltiple • Grupo Financiero BBVA
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs space-y-0.5">
                    <p className="font-bold text-slate-800">ESTADO DE CUENTA INTEGRAL</p>
                    <p className="font-mono text-[11px] text-slate-500">Folio Fiscal: BBVA-EDC-2026-07-88914</p>
                    <p className="text-[11px] text-slate-500">Periodo: 01/07/2026 al 31/07/2026</p>
                  </div>
                </div>

                {/* Account & Owner Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente Titular:</p>
                    <p className="text-sm font-black text-slate-900">RESIDENCIAL BOSQUES DEL LAGO A.C.</p>
                    <p className="text-slate-600 font-mono">RFC: RBL180422MN3</p>
                    <p className="text-slate-600">Av. De los Bosques 500, Fracc. Residencial</p>
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detalles de la Cuenta:</p>
                    <p className="font-mono font-bold text-slate-800">Cuenta: 0123984712</p>
                    <p className="font-mono font-bold text-blue-900">CLABE SPEI: 012 180 00123984712 9</p>
                    <p className="text-slate-600">Sucursal 0842 - Bosques Residencial</p>
                  </div>
                </div>

                {/* Balance Summary Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Saldo Inicial</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">$40,000.00</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p className="text-[9px] font-bold text-emerald-700 uppercase">+ Abonos (SPEI)</p>
                    <p className="text-sm font-black text-emerald-700 mt-0.5">$14,200.00</p>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <p className="text-[9px] font-bold text-rose-700 uppercase">- Cargos (Comisiones)</p>
                    <p className="text-sm font-black text-rose-700 mt-0.5">$348.00</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-[9px] font-bold text-blue-800 uppercase">= Saldo Final</p>
                    <p className="text-sm font-black text-blue-900 mt-0.5">$53,852.00</p>
                  </div>
                </div>

                {/* Movements Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b">
                      <tr>
                        <th className="p-2.5">Fecha</th>
                        <th className="p-2.5">Referencia</th>
                        <th className="p-2.5">Concepto / Remitente</th>
                        <th className="p-2.5 text-right">Cargos</th>
                        <th className="p-2.5 text-right">Abonos</th>
                        <th className="p-2.5 text-center">Unidad Conciliable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {MOVIMIENTOS_DEMO_BANCO.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">{m.fecha}</td>
                          <td className="p-2.5 font-mono font-bold text-blue-900 whitespace-nowrap">{m.referencia}</td>
                          <td className="p-2.5 text-slate-800 font-medium">{m.concepto}</td>
                          <td className="p-2.5 text-right font-mono text-rose-600 font-bold">
                            {m.tipo === 'cargo' ? `$${m.monto.toLocaleString('es-MX')}.00` : '-'}
                          </td>
                          <td className="p-2.5 text-right font-mono text-emerald-600 font-bold">
                            {m.tipo === 'abono' ? `$${m.monto.toLocaleString('es-MX')}.00` : '-'}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                              {m.unidadSugerida}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bank Seal / Footnote */}
                <div className="border-t pt-4 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
                  <p>Cadena Original: ||BBVA|012180001239847129|2026-07-31|14200.00|348.00|53852.00||</p>
                  <p className="font-bold text-slate-700">Página 1 de 1</p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#1B1C22] border-t border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cerrar Visor
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Descargar Archivo PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
