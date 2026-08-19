/**
 * gen_store_svg.ts — 参数化商店展示图布局引擎（替代 AI 手拼 SVG）
 *
 * Usage:
 *   bun run .codebuddy/skills/generate_store_image/scripts/gen_store_svg.ts \
 *     --title <产品名> [--tagline <一句话>] [--logo <路径>] \
 *     [--color brand|ocean|sunset|forest|midnight|slate] \
 *     [--size screenshot|promo-small|promo-large|marquee|all|WxH] \
 *     [--lang en|zh] [--out <svg 输出目录>]
 *
 * 输出 <out>/<W>x<H>.svg，随后交由 render_store_image.ts 渲染 PNG。
 *
 * 布局数学（基准 S=√(W·H)，替代旧锚 H 系数）：
 *   - title_fs = 0.09S、logo_h = 0.10S、tagline_fs = 0.035S
 *   - gap_logo_title = 0.035S、row_gap = 0.06S（动态间距，随画布/logo/字号联动）
 *   - 整体行（logo+标题）水平居中于 0.50W；标题 x = 0.50W + (logo_w+gap)/2
 *   - tagline 与整体行中心共轴 x = 0.50W
 *   - 垂直基线锚定：text y = yc + 0.35*font_size（弃用 dominant-baseline）
 *   - 溢出保护：整体行 B≤0.9W、tagline≤0.92W、内容高≤0.6H，超限等比压缩
 *   - <image> 显式 width/height，规避 librsvg 对无 intrinsic 尺寸 SVG 的 300×150 fallback 右偏
 */

import { existsSync } from 'node:fs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

interface SizeDef {
  name: string;
  w: number;
  h: number;
}

const SIZES: Record<string, SizeDef> = {
  screenshot: { name: 'screenshot', w: 1280, h: 800 },
  'promo-small': { name: 'promo-small', w: 440, h: 280 },
  'promo-large': { name: 'promo-large', w: 920, h: 680 },
  marquee: { name: 'marquee', w: 1400, h: 560 },
};

interface Palette {
  mode: 'light' | 'dark';
  primary: string;
  accent: string;
  end: string;
}

const PALETTES: Record<string, Palette> = {
  brand: { mode: 'light', primary: '', accent: '', end: '' }, // 主色由 logo 派生
  ocean: { mode: 'dark', primary: '#0071C5', accent: '#00C7FD', end: '#005A9E' },
  sunset: { mode: 'dark', primary: '#E65100', accent: '#FF9100', end: '#BF360C' },
  forest: { mode: 'dark', primary: '#2E7D32', accent: '#69F0AE', end: '#1B5E20' },
  midnight: { mode: 'dark', primary: '#4527A0', accent: '#B388FF', end: '#311B92' },
  slate: { mode: 'dark', primary: '#37474F', accent: '#90A4AE', end: '#263238' },
};

const FALLBACK_PRIMARY = '#0EA5E9';

/** 字宽系数（相对 1em），SVG 无 measureText，按字符类型加权估算 */
function charWidth(ch: string): number {
  if (/[a-z]/.test(ch)) return 0.52;
  if (/[A-Z]/.test(ch)) return 0.68;
  if (/[0-9]/.test(ch)) return 0.55;
  if (ch === ' ') return 0.3;
  if (ch === '-') return 0.4;
  return 1.0; // 中文/全角
}

function textWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const ch of text) em += charWidth(ch);
  return em * fontSize;
}

