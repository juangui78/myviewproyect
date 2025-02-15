"use client"
import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
import { Formik, Form, Field } from "formik";
import { Toaster, toast } from "sonner"

const ModalCreateCompany = ({ isOpenCompany, onOpenChangeCompany }) => {
    return (
        <Modal
            backdrop={"blur"}
            placement="center"
            isDismissable={false}
            isOpen={isOpenCompany}
            onClose={onOpenChangeCompany}
            className="bg-[#000000ab] shadow-white"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-white text-white">
                            <h1 className="font-bold text-xl">Crear nueva inmobiliaria</h1>
                            <p className="text-sm italic"></p>
                        </ModalHeader>
                        <ModalBody className="text-white">
                            <div className="flex gap-3 w-full justify-items-start">
                                <Formik
                                    onSubmit={async (values) => {
                                        console.log(values)
                                    }}
                                >
                                    {({ handleSubmit, isSubmitting }) => (
                                        <Form>
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
                                                            classNames={{
                                                                label: "text-white !important",
                                                                input: "text-black !important",
                                                                root: "text-black !important",
                                                                inputWrapper: [
                                                                    "bg-[#fff]",
                                                                    "backdrop-blur-xl",
                                                                    "backdrop-saturate-200",
                                                                    "hover:bg-default-200/70",
                                                                    "!cursor-text",
                                                                ],
                                                            }}
                                                            // className={`pr-4 pl-4  ${meta.error ? styleLogin.errorInputColor : styleLogin.colorWhite} `}
                                                            clearable
                                                        />
                                                        <div className="mb-[15px] ml-[4px] pr-4 pl-4 ">
                                                            {/* <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p> */}
                                                        </div>
                                                    </>
                                                )}
                                            </Field>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                className="text-white cursor-pointer"
                                variant="light"
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="cursor-pointer "
                                color="primary"
                            >
                                Guardar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
            <Toaster richColors position="top-right" />
        </Modal>
    )
}

export default ModalCreateCompany