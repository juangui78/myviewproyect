import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import Dropzone from "react-dropzone";
import { addNewModel } from "../actions/addNewModel";
import { toast } from "sonner";

import { generatePresignedUrlAction } from "../actions/generatePresignedUrl";

const ModalAddModel = ({ isOpen, onOpenChange, idProject }) => {

    const [errorGlb, setErrorGlb] = useState(false)
    const [glb, setGlb] = useState([])
    const [send, setSending] = useState(false)

    useEffect(() => {
        setErrorGlb(false)
        setGlb([])
        setSending(false)
    }, [isOpen, idProject])

    const verifyFiles = (Files, type) => {
        const file = Files[0]
        const typeFile = file.name.split('.').pop()

        if (type === "glb") {
            if (typeFile !== type) {
                setErrorGlb(true);
                setGlb([])
                return
            }

            setErrorGlb(false);
            setGlb(Files)
        }
    }

    const handleSubmit = async () => {

        if (glb.length === 0) {
            toast.warning("Debe seleccionar el archivo .glb")
            return
        }

        try {
            setSending(true)

            // 1. Obtener la Presigned URL y el idModel generado
            toast.loading("Paso 1/2: Configurando subida...", { id: 'upload-toast' });
            const presignedResponse = await generatePresignedUrlAction(idProject, glb[0].name);

            if (!presignedResponse.success) {
                toast.error(presignedResponse.message, { id: 'upload-toast' });
                setSending(false);
                return;
            }

            // 2. Subir el archivo directamente a S3
            toast.loading("Paso 2/2: Subiendo archivo...", { id: 'upload-toast' });
            
            const uploadResponse = await fetch(presignedResponse.uploadUrl, {
                method: "PUT",
                body: glb[0],
                headers: {
                    "Content-Type": "model/gltf-binary",
                },
            });

            if (!uploadResponse.ok) {
                throw new Error("Error al subir el archivo directamente a AWS S3.");
            }

            // 3. Guardar el modelo en la base de datos
            const finalResponse = await addNewModel(
                idProject, 
                presignedResponse.idModel, 
                glb[0].name, 
                presignedResponse.finalUrl
            );

            if (finalResponse.success) {
                toast.success("Modelo agregado correctamente", { id: 'upload-toast' });
                onOpenChange()
            } else {
                toast.error(finalResponse.message, { id: 'upload-toast' });
            }

            setSending(false)
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado en el servidor", { id: 'upload-toast' });
            setSending(false)
        }

    }

    return (

        <Modal
            backdrop={"blur"}
            placement="center"
            size="2xl"
            isDismissable={false}
            isOpen={isOpen}
            onClose={onOpenChange}
            className="bg-[#000000ab]"
        >

            <ModalContent>
                {(onClose) => (
                    <>

                        <ModalHeader>
                            <h2 className="text-3xl font-bold text-white">Agregar modelo</h2>
                        </ModalHeader>
                        <ModalBody>
                            <Dropzone onDrop={acceptedFiles => verifyFiles(acceptedFiles, "glb")}>
                                {({ getRootProps, getInputProps }) => (
                                    <section
                                        className={
                                            `border-2 border-gray-300 rounded-lg p-2 text-center 
                                        ${glb.length > 0 ? "bg-[#00C662]" : (!errorGlb ? "bg-[#fff]" : "bg-red-500")}`
                                        }
                                    >
                                        <div {...getRootProps()} className="cursor-pointer border-dashed border-2 border-gray-300 rounded-lg p-8 text-center">
                                            <input {...getInputProps()} />
                                            {glb.length > 0 ? (
                                                <p>Archivo .glb Cargado</p>
                                            ) : (
                                                <p>{!errorGlb ? "Arrastre o seleccione el archivo model.glb" : "Tipo de archivo invalido, debe ser .glb"}</p>
                                            )}
                                        </div>
                                    </section>
                                )}
                            </Dropzone>
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
                                type="submit"
                                onClick={handleSubmit}
                                disabled={send}
                            >
                                {send ? "Enviando..." : "Enviar"}
                            </Button>
                        </ModalFooter>

                    </>
                )}
            </ModalContent>
        </Modal>

    )
}

export default ModalAddModel