import { dbConnected } from '@/api/libs/mongoose';
import User from '@/api/models/users'
import { NextResponse } from 'next/server';
import sendEmail from '@/api/libs/mailer';

dbConnected();

export async function POST(request){
    try {
        
        const html = `
            <section style="width: 100%; height: 100%; display: flex; position: relative; justify-content: center; background-color: black;">
        <div style="width: 50%; position: relative; margin: auto;">
            <div style="padding-top: 10px; width: 100%; height: 10%; display: flex; justify-content: center;">
                <img style="height: 100%; object-fit: cover; margin: auto;"
                    src="https://heroui.com/images/album-cover.png" alt="">
            </div>
            <div>
                <div style="width: 100%; height: 10%; display: flex; justify-content: center;">
                    <h5 style="margin: auto; color: white;">Bienvenido a My View_</h5>
                </div>
                <div style="width: 100%; height: 10%; display: flex; justify-content: center;">
                    <h2 style="margin: auto; color: white;">Has sido invitado a participar en el proyecto</h2>
                </div>
                <div style="width: 100%; height: 10%; display: flex; justify-content: center;">
                    <h1 style="margin: auto; color: white;">Parcelación santa Rosa</h1>
                </div>
  
                <div style="width: 100%; height: 10%; display: flex; justify-content: center;">
                    <h6 style="margin: auto;">Price</h6>
                </div>
                <div style="width: 100%; height: 10%; display: flex; justify-content: center;">
                    <button style="margin: auto;">Buy</button>
                </div>
            </div>
        </div>
    </section>

        `


        const  {email, permissions} = await request.json();

 
        console.log(email, permissions)

        await sendEmail("layyagami9@gmail.com", "Test", "Test", html)
        return NextResponse.json({status: "ok"})

    } catch (error) {
        console.log(error)
    }

}     