import mongoose, { mongo } from "mongoose";

const { MOONGODB_URI } = process.env;

if (!MOONGODB_URI) {
  throw new Error("Por favor define la variable de entorno MOONGODB_URI");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnected() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MOONGODB_URI, opts).then((mongooseInstance) => {
      console.log("Conectado a la base de datos:", mongooseInstance.connection.db?.databaseName || "default");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("Error al conectar a MongoDB:", error);
    throw error;
  }

  return cached.conn;
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

