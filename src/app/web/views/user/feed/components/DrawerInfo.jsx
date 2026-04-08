import React, { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import { Tooltip, Input, Textarea, Button, Link, Avatar, AvatarGroup, Image } from "@nextui-org/react";
import { getTodoList, updateProject } from "../js/todo";
import ChevronDoubleLeft from "@/web/global_components/icons/ChevronDoubleLeft";
import { EditIcon } from "@/web/global_components/icons/EditIcon";
import CheckIcon from "@/web/global_components/icons/CheckIcon";
import { Ban } from "@/web/global_components/icons/Ban";

const DrawerInfo = ({ isOpen, onOpenChange, _id }) => {

    const [error, setError] = useState(false)
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        name: "",
        address: "",
        description: ""
    })
    const [isSaving, setIsSaving] = useState(false)

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
          setEditForm({
              name: data_.name || "",
              address: data_.address || "",
              description: data_.description || ""
          })
        }

        if (_id) fetchData()

    }, [_id])

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing, reset form
            setEditForm({
                name: data.name || "",
                address: data.address || "",
                description: data.description || ""
            })
        }
        setIsEditing(!isEditing)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        if (!window.confirm("¿Estás seguro de que deseas guardar los cambios?")) return

        setIsSaving(true)
        const [status, updatedData] = await updateProject(_id, editForm)
        
        if (status === "success") {
            setData(updatedData)
            setIsEditing(false)
            alert("Proyecto actualizado correctamente")
            // Reload if name changed to update the title in the Cards list
            if (updatedData.name !== data.name) {
                window.location.reload() 
            }
        } else {
            alert("Error al actualizar el proyecto")
        }
        setIsSaving(false)
    }

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
                          {!isEditing ? (
                              <Button
                                className="font-medium text-small text-black bg-[#0CDBFF] !text-black"
                                size="sm"
                                startContent={<EditIcon/>}
                                variant="flat"
                                onPress={handleEditToggle}
                              >
                                Editar
                              </Button>
                          ) : (
                              <div className="flex gap-2">
                                  <Button
                                    className="font-medium text-small text-black bg-[#0CDBFF] !text-black"
                                    size="sm"
                                    startContent={<CheckIcon className="w-4 h-4"/>}
                                    variant="flat"
                                    onPress={handleSave}
                                    isLoading={isSaving}
                                  >
                                    Guardar
                                  </Button>
                                  <Button
                                    className="font-medium text-small text-white bg-white/10"
                                    size="sm"
                                    startContent={<Ban className="w-4 h-4"/>}
                                    variant="flat"
                                    onPress={handleEditToggle}
                                  >
                                    Cancelar
                                  </Button>
                              </div>
                          )}
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
                    <DrawerBody className="pt-16 scrollbar-hide">
                      <div className="flex w-full justify-center items-center pt-4">
                        <Image
                          isBlurred
                          isZoomed
                          alt="Event image"
                          className="aspect-square w-full hover:scale-110 object-cover rounded-xl"
                          height={300}
                          src={data?.urlImage || "/images/parcela.jpg"}
                        />
                      </div>
                      <div className="flex flex-col gap-4 py-4">
                        {isEditing ? (
                            <>
                                <Input
                                    label="Nombre del Proyecto"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                    className="text-white"
                                    classNames={{
                                        input: "text-white",
                                        label: "text-white/70"
                                    }}
                                />
                                <Input
                                    label="Dirección"
                                    name="address"
                                    value={editForm.address}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                    className="text-white"
                                    classNames={{
                                        input: "text-white",
                                        label: "text-white/70"
                                    }}
                                />
                                <Textarea
                                    label="Descripción"
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                    className="text-white"
                                    classNames={{
                                        input: "text-white",
                                        label: "text-white/70"
                                    }}
                                />
                            </>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold leading-7">{data?.name}</h1>
                                <p className="text-sm text-default-500 text-white/70">{data?.department}, {data?.city}, {data?.address}</p>
                                <div className="mt-2 flex flex-col gap-3">
                                  <div className="flex flex-col mt-2 gap-1 items-start">
                                    <span className="text-medium text-white font-bold">Descripción</span>
                                    <p className="text-medium text-white/80 leading-relaxed">{data?.description}</p>
                                  </div>
                                  <div className="flex flex-col mt-2 gap-1 items-start">
                                    <span className="text-medium text-white font-bold">Información adicional</span>
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                            <p className="text-xs text-white/50 uppercase">Hectáreas</p>
                                            <p className="text-lg font-semibold text-white">{data?.hectares || 0}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                            <p className="text-xs text-white/50 uppercase">M2</p>
                                            <p className="text-lg font-semibold text-white">{data?.m2 || 0}</p>
                                        </div>
                                    </div>
                                  </div>
                                </div>
                            </>
                        )}
                    </div>
                  </DrawerBody>
                    <DrawerFooter className="border-t border-white/10">
                      <Button color="danger" variant="light" onPress={onClose}>
                        Cerrar
                      </Button>
                    </DrawerFooter>
                  </>
                )}
              </DrawerContent>
            </Drawer>
        </>
    )
}

export default DrawerInfo;