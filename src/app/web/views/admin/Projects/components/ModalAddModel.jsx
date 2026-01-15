import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import Dropzone from "react-dropzone";
import { addNewModel } from "../actions/addNewModel";
import { toast } from "sonner";

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

        const formData = new FormData()
        formData.append('idProject', idProject)
        formData.append('glb', glb[0])

        try {
            setSending(true)
            const response = await addNewModel(formData)
            console.log(response)
            if (response.success) {
                toast.success("Modelo agregado")
                onOpenChange()
            } else {
                toast.error(response.message)
            }

            setSending(false)
        } catch (error) {
            console.log(error)
            toast.error("Error al enviar")
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