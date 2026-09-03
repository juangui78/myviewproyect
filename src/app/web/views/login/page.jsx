"use client"
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Input, Button } from "@nextui-org/react";
import NextImage from "next/image";
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
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = "MyView | Iniciar Sesión";
  }, []);

  return (
    <div className="bg-[#02121B] bg-[url(/images/op11.webp)] bg-no-repeat bg-cover min-h-screen text-foreground relative flex flex-col justify-between items-center overflow-hidden">
      <div className="w-full flex-1 flex items-center justify-center py-10 px-4">
        <Card className="max-w-[420px] w-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-2 md:p-4">
          <CardHeader className="flex gap-3 flex-col mt-[5px]">
            <div className="grid place-items-center mb-[-10px]">
              <Link href="/">
                <NextImage
                  alt="logo"
                  src="/logos/completo-fullblanco.png"
                  width={220}
                  height={80}
                  priority
                  className="w-[220px] h-[80px] object-contain cursor-pointer"
                />
              </Link>
              <h1 className="text-2xl text-white font-semibold mt-[-10px]">Iniciar Sesión</h1>
            </div>
            <div className="w-full pr-[1rem] pl-[1rem] mt-2">
              {error ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    scale: { type: "spring", visualDuration: 0.3, bounce: 0.4 },
                  }}>
                  <div className="flex justify-center items-center text-[#FD6358] w-full border border-[#FD6358]/50 bg-[#FD6358]/10 p-[0.7rem] rounded-xl">
                    <AlertCircleOutline /> 
                    <span className="text-sm ml-[5px] text-[#FD6358]">Correo y/o contraseña incorrecta</span>
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
                setError(false);

                const { email, password } = values;

                let response = await signIn('credentials', {
                  email : email,
                  password: password,
                  redirect : false
                });

                // Auto-retry once on failure (handles database cold start timeouts)
                if (!response || !response.ok) {
                  console.warn("Intento de login fallido/timed out por posible cold start. Reintentando...");
                  await new Promise(resolve => setTimeout(resolve, 800));
                  response = await signIn('credentials', {
                    email : email,
                    password: password,
                    redirect : false
                  });
                }

                if (!response || !response.ok) { // if response is not ok
                  setError(true);
                  return;
                }

                router.push('/web/views/user/feed');
                router.refresh();
              }}
            >
            {({ handleSubmit, isSubmitting}) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="flex flex-col">
                <Field name="email">
                  {({ field, meta }) => (
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
                        classNames={{
                          label: "text-white !important",
                          input: "text-white !important",
                          innerWrapper: "bg-transparent",
                          inputWrapper: [
                            "bg-black/40",
                            "backdrop-blur-md",
                            "border-white/20",
                            "group-data-[hover=true]:bg-black/60",
                            "group-data-[focus=true]:bg-black/60",
                            "!cursor-text",
                          ],
                        }}
                        className={`pr-4 pl-4 ${meta.error ? styleLogin.errorInputColor : styleLogin.colorWhite }`} 
                      />
                      <div className="mb-[10px] ml-[4px] pr-4 pl-4">
                          <p className="h-[1rem] text-sm text-[#FD6358]">{ meta.error ? (meta.error + "*") : "" }</p>
                      </div>
                    </>
                  )}
                </Field>
                <Field name="password">
                  {({ field, meta }) => (
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
                        classNames={{
                          label: "text-white !important",
                          input: "text-white !important",
                          innerWrapper: "bg-transparent",
                          inputWrapper: [
                            "bg-black/40",
                            "backdrop-blur-md",
                            "border-white/20",
                            "group-data-[hover=true]:bg-black/60",
                            "group-data-[focus=true]:bg-black/60",
                            "!cursor-text",
                          ],
                        }}
                        className={`pr-4 pl-4 ${meta.error ? styleLogin.errorInputColor : styleLogin.colorWhite }`} 
                        clearable
                      />
                     <div className="mb-[15px] ml-[4px] pr-4 pl-4">
                          <p className="h-[1rem] text-sm text-[#FD6358]">{ meta.error ? (meta.error + "*") : "" }</p>
                      </div>
                    </>
                  )}
                </Field>
                <Button 
                  className="m-auto w-3/6 bg-[#0CDBFF] mb-[40px] mt-[30px] color-black font-bold" 
                  type="submit"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting ? 'Verificando...' : 'Entrar'}
                </Button>
              </form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </div>
    <div className="w-full py-4 text-center text-xs text-gray-400 border-t border-white/5 bg-black/20 backdrop-blur-md flex justify-center items-center gap-4">
      <Link href="/web/views/signup" className="hover:text-primary transition-colors">Ayuda</Link>
      <span>|</span>
      <Link href="/web/views/signup" className="hover:text-primary transition-colors">Términos y condiciones</Link>
    </div>
  </div>
  );
}
