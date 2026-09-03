"use server"
import { dbConnected } from "@/api/libs/mongoose";
import User from "@/api/models/users";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/api/auth/[...nextauth]/route";

export async function updateUserProfile(data) {
  try {
    await dbConnected();
    const session = await getServerSession(AuthOptions);
    if (!session || !session.user?._id) {
      return { success: false, message: "No autenticado" };
    }

    const userId = session.user._id;
    const { name, lastName, password } = data;

    if (!name) {
      return { success: false, message: "El nombre es obligatorio" };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    user.name = name;
    if (lastName !== undefined) {
      user.lastName = lastName;
    }

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return { success: false, message: "La contraseña debe tener al menos 6 caracteres" };
      }
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();
    return { 
      success: true, 
      message: "Perfil actualizado correctamente. Por favor, vuelve a iniciar sesión para aplicar los cambios visuales." 
    };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return { success: false, message: "Error interno en el servidor" };
  }
}
