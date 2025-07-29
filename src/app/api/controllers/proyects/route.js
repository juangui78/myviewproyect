import { dbConnected } from "@/api/libs/mongoose";
import { NextResponse } from "next/server";
import User from "@/api/models/users";
import Proyect from "@/api/models/proyect";

import { z } from "zod";

dbConnected();

const proyectSchema = z
  .object({
    name : z.string().max(60),
    m2 : z.number(),
    description : z.string().max(300),
    dateInit : z.string().date(),
    dateFinish : z.string().date(),
    department : z.string().max(60),
    city : z.string().max(60) ,
    address : z.string().max(300) ,
    clientNames : z.string().max(100),
    clientLastNames : z.string().max(100),
    clientEmail : z.string().email(),
    clientTel : z.string().max(10).min(10),
    id_user : z.string()
  });


export async function POST(request) {
  try {
    const getData = await request.json();
    const result = proyectSchema.safeParse(getData);

    if (!result) return NextResponse.json({
      message : 'type of data not expected'
    });

    const { id_Company } = await User.findById(getData?.id_user, {id_Company: 1}); // get id company

    delete getData.id_user; //delete key id_user is not in the model
    getData.idCompany = id_Company;

    const newProyect = new Proyect(getData);
    const saveNewProyect = await newProyect.save();

    if (!saveNewProyect) return NextResponse.json({
      message : 'data can not be saved'
    })

    return NextResponse.json({
      message : 'ok'
    });

  } catch (error) {
    console.log(error)
    return NextResponse.json({
      message: 'error code'
    })
  }
}

export async function GET(request) { //get all proyects by id_company and search

  try {
    const { searchParams } = new URL(request.url);
    const idCompany = searchParams.get('id_company');
    const search = searchParams.get('search');
    let proyects;

    if (!idCompany) return NextResponse.json({
      message: 'id_company is required'
    }, { status: 400 });


    if (search && search !== 'null' && search !== '' && search !== 'undefined') {
      proyects = await Proyect.find({
        idCompany,
        name: { $regex: search, $options: 'i' }
      }, 'name');
    } else {
      proyects = await Proyect.find({ idCompany }, 'name');
    }

    if (!proyects) return NextResponse.json({
      message: 'proyects not found'
    }, { status: 404 });

    return NextResponse.json(proyects, { status: 200});


  } catch (error) {
      return NextResponse.json({
        message: "Internal server error",
      }, { status: 500 });
  }
}