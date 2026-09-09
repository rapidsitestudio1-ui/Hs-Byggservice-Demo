/**
 * Bildoptimering for HS Byggservice.
 * Kors lokalt vid behov:  npm run images
 * Laser kallbilder fran design/assets och skriver optimerade varianter till assets/img.
 * Kallbilderna ingar inte i den publicerade webbplatsen.
 */
import sharp from 'sharp';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'design/assets';
const OUT = 'assets/img';

/** width = bredd i CSS-pixlar som filen ar avsedd for */
const JOBS = [
  // Hero (LCP) — AI-genererad bild i webbplatsens fargskala
  // Bilden speglas sa att fasaden hamnar till vanster, dar rubriken star,
  // och den grona toningen till hoger faller over himmel och tallar.
  { src: 'hero.png',       name: 'hero',        widths: [960, 1440, 1920], fit: 'cover', ratio: 1920 / 800, q: { avif: 46, webp: 62, jpg: 70 },
    pre: (img) => img.flop().extract({ left: 0, top: 250, width: 2752, height: 1147 }) },

  // Tjanstekort — kvadratiska
  { src: 'svc-kok.png',    name: 'tjanst-kok',  widths: [416, 832], fit: 'cover', ratio: 1,   q: { avif: 48, webp: 66, jpg: 72 } },
  { src: 'svc-bad.png',    name: 'tjanst-bad',  widths: [416, 832], fit: 'cover', ratio: 1,   q: { avif: 48, webp: 66, jpg: 72 } },
  { src: 'svc-hel.png',    name: 'tjanst-hel',  widths: [416, 832], fit: 'cover', ratio: 1,   q: { avif: 48, webp: 66, jpg: 72 } },

  // Om oss
  { src: 'about-1.png',    name: 'om-stor',     widths: [580, 1160], fit: 'cover', ratio: 578 / 367, q: { avif: 48, webp: 66, jpg: 72 } },
  { src: 'about-2.png',    name: 'om-liten',    widths: [250, 500],  fit: 'cover', ratio: 1,         q: { avif: 50, webp: 68, jpg: 74 } },

  // Projekt — portratt 1000x1350
  { src: 'proj/p7.png',    name: 'projekt-1',   widths: [416, 832], fit: 'cover', ratio: 1000 / 1350, q: { avif: 48, webp: 66, jpg: 72 } },
  { src: 'proj/p10.png',   name: 'projekt-2',   widths: [416, 832], fit: 'cover', ratio: 1000 / 1350, q: { avif: 48, webp: 66, jpg: 72 } },
  { src: 'proj/p9.png',    name: 'projekt-3',   widths: [416, 832], fit: 'cover', ratio: 1000 / 1350, q: { avif: 48, webp: 66, jpg: 72 } },
  { src: 'proj/p1.png',    name: 'projekt-4',   widths: [416, 832], fit: 'cover', ratio: 1000 / 1350, q: { avif: 48, webp: 66, jpg: 72 } },
  { src: 'proj/p3.png',    name: 'projekt-5',   widths: [416, 832], fit: 'cover', ratio: 1000 / 1350, q: { avif: 48, webp: 66, jpg: 72 } },

  // Fore/efter
  { src: 'ba/b3.png',      name: 'fore',        widths: [800, 1280, 1760], fit: 'cover', ratio: 16 / 9, q: { avif: 46, webp: 62, jpg: 70 } },
  { src: 'ba/b2.png',      name: 'efter',       widths: [800, 1280, 1760], fit: 'cover', ratio: 16 / 9, q: { avif: 46, webp: 62, jpg: 70 } },

  // Bakgrund omdomen (kraftigt nedtonad i layouten)
  { src: 'tst-bg-a.png',   name: 'omdomen-bg',  widths: [960, 1440], fit: 'cover', ratio: 1920 / 764, q: { avif: 40, webp: 56, jpg: 64 } },
];

/** Vita linjeikoner med alfakanal — webp racker, stods av alla aktuella webblasare */
const ICONS = [
  { src: 'svc-icon-1.png', name: 'ikon-kok' },
  { src: 'svc-icon-2.png', name: 'ikon-bad' },
  { src: 'svc-icon-3.png', name: 'ikon-hel' },
];

await mkdir(OUT, { recursive: true });

const kb = (b) => (b / 1024).toFixed(1) + ' kB';
let total = 0;

async function emit(file) {
  const s = await stat(file);
  total += s.size;
  console.log('  ' + path.basename(file).padEnd(28) + kb(s.size).padStart(10));
}

for (const job of JOBS) {
  for (const w of job.widths) {
    const h = Math.round(w / job.ratio);
    let img = sharp(path.join(SRC, job.src));
    if (job.pre) img = job.pre(img);
    const base = img.resize(w, h, { fit: job.fit, position: job.pre ? 'center' : 'attention' });
    const p = `${OUT}/${job.name}-${w}`;
    await base.clone().avif({ quality: job.q.avif, effort: 9, chromaSubsampling: '4:2:0' }).toFile(`${p}.avif`);
    await base.clone().webp({ quality: job.q.webp, effort: 6, smartSubsample: true }).toFile(`${p}.webp`);
    await base.clone().jpeg({ quality: job.q.jpg, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' }).toFile(`${p}.jpg`);
    await emit(`${p}.avif`); await emit(`${p}.webp`); await emit(`${p}.jpg`);
  }
}

for (const icon of ICONS) {
  const base = sharp(path.join(SRC, icon.src)).resize(162, 162, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  await base.clone().webp({ quality: 80, effort: 6, alphaQuality: 90 }).toFile(`${OUT}/${icon.name}.webp`);
  await emit(`${OUT}/${icon.name}.webp`);
}

console.log('\nTotalt: ' + kb(total));
