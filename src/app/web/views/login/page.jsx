"use client"
import React, { useState } from "react";
import {Card,CardHeader,CardBody, CardFooter,Divider,Image,Input,Button, Link} from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();

  return (
    <section className="flex justify-center ... items-center ... h-dvh">
      <Card className="max-w-[900px] w-3/12">
        <CardHeader className="flex gap-3">
          <Image
            alt="nextui logo"
            height={40}
            radius="sm"
            src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
            width={40}
          />
          <div className="flex flex-col">
            <p className="text-md">Modelos y Asociados</p>
            <p className="text-small text-default-500">Esteban Y Parra</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setDisabled(true);

            const email =  e.target.elements.email.value;
            const password =  e.target.elements.password.value;

            const form = new FormData();
            form.append('email', email);
            form.append('password', password);

            const response = await signIn('credentials', {
              email : email,
              password: password,
              redirect : false
            });

            if (response.ok){
              return router.push('/web/views/feed');
            }else{
              alert('incorrect password or email')
            }

            setDisabled(false);
            console.log(response.error);
            console.log(response.ok);

          }}>
            <Input
              isRequired
              type="email"
              name="email"
              label="Email"
              className="w-full mb-5"
            />
            <Input
              isRequired
              type="password"
              name="password"
              label="Contraseña"
              className="w-full mb-5"
            />
            <Button color="primary" type="submit" isDisabled={disabled}>
              Iniciar Sesión
            </Button>
          </form>
        </CardBody>
        <Divider />
        <CardFooter>
            <Link href={'./signup'}>Crear cuenta</Link>
        </CardFooter>
      </Card>
    </section>
  );
}
