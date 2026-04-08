"use client"
import React, {  useEffect, useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"
import { Formik, Form, Field } from "formik";
import { Toaster, toast } from "sonner"
import CustomInput from "./CustomInput";
import CustomDropdown from "./CustomDrowpdown";
import { validationSchemaInmo } from "../js/validationSchemaInmo";
import { OPTIONSGEOGRAPHICSCOPE, OPTIONSPROPERTYTYPE, OPTIONSMARKERTAPPROACH, OPTIONSOFPLANS } from "../js/infoDropdowns";
import { getDataToEditInmo, updateCompany } from "../actions/InmoActions";


const ModalEditCompany = ({ isOpenEditCompany, onOpenChangeEditCompany,_idInmo, refreshRow}) => {

    const [loading, setLoading] = useState(false)
    const [info, setInfo] = useState({
        name: '',
        department: '',
        city: '',
        address: '',
        cell: '',
        email: '',
        geographicScope: '',
        propertyType: '',
        marketApproach: '',
        plan: ''
    })

    useEffect(() => {

        const getData = async () => {
            try {
                const response = await getDataToEditInmo(_idInmo)

                if (response.status !== 200) {
                    toast.error(response.message)
                    return
                }

                const { data } = response;
                setInfo(data)
                setLoading(true)

            }catch (error) {
                toast.error("Error al obtener los datos de la inmobiliaria")
                console.log(error)
            } finally{
                setLoading(false)
            }
        }

        if (isOpenEditCompany) getData();

    }, [isOpenEditCompany, _idInmo])

    return (
        <Modal
            backdrop={"opaque"}
            placement="center"
            size="xl"
            isDismissable={false}
            isOpen={isOpenEditCompany}
            onClose={onOpenChangeEditCompany}
            scrollBehavior="inside"
      
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-white">
                            <h1 className="font-bold text-xl">Editar inmobiliaria</h1>
                            <p className="text-sm italic"></p>
                        </ModalHeader>
                        <ModalBody className="text-white">
                            <div className="flex gap-3 w-full justify-items-start">
                                <Formik
                                    initialValues={{
                                        name: info.name,
                                        department: info.department,
                                        city: info.city,
                                        address: info.address,
                                        cell: info.cell,
                                        email: info.email,
                                        geographicScope: info.geographicScope,
                                        propertyType: info.propertyType,
                                        marketApproach: info.marketApproach,
                                        plan: info.typeOfPlan
                                    }}
                                    validationSchema={validationSchemaInmo}
                                    enableReinitialize={true}
                                    onSubmit={async (values) => {

                                        try{
                                            const response = await updateCompany(values, _idInmo)

                                            if (response.status !== 200) {
                                                toast.error(response.message)
                                                return
                                            }

                                            toast.success("Inmobiliaria actualizada correctamente")
                                            refreshRow(values, _idInmo)

                                        }catch(error){
                                            console.error(error)
                                            toast.error("Error al actualizar la inmobiliaria")
                                        } finally {
                                            setTimeout(() => {
                                                onClose();
                                            }, 100)
                                        }
                                    }}
                                >
                                    {({ handleSubmit, isSubmitting }) => (
                                        <Form onSubmit={handleSubmit} className="w-full">
                                            <div className="grid grid-cols-1 mb-[15px]">
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
                                            <div className="grid  mb-[15px]">
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
                                            <div className="grid  mb-[15px]">
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
                                                <Field name="plan">
                                                    {({ field, form, meta }) => (
                                                        <div>
                                                            <CustomDropdown
                                                                field={field}
                                                                form={form}
                                                                options={OPTIONSOFPLANS}
                                                                label="Plan"
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

export default ModalEditCompany;