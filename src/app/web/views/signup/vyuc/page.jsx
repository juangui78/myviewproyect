"use client"
import React, { useState } from "react";
import {Card,CardHeader,CardBody,CardFooter,Divider,Image, Input, Button,  DateInput, Progress, Modal, ModalContent, ModalHeader, ModalBody} from "@nextui-org/react";
import {CalendarDate} from "@internationalized/date";
import axios from "axios";

export default function VerifyCreate() {

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
          <p className="text-md">Crear cuenta</p>
          <p className="text-small text-default-500">Esteban Y Parra</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <form onSubmit={async (e) => {
          e.preventDefault();

          const data = {
            name : e.target.elements.name.value,
            lastName : e.target.elements.lastName.value,
            age : e.target.elements.age.value,
            email : e.target.elements.email.value,
            password: e.target.elements.password.value,
            validPassword : e.target.elements.validPassword.value
          };

          setSending(true);
          const response = await axios.post("/api/signup", data);

          if (response.status == 200){
            if (response.data.success){
              setCreated(true);
            }else{
              if (response.data.message == "user already exist") {
                alert('User already exist');
                setCreated(false);
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
            label="Nombre"
            className="w-full mb-5"
          />
          <Input
            isRequired
            type="text"
            name="lastName"
            isDisabled={sending}
            label="Apellidos"
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
          <DateInput name="age" 
           isDisabled={sending}
           isRequired
            label={"Año de nacimineto"}
            placeholderValue={new CalendarDate(1995, 11, 6)} 
            className="w-full mb-5" />
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
      <Modal 
        isOpen={created} 
        placement={"top"}
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-500 to-zinc-500/10 backdrop-opacity-20"
        }}
      >
        <ModalContent>
        <Progress
          size="sm"
          isIndeterminate
          aria-label="Loading..."
          className="w-full"
        />  
          <ModalHeader className="flex flex-col gap-1 text-center text-lg">Usuario Creado con exito</ModalHeader>
          <ModalBody>
            <p> 
            {folders ? "Iniciando sesion" : "Creando folders"}
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
  </section>
  )
}