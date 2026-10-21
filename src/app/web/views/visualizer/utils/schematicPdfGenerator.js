import { jsPDF } from 'jspdf';
import autoTablePlugin from 'jspdf-autotable';

const AutoTable = typeof autoTablePlugin === 'function' ? autoTablePlugin : (autoTablePlugin?.default || autoTablePlugin);

/**
 * Normaliza y extrae las coordenadas 2D (plano X-Z de Three.js) desde los marcadores del terreno.
 * Maneja formatos: [{ position: [x,y,z] }], [{ x, y, z }], [[x, y, z]]
 */
function extractPoints2D(markers) {
  if (!Array.isArray(markers)) return [];
  return markers.map(marker => {
    if (Array.isArray(marker?.position)) {
      return { x: Number(marker.position[0]), z: Number(marker.position[2]) };
    }
    if (marker && typeof marker.x === 'number' && typeof marker.z === 'number') {
      return { x: Number(marker.x), z: Number(marker.z) };
    }
    if (Array.isArray(marker) && marker.length >= 3) {
      return { x: Number(marker[0]), z: Number(marker[2]) };
    }
    if (marker?.position && typeof marker.position.x === 'number') {
      return { x: Number(marker.position.x), z: Number(marker.position.z) };
    }
    return { x: 0, z: 0 };
  });
}

/**
 * Calcula el área 2D en metros cuadrados usando la fórmula Shoelace (Teorema de Gauss / Green).
 */
function calculatePolygonArea(points) {
  const n = points.length;
  if (n < 3) return 0;
  let areaTimes2 = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaTimes2 += points[i].x * points[j].z - points[j].x * points[i].z;
  }
  return Math.abs(areaTimes2) / 2;
}

/**
 * Calcula el perímetro de un polígono en metros.
 */
function calculatePerimeter(points) {
  const n = points.length;
  if (n < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    perimeter += Math.hypot(points[j].x - points[i].x, points[j].z - points[i].z);
  }
  return perimeter;
}

/**
 * Calcula el centroide 2D (X, Z) del polígono.
 */
function calculateCentroid(points) {
  const n = points.length;
  if (n === 0) return { x: 0, z: 0 };
  if (n < 3) {
    const sumX = points.reduce((acc, p) => acc + p.x, 0);
    const sumZ = points.reduce((acc, p) => acc + p.z, 0);
    return { x: sumX / n, z: sumZ / n };
  }

  let signedAreaTimes2 = 0;
  let cxSum = 0;
  let czSum = 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const factor = points[i].x * points[j].z - points[j].x * points[i].z;
    signedAreaTimes2 += factor;
    cxSum += (points[i].x + points[j].x) * factor;
    czSum += (points[i].z + points[j].z) * factor;
  }

  if (Math.abs(signedAreaTimes2) > 1e-6) {
    const sixA = 3 * signedAreaTimes2;
    return { x: cxSum / sixA, z: czSum / sixA };
  }

  return {
    x: points.reduce((acc, p) => acc + p.x, 0) / n,
    z: points.reduce((acc, p) => acc + p.z, 0) / n
  };
}

/**
 * Colores temáticos arquitectónicos según estado comercial
 */
const STATUS_STYLES = {
  disponible: {
    fillRGB: [220, 248, 230],       // Verde menta muy claro
    strokeRGB: [16, 185, 129],      // Esmeralda técnico
    textRGB: [6, 95, 70],
    label: 'Disponible'
  },
  reservado: {
    fillRGB: [254, 243, 199],       // Ámbar suave
    strokeRGB: [245, 158, 11],      // Ámbar vivo
    textRGB: [146, 64, 14],
    label: 'Reservado'
  },
  vendido: {
    fillRGB: [243, 244, 246],       // Gris claro neutral
    strokeRGB: [156, 163, 175],     // Gris medio
    textRGB: [75, 85, 99],
    label: 'Vendido'
  }
};

/**
 * Dibuja una rosa de los vientos / brújula arquitectónica vectorial
 */
