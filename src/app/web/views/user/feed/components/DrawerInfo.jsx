import React, { useEffect, useState, useRef } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import { Tooltip, Input, Textarea, Button, Link, Avatar, AvatarGroup, Image } from "@nextui-org/react";
import { getTodoList, updateProject } from "../js/todo";
import ChevronDoubleLeft from "@/web/global_components/icons/ChevronDoubleLeft";
import { EditIcon } from "@/web/global_components/icons/EditIcon";
import CheckIcon from "@/web/global_components/icons/CheckIcon";
import { Ban } from "@/web/global_components/icons/Ban";
import { uploadProjectImageAction } from "../actions/uploadImage";
import { encrypt } from "@/api/libs/crypto";
import axios from "axios";

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
    const fileInputRef = useRef(null)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [versions, setVersions] = useState([])

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
          setData(data_)
          setEditForm({
              name: data_.name || "",
              address: data_.address || "",
              description: data_.description || ""
          })

          try {
              const versionsRes = await axios.get(`/api/controllers/models_/${_id}/allmodels`);
              if (versionsRes.status === 200 && Array.isArray(versionsRes.data)) {
                  setVersions(versionsRes.data);
              } else {
                  setVersions([]);
              }
          } catch (err) {
              console.error("Error fetching project versions:", err);
              setVersions([]);
          }
          setLoading(false)
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
            setImageFile(null)
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
                setImagePreview(null)
            }
        }
        setIsEditing(!isEditing)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            const previewUrl = URL.createObjectURL(file)
            setImagePreview(previewUrl)
        }
    }

    const handleSave = async () => {
        if (!window.confirm("¿Estás seguro de que deseas guardar los cambios?")) return

        setIsSaving(true)
        let finalEditForm = { ...editForm }

        if (imageFile) {
            const formData = new FormData()
            formData.append("image", imageFile)
            const uploadRes = await uploadProjectImageAction(_id, formData)
            if (uploadRes.success) {
                finalEditForm.urlImage = uploadRes.url
            } else {
                alert("Error al subir la imagen: " + uploadRes.message)
                setIsSaving(false)
                return
            }
        }

        const [status, updatedData] = await updateProject(_id, finalEditForm)
        
        if (status === "success") {
            setData(updatedData)
            setIsEditing(false)
            setImageFile(null)
            setImagePreview(null)
            alert("Proyecto actualizado correctamente")
            window.location.reload() 
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
                      <div className="flex w-full flex-col justify-center items-center pt-4">
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden group/img border border-white/10">
                          <Image
                            removeWrapper
                            alt="Event image"
                            className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-500"
                            src={imagePreview || data?.urlImage || "/images/parcela.jpg"}
                          />
                          {isEditing && (
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 cursor-pointer z-20"
                            >
                              <EditIcon className="w-8 h-8 text-[#0CDBFF] mb-2" />
                              <span className="text-[#0CDBFF] font-semibold text-sm">Cambiar Imagen</span>
                            </div>
                          )}
                        </div>
                        {isEditing && (
                          <>
                            <input 
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                            <Button
                              size="sm"
                              variant="light"
                              className="text-white/60 hover:text-white mt-2 text-xs"
                              onPress={() => fileInputRef.current?.click()}
                            >
                              Seleccionar nueva imagen
                            </Button>
                          </>
                        )}
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
                                <div className="mt-2 flex flex-col gap-3 text-left items-start w-full">
                                  <div className="flex flex-col mt-2 gap-1 items-start w-full text-left">
                                    <span className="text-medium text-white font-bold">Descripción</span>
                                    <p className="text-medium text-white/80 leading-relaxed">{data?.description}</p>
                                  </div>
                                  <div className="flex flex-col mt-2 gap-1 items-start w-full text-left">
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
                                  <div className="flex flex-col mt-4 gap-2 items-start w-full text-left">
                                    <span className="text-medium text-white font-bold">Versiones del Escaneo ({versions.length})</span>
                                    <div className="flex flex-col gap-2 w-full">
                                      {versions.length > 0 ? (
                                        versions.map((ver, idx) => (
                                          <div key={ver._id || idx} className="bg-white/5 p-3 rounded-[16px] border border-white/10 hover:border-cyan-500/30 flex justify-between items-center gap-4 transition-all w-full">
                                            <div className="flex flex-col gap-0.5 text-left">
                                              <p className="text-sm font-semibold text-white">{ver.name || `Versión ${versions.length - idx}`}</p>
                                              <p className="text-xs text-white/40">
                                                {ver.creation_date 
                                                  ? new Date(ver.creation_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
                                                  : "Sin fecha"}
                                              </p>
                                            </div>
                                            <Button
                                              as={Link}
                                              href={`/web/views/visualizer?id=${encrypt(_id)}&modelIndex=${idx}`}
                                              target="_blank"
                                              size="sm"
                                              className="bg-[#0CDBFF] text-black font-bold hover:bg-cyan-400 min-w-0 px-4 rounded-full h-8"
                                            >
                                              Acceder
                                            </Button>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-white/50 italic">No hay escaneos disponibles.</p>
                                      )}
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