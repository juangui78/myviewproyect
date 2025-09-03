import { dbConnected } from "@/api/libs/mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import User from "@/api/models/users";
import Company from "@/api/models/company";
import mongoose from "mongoose";


// AQUI SE CREA UNA CUENTA DESDE 0 y CON ASIGNACION DE COMPAÑIA si no tiene

dbConnected();
const { ObjectId } = mongoose.Types;

// Esquema del USER
const loginSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    plan: z.string(),
    type: z.string(),
    password: z.string().min(3).max(50),
    validPassword: z.string().min(3),
  })
  .refine((data) => data.password === data.validPassword, {
    message: "Passwords don't match",
    path: ["validPassword"],
  });

export async function POST(request) {
  try {
    const data = await request.json();
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      return NextResponse.json({
        message: "corrupted data",
        success: false,
      });
    }

    const email = data.email;
    const pass = data.password;
    const foundUser = await User.findOne({ email }); //verify the email

    if (foundUser) {
      return NextResponse.json({
          message: "user already exist",
          success: false,
        },{ status: 200 }
      );
    }

    // Crear una nueva compañía automáticamente
    const newCompany = new Company({
      name: data.name, // Usa el nombre del usuario como nombre de la compañía
      email: data.email,
      createdAt: new Date(),
    });
    const savedCompany = await newCompany.save();

    const hashedPassword = await bcrypt.hash(pass, 12);
    data.password = hashedPassword;
    data.permissions = {
      view : true,
      createEdit : true,
      admin : false,
    }
    data.configurations = {
        feed : 'cards'
    }

    // Asignar el ID de la compañía al usuario
    data.id_Company = savedCompany._id;

    const newUser = new User(data);
    await newUser.save();

    return NextResponse.json(
      {
        message: "User and Company created",
        success: true,
      },
      { status: 200 }
    );
  }

    catch (error) {
    console.error("Error in signup:", error);
    return NextResponse.json(
      { message: "Error creating user", success: false, error },
      { status: 500 }
    );
  }
}
