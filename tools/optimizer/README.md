# Optimizador 3D Local para MyView (0 Tokens)

Herramienta 100% local para procesar modelos 3D (`.glb`) antes de subirlos a MyView, sin requerir internet ni consumir tokens de IA.

## ¿Qué hace?
Dado cualquier archivo `.glb`, genera automáticamente 3 variantes optimizadas:

1. **`[nombre]-preview.glb` (~300 - 500 KB)**
   - Malla simplificada al 15% con Meshopt.
   - Texturas WebP redimensionadas a 1024x1024.
   - Carga en ~0.3s para visualización instantánea mientras se descarga el modelo de alta calidad.

2. **`[nombre]-high.glb` (HD sin texturas basura)**
   - Poda texturas huérfanas/duplicadas generadas por programas como Agisoft Metashape o RealityCapture.
   - Compresión de geometría sin pérdidas con `meshopt` y soldadura de vértices (`weld`).

3. **`[nombre]-mobile.glb` (KTX2 GPU-Compressed)**
   - Texturas comprimidas en formato universal de GPU (Basis Universal ETC1S).
   - 13 niveles de mipmaps integrados.
   - Reduce el consumo de VRAM en dispositivos móviles de ~300 MB a ~10-15 MB (previene cierres por falta de memoria).

---

## Modos de Uso

### Método 1: Arrastrar y Soltar (El más fácil)
Simplemente arrastra cualquier archivo `.glb` desde el explorador de Windows y suéltalo sobre:
- [optimizar-modelo.bat](file:///e:/myview/optimizar-modelo.bat)

### Método 2: Doble clic
Haz doble clic en `optimizar-modelo.bat`, pega o arrastra la ruta de tu modelo a la consola y pulsa Enter.

### Método 3: Desde Terminal / PowerShell
```bash
node tools/optimizer/optimize.mjs "C:\ruta\al\modelo.glb"
```

Opciones opcionales:
- `--out "C:\carpeta\destino"`: Especifica dónde guardar los 3 archivos.
- `--no-ktx2`: Omitir versión KTX2 si solo quieres High y Preview.
