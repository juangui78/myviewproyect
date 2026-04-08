import React, { useEffect } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/drawer"

const DrawerShowModels = ({ IsOpenDrawerModels, onOpenChangeDrawerModels, dataModels }) => {

    

    return (
        <Drawer
            isOpen={IsOpenDrawerModels}
            onOpenChange={onOpenChangeDrawerModels}
            placement="left"
            backdrop="blur"
            className="h-full bg-transparent border"
        >
            <DrawerContent>
                {(onclose) => (
                    <>
                        <DrawerHeader>
                            <h2 className="m-auto font-medium text-white text-2xl">Historial de modelos</h2>
                        </DrawerHeader>
                        <DrawerBody>
                            <div>
                                <p className="text-white italic">Total de modelos en este proyecto = 3</p>
                                {dataModels.plainModels.map((model) => (
                                    <div key={model._id} className="w-full border-b-1 p-5 flex justify-between items-center">
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{model.name}</h4>
                                            <p className="text-white italic text-sm">{model._id}</p>
                                            <p className="text-white italic text-sm">{model.creation_date}</p>
                                            <p className="text-white italic text-sm">{model.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DrawerBody>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    )

}


export default DrawerShowModels