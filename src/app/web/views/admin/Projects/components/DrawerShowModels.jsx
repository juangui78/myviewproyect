import React from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/drawer"

const DrawerShowModels = ({ IsOpenDrawerModels, onOpenChangeDrawerModels, dataModels }) => {

    const models = dataModels?.plainModels || [];

    return (
        <Drawer
            isOpen={IsOpenDrawerModels}
            onOpenChange={onOpenChangeDrawerModels}
            placement="left"
            backdrop="blur"
            className="h-full bg-[#0B151F]/95 backdrop-blur-2xl border-r border-white/10"
        >
            <DrawerContent>
                {(onclose) => (
                    <>
                        <DrawerHeader className="border-b border-white/10 py-4">
                            <h2 className="m-auto font-bold text-white text-xl">Historial de Modelos 3D</h2>
                        </DrawerHeader>
                        <DrawerBody className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs font-mono text-white/50 pb-2 border-b border-white/5">
                                <span>Versiones registradas:</span>
                                <span className="font-bold text-[#0CDBFF]">{models.length}</span>
                            </div>
                            
                            {models.length === 0 ? (
                                <div className="text-center py-10 text-white/40 text-xs">
                                    No hay versiones o modelos registrados para este proyecto.
                                </div>
                            ) : (
                                models.map((model, idx) => (
                                    <div key={model._id} className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:border-[#0CDBFF]/40 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-white truncate">{model.name}</h4>
                                            {idx === 0 && (
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    Activo
                                                </span>
                                            )}
                                        </div>
                                        {model.version_notes && (
                                            <p className="text-xs text-white/70 bg-white/5 p-2 rounded-lg italic">
                                                &quot;{model.version_notes}&quot;
                                            </p>
                                        )}
                                        <div className="text-[11px] font-mono text-white/40 space-y-0.5">
                                            <p>📅 {model.creation_date ? new Date(model.creation_date).toLocaleString("es-ES") : "Sin fecha"}</p>
                                            <p className="truncate text-white/30">ID: {model._id}</p>
                                            {model.model?.previewUrl && <p className="text-yellow-400/70">⚡ Versión Preview Progresivo activa</p>}
                                            {model.model?.mobileUrl && <p className="text-blue-400/70">📱 Versión Móvil KTX2 activa</p>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </DrawerBody>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    )

}

export default DrawerShowModels
