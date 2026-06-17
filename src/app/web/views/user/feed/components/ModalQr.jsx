import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalContent, ModalBody, ModalFooter, Button} from "@nextui-org/react";
import { BlocksShuffle3 } from "@/web/global_components/icons/BlocksShuffle3";
import { Toaster, toast } from "sonner";
import { getQr } from "../js/qrCode";
import { encrypt } from "@/api/libs/crypto";

const ModalQr = ({ isOpenQr, onOpenChangeQr, _id }) => {

    const [errorLoad, setErrorLoad] = useState(false)
    const [loading, setLoading] = useState(false)
    const [qrCode, setQrCode] = useState(null)
    const [shareUrl, setShareUrl] = useState("")

    const initializateState = () => {
        setErrorLoad(false)
        setQrCode(null)
        setShareUrl("")
        setLoading(false)
    }

    useEffect(() => {
        if (isOpenQr && _id) {
            const getUrlQr = async () => {
                try {
                    setLoading(true)
                    const response = await getQr(_id)

                    if (!response.status) {
                        toast.error("Error al obtener el código QR del servidor.")
                        setErrorLoad(true)
                        // Fallback client-side URL generation
                        const localShareUrl = `${window.location.origin}/web/views/visualizer?id=${encrypt(_id)}`;
                        setShareUrl(localShareUrl);
                        return
                    }

                    setQrCode(response.data.qrCode)
                    
                    let finalUrl = response.data.urlShare;
                    if (finalUrl && !finalUrl.startsWith("http")) {
                        finalUrl = window.location.origin + (finalUrl.startsWith("/") ? "" : "/") + finalUrl;
                    }
                    setShareUrl(finalUrl)
                } 
                catch (error) { 
                    toast.error("Se ha producido un error al cargar el código QR.") 
                    setErrorLoad(true)
                    const localShareUrl = `${window.location.origin}/web/views/visualizer?id=${encrypt(_id)}`;
                    setShareUrl(localShareUrl);
                }
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

    const copyToClipboard = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl)
            toast.success("Enlace copiado al portapapeles")
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
                            <p className="text-sm italic">Compartir proyecto mediante un QR o enlace</p>
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4 justify-center items-center">
                                {errorLoad ? (
                                    <div className="flex flex-col items-center gap-4 w-full">
                                        <p className="text-red-400 text-sm font-medium text-center">No se pudo cargar el código QR, pero aún puedes compartir el enlace:</p>
                                        {shareUrl && (
                                            <div className="w-full flex flex-col gap-1.5 mt-2">
                                                <label className="text-xs text-slate-300 font-medium">Enlace del proyecto:</label>
                                                <div className="flex gap-2 w-full">
                                                    <input 
                                                        type="text" 
                                                        readOnly 
                                                        value={shareUrl} 
                                                        className="flex-1 bg-[#1a1a1a] text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0CDBFF] select-all overflow-ellipsis"
                                                    />
                                                    <Button 
                                                        className="bg-[#0CDBFF] text-black font-semibold rounded-lg px-4 py-2 hover:bg-[#00c2e0] transition-colors"
                                                        onClick={copyToClipboard}
                                                    >
                                                        Copiar
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : 
                                    (loading ?   <div className="h-[25vh] flex justify-center items-center "> <BlocksShuffle3 className="text-white text-6xl" /> </div> : 
                                        <>
                                            <img src={qrCode} alt="qr" className="w-48 h-48 rounded-lg border border-white/10 p-2 bg-white" />
                                            {shareUrl && (
                                                <div className="w-full flex flex-col gap-1.5 mt-2">
                                                    <label className="text-xs text-slate-300 font-medium">Enlace del proyecto:</label>
                                                    <div className="flex gap-2 w-full">
                                                        <input 
                                                            type="text" 
                                                            readOnly 
                                                            value={shareUrl} 
                                                            className="flex-1 bg-[#1a1a1a] text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0CDBFF] select-all overflow-ellipsis"
                                                        />
                                                        <Button 
                                                            className="bg-[#0CDBFF] text-black font-semibold rounded-lg px-4 py-2 hover:bg-[#00c2e0] transition-colors"
                                                            onClick={copyToClipboard}
                                                        >
                                                            Copiar
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
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