function drawCompass(doc, x, y, size = 16, northOffset = 0) {
  doc.saveGraphicsState();

  const rad = (((Number(northOffset) || 0) % 360) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rot = (dx, dy) => [
    x + dx * cos - dy * sin,
    y + dx * sin + dy * cos
  ];

  // Círculo exterior sutil
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.3);
  doc.circle(x, y, size / 2, 'S');

  // Flecha Norte (azul marca MyView)
  doc.setFillColor(12, 219, 255); // #0CDBFF
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.2);
  const [n1x, n1y] = rot(0, -(size / 2) + 1);
  const [n2x, n2y] = rot(-2.5, 0);
  const [n3x, n3y] = rot(0, -1);
  doc.triangle(n1x, n1y, n2x, n2y, n3x, n3y, 'FD');

  // Flecha Sur (gris)
  doc.setFillColor(148, 163, 184); // Slate 400
  doc.setDrawColor(100, 116, 139);
  const [s1x, s1y] = rot(0, (size / 2) - 1);
  const [s2x, s2y] = rot(2.5, 0);
  const [s3x, s3y] = rot(0, 1);
  doc.triangle(s1x, s1y, s2x, s2y, s3x, s3y, 'FD');

  // Letra N ubicada en la punta Norte
  const [tx, ty] = rot(0, -(size / 2) - 2.2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('N', tx, ty + 1, { align: 'center' });

  doc.restoreGraphicsState();
}

/**
 * Dibuja una escala gráfica métrica
 */
function drawGraphicScale(doc, x, y, scaleMeters, widthMm) {
  doc.saveGraphicsState();
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);

  // Barra principal
  doc.line(x, y, x + widthMm, y);
  doc.line(x, y - 1.5, x, y + 1.5);
  doc.line(x + (widthMm / 2), y - 1, x + (widthMm / 2), y + 1);
  doc.line(x + widthMm, y - 1.5, x + widthMm, y + 1.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('0m', x, y + 4, { align: 'center' });
  doc.text(`${Math.round(scaleMeters / 2)}m`, x + (widthMm / 2), y + 4, { align: 'center' });
  doc.text(`${Math.round(scaleMeters)}m`, x + widthMm, y + 4, { align: 'center' });
  doc.text('ESCALA GRÁFICA', x + (widthMm / 2), y - 3, { align: 'center' });

  doc.restoreGraphicsState();
}

/**
 * Función principal para generar y descargar el Schematic Floor Plan en PDF por Proyecto.
 * Soporta tanto modelos con lotes delimitados como modelos generales sin lotes (usando captura cenital).
 */
