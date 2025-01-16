"use client"
import React, { useState } from "react";
import {Card,CardHeader,CardBody, CardFooter,Divider,Image,Input,Button, Link} from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { validationSchemaLogin } from "./js/validationSchema";
import { Formik, Form, Field } from "formik";
import styleLogin from './styles/login.module.css'


export default function Login() {
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();

  return (
    <section className="flex flex-row flex-wrap max-[876px]:flex-col">
      <section className={`flex flex-row  justify-center  items-center grow w-2/5 ... max-[876px]:hidden bg-[#030D1C]`}>
        <div>
          <Image
            alt="my view_"
            src="/logos/completo-fullblanco.png"
          />
              <p className="text-[#fff] absolute z-10 mt-[-520px] ml-[142px] text-2xl italic">Redefinimos La Perspectiva</p>
        </div>
      </section>
      <section className={`flex justify-center ... items-center ... h-dvh  grow w-2/5 ... max-[876px]:w-full`} >
        <Card className="max-w-[400px] w-full drop-shadow-2xl ...">
          <CardHeader className="flex gap-3 flex-col mt-[35px]">
            <div className="flex flex-col">
              <h1 className="text-2xl">Iniciar Sesión</h1>
            </div>
          </CardHeader>
          <CardBody>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchemaLogin}
              onSubmit={ async (values) => {

                const { email, password } = values

                const response = await signIn('credentials', {
                  email : email,
                  password: password,
                  redirect : false
                })

                if (!response.ok) { // if there is an error
                  alert('incorrect password or email')
                  return
                }

                return router.push('/web/views/feed')
              }}
            >
            {({ handleSubmit, isSubmitting}) => (
              <Form onSubmit={handleSubmit} className="flex flex-col ">
                <Field name="email">
                  {({ field, form, meta }) => (
                     <>
                      <Input
                        {...field}
                        type="email"
                        label="Email"
                        labelPlacement="outside"
                        variant="bordered"
                        placeholder="Ingrese su correo electrónico"
                        isRequired
                        fullWidth
                        clearable
                        className={`pr-4 pl-4  ${meta.error ? styleLogin.errorInputColor : "" } `} 
                      />
                      <div className="mb-[10px] ml-[4px] pr-4 pl-4 ">
                          <p className="h-[1rem] text-sm text-[#DA1001]">{ meta.error ? (meta.error + "*") : "" }</p>
                      </div>
                    </>
                  )}
                </Field>
                <Field name="password" >
                  {({ field, form, meta }) => (
                     <>
                      <Input
                        {...field}
                        type="password"
                        isRequired
                        bordered
                        labelPlacement="outside"
                        variant="bordered"
                        placeholder="Ingrese su contraseña"
                        fullWidth
                        label="Contraseña"
                        className={`pr-4 pl-4  ${meta.error ? styleLogin.errorInputColor : "" } `} 
                        clearable
                      />
                     <div className="mb-[15px] ml-[4px] pr-4 pl-4 ">
                          <p className="h-[1rem] text-sm  text-[#DA1001]">{ meta.error ? (meta.error + "*") : "" }</p>
                      </div>
                    </>
                  )}
                </Field>
                <Button 
                  className="m-auto w-3/6 bg-[#030D1C] mb-[40px]" 
                  color="primary" 
                  type="submit"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting ? 'Verificando...' : 'Entrar'}
                </Button>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </section>
    </section>
    
  );
}
