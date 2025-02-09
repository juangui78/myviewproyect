import { dbConnected } from '@/api/libs/mongoose';
import User from '@/api/models/users'
import { NextResponse } from 'next/server';
import sendEmail from '@/api/libs/mailer';

dbConnected();

export async function POST(request){
    try {
        const  {email, permissions} = await request.json();


        console.log(email, permissions)

        await sendEmail("layyagami9@gmail.com", "Test", "Test", "<h1>Test</h1>")
        return NextResponse.json({status: "ok"})

    } catch (error) {
        console.log(error)
    }

}    