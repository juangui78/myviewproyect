import mongoose, { mongo } from "mongoose";

const { MOONGODB_URI } = process.env;

const conn = {
  isConnected: false,
};

export async function dbConnected() {

  if (conn.isConnected) {
    console.log("Ya está conectado a la base de datos");
    return;
  }

  if (mongoose.connections.length > 0) {
    conn.isConnected = mongoose.connections[0].readyState === 1;
    if (conn.isConnected) {
      console.log("Usando conexión existente");
      return;
    }

    await mongoose.disconnect();
  }


  try {
    const db = await mongoose.connect(MOONGODB_URI);
    conn.isConnected = db.connections[0].readyState === 1;

    console.log("Conectado a la base de datos:", db.connection.db.databaseName);

  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
}

// Escuchar eventos de conexión
if (mongoose.connection.listeners("connected").length === 0) {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB está conectado");
  });
}

if (mongoose.connection.listeners("error").length === 0) {
  mongoose.connection.on("error", (err) => {
    console.error("Error de conexión de MongoDB:", err);
  });
}

