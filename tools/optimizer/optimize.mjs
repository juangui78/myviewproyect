#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRTextureBasisu } from '@gltf-transform/extensions';
import { prune, dedup, weld, meshopt, simplify, textureCompress, inspect } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Buscar el ejecutable de basisu
const basisuExe = path.join(__dirname, 'node_modules', 'basis_universal', 'bin', process.platform === 'win32' ? 'basisu.exe' : 'basisu');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

async function main() {
  const args = process.argv.slice(2);
  const inputArg = args[0];

  if (!inputArg || inputArg === '--help' || inputArg === '-h') {
    console.log(`
=============================================================
  MyView 3D Model Optimizer (0 Tokens / 100% Local)
=============================================================

Uso:
  node optimize.mjs <archivo.glb> [opciones]

Ejemplos:
  node optimize.mjs modelo.glb
  node optimize.mjs C:\\renders\\terreno.glb --out C:\\renders\\opt

Opciones:
  --out <dir>     Directorio de salida (por defecto: misma carpeta del modelo)
  --no-ktx2       Omitir generacion de version KTX2 para moviles
  --no-preview    Omitir generacion de preview ultra liviano

Genera 3 archivos listos para MyView:
  1. [nombre]-preview.glb  (~300-500 KB) Carga instantanea en 0.3s
  2. [nombre]-high.glb     (HD/8K sin duplicados + Meshopt)
  3. [nombre]-mobile.glb   (KTX2 GPU-compressed: 97% menos VRAM)
=============================================================
`);
    process.exit(0);
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  if (!fs.existsSync(inputPath)) {
    console.error(`\x1b[31mError: No se encontro el archivo: ${inputPath}\x1b[0m`);
    process.exit(1);
  }

  const outIndex = args.indexOf('--out');
  const outDir = outIndex !== -1 && args[outIndex + 1]
    ? path.resolve(process.cwd(), args[outIndex + 1])
    : path.dirname(inputPath);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const parsed = path.parse(inputPath);
  const baseName = parsed.name;
  const origStat = fs.statSync(inputPath);
  const origSize = origStat.size;

  console.log(`\n\x1b[36m=============================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[32m  MyView 3D Model Optimizer\x1b[0m`);
  console.log(`  Archivo original : \x1b[33m${parsed.base}\x1b[0m (${formatBytes(origSize)})`);
  console.log(`  Carpeta salida   : \x1b[37m${outDir}\x1b[0m`);
  console.log(`\x1b[36m=============================================================\x1b[0m\n`);

  console.log(`[1/4] Inicializando motores de compresion WebAssembly...`);
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;
  await MeshoptSimplifier.ready;

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder,
    });

  const doc = await io.read(inputPath);
  const initialReport = inspect(doc);

  const meshesCount = initialReport.meshes.properties.length;
  const totalTris = initialReport.meshes.properties.reduce((a, b) => a + b.glPrimitives, 0);
  const texturesCount = initialReport.textures.properties.length;

  console.log(`      Mallas: ${meshesCount} | Triangulos: ${totalTris.toLocaleString()} | Texturas: ${texturesCount}`);

  // --------------------------------------------------------------------------
  // 1. GENERAR PREVIEW (~300-500 KB)
  // --------------------------------------------------------------------------
  const previewPath = path.join(outDir, `${baseName}-preview.glb`);
  if (!args.includes('--no-preview')) {
    console.log(`\n[2/4] Generando Preview Progresivo (simplificacion 15% + textura 1K)...`);
    const docPreview = await io.read(inputPath);
    await docPreview.transform(
      prune(),
      dedup(),
      weld(),
      simplify({ simplifier: MeshoptSimplifier, ratio: 0.15, error: 0.01 }),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 78 }),
      meshopt({ encoder: MeshoptEncoder, level: 'high' })
    );
    await io.write(previewPath, docPreview);
    const prevStat = fs.statSync(previewPath);
    console.log(`      \x1b[32m✔ Preview listo:\x1b[0m ${path.basename(previewPath)} (${formatBytes(prevStat.size)}) - Reduccion: \x1b[1m${((1 - prevStat.size / origSize) * 100).toFixed(1)}%\x1b[0m`);
  }

  // --------------------------------------------------------------------------
  // 2. GENERAR HIGH-RES OPTIMIZADO (Textura completa 8K/4K + Meshopt)
  // --------------------------------------------------------------------------
  console.log(`\n[3/4] Generando Version High-Res (eliminando texturas duplicadas + Meshopt)...`);
  const highPath = path.join(outDir, `${baseName}-high.glb`);
  const docHigh = await io.read(inputPath);
  await docHigh.transform(
    prune(), // Elimina imagenes huerfanas (ej: el JPEG duplicado de 14 MB)
    dedup(),
    weld(),
    meshopt({ encoder: MeshoptEncoder, level: 'high' })
  );
  await io.write(highPath, docHigh);
  const highStat = fs.statSync(highPath);
  console.log(`      \x1b[32m✔ High-Res listo:\x1b[0m ${path.basename(highPath)} (${formatBytes(highStat.size)}) - Reduccion: \x1b[1m${((1 - highStat.size / origSize) * 100).toFixed(1)}%\x1b[0m`);

  // --------------------------------------------------------------------------
  // 3. GENERAR MOBILE KTX2 (GPU-COMPRESSED 10 MB VRAM)
  // --------------------------------------------------------------------------
  const mobilePath = path.join(outDir, `${baseName}-mobile.glb`);
  let mobileSize = 0;
  if (!args.includes('--no-ktx2') && fs.existsSync(basisuExe)) {
    console.log(`\n[4/4] Generando Version Movil KTX2 (Basis Universal ETC1S con 13 niveles de mipmaps)...`);
    const docMobile = await io.read(inputPath);
    await docMobile.transform(prune(), dedup(), weld());

    const textures = docMobile.getRoot().listTextures();
    const tempFiles = [];

    for (let i = 0; i < textures.length; i++) {
      const tex = textures[i];
      const rawImg = tex.getImage();
      if (!rawImg || rawImg.length === 0) continue;

      const tempPng = path.join(outDir, `_temp_tex_${i}.png`);
      const tempKtx2 = path.join(outDir, `_temp_tex_${i}.ktx2`);
      tempFiles.push(tempPng, tempKtx2);

      // Redimensionar textura para moviles a 4096 maximo
      const meta = await sharp(rawImg).metadata();
      const targetW = Math.min(meta.width || 4096, 4096);
      const targetH = Math.min(meta.height || 4096, 4096);

      await sharp(rawImg).resize(targetW, targetH).png().toFile(tempPng);

      // Ejecutar basisu CLI
      execFileSync(basisuExe, [
        '-ktx2',
        '-mipmap',
        '-q', '255',
        '-comp_level', '2',
        tempPng,
        '-output_file', tempKtx2
      ], { stdio: 'ignore' });

      if (fs.existsSync(tempKtx2)) {
        const ktx2Bytes = fs.readFileSync(tempKtx2);
        tex.setImage(ktx2Bytes).setMimeType('image/ktx2');
      }
    }

    // Limpiar temporales
    tempFiles.forEach(f => {
      try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {}
    });

    // Eliminar extensiones WebP viejas y registrar KHR_texture_basisu
    for (const ext of docMobile.getRoot().listExtensionsUsed()) {
      if (ext.extensionName === 'EXT_texture_webp') ext.dispose();
    }
    docMobile.createExtension(KHRTextureBasisu).setRequired(true);

    await docMobile.transform(meshopt({ encoder: MeshoptEncoder, level: 'high' }));
    await io.write(mobilePath, docMobile);
    const mobStat = fs.statSync(mobilePath);
    mobileSize = mobStat.size;
    console.log(`      \x1b[32m✔ Movil KTX2 listo:\x1b[0m ${path.basename(mobilePath)} (${formatBytes(mobStat.size)}) - Reduccion: \x1b[1m${((1 - mobStat.size / origSize) * 100).toFixed(1)}%\x1b[0m`);
  } else {
    console.log(`\n[4/4] Saltando KTX2 (basisu no disponible o desactivado con --no-ktx2).`);
  }

  // --------------------------------------------------------------------------
  // RESUMEN FINAL
  // --------------------------------------------------------------------------
  console.log(`\n\x1b[36m=============================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[32m  OPTIMIZACION COMPLETADA CON EXITO\x1b[0m`);
  console.log(`\x1b[36m=============================================================\x1b[0m`);
  console.log(`  Archivo original : ${formatBytes(origSize)}`);
  if (fs.existsSync(previewPath)) {
    console.log(`  1. Preview       : ${formatBytes(fs.statSync(previewPath).size)} (${path.basename(previewPath)})`);
  }
  if (fs.existsSync(highPath)) {
    console.log(`  2. High-Res      : ${formatBytes(fs.statSync(highPath).size)} (${path.basename(highPath)})`);
  }
  if (mobileSize > 0) {
    console.log(`  3. Movil KTX2    : ${formatBytes(mobileSize)} (${path.basename(mobilePath)})`);
  }
  console.log(`\n  \x1b[33mComo usarlos en MyView:\x1b[0m`);
  console.log(`  - Sube '${baseName}-high.glb' como modelo principal (url)`);
  console.log(`  - Sube '${baseName}-preview.glb' como previewUrl (para carga instantanea)`);
  if (mobileSize > 0) {
    console.log(`  - Sube '${baseName}-mobile.glb' como mobileUrl (para celulares sin lag)`);
  }
  console.log(`\x1b[36m=============================================================\x1b[0m\n`);
}

main().catch(err => {
  console.error('\x1b[31mError fatal durante la optimizacion:\x1b[0m', err);
  process.exit(1);
});
