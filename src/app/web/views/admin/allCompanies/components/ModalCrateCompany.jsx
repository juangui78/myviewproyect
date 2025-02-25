"use client"
import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"
import { Formik, Form, Field } from "formik";
import { Toaster, toast } from "sonner"
import CustomInput from "./CustomInput";
import CustomDropdown from "./CustomDrowpdown";
import { validationSchemaInmo } from "../js/validationSchemaInmo";
import { saveCompany } from "../actions/saveCompany";

export const OPTIONSGEOGRAPHICSCOPE = [
    { key: 'local', value: 'local' },
    { key: 'regional', value: 'regional' },
    { key: 'nacional', value: 'nacional' },
    { key: 'internacional', value: 'internacional' }
]

export const OPTIONSPROPERTYTYPE = [
    { key: 'residenciales', value: 'residenciales' },
    { key: 'comerciales', value: 'comerciales' },
    { key: 'industriales', value: 'industriales' },
    { key: 'rústicas o rurales', value: 'rústicas o rurales' },
    { key: 'de lujo', value: 'de lujo' },
    { key: 'otros', value: 'otros' }
]

export const OPTIONSMARKERTAPPROACH = [
    { key: 'residencial', value: 'residencial' },
    { key: 'comercial', value: 'comercial' },
    { key: 'inversiones', value: 'inversiones' },
    { key: 'gestion de patrimonio', value: 'gestion de patrimonio' },
    { key: 'otros', value: 'otros' }
]


const ModalCreateCompany = ({ isOpenCompany, onOpenChangeCompany, addNewRecord }) => {


    return (
        <Modal
            backdrop={"blur"}
            placement="center"
            size="4xl"
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
                                    initialValues={{
                                        name: '',
                                        department: '',
                                        city: '',
                                        address: '',
                                        cell: '',
                                        email: '',
                                        geographicScope: '',
                                        propertyType: '',
                                        marketApproach: ''
                                    }}
                                    validationSchema={validationSchemaInmo}
                                    onSubmit={async (values) => {
                                        const response = await saveCompany(values)

                                        if (!response.status) {
                                           toast.error(response.message)
                                           return
                                        }

                                        toast.success(response.message)
                                        addNewRecord(response.data)
                                        onClose()
                                    }}
                                >
                                    {({ handleSubmit, isSubmitting }) => (
                                        <Form onSubmit={handleSubmit} className="w-full">
                                            <div className="grid grid-cols-3 gap-4 mb-[15px]">
                                                <Field name="name" className="w-full">
                                                    {({ field, meta }) => (
                                                        <div>
                                                            <CustomInput
                                                                {...field}
                                                                type="text"
                                                                isRequired
                                                                bordered
                                                                variant="bordered"
                                                                placeholder="Ingrese el nombre"
                                                                fullWidth
                                                                label="Nombre"
                                                            />
                                                            <div className="mb-[15px] mt-[5px]">
                                                                <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Field>
                                                <Field name="department" >
                                                    {({ field, meta }) => (
                                                        <div>
                                                            <CustomInput
                                                                {...field}
                                                                type="text"
                                                                isRequired
                                                                bordered
                                                                variant="bordered"
                                                                placeholder="Ingrese el departamento"
                                                                fullWidth
                                                                label="Departamento"
                                                            />
                                                            <div className="mb-[15px] mt-[5px]">
                                                                <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Field>
                                                <Field name="city">
                                                    {({ field, meta }) => (
                                                        <div>
                                                            <CustomInput
                                                                {...field}
                                                                type="text"
                                                                isRequired
                                                                bordered
                                                                variant="bordered"
                                                                placeholder="Ingrese la ciudad"
                                                                fullWidth
                                                                label="Ciudad"
                                                            />
                                                            <div className="mb-[15px] mt-[5px]">
                                                                <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Field>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 mb-[15px]">
                                                <Field name="address">
                                                    {({ field, meta }) => (
                                                        <div>
                                                            <CustomInput
                                                                {...field}
                                                                type="text"
                                                                isRequired
                                                                bordered
                                                                variant="bordered"
                                                                placeholder="Ingrese la dirección"
                                                                fullWidth
                                                                label="Dirección"
                                                            />
                                                            <div className="mb-[15px] mt-[5px]">
                                                                <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Field>
                                                <Field name="cell">
                                                    {({ field, meta }) => (
                                                        <div>
                                                            <CustomInput
                                                                {...field}
                                                                type="text"
                                                                isRequired
                                                                bordered
                                                                variant="bordered"
                                                                placeholder="Ingrese el telefono"
                                                                fullWidth
                                                                label="Telefono"
                                                            />
                                                            <div className="mb-[15px] mt-[5px]">
                                                                <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Field>
                                                <Field name="email">
                                                    {({ field, meta }) => (
                                                        <div>
                                                            <CustomInput
                                                                {...field}
                                                                type="email"
                                                                isRequired
                                                                bordered
                                                                variant="bordered"
                                                                placeholder="Ingrese el correo electrónico"
                                                                fullWidth
                                                                label="Correo electrónico"
                                                            />
                                                            <div className="mb-[15px] mt-[5px]">
                                                                <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Field>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 mb-[15px]">
                                                <Field name="geographicScope">
                                                    {({ field, form, meta }) => (
                                                        <div>
                                                            <CustomDropdown
                                                                field={field}
                                                                form={form}
                                                                options={OPTIONSGEOGRAPHICSCOPE}
                                                                label="Alcance geográfico"
                                                            />
                                                            <div className="mb-[15px] mt-[5px]">
                                                                <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Field>
                                                <Field name="propertyType">
                                                    {({ field, form, meta }) => (
                                                        <div>
                                                            <CustomDropdown
                                                                field={field}
                                                                form={form}
                                                                options={OPTIONSPROPERTYTYPE}
                                                                label="Tipo de propiedades"
                                                            />
                                                            <div className="mb-[15px] mt-[5px]">
                                                                <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Field>
                                                <Field name="marketApproach">
                                                    {({ field, form, meta }) => (
                                                        <div>
                                                            <CustomDropdown
                                                                field={field}
                                                                form={form}
                                                                options={OPTIONSMARKERTAPPROACH}
                                                                label="Enfoque de mercado"
                                                            />
                                                            <div className="mb-[15px] mt-[5px]">
                                                                <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Field>
                                            </div>
                                            <ModalFooter>
                                                <Button
                                                    className="text-white cursor-pointer"
                                                    variant="light"
                                                    onClick={onClose}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    disabled={isSubmitting}
                                                    className="cursor-pointer "
                                                    color="primary"
                                                    type="submit"
                                                >
                                                    {isSubmitting ? "Guardando..." : "Guardar"}
                                                </Button>
                                            </ModalFooter>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </ModalBody>

                    </>
                )}
            </ModalContent>
            <Toaster richColors position="top-right" />
        </Modal>
    )
}

export default ModalCreateCompany