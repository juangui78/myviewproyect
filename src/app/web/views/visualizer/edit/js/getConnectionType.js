export function getConnectionType() {
    if (typeof navigator !== "undefined" && navigator.connection && navigator.connection.effectiveType) {
        return navigator.connection.effectiveType; // Ejemplo: '4g', '3g', '2g', 'slow-2g'
    }
    return "4g"; // Valor por defecto si no está soportado
}