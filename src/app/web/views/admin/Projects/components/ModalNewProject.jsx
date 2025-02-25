import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import { Formik, Form, Field } from "formik";
import CustomInput from "../../allCompanies/components/CustomInput";
import CustomDropdown from "../../allCompanies/components/CustomDrowpdown";
import { createNewProject } from "../actions/createNewProject";


export const PLANS = [
    { key: 'static', value: 'static' },
    { key: 'basic', value: 'basic' },
    { key: 'medium', value: 'medium' },
    { key: 'pro', value: 'pro' },
    { key: 'pro', value: 'enterprise' }
]

const ModalNewProject = ({ isOpenNewProject, onOpenChangeNewProject }) => {
    return (
        <Modal
            backdrop={"blur"}
            placement="center"
            size="2xl"
            isDismissable={false}
            isOpen={isOpenNewProject}
            onClose={onOpenChangeNewProject}
            className="bg-[#0000003b]"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <h2 className="text-3xl font-bold text-white">Crear nuevo proyecto</h2>
                        </ModalHeader>
                        <ModalBody>
                            <Formik
                                initialValues={{
                                    name: "",
                                    description: "",
                                    department: "",
                                    city: "",
                                    address: "",
                                    plan: ""
                                }}
                                onSubmit={async (values) => {

                                    const response = await createNewProject(values);
                                    console.log(response)

                                }}
                            >
                                {({ isSubmitting, handleSubmit }) => (
                                    <Form>
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
                                                        size="sm"
                                                    />
                                                    <div className="mb-[15px] mt-[5px]">
                                                        <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </Field>
                                        <Field name="description" className="w-full">
                                            {({ field, meta }) => (
                                                <div>
                                                    <CustomInput
                                                        {...field}
                                                        type="text"
                                                        isRequired
                                                        bordered
                                                        variant="bordered"
                                                        placeholder="Ingrese una descripcion"
                                                        fullWidth
                                                        label="Descripcion"
                                                        size="sm"
                                                    />
                                                    <div className="mb-[15px] mt-[5px]">
                                                        <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </Field>
                                        <Field name="department" className="w-full">
                                            {({ field, meta }) => (
                                                <div>
                                                    <CustomInput
                                                        {...field}
                                                        type="text"
                                                        isRequired
                                                        bordered
                                                        variant="bordered"
                                                        placeholder="Ingrese un departamento"
                                                        fullWidth
                                                        label="Departamento"
                                                        size="sm"
                                                    />
                                                    <div className="mb-[15px] mt-[5px]">
                                                        <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </Field>
                                        <Field name="city" className="w-full">
                                            {({ field, meta }) => (
                                                <div>
                                                    <CustomInput
                                                        {...field}
                                                        type="text"
                                                        isRequired
                                                        bordered
                                                        variant="bordered"
                                                        placeholder="Ingrese la ciudadd"
                                                        fullWidth
                                                        label="Ciudad"
                                                        size="sm"
                                                    />
                                                    <div className="mb-[15px] mt-[5px]">
                                                        <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </Field>
                                        <Field name="address" className="w-full">
                                            {({ field, meta }) => (
                                                <div>
                                                    <CustomInput
                                                        {...field}
                                                        type="text"
                                                        isRequired
                                                        bordered
                                                        variant="bordered"
                                                        placeholder="Ingrese la direccion"
                                                        fullWidth
                                                        label="Direccion"
                                                        size="sm"
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
                                                        options={PLANS}
                                                        label="Planes"
                                                    />
                                                    <div className="mb-[15px] mt-[5px]">
                                                        <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </Field>
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
                                                type="submit"
                                                disabled={isSubmitting}
                                            >
                                                guardar
                                            </Button>
                                        </ModalFooter>
                                    </Form>
                                )}
                            </Formik>
                        </ModalBody>

                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default ModalNewProject;