export async function generateSchematicFloorPlanPdf({
  projectInfo,
  terrains = [],
  modelName = '',
  modelSnapshot = null,
  modelBounds = null,
  northOffset = 0,
  autoDownload = true
}) {
  // 1. Extraer y procesar geometrías de terrenos si existen
  const processedTerrains = (terrains || []).map((terrain, idx) => {
    const rawPoints = extractPoints2D(terrain.markers || []);
    const area = terrain.areaCalculated || calculatePolygonArea(rawPoints);
    const perimeter = calculatePerimeter(rawPoints);
    const centroid = calculateCentroid(rawPoints);
    const status = (terrain.status || 'disponible').toLowerCase();
    const name = terrain.name || `Lote ${terrain.id || idx + 1}`;

    return {
      id: terrain.id || idx + 1,
      name,
      status,
      points: rawPoints,
      area: Math.round(area * 100) / 100,
      perimeter: Math.round(perimeter * 100) / 100,
      centroid
    };
  }).filter(t => t.points.length >= 3);

  const hasTerrains = processedTerrains.length > 0;

  // 2. Crear documento PDF A4 Horizontal (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // ===================== ENCABEZADO / HEADER COMÚN =====================
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Acento color MyView (#0CDBFF)
  doc.setFillColor(12, 219, 255);
  doc.rect(0, 26, pageWidth, 1.2, 'F');

  const projName = projectInfo?.name || modelName || 'Proyecto Inmobiliario';
  const companyName = projectInfo?.idCompany?.name || 'MyView 3D Platform';
  const location = [projectInfo?.city, projectInfo?.department].filter(Boolean).join(', ') || 'Colombia';
  const emissionDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(
    hasTerrains ? 'PLANO ESQUEMÁTICO DE DISTRIBUCIÓN & LOTES' : 'PLANO ESQUEMÁTICO GENERAL DEL PROYECTO',
    14,
    11
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('PROYECTO: ', 14, 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(12, 219, 255); // #0CDBFF
  doc.text(projName.toUpperCase(), 35, 18);

  // Ubicación y Fecha a la derecha
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`${location} | Fecha: ${emissionDate}`, pageWidth - 14, 11, { align: 'right' });
  doc.setTextColor(148, 163, 184);
  doc.text(`Desarrolla: ${companyName}`, pageWidth - 14, 18, { align: 'right' });

  // Dimensiones del Viewport principal
  const viewX = 14;
  const viewY = 32;
  const viewW = 192;
  const viewH = 158;

  const panelX = 211;
  const panelY = 32;
  const panelW = 72;
  const panelH = 158;

  // Función común para pie de página
  const drawFooter = (pageNum, totalPages) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);

    const contactPhone = projectInfo?.idCompany?.cell || '+57 (305) 402-3539';
    const contactEmail = projectInfo?.idCompany?.email || 'contacto@myview.com';
    doc.text(`Contacto comercial: ${contactPhone} | ${contactEmail}`, 14, 202);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(12, 219, 255);
    doc.text('MyView 3D Platform', pageWidth / 2, 202, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 14, 202, { align: 'right' });
  };

  // =========================================================================
  // CASO 1: PROYECTO CON LOTES / TERRENOS DELIMITADOS (VECTORIAL COMPLETO)
  // =========================================================================
  if (hasTerrains) {
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    processedTerrains.forEach(t => {
      t.points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.z < minZ) minZ = p.z;
        if (p.z > maxZ) maxZ = p.z;
      });
    });

    const rawWidth = Math.max(maxX - minX, 1);
    const rawDepth = Math.max(maxZ - minZ, 1);
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;

    // Fondo del viewport
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(viewX, viewY, viewW, viewH, 2, 2, 'FD');

    // Cuadrícula arquitectónica
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    const gridStep = 10;
    for (let gx = viewX + gridStep; gx < viewX + viewW; gx += gridStep) {
      doc.line(gx, viewY, gx, viewY + viewH);
    }
    for (let gy = viewY + gridStep; gy < viewY + viewH; gy += gridStep) {
      doc.line(viewX, gy, viewX + viewW, gy);
    }

    const pad = 14;
    const scale = Math.min((viewW - pad * 2) / rawWidth, (viewH - pad * 2) / rawDepth);
    const viewCenterX = viewX + viewW / 2;
    const viewCenterY = viewY + viewH / 2;

    const projectPoint = (pt) => ({
      x: viewCenterX + (pt.x - centerX) * scale,
      y: viewCenterY + (pt.z - centerZ) * scale
    });

    // Dibujar cada lote/terreno vectorial
    processedTerrains.forEach(terrain => {
      const style = STATUS_STYLES[terrain.status] || STATUS_STYLES.disponible;
      const projectedPoints = terrain.points.map(projectPoint);

      doc.setFillColor(...style.fillRGB);
      doc.setDrawColor(...style.strokeRGB);
      doc.setLineWidth(0.45);

      const startPoint = projectedPoints[0];
      const lines = [];
      for (let i = 1; i < projectedPoints.length; i++) {
        lines.push([
          projectedPoints[i].x - projectedPoints[i - 1].x,
          projectedPoints[i].y - projectedPoints[i - 1].y
        ]);
      }
      lines.push([
        startPoint.x - projectedPoints[projectedPoints.length - 1].x,
        startPoint.y - projectedPoints[projectedPoints.length - 1].y
      ]);

      doc.lines(lines, startPoint.x, startPoint.y, [1, 1], 'FD', true);

      // Vértices
      doc.setFillColor(...style.strokeRGB);
      projectedPoints.forEach(p => doc.circle(p.x, p.y, 0.6, 'F'));

      // Cotas
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(71, 85, 105);

      for (let i = 0; i < terrain.points.length; i++) {
        const j = (i + 1) % terrain.points.length;
        const p1Raw = terrain.points[i];
        const p2Raw = terrain.points[j];
        const p1Proj = projectedPoints[i];
        const p2Proj = projectedPoints[j];

        const edgeDist = Math.hypot(p2Raw.x - p1Raw.x, p2Raw.z - p1Raw.z);
        const edgeScreenDist = Math.hypot(p2Proj.x - p1Proj.x, p2Proj.y - p1Proj.y);

        if (edgeScreenDist > 7) {
          const midX = (p1Proj.x + p2Proj.x) / 2;
          const midY = (p1Proj.y + p2Proj.y) / 2;
          doc.text(`${edgeDist.toFixed(1)}m`, midX, midY - 0.8, { align: 'center' });
        }
      }

      // Etiqueta central
      const centerProj = projectPoint(terrain.centroid);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...style.textRGB);
      doc.text(terrain.name, centerProj.x, centerProj.y - 1, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`${terrain.area} m²`, centerProj.x, centerProj.y + 2.5, { align: 'center' });
    });

    drawCompass(doc, viewX + 14, viewY + 14, 15, northOffset);
    const scaleMm = 30;
    const realMetersAtScale = scaleMm / scale;
    drawGraphicScale(doc, viewX + 8, viewY + viewH - 8, realMetersAtScale, scaleMm);

    // Panel Lateral Derecho
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(panelX, panelY, panelW, panelH, 2, 2, 'FD');

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(panelX, panelY, panelW, 11, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('RESUMEN DE PROYECTO', panelX + panelW / 2, panelY + 7, { align: 'center' });

    const totalLotes = processedTerrains.length;
    const totalArea = Math.round(processedTerrains.reduce((acc, t) => acc + t.area, 0) * 100) / 100;
    const countDisp = processedTerrains.filter(t => t.status === 'disponible').length;
    const countRes = processedTerrains.filter(t => t.status === 'reservado').length;
    const countVen = processedTerrains.filter(t => t.status === 'vendido').length;

    let curY = panelY + 17;
    const drawMetricRow = (label, value) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(label, panelX + 5, curY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(value), panelX + panelW - 5, curY, { align: 'right' });
      curY += 6.5;
    };

    drawMetricRow('Total de Lotes:', totalLotes);
    drawMetricRow('Área Loteada Total:', `${totalArea.toLocaleString('es-CO')} m²`);

    doc.setDrawColor(241, 245, 249);
    doc.line(panelX + 4, curY - 1, panelX + panelW - 4, curY - 1);
    curY += 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('ESTADO COMERCIAL', panelX + 5, curY);
    curY += 6;

    const drawLegendItem = (style, label, count) => {
      doc.setFillColor(...style.fillRGB);
      doc.setDrawColor(...style.strokeRGB);
      doc.setLineWidth(0.3);
      doc.roundedRect(panelX + 5, curY - 3.2, 5, 4, 0.5, 0.5, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(label, panelX + 13, curY);

      doc.setFont('helvetica', 'bold');
      doc.text(`${count} (${Math.round((count / totalLotes) * 100)}%)`, panelX + panelW - 5, curY, { align: 'right' });
      curY += 6.5;
    };

    drawLegendItem(STATUS_STYLES.disponible, 'Disponibles', countDisp);
    drawLegendItem(STATUS_STYLES.reservado, 'Reservados', countRes);
    drawLegendItem(STATUS_STYLES.vendido, 'Vendidos', countVen);

    doc.setDrawColor(241, 245, 249);
    doc.line(panelX + 4, curY - 1, panelX + panelW - 4, curY - 1);
    curY += 4;

    const quickTableData = processedTerrains.slice(0, 7).map(t => [
      t.name,
      `${t.area} m²`,
      STATUS_STYLES[t.status]?.label || t.status
    ]);

    AutoTable(doc, {
      startY: curY,
      margin: { left: panelX + 3, right: pageWidth - (panelX + panelW - 3) },
      head: [['Lote', 'Área', 'Estado']],
      body: quickTableData,
      theme: 'plain',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontSize: 6,
        fontStyle: 'bold',
        cellPadding: 1.2
      },
      bodyStyles: {
        fontSize: 5.8,
        cellPadding: 1,
        textColor: [71, 85, 105]
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 20, halign: 'right' },
        2: { cellWidth: 20, halign: 'center' }
      }
    });

    if (processedTerrains.length > 7) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text(`* Ver cuadro completo en Pág. 2 (+${processedTerrains.length - 7} lotes)`, panelX + panelW / 2, panelY + panelH - 3, { align: 'center' });
    }

    // PÁGINA 2: CUADRO GENERAL DE ÁREAS COMPLETO
    doc.addPage('a4', 'landscape');

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setFillColor(12, 219, 255);
    doc.rect(0, 20, pageWidth, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('CUADRO GENERAL DE ÁREAS Y LINDEROS', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Proyecto: ${projName} | Ubicación: ${location}`, 14, 16);

    const fullTableData = processedTerrains.map(t => [
      t.id,
      t.name,
      `${t.perimeter.toFixed(2)} m`,
      `${t.area.toLocaleString('es-CO')} m²`,
      STATUS_STYLES[t.status]?.label || t.status
    ]);

    const totalPerimeter = Math.round(processedTerrains.reduce((acc, t) => acc + t.perimeter, 0) * 100) / 100;
    fullTableData.push([
      'TOTAL',
      `${totalLotes} Unidades`,
      `${totalPerimeter.toLocaleString('es-CO')} m`,
      `${totalArea.toLocaleString('es-CO')} m²`,
      '-'
    ]);

    AutoTable(doc, {
      startY: 28,
      margin: { left: 14, right: 14, bottom: 18 },
      head: [['ID', 'Identificador de Lote', 'Perímetro (m)', 'Superficie (m²)', 'Estado Comercial']],
      body: fullTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 70, fontStyle: 'bold' },
        2: { cellWidth: 45, halign: 'right' },
        3: { cellWidth: 55, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 45, halign: 'center' }
      },
      didParseCell: (data) => {
        if (data.row.index === fullTableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.textColor = [15, 23, 42];
        }
        if (data.column.index === 4 && data.row.index < fullTableData.length - 1) {
          const val = data.cell.raw;
          if (val === 'Disponible') {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Reservado') {
            data.cell.styles.textColor = [245, 158, 11];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Vendido') {
            data.cell.styles.textColor = [156, 163, 175];
          }
        }
      }
    });

    doc.setPage(1);
    drawFooter(1, 2);
    doc.setPage(2);
    drawFooter(2, 2);

  } else {
    // =========================================================================
    // CASO 2: PROYECTO GENERAL SIN LOTES DELIMITADOS (PLANTA 3D CENITAL)
    // =========================================================================
    const width = modelBounds?.width || 50;
    const depth = modelBounds?.depth || 80;
    const height = modelBounds?.height || 12;

    // Marco del Viewport
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(viewX, viewY, viewW, viewH, 2, 2, 'FD');

    // Cuadrícula arquitectónica de fondo
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    for (let gx = viewX + 10; gx < viewX + viewW; gx += 10) {
      doc.line(gx, viewY, gx, viewY + viewH);
    }
    for (let gy = viewY + 10; gy < viewY + viewH; gy += 10) {
      doc.line(viewX, gy, viewX + viewW, gy);
    }

    // Incrustar captura ortográfica cenital si fue provista
    if (modelSnapshot) {
      try {
        const pad = 10;
        const maxImgW = viewW - pad * 2;
        const maxImgH = viewH - pad * 2;

        // Obtener aspect ratio REAL de la imagen capturada
        let imgAspect = width / Math.max(depth, 1); // fallback
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              imgAspect = img.naturalWidth / img.naturalHeight;
            }
            resolve();
          };
          img.onerror = resolve;
          img.src = modelSnapshot;
        });

        let imgW = maxImgW;
        let imgH = imgW / imgAspect;

        if (imgH > maxImgH) {
          imgH = maxImgH;
          imgW = imgH * imgAspect;
        }

        const imgX = viewX + (viewW - imgW) / 2;
        const imgY = viewY + (viewH - imgH) / 2;

        // Fondo blanco detrás de la imagen para zonas sin datos
        doc.setFillColor(248, 250, 252);
        doc.rect(imgX, imgY, imgW, imgH, 'F');

        doc.addImage(modelSnapshot, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'FAST');

        // Borde fino de marco de imagen
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.4);
        doc.rect(imgX, imgY, imgW, imgH, 'S');

        // Cotas perimétricas del modelo con líneas de cota
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(51, 65, 85);
        doc.setDrawColor(51, 65, 85);
        doc.setLineWidth(0.3);

        // Cota Superior (Frente = X)
        const cotaTopY = imgY - 6;
        doc.line(imgX, cotaTopY + 2, imgX + imgW, cotaTopY + 2);
        doc.line(imgX, cotaTopY, imgX, cotaTopY + 4);
        doc.line(imgX + imgW, cotaTopY, imgX + imgW, cotaTopY + 4);
        doc.text(`Frente: ${width.toFixed(1)} m`, imgX + imgW / 2, cotaTopY - 0.5, { align: 'center' });

        // Cota Lateral (Fondo = Z)
        const cotaRightX = imgX + imgW + 6;
        doc.line(cotaRightX - 2, imgY, cotaRightX - 2, imgY + imgH);
        doc.line(cotaRightX - 4, imgY, cotaRightX, imgY);
        doc.line(cotaRightX - 4, imgY + imgH, cotaRightX, imgY + imgH);
        doc.text(`Fondo: ${depth.toFixed(1)} m`, cotaRightX + 1, imgY + imgH / 2, { angle: 270, align: 'center' });

      } catch (err) {
        console.warn('No se pudo incrustar el snapshot en el PDF:', err);
      }
    } else {
      // Dibujo esquemático referencial del Bounding Box
      const boxW = 120;
      const boxH = 90;
      const boxX = viewX + (viewW - boxW) / 2;
      const boxY = viewY + (viewH - boxH) / 2;

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(12, 219, 255);
      doc.setLineWidth(0.6);
      doc.rect(boxX, boxY, boxW, boxH, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('PLANTA GENERAL DEL MODELO 3D', viewX + viewW / 2, boxY + boxH / 2 - 3, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${width.toFixed(1)}m × ${depth.toFixed(1)}m`, viewX + viewW / 2, boxY + boxH / 2 + 5, { align: 'center' });
    }

    drawCompass(doc, viewX + 14, viewY + 14, 15, northOffset);
    drawGraphicScale(doc, viewX + 8, viewY + viewH - 8, width / 2, 30);

    // Panel Lateral Derecho: Ficha Técnica del Proyecto
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(panelX, panelY, panelW, panelH, 2, 2, 'FD');

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(panelX, panelY, panelW, 11, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('FICHA TÉCNICA GENERAL', panelX + panelW / 2, panelY + 7, { align: 'center' });

    let curY = panelY + 17;
    const drawItem = (label, value) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(label, panelX + 5, curY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(value), panelX + panelW - 5, curY, { align: 'right' });
      curY += 6.5;
    };

    const projectArea = projectInfo?.areaOfThisproyect
      ? `${projectInfo.areaOfThisproyect.toLocaleString('es-CO')} m²`
      : `${Math.round(width * depth).toLocaleString('es-CO')} m² (est.)`;

    drawItem('Superficie del Proyecto:', projectArea);
    drawItem('Frente del Modelo:', `${width.toFixed(1)} m`);
    drawItem('Fondo del Modelo:', `${depth.toFixed(1)} m`);
    drawItem('Altura Máxima:', `${height.toFixed(1)} m`);
    drawItem('Estado Comercial:', projectInfo?.state || 'Activo');

    doc.setDrawColor(241, 245, 249);
    doc.line(panelX + 4, curY - 1, panelX + panelW - 4, curY - 1);
    curY += 4;

    // Sección de Descripción
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('DESCRIPCIÓN DEL PROYECTO', panelX + 5, curY);
    curY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const descText = projectInfo?.description || 'Proyecto visualizado y modelado en la plataforma interactiva 3D MyView.';
    const splitDesc = doc.splitTextToSize(descText, panelW - 10);
    doc.text(splitDesc.slice(0, 6), panelX + 5, curY);
    curY += Math.min(splitDesc.length * 3.5, 25) + 3;

    // Sección de Ubicación y Contacto
    doc.setDrawColor(241, 245, 249);
    doc.line(panelX + 4, curY, panelX + panelW - 4, curY);
    curY += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('DATOS DE CONTACTO', panelX + 5, curY);
    curY += 5;

    const contactPhone = projectInfo?.idCompany?.cell || '+57 (305) 402-3539';
    const contactEmail = projectInfo?.idCompany?.email || 'contacto@myview.com';
    const contactAddress = projectInfo?.address || 'Ubicación central';

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Dirección: ${contactAddress}`, panelX + 5, curY);
    curY += 4.5;
    doc.text(`Teléfono: ${contactPhone}`, panelX + 5, curY);
    curY += 4.5;
    doc.text(`Email: ${contactEmail}`, panelX + 5, curY);

    drawFooter(1, 1);
  }

  // Descargar archivo PDF (omitible para mostrar vista previa antes de descargar)
  const sanitizedName = projName.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
  const fileName = `${sanitizedName}_plano_esquematico.pdf`;

  if (autoDownload && typeof window !== 'undefined') {
    doc.save(fileName);
  }

  return {
    success: true,
    fileName,
    totalLotes: processedTerrains.length,
    doc
  };
}
