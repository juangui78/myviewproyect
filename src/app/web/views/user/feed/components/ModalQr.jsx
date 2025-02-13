import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalContent, ModalBody, ModalFooter, Button} from "@nextui-org/react";
import { BlocksShuffle3 } from "@/web/global_components/icons/BlocksShuffle3";
import { Toaster, toast } from "sonner";
import { getQr } from "../js/qrCode";

const ModalQr = ({ isOpenQr, onOpenChangeQr, _id }) => {

    const [errorLoad, setErrorLoad] = useState(false)
    const [loading, setLoading] = useState(false)
    const [qrCode, setQrCode] = useState(null)

    const initializateState = () => {
        setErrorLoad(false)
        setQrCode(null)
        setLoading(false)
    }

    useEffect(() => {
        if (isOpenQr && _id) {
            const getUrlQr = async () => {
                try {
                    setLoading(true)
                    const response = await getQr(_id)

                    if (!response.status) {
                        toast.error(response.data)
                        setErrorLoad(true)
                        return
                    }

                    setQrCode(response.data)
                } 
                catch (error) { toast.error("Se ha producido un error al cargar el código QR.") }
                finally { 
                    setLoading(false)
                }
            }

            initializateState()
            getUrlQr() //get code qr in base 64

        }
    }, [isOpenQr, _id])

    const dowloadQr = () => {
        if (qrCode && !errorLoad){
            const link = document.createElement("a")
            link.href = qrCode
            link.download = "qr.png"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    return (
        <Modal
            backdrop={"blur"}
            placement="center"
            isDismissable={false}
            isOpen={isOpenQr}
            onClose={onOpenChangeQr}
            className="bg-[#000000ab] shadow-white"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-white text-white">
                            <h1 className="font-bold text-xl">Generar QR</h1>
                            <p className="text-sm italic">Compartir proyecto mediante un QR</p>
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex justify-center items-center">
                                {errorLoad ? <p className="text-white">Se ha producido un error al cargar el código QR.</p> : 
                                    (loading ?   <div className="h-[25vh] flex justify-center items-center "> <BlocksShuffle3 className="text-white text-6xl" /> </div> : 
                                        <img src={qrCode} alt="qr" />
                                    )
                                }
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button 
                                onClick={onClose} 
                                variant="light" 
                                className="text-white cursor-pointer"
                            >
                                Cerrar
                            </Button>
                            <Button 
                                className="bg-[#0CDBFF] cursor-pointer"
                                onClick={dowloadQr}
                                disabled={loading || errorLoad}
                            >
                                Descargar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
            <Toaster richColors position="top-right" />
        </Modal>
    )
}

export default ModalQr