function hexToHue(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Invalid hex color: ${hex}`);
  const n = parseInt(m[1]!, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      break;
    case g:
      h = ((b - r) / d + 2) * 60;
      break;
    default:
      h = ((r - g) / d + 4) * 60;
  }
  return Math.round(h);
}

interface LogoInfo {
  dataUri: string;
  aspect: number; // w/h
  hue: number;
}

async function loadLogo(path: string): Promise<LogoInfo> {
  const buf = await readFile(path);
  const isPng = path.toLowerCase().endsWith('.png');
  const mime = isPng ? 'image/png' : 'image/svg+xml';
  const dataUri = `data:${mime};base64,${buf.toString('base64')}`;
  let aspect = 1;
  let hue = hexToHue(FALLBACK_PRIMARY);

  if (isPng) {
    const meta = await sharp(buf).metadata();
    if (meta.width && meta.height) aspect = meta.width / meta.height;
    // 主色：缩小 8×8 取饱和度最高的像素
    const { data, info } = await sharp(buf)
      .resize(8, 8, { fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    let best: { sat: number; hex: string } = { sat: -1, hex: FALLBACK_PRIMARY };
    for (let i = 0; i < info.width * info.height; i++) {
      const r = data[i * info.channels]!;
      const g = data[i * info.channels + 1]!;
      const b = data[i * info.channels + 2]!;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      if (sat > best.sat) {
        best = {
          sat,
          hex: `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`,
        };
      }
    }
    hue = hexToHue(best.hex);
  } else {
    const svg = buf.toString('utf-8');
    const vb = /viewBox\s*=\s*"([^"]+)"/.exec(svg);
    if (vb) {
      const parts = vb[1]!.split(/[\s,]+/).map(Number);
      const w = parts[2];
      const h = parts[3];
      if (w && h) aspect = w / h;
    }
    // 主色：首个渐变第一 stop 的 stop-color；无渐变回退首个 fill
    const grad = /<(?:linear|radial)Gradient[\s\S]*?<\/\1>/i.exec(svg);
    let color: string | null = null;
    if (grad) {
      const stop = /<stop[^>]*stop-color\s*=\s*"([^"]+)"/i.exec(grad[0]);
      if (stop) color = stop[1];
    }
    if (!color) {
      const fill = /fill\s*=\s*"(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})"/i.exec(svg);
      if (fill) color = fill[1];
    }
    if (color) hue = hexToHue(color);
  }
  return { dataUri, aspect, hue };
}

interface LayoutInput {
  w: number;
  h: number;
  logoAspect: number;
  title: string;
  tagline: string;
}

interface LayoutResult {
  titleFs: number;
  logoH: number;
  logoW: number;
  taglineFs: number;
  gap: number;
  rowGap: number;
  logoX: number;
  logoY: number;
  titleX: number;
  titleY: number; // baseline
  taglineX: number;
  taglineY: number; // baseline
}

function computeLayout(input: LayoutInput): LayoutResult {
  const { w, h, logoAspect, title, tagline } = input;
  const s = Math.sqrt(w * h);

  let titleFs = 0.09 * s;
  let logoH = 0.1 * s;
  let logoW = logoH * logoAspect;
  let taglineFs = 0.035 * s;
  let gap = 0.035 * s;
  let rowGap = 0.06 * s;

  // 整体行水平溢出保护：B ≤ 0.9W，等比压缩（保持比例）
  const brandW = () => logoW + gap + textWidth(title, titleFs);
  const bMax = 0.9 * w;
  if (brandW() > bMax) {
    const k = bMax / brandW();
    titleFs *= k;
    logoH *= k;
    logoW *= k;
    taglineFs *= k;
    gap *= k;
    rowGap *= k;
  }

  // tagline 独立溢出保护：≤ 0.92W
  if (tagline) {
    const tagW = textWidth(tagline, taglineFs);
    const tMax = 0.92 * w;
    if (tagW > tMax) taglineFs *= tMax / tagW;
  }

  // 垂直溢出保护：内容总高 ≤ 0.6H
  const contentH = () => Math.max(logoH, titleFs) + rowGap + taglineFs;
  if (contentH() > 0.6 * h) {
    const k = (0.6 * h) / contentH();
    titleFs *= k;
    logoH *= k;
    logoW *= k;
    taglineFs *= k;
    gap *= k;
    rowGap *= k;
  }

  // 垂直：品牌行中心锚定光学中心 yc = 0.45H
  const yc = 0.45 * h;
  const logoY = yc - logoH / 2;
  const titleY = yc + 0.35 * titleFs; // 基线锚定：视觉中心≈基线下方 0.35em

  // 水平：整体行（logo+标题）居中于 0.50W
  const b = logoW + gap + textWidth(title, titleFs);
  const xLeft = 0.5 * w - b / 2;
  const logoX = xLeft;
  const titleX = 0.5 * w + (logoW + gap) / 2;

  // tagline：与整体行中心共轴（0.50W），垂直位于品牌行下方
  const tagYc = yc + logoH / 2 + rowGap + taglineFs / 2;
  const taglineY = tagYc + 0.35 * taglineFs;

  return {
    titleFs,
    logoH,
    logoW,
    taglineFs,
    gap,
    rowGap,
    logoX,
    logoY,
    titleX,
    titleY,
    taglineX: 0.5 * w,
    taglineY,
  };
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const f2 = (n: number): number => Math.round(n * 100) / 100;

interface BuildParams {
  w: number;
  h: number;
  hue: number;
  palette: Palette;
  title: string;
  tagline: string;
  layout: LayoutResult;
  dataUri: string;
  fontStack: string;
  hasLogo: boolean;
}

function buildSvg(p: BuildParams): string {
  const { w, h, hue, palette, title, tagline, layout: l, dataUri, fontStack, hasLogo } = p;
  const titleFill = palette.mode === 'light' ? '#0F172A' : '#FFFFFF';
  const taglineFill = palette.mode === 'light' ? '#334155' : '#FFFFFF';

  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">\n  <defs>\n`;

  if (palette.mode === 'light') {
    const bg = [
      head,
      `    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">\n`,
      `      <stop offset="0%" stop-color="hsl(${hue},45%,97%)"/>\n`,
      `      <stop offset="50%" stop-color="hsl(${hue},55%,92%)"/>\n`,
      `      <stop offset="100%" stop-color="hsl(${hue},60%,86%)"/>\n`,
      `    </linearGradient>\n`,
      `    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">\n`,
      `      <feGaussianBlur stdDeviation="${f2(0.03 * h)}"/>\n`,
      `    </filter>\n`,
      `  </defs>\n`,
      `  <rect width="${w}" height="${h}" fill="url(#base)"/>\n`,
      `  <g filter="url(#blur)">\n`,
      `    <circle cx="${f2(0.15 * w)}" cy="${f2(0.22 * h)}" r="${f2(0.3 * h)}" fill="hsl(${hue},70%,80%)" fill-opacity="0.35"/>\n`,
      `    <circle cx="${f2(0.85 * w)}" cy="${f2(0.75 * h)}" r="${f2(0.26 * h)}" fill="hsl(${hue},70%,80%)" fill-opacity="0.3"/>\n`,
      `    <rect x="${f2(0.6 * w)}" y="${f2(0.1 * h)}" width="${f2(0.25 * w)}" height="${f2(0.18 * h)}" rx="${f2(0.09 * h)}" fill="hsl(${hue},70%,80%)" fill-opacity="0.25"/>\n`,
      `  </g>\n`,
      `  <rect width="${w}" height="${h}" fill="#FFFFFF" fill-opacity="0.35"/>\n`,
    ].join('');
    return bg + contentBlock() + `</svg>\n`;
  }

  const bg = [
    head,
    `    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">\n`,
    `      <stop offset="0%" stop-color="${palette.primary}"/>\n`,
    `      <stop offset="50%" stop-color="${palette.accent}"/>\n`,
    `      <stop offset="100%" stop-color="${palette.end}"/>\n`,
    `    </linearGradient>\n`,
    `  </defs>\n`,
    `  <rect width="${w}" height="${h}" fill="url(#base)"/>\n`,
  ].join('');
  return bg + contentBlock() + `</svg>\n`;

  function contentBlock(): string {
    const parts: string[] = [];
    if (hasLogo) {
      parts.push(
        `  <image href="${dataUri}" x="${f2(l.logoX)}" y="${f2(l.logoY)}" width="${f2(l.logoW)}" height="${f2(l.logoH)}" preserveAspectRatio="xMidYMid meet"/>\n`,
      );
    }
    parts.push(
      `  <text x="${f2(l.titleX)}" y="${f2(l.titleY)}" text-anchor="middle" font-family="${fontStack}" font-size="${f2(l.titleFs)}" font-weight="800" fill="${titleFill}">${escapeXml(title)}</text>\n`,
    );
    if (tagline) {
      parts.push(
        `  <text x="${f2(l.taglineX)}" y="${f2(l.taglineY)}" text-anchor="middle" font-family="${fontStack}" font-size="${f2(l.taglineFs)}" font-weight="400" fill="${taglineFill}">${escapeXml(tagline)}</text>\n`,
      );
    }
    return parts.join('');
  }
}

