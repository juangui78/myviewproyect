import { dbConnected } from "@/api/libs/mongoose";
import { NextResponse } from "next/server";

import User from "@/api/models/users";
import Company from "@/api/models/company";

import { z } from "zod";
import bcrypt from "bcryptjs";;

dbConnected();


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

    const hashedPassword = await bcrypt.hash(pass, 12);
    data.password = hashedPassword;

    //give the permissions
    data.permissions = {
      view : true,
      createEdit : true,
    }

    //create the company width the plan and dates
    const dateNow = new Date();
    const in30Days = new Date(dateNow.getTime() + 30 * 24 * 60 * 60 * 1000);

    const companyData = {
      plan : data.plan,
      finalFree : in30Days
    }

    const company = new Company(companyData);
    const successCompany = await company.save(); //save company

    if (successCompany){
      const idCompany = successCompany?._id;
      data.id_Company = idCompany;

      const user = new User(data); //save user
      user.save();

      //send email
      // sendEmail()

      return NextResponse.json({
        message: "user created",
        success: true,
      });

    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({
      message: "somethin get wrong",
      success: false
    })
  }
}
