export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request){

  const session = await getToken({ req : request, secret : process.env.NEXTAUTH_SECRET}) // get the token
  const path = request.nextUrl.pathname;

  console.log(session, path)

  if (!session){ // the session does not exist
    if (path !== '/web/views/signup' && path !== '/web/views/login'){
      const urlRedirect = new URL('/web/views/login' , request.url);
      return NextResponse.redirect(urlRedirect);
    }
  }
  
  // the session exist
  if (session){
    if (path === '/web/views/login' || path === '/web/views/signup'){
      const urlRedirect_ = new URL('/web/views/feed' , request.url);
      return NextResponse.redirect(urlRedirect_);
    }else NextResponse.next();
  }
}

export const config = {
  matcher : ['/pages/:path*', '/web/views/login', '/web/views/feed'] // see in the future
}