function parseArgs(argv: string[]): Record<string, string> {
  const args = argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i]!;
    if (!flag.startsWith('--')) throw new Error(`Unexpected argument: ${flag}`);
    out[flag.slice(2)] = args[i + 1] ?? '';
  }
  return out;
}

function expandSizes(sizeArg: string): SizeDef[] {
  if (sizeArg === 'all') return Object.values(SIZES);
  if (sizeArg in SIZES) return [SIZES[sizeArg]!];
  const m = /^(\d+)x(\d+)$/i.exec(sizeArg);
  if (m) return [{ name: 'custom', w: Number(m[1]), h: Number(m[2]) }];
  throw new Error(`Invalid --size: ${sizeArg} (screenshot/promo-small/promo-large/marquee/all/WxH)`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const title = args['title'];
  if (!title) throw new Error('Missing required flag: --title <产品名>');
  const tagline = args['tagline'] ?? '';
  const logoArg = args['logo'];
  const colorName = args['color'] ?? 'brand';
  const sizeArg = args['size'] ?? 'screenshot';
  const lang = args['lang'] ?? 'en';
  const outDir = resolve(args['out'] ?? '.output/store-image/svg');

  const palette = PALETTES[colorName];
  if (!palette) throw new Error(`Invalid --color: ${colorName} (brand/ocean/sunset/forest/midnight/slate)`);

  const sizes = expandSizes(sizeArg);
  const logoPath = logoArg ?? join(process.cwd(), 'public/icon/icon.svg');
  const hasLogo = existsSync(logoPath);
  const logo = hasLogo ? await loadLogo(logoPath) : null;
  const hue = logo ? logo.hue : hexToHue(FALLBACK_PRIMARY);
  const fontStack =
    lang === 'zh'
      ? "'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif"
      : "'Helvetica Neue', Arial, sans-serif";

  await mkdir(outDir, { recursive: true });
  for (const size of sizes) {
    const layout = computeLayout({
      w: size.w,
      h: size.h,
      logoAspect: logo?.aspect ?? 1,
      title,
      tagline,
    });
    const svg = buildSvg({
      w: size.w,
      h: size.h,
      hue,
      palette,
      title,
      tagline,
      layout,
      dataUri: logo?.dataUri ?? '',
      fontStack,
      hasLogo,
    });
    await writeFile(join(outDir, `${size.w}x${size.h}.svg`), svg, 'utf-8');
    console.log(
      `PASS ${size.w}x${size.h}.svg (title ${layout.titleFs.toFixed(0)}px, logo ${layout.logoH.toFixed(0)}px, tagline ${layout.taglineFs.toFixed(0)}px)`,
    );
  }
  console.log(`\nResult: ${sizes.length} SVG generated -> ${outDir}`);
}

await main();
