import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, RadioGroup, Radio, Select, SelectItem, Textarea } from "@nextui-org/react";
import Dropzone from "react-dropzone";
import { addNewModel } from "../actions/addNewModel";
import { updateModelFile } from "../actions/updateModelFile";
import { getModels } from "../actions/getModels";
import { toast } from "sonner";
import { generatePresignedUrlAction } from "../actions/generatePresignedUrl";

const ModalAddModel = ({ isOpen, onOpenChange, idProject }) => {

    const [errorGlb, setErrorGlb] = useState(false)
    const [glb, setGlb] = useState([])
    const [send, setSending] = useState(false)
    const [actionType, setActionType] = useState("create")
    const [modelsList, setModelsList] = useState([])
    const [selectedModelId, setSelectedModelId] = useState("")
    const [versionNotes, setVersionNotes] = useState("")

    useEffect(() => {
        setErrorGlb(false)
        setGlb([])
        setSending(false)
        setActionType("create")
        setSelectedModelId("")
        setVersionNotes("")
        
        const fetchModels = async () => {
            const res = await getModels(idProject)
            if (res.success) {
                setModelsList(res.data.plainModels)
            }
        }
        if (isOpen && idProject) {
            fetchModels()
        }
    }, [isOpen, idProject])

    const classifyFiles = (fileList) => {
        let high = null;
        let preview = null;
        let mobile = null;

        if (fileList.length === 1) {
            high = fileList[0];
        } else {
            for (const file of fileList) {
                const lower = file.name.toLowerCase();
                if (lower.includes('preview')) {
                    preview = file;
                } else if (lower.includes('mobile') || lower.includes('ktx2')) {
                    mobile = file;
                } else if (lower.includes('high')) {
                    high = file;
                }
            }
            if (!high) {
                high = fileList.find(f => f !== preview && f !== mobile) || fileList[0];
            }
        }
        return { high, preview, mobile };
    }

    const verifyFiles = (Files) => {
        if (!Files || Files.length === 0) return;
        const validGlbFiles = Files.filter(f => f.name.toLowerCase().endsWith('.glb'));

        if (validGlbFiles.length === 0) {
            setErrorGlb(true);
            setGlb([]);
            return;
        }

        setErrorGlb(false);
        setGlb(validGlbFiles);
    }

    const handleSubmit = async () => {
        if (glb.length === 0) {
            toast.warning("Debe seleccionar al menos un archivo .glb")
            return
        }

        try {
            if (actionType === "replace" && !selectedModelId) {
                toast.warning("Debe seleccionar un modelo a reemplazar");
                return;
            }

            setSending(true);

            const { high, preview, mobile } = classifyFiles(glb);
            if (!high) {
                toast.error("No se encontró el archivo principal .glb");
                setSending(false);
                return;
            }

            let targetModelId = actionType === "replace" ? selectedModelId : null;

            // 1. Subir archivo High-Res (principal)
            toast.loading("Subiendo modelo principal (High-Res)...", { id: 'upload-toast' });
            const presignedHigh = await generatePresignedUrlAction(idProject, high.name, targetModelId);
            if (!presignedHigh.success) {
                toast.error(presignedHigh.message, { id: 'upload-toast' });
                setSending(false);
                return;
            }
            targetModelId = presignedHigh.idModel;

            const uploadHigh = await fetch(presignedHigh.uploadUrl, {
                method: "PUT",
                body: high,
                headers: { "Content-Type": "model/gltf-binary" },
            });
            if (!uploadHigh.ok) throw new Error("Error al subir archivo principal a AWS S3.");

            // 2. Subir Preview si fue seleccionado
            let previewFinalUrl = null;
            if (preview) {
                toast.loading("Subiendo versión Preview...", { id: 'upload-toast' });
                const presignedPrev = await generatePresignedUrlAction(idProject, preview.name, targetModelId);
                if (presignedPrev.success) {
                    const uploadPrev = await fetch(presignedPrev.uploadUrl, {
                        method: "PUT",
                        body: preview,
                        headers: { "Content-Type": "model/gltf-binary" },
                    });
                    if (uploadPrev.ok) {
                        previewFinalUrl = presignedPrev.finalUrl;
                    }
                }
            }

            // 3. Subir Móvil KTX2 si fue seleccionado
            let mobileFinalUrl = null;
            if (mobile) {
                toast.loading("Subiendo versión Móvil KTX2...", { id: 'upload-toast' });
                const presignedMob = await generatePresignedUrlAction(idProject, mobile.name, targetModelId);
                if (presignedMob.success) {
                    const uploadMob = await fetch(presignedMob.uploadUrl, {
                        method: "PUT",
                        body: mobile,
                        headers: { "Content-Type": "model/gltf-binary" },
                    });
                    if (uploadMob.ok) {
                        mobileFinalUrl = presignedMob.finalUrl;
                    }
                }
            }

            // 4. Guardar el modelo en la base de datos
            toast.loading("Guardando información del modelo...", { id: 'upload-toast' });
            let finalResponse;
            if (actionType === "replace") {
                finalResponse = await updateModelFile(
                    idProject,
                    targetModelId,
                    high.name,
                    presignedHigh.finalUrl,
                    versionNotes,
                    previewFinalUrl,
                    mobileFinalUrl
                );
            } else {
                finalResponse = await addNewModel(
                    idProject, 
                    targetModelId, 
                    high.name, 
                    presignedHigh.finalUrl,
                    versionNotes,
                    previewFinalUrl,
                    mobileFinalUrl
                );
            }

            if (finalResponse.success) {
                toast.success(actionType === "replace" ? "Modelo reemplazado correctamente" : "Modelo agregado correctamente", { id: 'upload-toast' });
                onOpenChange();
            } else {
                toast.error(finalResponse.message, { id: 'upload-toast' });
            }

            setSending(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar la subida: " + (error?.message || ''), { id: 'upload-toast' });
            setSending(false);
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
                            <div className="flex flex-col gap-4 mb-4">
                                <RadioGroup
                                    orientation="horizontal"
                                    value={actionType}
                                    onValueChange={setActionType}
                                >
                                    <Radio value="create" classNames={{ label: "text-white" }}>Crear nuevo modelo</Radio>
                                    <Radio value="replace" classNames={{ label: "text-white" }}>Reemplazar modelo existente</Radio>
                                </RadioGroup>

                                {actionType === "replace" && (
                                    <Select 
                                        label="Selecciona un modelo a reemplazar" 
                                        placeholder="Elige un modelo"
                                        selectedKeys={selectedModelId ? [selectedModelId] : []}
                                        onChange={(e) => setSelectedModelId(e.target.value)}
                                    >
                                        {modelsList.map((model) => (
                                            <SelectItem key={model._id} value={model._id}>
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                                <Textarea
                                    label="Notas de la versión / Actualizaciones"
                                    placeholder="Describe los cambios en esta versión..."
                                    value={versionNotes}
                                    onChange={(e) => setVersionNotes(e.target.value)}
                                    className="text-white"
                                    classNames={{
                                        input: "text-white",
                                        label: "text-white/70",
                                        innerWrapper: "bg-transparent",
                                        inputWrapper: "border-white/20 bg-white/5 hover:bg-white/10"
                                    }}
                                    variant="bordered"
                                />
                            </div>
                            <Dropzone onDrop={acceptedFiles => verifyFiles(acceptedFiles)}>
                                {({ getRootProps, getInputProps }) => {
                                    const { high, preview, mobile } = classifyFiles(glb);
                                    return (
                                        <section
                                            className={
                                                `border-2 border-gray-300 rounded-lg p-2 text-center transition-colors 
                                            ${glb.length > 0 ? "bg-[#0b2918] border-[#00C662]" : (!errorGlb ? "bg-white/5" : "bg-red-500/20 border-red-500")}`
                                            }
                                        >
                                            <div {...getRootProps()} className="cursor-pointer border-dashed border-2 border-white/20 rounded-lg p-6 text-center text-white">
                                                <input {...getInputProps()} multiple />
                                                {glb.length > 0 ? (
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <p className="font-semibold text-[#00C662] mb-1">
                                                            ✔ {glb.length} archivo{glb.length > 1 ? "s" : ""} .glb seleccionado{glb.length > 1 ? "s" : ""}
                                                        </p>
                                                        {high && <span className="text-xs text-white/90">🟢 Principal (HD): {high.name}</span>}
                                                        {preview && <span className="text-xs text-yellow-300">🟡 Preview: {preview.name}</span>}
                                                        {mobile && <span className="text-xs text-blue-300">🔵 Móvil KTX2: {mobile.name}</span>}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {!errorGlb 
                                                                ? "Arrastre aquí el archivo .glb (o los 3 archivos optimizados: -high, -preview, -mobile)" 
                                                                : "Tipo de archivo inválido, debe ser .glb"}
                                                        </p>
                                                        <p className="text-xs text-white/50 mt-1">Soporta subida individual o de las 3 versiones a la vez</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    );
                                }}
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
                                className="cursor-pointer"
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
