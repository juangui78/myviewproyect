
export const formatDate = (date) => {
    const opciones = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Para formato de 24 horas
    };
    return new Date(date).toLocaleString("es-ES", opciones);
};