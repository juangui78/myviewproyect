import React from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/drawer"
import { Button } from "@nextui-org/react"

const DrawerShowInfoProject = ({ IsOpenDrawerInfoProject, onOpenChangeDrawerShowInfoProject, dataProject}) => {

    return (
        <Drawer
            isOpen={IsOpenDrawerInfoProject}
            onOpenChange={onOpenChangeDrawerShowInfoProject}
            placement="left"
            backdrop="blur"
            className="h-full bg-transparent border"
        >
            <DrawerContent>
                {(onclose) => (
                    <>
                        <DrawerHeader>
                            <h2 className="m-auto font-medium text-white text-2xl">{dataProject?.name}</h2>
                        </DrawerHeader>
                        <DrawerBody>
                            <div>
                                <p className="text-white italic">Falta implementar</p>
                               
                                <p className="text-white italic">{dataProject?.description}</p>
                                <p className="text-white italic">{dataProject?.department}</p>
                                <p className="text-white italic">{dataProject?.city}</p>
                                <p className="text-white italic">{dataProject?.address}</p>
                                <p className="text-white italic">{dataProject?.plan}</p>

                            </div>
                            <Button color="primary">
                                Editar
                            </Button>

                        </DrawerBody>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    )

}


export default  DrawerShowInfoProject