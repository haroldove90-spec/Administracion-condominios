import QRCode from 'qrcode';
import { VisitorPassData } from '../components/VisitorPassModal';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generates the clean WhatsApp invitation text with ONLY global data and NO system links.
 */
export function getCleanWhatsAppText(pass: VisitorPassData): string {
  const host = pass.hostName || 'Mariana Silva (Residente Acreditado)';
  return `🎫 *PASE DE ACCESO DIGITAL - RESIDENCIAL*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👋 ¡Hola *${pass.visitorName}*!\n` +
    `Tu pase de ingreso autorizado al condominio está listo:\n\n` +
    `👤 *Autorizado por (Residente):* ${host}\n` +
    `🏠 *Destino:* ${pass.condo}\n` +
    `🚘 *Vehículo / Placas:* ${pass.plate || 'Peatonal'}\n` +
    `📋 *Tipo:* ${pass.type}\n` +
    `⏱️ *Vigencia / Duración:* ${pass.validUntil}\n` +
    `🔢 *Folio de Acceso:* ${pass.token}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Presenta la imagen del Código QR adjunta al guardia en la caseta de seguridad para autorizar tu ingreso._`;
}

/**
 * Creates a high-resolution Canvas card representing the pass image.
 */
export async function createPassCardCanvas(pass: VisitorPassData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 680;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D context');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#0F172A');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative header bar
  const headerGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  headerGrad.addColorStop(0, '#1E293B');
  headerGrad.addColorStop(0.5, '#0F766E');
  headerGrad.addColorStop(1, '#1E293B');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, canvas.width, 110);

  // Border frame
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Top header text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5EEAD4';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText('RESIDENCIAL BOSQUES • CONTROL DE ACCESOS Y SEGURIDAD', canvas.width / 2, 40);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('PASE OFICIAL DE ACCESO DIGITAL', canvas.width / 2, 75);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Válido para presentación directa en caseta de vigilancia', canvas.width / 2, 98);

  // Status Badge
  const statusX = (canvas.width - 260) / 2;
  const statusY = 130;
  drawRoundedRect(ctx, statusX, statusY, 260, 32, 16);
  ctx.fillStyle = pass.status === 'valido' ? '#064E3B' : '#7F1D1D';
  ctx.fill();
  ctx.strokeStyle = pass.status === 'valido' ? '#10B981' : '#EF4444';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = pass.status === 'valido' ? '#A7F3D0' : '#FECACA';
  ctx.font = '900 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(pass.status === 'valido' ? '✓ ACCESO AUTORIZADO EN CASETA' : '✕ PASE NO VIGENTE', canvas.width / 2, statusY + 21);

  // Generate QR code data URL
  const qrDataUrl = await QRCode.toDataURL(pass.token, {
    width: 240,
    margin: 1,
    color: {
      dark: '#020617',
      light: '#FFFFFF'
    }
  });

  // Draw QR plate
  const qrPlateX = (canvas.width - 270) / 2;
  const qrPlateY = 180;
  drawRoundedRect(ctx, qrPlateX, qrPlateY, 270, 270, 20);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Draw QR Image
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, qrPlateX + 15, qrPlateY + 15, 240, 240);
      resolve();
    };
    img.onerror = reject;
    img.src = qrDataUrl;
  });

  // Token Folio Box
  const tokenBoxX = (canvas.width - 420) / 2;
  const tokenBoxY = 470;
  drawRoundedRect(ctx, tokenBoxX, tokenBoxY, 420, 38, 12);
  ctx.fillStyle = '#090D16';
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillText(`FOLIO: ${pass.token}`, canvas.width / 2, tokenBoxY + 24);

  // Data details Card
  const cardX = 50;
  const cardY = 530;
  const cardW = canvas.width - 100;
  const cardH = 300;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 18);
  ctx.fillStyle = '#111827';
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Helper row drawer
  const drawDetailRow = (
    label: string,
    value: string,
    yPos: number,
    valueColor = '#F8FAFC',
    isBold = true
  ) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(label, cardX + 24, yPos);

    ctx.textAlign = 'right';
    ctx.fillStyle = valueColor;
    ctx.font = `${isBold ? '900' : 'bold'} 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    
    // truncate if needed
    let displayVal = value;
    if (displayVal.length > 32) {
      displayVal = displayVal.substring(0, 30) + '...';
    }
    ctx.fillText(displayVal, cardX + cardW - 24, yPos);

    // Divider line
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 20, yPos + 10);
    ctx.lineTo(cardX + cardW - 20, yPos + 10);
    ctx.stroke();
  };

  const hostName = pass.hostName || 'Mariana Silva (Casa 105)';
  drawDetailRow('👤 Autoriza (Residente):', hostName, cardY + 40, '#38BDF8');
  drawDetailRow('🏠 Destino:', pass.condo, cardY + 85, '#F8FAFC');
  drawDetailRow('👤 Visitante Autorizado:', pass.visitorName, cardY + 130, '#10B981');
  drawDetailRow('🚘 Vehículo / Placas:', pass.plate || 'Acceso Peatonal', cardY + 175, '#FBBF24');
  drawDetailRow('📋 Tipo de Acceso:', pass.type, cardY + 220, '#E2E8F0');
  drawDetailRow('⏱️ Vigencia / Duración:', pass.validUntil, cardY + 265, '#A7F3D0');

  // Footer Instructions
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Presenta esta tarjeta al vigilante en caseta para autorizar tu ingreso.', canvas.width / 2, 865);

  ctx.fillStyle = '#64748B';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('EMISIÓN DIGITAL DIRECTA • SIN ENLACES EXTERNOS • SEGURIDAD PRIVADA', canvas.width / 2, 890);

  return canvas;
}

/**
 * Returns a Blob of the rendered pass image.
 */
export async function getPassImageBlob(pass: VisitorPassData): Promise<Blob> {
  const canvas = await createPassCardCanvas(pass);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate pass image blob'));
    }, 'image/png');
  });
}

/**
 * Triggers browser download of the pass PNG image.
 */
export async function downloadPassImage(pass: VisitorPassData): Promise<void> {
  const canvas = await createPassCardCanvas(pass);
  const dataUrl = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  const safeName = pass.visitorName.replace(/[^a-zA-Z0-9_-]/g, '_');
  anchor.download = `Pase-Acceso-${safeName}.png`;
  anchor.href = dataUrl;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Shares the pass image directly via Web Share API Level 2 (files).
 * If sharing files is not supported, it falls back to downloading the image
 * and opening WhatsApp with the clean text.
 */
export async function sharePassImageOrFallback(pass: VisitorPassData): Promise<{ sharedViaFiles: boolean }> {
  try {
    const blob = await getPassImageBlob(pass);
    const safeName = pass.visitorName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const file = new File([blob], `Pase-Acceso-${safeName}.png`, { type: 'image/png' });
    const cleanText = getCleanWhatsAppText(pass);

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Pase de Acceso - ${pass.visitorName}`,
        text: cleanText,
      });
      return { sharedViaFiles: true };
    }
  } catch (err: any) {
    // User cancelled or aborted share
    if (err?.name === 'AbortError') {
      return { sharedViaFiles: false };
    }
    console.warn('Web Share API with files not available:', err);
  }

  // Fallback: download image and open WhatsApp
  await downloadPassImage(pass);
  const cleanPhone = (pass.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
  const cleanText = getCleanWhatsAppText(pass);
  const waUrl = formattedPhone
    ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(cleanText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanText)}`;
  window.open(waUrl, '_blank', 'noreferrer');

  return { sharedViaFiles: false };
}

/**
 * Copies the pass image to the clipboard (works on desktop / modern mobile).
 */
export async function copyPassImageToClipboard(pass: VisitorPassData): Promise<boolean> {
  try {
    const blob = await getPassImageBlob(pass);
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (err) {
    console.warn('Failed to copy image to clipboard:', err);
  }
  return false;
}
