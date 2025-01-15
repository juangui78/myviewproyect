"use client"
import React, { useState } from "react";
import {Card,CardHeader,CardBody, CardFooter,Divider,Image,Input,Button, Link} from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { validationSchemaLogin } from "./js/validationSchema";
import { Formik, Form, Field } from "formik";


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
            src="/logos/isotipo-full-color.png"
            width={40}
          />
          <div className="flex flex-col">
            <p className="text-md">Modelos y Asociados</p>
            <p className="text-small text-default-500">Esteban Y Parra</p>
          </div>
        </CardHeader>
        <Divider />
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
            {({ handleSubmit, errors, touched }) => (
              <Form onSubmit={handleSubmit}>
                <Field name="email">
                  {({ field, form, meta }) => (
                     <>
                      <Input
                        {...field}
                        type="email"
                        isRequired
                        bordered
                        fullWidth
                        label="Correo electrónico"
                        color={meta.touched && meta.error ? 'error' : 'default'}
                        className={meta.touched && meta.error ? 'input-error' : ''}
                        clearable
                      />
                      {meta.error && (
                        <p color="error">{meta.error}</p> 
                      )}
                    </>
                  )}
                </Field>
                <Field name="password">
                  {({ field, form, meta }) => (
                     <>
                      <Input
                        {...field}
                        type="password"
                        isRequired
                        bordered
                        fullWidth
                        label="Contraseña"
                        color={meta.touched && meta.error ? 'error' : 'default'}
                        className={meta.touched && meta.error ? 'input-error' : ''}
                        clearable
                      />
                      {meta.error && (
                        <p color="error">{meta.error}</p> 
                      )}
                    </>
                  )}
                </Field>
                <Button color="primary" type="submit">
                  Iniciar Sesión
                </Button>
              </Form>
            )}
          </Formik>
        </CardBody>
        <Divider />
        <CardFooter>
            <Link href={'./signup'}>Crear cuenta</Link>
        </CardFooter>
      </Card>
    </section>
  );
}
