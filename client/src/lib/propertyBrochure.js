// Single-property branded PDF brochure.
// Uses jsPDF (already a dep). Images are pulled from the property's image URLs;
// CORS must allow them — Cloudinary URLs do by default.
import { formatPrice, propertyTypeLabels } from './utils';

const BRAND = { r: 99, g: 102, b: 241 };

async function urlToDataUrl(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function imageDims(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.width, h: img.height });
    img.onerror = () => resolve({ w: 1, h: 1 });
    img.src = dataUrl;
  });
}

export async function generatePropertyBrochure(p, opts = {}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 36;

  // ── Hero header ──────────────────────────────────────────────────────────
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, pageW, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Telvine Realty', margin, 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Property Brochure', margin, 56);
  doc.setFontSize(9);
  doc.text(
    `Generated ${new Date().toLocaleDateString()}`,
    pageW - margin,
    36,
    { align: 'right' }
  );

  // ── Cover image ─────────────────────────────────────────────────────────
  let cursorY = 100;
  const cover = p.images?.[0]?.url;
  if (cover) {
    const data = await urlToDataUrl(cover);
    if (data) {
      const { w, h } = await imageDims(data);
      const targetW = pageW - margin * 2;
      const targetH = Math.min((h * targetW) / w, 260);
      try {
        doc.addImage(data, 'JPEG', margin, cursorY, targetW, targetH);
        cursorY += targetH + 16;
      } catch {
        // fallthrough
      }
    }
  }

  // ── Title + status ──────────────────────────────────────────────────────
  doc.setTextColor(20, 20, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(p.title || '', pageW - margin * 2);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90, 100, 120);
  const loc = [p.address, p.city, p.state].filter(Boolean).join(', ');
  doc.text(loc, margin, cursorY);
  cursorY += 18;

  // Price tag
  doc.setFillColor(244, 246, 252);
  doc.roundedRect(margin, cursorY, pageW - margin * 2, 50, 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.text(formatPrice(p.price, p.pricePeriod), margin + 14, cursorY + 32);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 90, 110);
  const tag = [
    propertyTypeLabels[p.propertyType] || p.propertyType,
    p.listingType === 'rent' ? 'For Rent' : 'For Sale',
    p.status,
  ].filter(Boolean).join(' • ');
  doc.text(tag, pageW - margin - 14, cursorY + 32, { align: 'right' });
  cursorY += 70;

  // ── Specs grid ──────────────────────────────────────────────────────────
  const specs = [
    ['Bedrooms', p.bedrooms ?? '—'],
    ['Bathrooms', p.bathrooms ?? '—'],
    ['Area', p.area ? `${p.area} ${p.areaUnit || 'sqft'}` : '—'],
    ['Parking', p.parking ?? '—'],
    ['Furnishing', p.furnishing || '—'],
    ['Year Built', p.yearBuilt || '—'],
  ];
  doc.setDrawColor(220, 225, 235);
  const colW = (pageW - margin * 2) / 3;
  const rowH = 48;
  specs.forEach((row, i) => {
    const col = i % 3;
    const r = Math.floor(i / 3);
    const x = margin + col * colW;
    const y = cursorY + r * rowH;
    doc.setFillColor(252, 253, 255);
    doc.roundedRect(x + 4, y, colW - 8, rowH - 8, 6, 6, 'F');
    doc.setTextColor(120, 130, 150);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(String(row[0]).toUpperCase(), x + 14, y + 16);
    doc.setTextColor(20, 30, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(String(row[1]), x + 14, y + 32);
  });
  cursorY += Math.ceil(specs.length / 3) * rowH + 8;

  // ── Description ─────────────────────────────────────────────────────────
  if (p.description) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 30, 50);
    doc.text('About this property', margin, cursorY);
    cursorY += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 70, 90);
    const descLines = doc.splitTextToSize(p.description, pageW - margin * 2);
    const maxDesc = Math.min(descLines.length, Math.floor((pageH - cursorY - 120) / 14));
    doc.text(descLines.slice(0, maxDesc), margin, cursorY);
    cursorY += maxDesc * 14 + 12;
  }

  // ── Amenities ───────────────────────────────────────────────────────────
  if (p.amenities?.length && cursorY < pageH - 140) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 30, 50);
    doc.text('Amenities', margin, cursorY);
    cursorY += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let chipX = margin;
    p.amenities.slice(0, 12).forEach((a) => {
      const w = doc.getTextWidth(a) + 14;
      if (chipX + w > pageW - margin) {
        chipX = margin;
        cursorY += 22;
      }
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(chipX, cursorY - 10, w, 18, 9, 9, 'F');
      doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
      doc.text(a, chipX + 7, cursorY + 2);
      chipX += w + 6;
    });
    cursorY += 22;
  }

  // ── Footer ──────────────────────────────────────────────────────────────
  const contact = opts.contact || {};
  doc.setFillColor(245, 247, 252);
  doc.rect(0, pageH - 70, pageW, 70, 'F');
  doc.setTextColor(40, 50, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Interested in this property?', margin, pageH - 44);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 90, 110);
  doc.text(
    contact.line ||
      'Contact Telvine Realty for a viewing, pricing details, or to make an offer.',
    margin,
    pageH - 28
  );
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.text(
    contact.email || 'hello@telvine.realty',
    pageW - margin,
    pageH - 44,
    { align: 'right' }
  );
  doc.text(
    contact.phone || '+91 90000 00000',
    pageW - margin,
    pageH - 28,
    { align: 'right' }
  );

  const slug = (p.title || 'property')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  doc.save(`brochure-${slug || 'property'}.pdf`);
}
