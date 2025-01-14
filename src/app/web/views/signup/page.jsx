"use client"
import React, { useState } from "react";
import {Card,CardHeader,CardBody,CardFooter,Divider,Image, Input, Button, Progress, Modal, ModalContent, ModalHeader, ModalBody} from "@nextui-org/react";
import { signIn } from "next-auth/react";
import axios from "axios";

export default function Signup() { // PAGE TO CREATE USER WHEN THEY DONT HAVE A PLAN => PLAN FREE

  const [sending, setSending] = useState(false);
  const [created, setCreated] = useState(false);
  const [folders, setFolders] =  useState(false);
  const [password, setPassword] = useState('');
  const [valuePass, setValuePass] = useState('');
  const [valueValidPss, setValueValidPass] = useState('');
  const [validPassword, setValidPassword] = useState('');

  const verifyPass = (value) => {
    setValuePass(value);
    if (value.length < 3) setPassword('La contraseña debe contener minimo 3 caracteres');
    else setPassword('');

    if (value != valueValidPss) setValidPassword('Las contraseñas deben coincidir');
    else setValidPassword('');
  }

  const verifyTwoPass = (value) => {
    setValueValidPass(value);
    if (value !== valuePass) setValidPassword('Las contraseñas deben coincidir');
    else setValidPassword('');
  }

  return (
    <section className="flex justify-center ... items-center ... h-dvh">
    
    <Card className="max-w-[900px] w-3/12">
      {sending ? (
        <Progress
        size="sm"
        isIndeterminate
        aria-label="Loading..."
        className="w-full"
      />   
      ): null}  
      <CardHeader className="flex gap-3">
        <Image
          alt="nextui logo"
          height={40}
          radius="sm"
          src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          width={40}
        />
        <div className="flex flex-col">
          <p className="text-md">Crear Compañia</p>
          <p className="text-small text-default-500">Esteban Y Parra</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <form onSubmit={async (e) => {
          e.preventDefault();

          const data = {
            name : e.target.elements.name.value,
            email : e.target.elements.email.value,
            password: e.target.elements.password.value,
            validPassword : e.target.elements.validPassword.value,
            plan : 'test 30 days',
            type : 'Company'
          };

          setSending(true);
          const response = await axios.post("/api/signup", data);

          if (response.status == 200){
            if (response.data.success){

              const response = await signIn('credentials', {
                email : data.email,
                password: data.password,
                redirect : true
              });

            }else{
              if (response.data.message == "user already exist") {
                alert('User already exist');
                setSending(false);
              }else{
                console.error('Corrupted data');
              }
            }
          }
        }}>
          <Input
            isRequired
            type="text"
            name="name"
            isDisabled={sending}
            label="Nombre Compañia"
            className="w-full mb-5"
          />
          <Input
            isRequired
            type="email"
            name="email"
            isDisabled={sending}
            label="Correo electronico"
            className="w-full mb-5"
          />
          <Input
            isRequired
            type="password"
            name="password"
            isDisabled={sending}
            onChange={(e) => verifyPass(e.target.value)}
            errorMessage={password != '' ? password : null}
            isInvalid={password !== '' ? true : false}
            label="Contaseña"
            className="w-full mb-5"
          />
           <Input
            isRequired
            type="password"
            name="validPassword"
            isDisabled={sending}
            label="Validar Contraseña"
            onChange={(e) => verifyTwoPass(e.target.value)}
            errorMessage={validPassword !== "" ? validPassword : null}
            isInvalid={validPassword !== "" ? true : false}
            className="w-full mb-5"
          />
          <Button color="primary" type="submit" isDisabled={sending}>
            Guardar
          </Button>
        </form>
      </CardBody>
      <Divider />
      <CardFooter>
          @powered by projecters
      </CardFooter>
    </Card>
  </section>
  )
}