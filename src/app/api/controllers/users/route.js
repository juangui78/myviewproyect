import { dbConnected } from '@/api/libs/mongoose';
import User from '@/api/models/users'
import { NextResponse } from 'next/server';


dbConnected();

export async function GET(request){
  await dbConnected();
  const users = await User.find();
  return NextResponse.json(users);
}

export async function POST(request){
  await dbConnected();
  const data = await request.json();
  const newUser = new User(data);
  newUser.save();

  return NextResponse.json({
    data
  })
}