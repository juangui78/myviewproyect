import mongoose from "mongoose";

const { MOONGODB_URI } = process.env;

let conn = {
  isConnected: false,
};

export async function dbConnected() {
  if (conn.isConnected) return;

  try {
    // Usar mongoose.connect() directamente
    const db = await mongoose.connect(MOONGODB_URI);

    // Actualizar el estado de la conexión
    conn.isConnected = db.connections[0].readyState === 1;

    console.log("Conectado a la base de datos:", db.connection.db.databaseName);

    // Escuchar eventos de conexión
    mongoose.connection.on("connected", () => {
      console.log("MongoDB está conectado");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Error de conexión de MongoDB:", err);
    });

  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
}
