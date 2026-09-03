"use client"
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  DatePicker,
  Textarea,
} from "@nextui-org/react";
import { Formik, Form, Field } from "formik";
import Dropzone from "react-dropzone";
import { validationSchemaNewProject } from "../js/SchemaFormNewProyect";
import { createNewProject } from "../actions/createNewProject";
import { toast } from "sonner";
import moment from "moment";

export const validTypesOFFiles = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "avif",
  "bmp",
  "gif",
];

const ModalNewProject = ({
  isOpenNewProject,
  onOpenChangeNewProject,
  idCompany,
}) => {
  const [imgOfProject, setImgOfProject] = useState([]);
  const [isValidImg, setIsValidImg] = useState(null); // null = not attempted, true = valid, false = invalid
  const [dateInit, setDateInit] = useState(null);

  useEffect(() => {
    if (isOpenNewProject) {
      setImgOfProject([]);
      setIsValidImg(null);
      setDateInit(null);
    }
  }, [isOpenNewProject]);

  const verifyFile = (file) => {
    if (!file || file.length === 0) return;
    const typeFile = file[0].name.split(".").pop().toLowerCase();

    if (!validTypesOFFiles.includes(typeFile)) {
      setIsValidImg(false);
      setImgOfProject([]);
      return;
    }

    setIsValidImg(true);
    setImgOfProject(file);
  };

  const inputClassNames = {
    label: "text-white/70 font-medium",
    input: "text-white placeholder:text-white/30",
    inputWrapper: [
      "border-white/20",
      "hover:border-white/40",
      "group-data-[focus=true]:border-[#0CDBFF]",
      "bg-transparent",
      "backdrop-blur-sm"
    ],
  };

  return (
    <Modal
      backdrop="blur"
      placement="center"
      size="xl"
      isDismissable={false}
      isOpen={isOpenNewProject}
      onClose={onOpenChangeNewProject}
      scrollBehavior="inside"
      classNames={{
        content: "bg-[#0B151F] border border-white/10 text-white max-w-xl rounded-2xl",
        header: "border-b border-white/10 py-5",
        footer: "border-t border-white/10 py-4"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Crear nuevo proyecto
              </h2>
            </ModalHeader>
            <ModalBody className="py-6">
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
                  linkWeb: "",
                }}
                validationSchema={validationSchemaNewProject}
                enableReinitialize={true}
                onSubmit={async (values) => {
                  //validate img
                  if (imgOfProject.length === 0) {
                    toast.error("Debe cargar una imagen de portada válida");
                    return;
                  }

                  if (dateInit === null) {
                    toast.error(
                      "Debe seleccionar una fecha de inicio del proyecto"
                    );
                    return;
                  }

                  const formData = new FormData();
                  for (const i in values) {
                    if (i !== "dateInit") {
                      formData.append(i, values[i]);
                    }
                  }

                  const { day, month, year } = dateInit;
                  const date = moment(
                    `${year}-${month}-${day}`,
                    "YYYY-MM-DD"
                  ).format("YYYY-MM-DD");
                  const sumSixMonths = moment(date)
                    .add(6, "months")
                    .format("YYYY-MM-DD");

                  formData.append("urlImage", imgOfProject[0]);
                  formData.append("dateInit", date);
                  formData.append("dateFinish", sumSixMonths);
                  formData.append("idCompany", idCompany);

                  const response = await createNewProject(formData);

                  if (response.status === 200) {
                    toast.success(response.message);
                    onClose();
                  } else {
                    toast.error(response.message);
                  }
                }}
              >
                {({ isSubmitting, handleSubmit }) => (
                  <Form className="flex flex-col gap-4">
                    
                    <Field name="name" className="w-full">
                      {({ field, meta }) => (
                        <div>
                          <Input
                            {...field}
                            type="text"
                            isRequired
                            variant="bordered"
                            placeholder="Ingrese el nombre"
                            label="Nombre"
                            labelPlacement="inside"
                            classNames={inputClassNames}
                          />
                          {meta.touched && meta.error && (
                            <p className="text-xs text-rose-500 mt-1 font-medium ml-1">
                              {meta.error} *
                            </p>
                          )}
                        </div>
                      )}
                    </Field>

                    <Field name="description" className="w-full">
                      {({ field, meta }) => (
                        <div>
                          <Input
                            {...field}
                            type="text"
                            isRequired
                            variant="bordered"
                            placeholder="Ingrese una descripción"
                            label="Descripción"
                            labelPlacement="inside"
                            classNames={inputClassNames}
                          />
                          {meta.touched && meta.error && (
                            <p className="text-xs text-rose-500 mt-1 font-medium ml-1">
                              {meta.error} *
                            </p>
                          )}
                        </div>
                      )}
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field name="department" className="w-full">
                        {({ field, meta }) => (
                          <div>
                            <Input
                              {...field}
                              type="text"
                              isRequired
                              variant="bordered"
                              placeholder="Ingrese un departamento"
                              label="Departamento"
                              labelPlacement="inside"
                              classNames={inputClassNames}
                            />
                            {meta.touched && meta.error && (
                              <p className="text-xs text-rose-500 mt-1 font-medium ml-1">
                                {meta.error} *
                              </p>
                            )}
                          </div>
                        )}
                      </Field>

                      <Field name="city" className="w-full">
                        {({ field, meta }) => (
                          <div>
                            <Input
                              {...field}
                              type="text"
                              isRequired
                              variant="bordered"
                              placeholder="Ingrese la ciudad"
                              label="Ciudad"
                              labelPlacement="inside"
                              classNames={inputClassNames}
                            />
                            {meta.touched && meta.error && (
                              <p className="text-xs text-rose-500 mt-1 font-medium ml-1">
                                {meta.error} *
                              </p>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>

                    <Field name="address" className="w-full">
                      {({ field, meta }) => (
                        <div>
                          <Input
                            {...field}
                            type="text"
                            isRequired
                            variant="bordered"
                            placeholder="Ingrese la dirección"
                            label="Dirección"
                            labelPlacement="inside"
                            classNames={inputClassNames}
                          />
                          {meta.touched && meta.error && (
                            <p className="text-xs text-rose-500 mt-1 font-medium ml-1">
                              {meta.error} *
                            </p>
                          )}
                        </div>
                      )}
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field name="areaOfThisproyect" className="w-full">
                        {({ field, meta }) => (
                          <div>
                            <Input
                              {...field}
                              type="number"
                              isRequired
                              variant="bordered"
                              placeholder="Ingrese el área del proyecto"
                              min={0}
                              step={1}
                              max={1000000}
                              label="Área del proyecto (m2)"
                              labelPlacement="inside"
                              classNames={inputClassNames}
                            />
                            {meta.touched && meta.error && (
                              <p className="text-xs text-rose-500 mt-1 font-medium ml-1">
                                {meta.error} *
                              </p>
                            )}
                          </div>
                        )}
                      </Field>

                      <Field name="dateInit" className="w-full">
                        {({ field, meta }) => (
                          <div>
                            <DatePicker
                              isRequired
                              className="w-full"
                              label="Fecha de inicio del proyecto"
                              variant="bordered"
                              onChange={(value) => setDateInit(value)}
                              classNames={{
                                label: "text-white/70 font-medium",
                                input: "text-white",
                                inputWrapper: "border-white/20 hover:border-white/40 bg-transparent backdrop-blur-sm group-data-[focus=true]:border-[#0CDBFF]",
                                selectorButton: "text-[#0CDBFF]"
                              }}
                            />
                            {meta.touched && meta.error && (
                              <p className="text-xs text-rose-500 mt-1 font-medium ml-1">
                                {meta.error} *
                              </p>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>

                    <Field name="linkWeb" className="w-full">
                      {({ field, meta }) => (
                        <div>
                          <Input
                            {...field}
                            type="text"
                            variant="bordered"
                            placeholder="Ingrese la url"
                            label="Link web proyecto o inmobiliaria"
                            labelPlacement="inside"
                            classNames={inputClassNames}
                          />
                          {meta.touched && meta.error && (
                            <p className="text-xs text-rose-500 mt-1 font-medium ml-1">
                              {meta.error} *
                            </p>
                          )}
                        </div>
                      )}
                    </Field>

                    <Field name="notes" className="w-full">
                      {({ field, meta }) => (
                        <div>
                          <Textarea
                            {...field}
                            variant="bordered"
                            label="Notas"
                            labelPlacement="inside"
                            placeholder="Ingrese notas adicionales"
                            classNames={inputClassNames}
                          />
                          {meta.touched && meta.error && (
                            <p className="text-xs text-rose-500 mt-1 font-medium ml-1">
                              {meta.error} *
                            </p>
                          )}
                        </div>
                      )}
                    </Field>

                    <div className="mt-2">
                      <span className="text-xs text-white/50 block mb-2 font-medium">Imagen de Portada *</span>
                      <Dropzone
                        onDrop={(acceptedFiles) => verifyFile(acceptedFiles)}
                      >
                        {({ getRootProps, getInputProps }) => (
                          <section
                            className={`border-2 rounded-xl p-1 transition-all duration-300 ${
                              imgOfProject.length > 0
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : isValidImg === false
                                ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                                : "border-white/10 hover:border-[#0CDBFF]/40 bg-white/[0.02] text-white/60"
                            }`}
                          >
                            <div
                              {...getRootProps()}
                              className="cursor-pointer border-dashed border-2 border-transparent hover:border-white/10 rounded-lg p-6 text-center"
                            >
                              <input {...getInputProps()} />
                              {imgOfProject.length > 0 ? (
                                <p className="font-bold flex items-center justify-center gap-2">
                                  <span>✓</span> Imagen Cargada ({imgOfProject[0].name})
                                </p>
                              ) : (
                                <p className="text-xs font-light">
                                  {isValidImg === false
                                    ? "Tipo de archivo inválido, deben ser (.png, .jpg, .jpeg, .webp)"
                                    : "Arrastre o seleccione la imagen del proyecto"}
                                </p>
                              )}
                            </div>
                          </section>
                        )}
                      </Dropzone>
                    </div>

                    <ModalFooter className="px-0 pb-0 mt-4">
                      <Button
                        variant="flat"
                        className="bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                        onClick={onClose}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-[#0CDBFF] to-[#00A8CC] hover:from-[#33E2FF] hover:to-[#00C5ED] text-[#02121B] font-bold shadow-lg shadow-[#0CDBFF]/20"
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
  );
};

export default ModalNewProject;
