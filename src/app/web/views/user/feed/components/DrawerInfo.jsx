import React, { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import { Tooltip } from "@nextui-org/react";
import { getTodoList } from "../js/todo";
import { Button, Link, Avatar, AvatarGroup, Image } from "@nextui-org/react";
import ChevronDoubleLeft from "@/web/global_components/icons/ChevronDoubleLeft";
import { EditIcon } from "@/web/global_components/icons/EditIcon";

const DrawerInfo = ({ isOpen, onOpenChange, _id }) => {

    const [error, setError] = useState(false)
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const fetchData = async () => {
          const response = await getTodoList(_id); //get data from api
          const status_ = response[0]
          const data_ = response[1]

          if (status_ === "error") {
              setError(true)
              setLoading(false)
              return
          }

          setError(false)
          setLoading(false)
          setData(data_)
        }

        fetchData()

    }, [_id])

    return (
        <>
            <Drawer
               isOpen={isOpen}
               placement={"left"}
               backdrop={"blur"}
               onOpenChange={onOpenChange}
               className="h-full bg-transparent text-white"
              >
              <DrawerContent>
                {(onClose) => (
                  <>
                    <DrawerHeader className="absolute top-0 inset-x-0 z-50 flex flex-row gap-2 px-2 py-2 border-b border-default-200/50 justify-between  backdrop-blur-lg">
                      <div className="flex gap-2 items-center"></div>
                        <div className="w-full flex justify-start gap-2 pl-[6px]">
                          <Button
                            className="font-medium text-small text-black text-default-500 bg-[#0CDBFF]"
                            size="sm"
                            startContent={
                              <EditIcon/>
                            }
                            variant="flat"
                          >
                            Editar
                          </Button>
                        </div>
                        <div className="flex gap-1 items-center">
                         <Tooltip content="Cerrar">
                           <Button  
                           isIconOnly
                           className="text-default-400"
                           size="sm"
                           variant="light"
                           onPress={onClose}>
                             <ChevronDoubleLeft />
                           </Button>
                         </Tooltip>
                       </div>
                     </DrawerHeader>
                    <DrawerBody className="pt-16">
                      <div className="flex w-full justify-center items-center pt-4">
                        <Image
                          isBlurred
                          isZoomed
                          alt="Event image"
                          className="aspect-square w-full hover:scale-110"
                          height={300}
                          src="https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/places/san-francisco.png"
                        />
                      </div>
                      <div className="flex flex-col gap-2 py-4">
                        <h1 className="text-2xl font-bold leading-7">{data?.name}</h1>
                        <p className="text-sm text-default-500 text-white">{data?.department}, {data?.city}, {data?.address}</p>
                        <div className="mt-4 flex flex-col gap-3">
                          <div className="flex flex-col mt-4 gap-3 items-start">
                            <span className="text-medium text-white font-bold">Descripción</span>
                            <div className="text-medium text-default-500 flex flex-col gap-2">
                              <p className="text-white">{data?.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-col mt-4 gap-3 items-start">
                            <span className="text-medium text-white font-bold">Hectareas</span>
                            <div className="text-medium text-default-500 flex flex-col gap-2">
                              <p className="text-white">{data?.hectares} hectareas</p>
                            </div>
                          </div>
                      </div>
                    </div>
                  </DrawerBody>
                    <DrawerFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Close
                      </Button>
                      <Button color="primary" onPress={onClose}>
                        Action
                      </Button>
                    </DrawerFooter>
                  </>
                )}
              </DrawerContent>
            </Drawer>
        </>
    )
}

export default DrawerInfo