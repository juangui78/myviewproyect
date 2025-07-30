import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, DatePicker, Textarea } from "@nextui-org/react";
import { Formik, Form, Field} from "formik";
import CustomInput from "../../allCompanies/components/CustomInput";
import Dropzone from "react-dropzone";
import { validationSchemaNewProject } from "../js/SchemaFormNewProyect";
import { createNewProject } from "../actions/createNewProject";
import { toast } from "sonner";
import moment from "moment";

export const validTypesOFFiles = ["png", "jpg", "jpeg", "webp", "avif", "bmp", "gif"];

const ModalNewProject = ({ isOpenNewProject, onOpenChangeNewProject }) => {

    const [imgOfProject, setImgOfProject] = useState([]);
    const [isValidImg, setIsValidImg] = useState(false);
    const [dateInit, setDateInit] = useState(null);

    useEffect(() => {

        if (isOpenNewProject){
            setImgOfProject([]);
            setIsValidImg(false);
            setDateInit(null);
        }

    }, [isOpenNewProject]);


    const verifyFile = (file) => {
        const typeFile = file[0].name.split('.').pop()

        if (!validTypesOFFiles.includes(typeFile)) {
            setIsValidImg(false);
            setImgOfProject([]);
            return
        }

        setIsValidImg(true);
        setImgOfProject(file);
    }

    return (
        <Modal
            backdrop={"blur"}
            placement="center"
            size="xl"
            isDismissable={false}
            isOpen={isOpenNewProject}
            onClose={onOpenChangeNewProject}
            scrollBehavior="inside"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <h2 className="text-3xl font-bold text-black">Crear nuevo proyecto</h2>
                        </ModalHeader>
                        <ModalBody>
                            <Formik
                                initialValues={{
                                    name: "",
                                    description: "",
                                    department: "",
                                    city: "",
                                    address: "",
                                    areaOfThisproyect: 0.0,
                                    dateInit: "",
                                    notes: "",
                                    linkWeb: ""
                                }}
                                validationSchema={validationSchemaNewProject}
                                enableReinitialize={true}
                                onSubmit={async (values) => {

                                    //validate img
                                    if (imgOfProject.length === 0 && !isValidImg){
                                        toast.error("Debe cargar una imagen válida");
                                        return
                                    }

                                    if (dateInit === null) {
                                        toast.error("Debe seleccionar una fecha de inicio del proyecto");
                                        return
                                    }

                                    const formData = new FormData();
                                    for (const i in values) if (i !== "dateInit") formData.append(i, values[i]);

                                    const { day, month, year} = dateInit
                                    const date = moment(`${year}-${month}-${day}`, "YYYY-MM-DD").format("YYYY-MM-DD");
                                    const sumSixMonths = moment(date).add(6, 'months').format("YYYY-MM-DD");

                                    formData.append("urlImage", imgOfProject[0]);
                                    formData.append("dateInit", date);
                                    formData.append("dateFinish", sumSixMonths);
                       
                                    console.log(formData)

                                    const response = await createNewProject(formData);


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
                                        <Field name="areaOfThisproyect" className="w-full">
                                            {({ field, meta }) => (
                                                <div>
                                                    <CustomInput
                                                        {...field}
                                                        type="number"
                                                        isRequired
                                                        bordered
                                                        variant="bordered"
                                                        placeholder="Ingrese el área del proyecto"
                                                        min={0}
                                                        step={1}
                                                        max={1000000}
                                                        fullWidth
                                                        label="Área del proyecto (m2)"
                                                        size="sm"
                                                    />
                                                    <div className="mb-[15px] mt-[5px]">
                                                        <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </Field>
                                        <Field name="dateInit" className="w-full">
                                            {({ field, meta }) => (
                                                <div>
                                                    <DatePicker isRequired className="w-full" label="Fecha de inicio del proyecto" onChange={(value) => setDateInit(value)} />
                                                    <div className="mb-[15px] mt-[5px]">
                                                        <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </Field>   
                                        <Field name="linkWeb" className="w-full">
                                            {({ field, meta }) => (
                                                <div>
                                                    <CustomInput
                                                        {...field}
                                                        type="text"
                                                        bordered
                                                        variant="bordered"
                                                        placeholder="Ingrese la url"
                                                        fullWidth
                                                        label="Link web proyecto o inmobiliaria"
                                                        size="sm"
                                                    />
                                                    <div className="mb-[15px] mt-[5px]">
                                                        <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </Field>
                                      
                                        <Field name="notes" className="w-full">
                                            {({ field, meta }) => (
                                                <div>
                                                    <Textarea
                                                        classNames={{
                                                            label: "text-black",
                                                            input: "text-black",
                                                            root: "text-black",
                                                            inputWrapper: [
                                                                "shadow-xl",
                                                                "bg-gray-200",
                                                                "backdrop-saturate-200",
                                                                "hover:bg-default-100/70",
                                                                "!cursor-text",
                                                            ],
                                                        }}
                                                        label="Notas"
                                                        labelPlacement="inside"
                                                        placeholder="Ingrese notas adicionales"
                                                    />
                                                    <div className="mb-[15px] mt-[5px]">
                                                        <p className="h-[1rem] text-sm  text-[#FD6358]">{meta.error ? (meta.error + "*") : ""}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </Field>
                                        <Dropzone onDrop={acceptedFiles => verifyFile(acceptedFiles)}>
                                            {({ getRootProps, getInputProps }) => (
                                                <section
                                                    className={
                                                        `border-2 border-gray-300 rounded-lg p-2 text-center 
                                                        ${imgOfProject.length > 0 ? "bg-[#00C662]" : (isValidImg ? "bg-[#fff]" : "bg-red-500")}`
                                                    }>
                                                    <div {...getRootProps()} className="cursor-pointer border-dashed border-2 border-gray-300 rounded-lg p-8 text-center">
                                                        <input {...getInputProps()} />
                                                        {imgOfProject.length > 0 ? (
                                                            <p>Imagen Cargada</p>
                                                        ) : (
                                                            <p>{isValidImg ? "Arrastre o seleccione la imagen" : "Tipo de archivo invalido, deben ser (.png)"}</p>
                                                        )}
                                                    </div>
                                                </section>
                                            )}
                                        </Dropzone>

                                        <ModalFooter>
                                            <Button
                                                className="text-white cursor-pointer"
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
                                                Añadir Proyecto
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