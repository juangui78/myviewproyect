import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { dbConnected } from '@/api/libs/mongoose';
import User from '@/api/models/users'
import Company from "@/api/models/company";
import bcrypt from "bcryptjs";

dbConnected();

const AuthOptions ={
  providers : [
    Credentials({
      name : 'credentials',
      credentials : {
        email : {label : 'email', type:'text'},
        password :{label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        
        const userFound = await User.findOne({email : credentials?.email});
        if (!userFound) throw new Error("invalid credentials");

        const password = await bcrypt.compare(credentials?.password, userFound.password); //validate if the password math
        if (!password) throw new Error("invalid password");

        const planUser = await Company.findById(userFound.id_Company);

        const userWithData = {
          _id: userFound._id,
          name: userFound.name,
          lastName: userFound.lastName,
          email: userFound.email,
          configuration : userFound.configurations,
          rol : userFound.type,
          plan : planUser.plan,
          id_company : planUser._id
        };

        const user = userWithData;
        return user;
      }
    })
  ], 
  callbacks : {
    jwt({account, token, user, profile, session}){
      if (user) token.user = user;
      return token;
    },
    session({session, token}){
      session.user = token.user;
      return session;
    }
  },
  pages : {
    signIn : "/login"
  }  
};

const handler = NextAuth(AuthOptions);

export { handler as GET, handler as POST, AuthOptions}