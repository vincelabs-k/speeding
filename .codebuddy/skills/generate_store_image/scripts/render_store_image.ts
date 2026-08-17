/**
 * render_store_image.ts — 批量渲染商店展示图 PNG
 *
 * Usage:
 *   bun run .codebuddy/skills/generate_store_image/scripts/render_store_image.ts \
 *     --svg-dir <svg 目录> --out <png 输出目录>
 *
 * 遍历 <svg-dir> 下所有 <W>x<H>.svg（viewBox 即目标尺寸），用 sharp 渲染为
 * <out>/<W>x<H>.png，并校验输出 PNG 像素尺寸与文件名一致。
 * 输出 PASS/FAIL 清单；全部通过退出码 0，任一失败退出码 1。
 */

import { readdir, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

function parseArgs(argv: string[]): { svgDir: string; outDir: string } {
  const args = argv.slice(2);
  const get = (flag: string): string => {
    const idx = args.indexOf(flag);
    if (idx === -1 || !args[idx + 1]) {
      throw new Error(`Missing required flag: ${flag} <path>`);
    }
    return args[idx + 1]!;
  };
  return { svgDir: get('--svg-dir'), outDir: get('--out') };
}

function parseSize(name: string): { w: number; h: number } | null {
  const m = /^(\d+)x(\d+)\.svg$/.exec(name);
  if (!m) return null;
  return { w: Number(m[1]), h: Number(m[2]) };
}

async function main(): Promise<void> {
  const { svgDir, outDir } = parseArgs(process.argv);
  await mkdir(outDir, { recursive: true });

  let files: string[];
  try {
    files = (await readdir(svgDir)).filter((f) => /^\d+x\d+\.svg$/.test(f));
  } catch (err) {
    console.log('FAIL Cannot read svg dir:', svgDir, err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
  if (files.length === 0) {
    console.log('FAIL No SVG files matching <W>x<H>.svg found in', svgDir);
    process.exit(1);
  }

  const results: string[] = [];
  let pass = 0;
  let fail = 0;

  for (const file of files.sort()) {
    const size = parseSize(file);
    if (!size) continue; // 已在 filter 排除，防御分支

    const outName = file.replace(/\.svg$/, '.png');
    const outPath = join(outDir, outName);
    try {
      const svg = await readFile(join(svgDir, file));
      await sharp(svg).png().toFile(outPath);

      const meta = await sharp(outPath).metadata();
      if (meta.width === size.w && meta.height === size.h) {
        results.push(`PASS ${outName} (${meta.width}x${meta.height})`);
        pass += 1;
      } else {
        results.push(`FAIL ${outName} expected ${size.w}x${size.h} got ${meta.width}x${meta.height}`);
        fail += 1;
      }
    } catch (err) {
      results.push(`FAIL ${outName} render error: ${err instanceof Error ? err.message : String(err)}`);
      fail += 1;
    }
  }

  for (const line of results) console.log(line);

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

await main();
