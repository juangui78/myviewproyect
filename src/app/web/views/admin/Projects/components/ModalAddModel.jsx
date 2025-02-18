import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import Dropzone from "react-dropzone";

const ModalAddModel = ({ isOpen, onOpenChange, idProject }) => {

    const [errorBin, setErrorBin] = useState(false)
    const [errorGltf, setErrorGltf] = useState(false)
    const [errorTextures, setErrorTextures] = useState(false)
    const [bin, setBin] = useState([])
    const [gltf, setGltf] = useState([])
    const [textures, setTextures] = useState([])

    const verifyFiles = (Files, type) => {
        const length = Files.length 
        const typeFile = Files[length - 1].name.split('.').pop()

        console.log(typeFile)
        if (type === "bin") {
            if (typeFile != type) {
                setErrorBin(true);
                setBin([])
                return
            }

            setErrorBin(false);
            setBin(Files)
            
        }
        else if (type === "gltf") {
            if (typeFile != type){
                setErrorGltf(true);
                setGltf([])
                return
            }

            setErrorGltf(false);
            setGltf(Files)
        }
        else if (type === "png" || type === "jpg") {
            if (typeFile != type) {
                setErrorTextures(true);
                setTextures([])
                return
            }

            setErrorTextures(false);
            setTextures(Files)
        }
    }

    const handleSubmit = async () => {
        
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
                            <Dropzone onDrop={acceptedFiles => verifyFiles(acceptedFiles, "bin")}>
                                {({ getRootProps, getInputProps }) => (
                                      <section 
                                      className={
                                        `border-2 border-gray-300 rounded-lg p-2 text-center 
                                        ${bin.length > 0 ? "bg-[#00C662]" : (!errorBin ? "bg-[#fff]" : "bg-red-500")}`
                                    }
                                    >
                                        <div {...getRootProps()} className="cursor-pointer border-dashed border-2 border-gray-300 rounded-lg p-8 text-center">
                                          <input {...getInputProps()} />
                                          {bin.length > 0 ? (
                                              <p>Archvio .bin Cargado</p>
                                          ) : (
                                              <p>{!errorBin ? "Arrastre o seleccione el archivo scene.bin" : "Tipo de archivo invalido, debe ser .bin"}</p>
                                          )}
                                        </div>
                                    </section>
                                )}
                            </Dropzone>

                            <Dropzone onDrop={acceptedFiles =>  verifyFiles(acceptedFiles, "gltf")}>
                                {({ getRootProps, getInputProps }) => (
                                      <section 
                                        className={
                                            `border-2 border-gray-300 rounded-lg p-2 text-center 
                                            ${gltf.length > 0 ? "bg-[#00C662]" : (!errorGltf ? "bg-[#fff]" : "bg-red-500")}`
                                        }>
                                      <div {...getRootProps()} className="cursor-pointer border-dashed border-2 border-gray-300 rounded-lg p-8 text-center">
                                        <input {...getInputProps()} />
                                        {gltf.length > 0 ? (
                                              <p>Archvio .gltf Cargado</p>
                                          ) : (
                                              <p>{!errorGltf ? "Arrastre o seleccione el archivo scene.gltf" : "Tipo de archivo invalido, debe ser .gltf"}</p>
                                          )}
                                      </div>
                                    </section>
                                )}
                            </Dropzone>

                            <Dropzone onDrop={acceptedFiles => verifyFiles(acceptedFiles, "png")}>
                                {({ getRootProps, getInputProps }) => (
                                      <section 
                                      className={
                                        `border-2 border-gray-300 rounded-lg p-2 text-center 
                                        ${textures.length > 0 ? "bg-[#00C662]" : (!errorTextures ? "bg-[#fff]" : "bg-red-500")}`
                                      }>
                                      <div {...getRootProps()} className="cursor-pointer border-dashed border-2 border-gray-300 rounded-lg p-8 text-center">
                                        <input {...getInputProps()} />
                                        {textures.length > 0 ? (
                                              <p>Archivos texturas Cargadas</p>
                                          ) : (
                                              <p>{!errorTextures ? "Arrastre o seleccione las texturas" : "Tipo de archivo invalido, deben ser (.png)"}</p>
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
                            >
                                guardar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>

    )
}

export default ModalAddModel