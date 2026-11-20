import fs from 'node:fs';
import path from 'node:path';
import { jsPDF } from 'jspdf';
import { SEED_PRODUCTS } from '../src/data/seedCatalog.ts';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'downloads');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function renderWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  pageBottom = 274
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  let cursorY = y;
  for (const line of lines) {
    if (cursorY > pageBottom) {
      doc.addPage();
      cursorY = 22;
    }
    doc.text(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

function renderMarkdownIntoPdf(doc: jsPDF, md: string, startY: number): number {
  let y = startY;
  const paragraphs = md.split('\n');

  for (const rawLine of paragraphs) {
    const line = rawLine.trim();
    if (!line) {
      y += 3;
      continue;
    }

    if (y > 270) {
      doc.addPage();
      y = 22;
    }

    if (line.startsWith('## ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      y = renderWrappedText(doc, line.replace(/^##\s+/, ''), 18, y + 3, 174, 6);
      y += 2;
    } else if (line.startsWith('### ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      y = renderWrappedText(doc, line.replace(/^###\s+/, ''), 18, y + 2, 174, 5.5);
      y += 1.5;
    } else if (line.startsWith('- ')) {
      const clean = line.replace(/^-\s+/, '').replace(/\*\*/g, '').replace(/`/g, '');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(39, 39, 42);
      y = renderWrappedText(doc, `•  ${clean}`, 22, y, 168, 5);
      y += 1;
    } else {
      const clean = line.replace(/\*\*/g, '').replace(/`/g, '');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(39, 39, 42);
      y = renderWrappedText(doc, clean, 18, y, 174, 5);
      y += 1.5;
    }
  }
  return y;
}

// 1. Generate 5 individual product deliverable PDFs (ready to upload to Polar.sh)
for (const product of SEED_PRODUCTS) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Obsidian header banner
  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, 210, 44, 'F');
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 42, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(96, 165, 250);
  doc.text('AXIAVONE DIGITAL SYSTEMS  ·  COMMERCIAL EDITION', 18, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(doc.splitTextToSize(product.title, 174) as string[], 18, 25);

  // Metadata bar
  let y = 55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(82, 82, 91);
  const priceLabel = product.price_usd === 0 ? 'FREE ($0 USD)' : `$${product.price_usd.toFixed(0)} USD`;
  doc.text(`Tier: ${product.tier}   |   Price: ${priceLabel}   |   Slug: ${product.slug}`, 18, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(24, 24, 27);
  y = renderWrappedText(doc, product.tagline, 18, y, 174, 5.5);

  // Included Features Box
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Included Deliverables', 18, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(39, 39, 42);
  for (const feat of product.features_json) {
    y = renderWrappedText(doc, `[+]  ${feat}`, 20, y, 170, 5);
    y += 1;
  }

  y += 4;
  doc.setDrawColor(228, 228, 231);
  doc.line(18, y, 192, y);
  y += 6;

  y = renderMarkdownIntoPdf(doc, product.description_md, y);

  // Polar.sh & SEO quick reference section at bottom
  if (y > 235) {
    doc.addPage();
    y = 22;
  } else {
    y += 8;
  }

  doc.setFillColor(244, 244, 245);
  doc.rect(18, y, 174, 34, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Polar.sh / Storefront Metadata Reference', 22, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(63, 63, 70);
  renderWrappedText(doc, `SEO Title: ${product.seo_title}`, 22, y + 13, 166, 4.2);
  renderWrappedText(doc, `SEO Desc: ${product.seo_description}`, 22, y + 19, 166, 4.2);
  renderWrappedText(doc, `Keywords: ${product.keywords.join(', ')}`, 22, y + 29, 166, 4.2);

  const outPath = path.join(OUTPUT_DIR, `${product.slug}.pdf`);
  fs.writeFileSync(outPath, Buffer.from(doc.output('arraybuffer')));
}

// 2. Generate combined master Polar.sh Shop Setup & 5-Product Pack PDF
const masterDoc = new jsPDF({ unit: 'mm', format: 'a4' });
masterDoc.setFillColor(9, 9, 11);
masterDoc.rect(0, 0, 210, 48, 'F');
masterDoc.setFillColor(37, 99, 235);
masterDoc.rect(0, 46, 210, 2, 'F');

masterDoc.setFont('helvetica', 'bold');
masterDoc.setFontSize(10);
masterDoc.setTextColor(96, 165, 250);
masterDoc.text('AXIAVONE  ·  POLAR.SH & LEMON SQUEEZY SELLER PACK', 18, 17);

masterDoc.setFont('helvetica', 'bold');
masterDoc.setFontSize(18);
masterDoc.setTextColor(255, 255, 255);
masterDoc.text('5 Tier-1 MVP Products — Shop Listing & Copy Pack', 18, 28);

masterDoc.setFont('helvetica', 'normal');
masterDoc.setFontSize(10);
masterDoc.setTextColor(212, 212, 216);
masterDoc.text(
  'Copy-paste each product listing below directly into Polar.sh and Lemon Squeezy.',
  18,
  37
);

let my = 58;
SEED_PRODUCTS.slice()
  .sort((a, b) => a.price_usd - b.price_usd)
  .forEach((p, idx) => {
    if (idx > 0) {
      masterDoc.addPage();
      my = 20;
    }

    masterDoc.setFont('helvetica', 'bold');
    masterDoc.setFontSize(10);
    masterDoc.setTextColor(37, 99, 235);
    masterDoc.text(`PRODUCT 0${idx + 1}  ·  TIER: ${p.tier.toUpperCase()}  ·  $${p.price_usd.toFixed(0)} USD`, 18, my);
    my += 7;

    masterDoc.setFont('helvetica', 'bold');
    masterDoc.setFontSize(14);
    masterDoc.setTextColor(15, 23, 42);
    my = renderWrappedText(masterDoc, p.title, 18, my, 174, 6.5);
    my += 3;

    masterDoc.setFont('helvetica', 'bold');
    masterDoc.setFontSize(9.5);
    masterDoc.setTextColor(63, 63, 70);
    masterDoc.text(`Slug: ${p.slug}`, 18, my);
    my += 5;
    masterDoc.text(`Deliverable File: public/downloads/${p.slug}.pdf`, 18, my);
    my += 7;

    masterDoc.setFont('helvetica', 'bold');
    masterDoc.setFontSize(10);
    masterDoc.setTextColor(15, 23, 42);
    masterDoc.text('Short Tagline (Polar.sh Subtitle):', 18, my);
    my += 5;
    masterDoc.setFont('helvetica', 'normal');
    masterDoc.setTextColor(39, 39, 42);
    my = renderWrappedText(masterDoc, p.tagline, 18, my, 174, 5);
    my += 4;

    masterDoc.setFont('helvetica', 'bold');
    masterDoc.setTextColor(15, 23, 42);
    masterDoc.text('Bullet Features:', 18, my);
    my += 5;
    masterDoc.setFont('helvetica', 'normal');
    for (const f of p.features_json) {
      my = renderWrappedText(masterDoc, `•  ${f}`, 21, my, 170, 5);
    }
    my += 4;

    masterDoc.setFont('helvetica', 'bold');
    masterDoc.setTextColor(15, 23, 42);
    masterDoc.text('Full Polar.sh Markdown Description:', 18, my);
    my += 5;
    my = renderMarkdownIntoPdf(masterDoc, p.description_md, my);
  });

const masterPath = path.join(OUTPUT_DIR, 'axiavone-polar-sh-launch-kit.pdf');
fs.writeFileSync(masterPath, Buffer.from(masterDoc.output('arraybuffer')));
console.log('Generated PDFs:', fs.readdirSync(OUTPUT_DIR));
