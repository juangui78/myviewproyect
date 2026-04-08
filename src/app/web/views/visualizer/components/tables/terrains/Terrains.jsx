import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue } from "@heroui/table";

// Función para calcular el área (misma lógica que en AreaVisual)
const calculateArea = (markers) => {
    if (markers.length < 3) return 0; // Se necesitan al menos 3 puntos para un área

    let area = 0;
    const n = markers.length;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const xi = markers[i].position[0]; // Coordenada x
        const zi = markers[i].position[2]; // Coordenada z (usamos z en lugar de y)
        const xj = markers[j].position[0]; // Coordenada x del siguiente punto
        const zj = markers[j].position[2]; // Coordenada z del siguiente punto
        area += xi * zj - xj * zi; // Fórmula del área de un polígono
    }
    return Math.abs(area / 2); // Área en metros cuadrados
};

// Columnas de la tabla
const columns = [
    {
        key: "name",
        label: "Nombre",
    },
    {
        key: "area",
        label: "Área (m²)",
    },
];

// Componente Terrains
export default function Terrains({ terrains, onSelectTerrain }) {
    // Transformar los terrenos en filas para la tabla
    const rows = terrains.map((terrain) => ({
        key: terrain.id.toString(),
        name: `Terreno ${terrain.id}`,
        area: calculateArea(terrain.markers).toFixed(2), // Calcular el área y formatear a 2 decimales
    }));

    
    
    return (
        <Table aria-label="Tabla de terrenos" className="py-4 dark" selectionMode="single" isCompact >
            <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody items={rows} className="text-xs text-white" emptyContent={"Selecciona Terrenos."}>
                {(item) => (
                    <TableRow key={item.key} onClick={() => onSelectTerrain(terrains.find(t => t.id.toString() === item.key))} className="text-xs text-white">
                        {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
  