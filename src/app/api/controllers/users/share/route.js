import { dbConnected } from '@/api/libs/mongoose';
import User from '@/api/models/users'
import { NextResponse } from 'next/server';

dbConnected();

export async function POST(request){
    
}