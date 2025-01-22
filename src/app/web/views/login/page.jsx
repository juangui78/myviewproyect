"use client"
import React, { useEffect, useState } from "react";
import { Card,CardHeader,CardBody,Image,Input,Button } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { validationSchemaLogin } from "./js/validationSchema";
import { Formik, Form, Field } from "formik";
import styleLogin from './styles/login.module.css'
import { motion } from "framer-motion";
import { AlertCircleOutline } from "@/web/global_components/icons/AlertCircleOutline";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState(false)

  useEffect(() => {
    document.title = "MyView | Iniciar Sesión"
  }, [])

  return (
    <>
    <section className="flex flex-row flex-wrap max-[876px]:flex-col">
      <section className={`flex flex-row  justify-center  items-center grow w-2/5 ... max-[876px]:hidden bg-[#030D1C] ${styleLogin.backgrodunSection}  `}>
        <div>
          <Image
            alt="my view_"
            src="/logos/completo-fullblanco.png"
            className="w-[600px] h-auto"
          />
              {/* <p className="text-[#fff] absolute z-10 mt-[-520px] ml-[142px] text-2xl italic">Redefinimos La Perspectiva</p> */}
        </div>
      </section>
      <section className={`flex justify-center ... items-center ... h-dvh  grow w-2/5 ... max-[876px]:w-full max-[876px]:bg-[#030D1C]`} >
        <Card className="max-w-[400px] w-full drop-shadow-2xl ...">
          <CardHeader className="flex gap-3 flex-col mt-[5px]">
            <div className="grid place-items-center">
            <Image
                alt="logo"
                src="/logos/isotipo-full-color.png"
                className="w-[100px] h-[100px] align-center justify-center"
              />
              <h1 className="text-2xl">Iniciar Sesión</h1>
            </div>
            <div className="w-full pr-[1rem] pl-[1rem] ">
              {error ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                  }}>
                  <div className="flex justify-center items-center text-[#DA1001]  w-full border-solid border-2 border-[#DA1001]  p-[0.7rem] rounded-lg">
                    <AlertCircleOutline /> 
                    <span className=" text-base ml-[5px]">Correo y/o contraseña incorrecta</span>
                  </div>
                </motion.div>
              ) : null}
            </div>
          </CardHeader>
          <CardBody>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchemaLogin}
              onSubmit={ async (values) => {

                setError(false)

                const { email, password } = values

                const response = await signIn('credentials', {
                  email : email,
                  password: password,
                  redirect : false
                })

                if (!response.ok) { // if response is not ok
                  setError(true)
                  return
                }

                return router.push('/web/views/feed') // go to feed page
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
        {/* <CardFooter>
            <Link href="/web/views/register" className="text-center text-[#030D1C]">¿No tienes una cuenta? Regístrate</Link>
        </CardFooter> */}
      </Card>
      <div className="flex absolute right-5 bottom-0">
        <Link href="/web/views/register" className="text-center text-[#030D1C] mr-[5px]"> Ayuda </Link>
        <Link href="/web/views/register" className="text-center text-[#030D1C]"> | Terminos y condiciones</Link>
      </div>
    </section>
    </section>  
    </>
  );
}
