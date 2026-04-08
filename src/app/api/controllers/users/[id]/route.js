import { dbConnected } from '@/api/libs/mongoose';
import User from '@/api/models/users'
import { z } from 'zod';
import { NextResponse } from 'next/server';


dbConnected();

export async function GET(request, { params }) {

    try{
        const { id } = params

        const schema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId")
        const resultSchema = schema.safeParse(id)

        if (!resultSchema.success){ //when the id is not a valid ObjectId
            return NextResponse.json({message: 'Invalid Id'}, { status: 400 })
        }

        //all its right
        const usersInvited = await User.findById( id , { 
            __v: 0, 
            _id: 0,
            id_Company: 0, 
            type: 0,
            name: 0,
            email: 0,
            password: 0,
            request: 0,
            permissions: 0,
            configurations: 0,
            created: 0,
            rol: 0,

        })

        return NextResponse.json(usersInvited, { status: 200 })

    }catch(error){
        console.log(error)
        return NextResponse.json({message: 'Error'}, { status: 500 })
    }



}