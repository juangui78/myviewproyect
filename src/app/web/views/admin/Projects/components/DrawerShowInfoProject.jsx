"use client";
import React, { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/drawer";
import { Button, Input, Textarea, Tooltip } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";
import { EditIcon } from "@/web/global_components/icons/EditIcon";
import CheckIcon from "@/web/global_components/icons/CheckIcon";
import { Ban } from "@/web/global_components/icons/Ban";
import ChevronDoubleLeft from "@/web/global_components/icons/ChevronDoubleLeft";

const DrawerShowInfoProject = ({
  IsOpenDrawerInfoProject,
  onOpenChangeDrawerShowInfoProject,
  dataProject,
  onProjectUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    department: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    if (dataProject) {
      setForm({
        name: dataProject.name || "",
        city: dataProject.city || "",
        department: dataProject.department || "",
        address: dataProject.address || "",
        description: dataProject.description || "",
      });
      setIsEditing(false);
    }
  }, [dataProject, IsOpenDrawerInfoProject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("El nombre del proyecto es obligatorio");
      return;
    }

    try {
      setIsSaving(true);
      const res = await axios.put(`/api/controllers/proyects/${dataProject._id}`, form);
      if (res.status === 200) {
        toast.success("Proyecto actualizado correctamente");
        setIsEditing(false);
        if (onProjectUpdated) {
          onProjectUpdated(res.data);
        } else {
          // Si no hay callback, recargar para refrescar el dashboard
          setTimeout(() => {
            window.location.reload();
          }, 800);
        }
      }
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);
      toast.error("No se pudo actualizar el proyecto");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      isOpen={IsOpenDrawerInfoProject}
      onOpenChange={onOpenChangeDrawerShowInfoProject}
      placement="left"
      backdrop="blur"
      className="h-full bg-[#0D1520]/95 backdrop-blur-2xl border-r border-white/10 text-white"
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button
                    size="sm"
                    className="bg-[#0CDBFF] text-black font-bold"
                    startContent={<EditIcon className="w-4 h-4" />}
                    onPress={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-[#0CDBFF] text-black font-bold"
                      startContent={<CheckIcon className="w-4 h-4" />}
                      isLoading={isSaving}
                      onPress={handleSave}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      className="bg-white/10 text-white"
                      startContent={<Ban className="w-4 h-4" />}
                      onPress={() => {
                        setIsEditing(false);
                        setForm({
                          name: dataProject.name || "",
                          city: dataProject.city || "",
                          department: dataProject.department || "",
                          address: dataProject.address || "",
                          description: dataProject.description || "",
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              <Tooltip content="Cerrar">
                <Button isIconOnly size="sm" variant="light" onPress={onClose} className="text-white/60 hover:text-white">
                  <ChevronDoubleLeft />
                </Button>
              </Tooltip>
            </DrawerHeader>

            <DrawerBody className="p-6 overflow-y-auto scrollbar">
              {isEditing ? (
                <div className="flex flex-col gap-4">
                  <Input
                    label="Nombre del Proyecto"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    variant="bordered"
                    classNames={{
                      input: "text-white text-sm",
                      label: "text-white/70",
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Ciudad"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      variant="bordered"
                      classNames={{
                        input: "text-white text-sm",
                        label: "text-white/70",
                      }}
                    />
                    <Input
                      label="Departamento"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      variant="bordered"
                      classNames={{
                        input: "text-white text-sm",
                        label: "text-white/70",
                      }}
                    />
                  </div>

                  <Input
                    label="Dirección"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    variant="bordered"
                    classNames={{
                      input: "text-white text-sm",
                      label: "text-white/70",
                    }}
                  />

                  <Textarea
                    label="Descripción"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    variant="bordered"
                    rows={4}
                    classNames={{
                      input: "text-white text-sm",
                      label: "text-white/70",
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[11px] font-mono text-[#0CDBFF] uppercase tracking-[0.2em] font-semibold">
                      INFORMACIÓN DEL PROYECTO
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">{dataProject?.name}</h2>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Ubicación
                    </span>
                    <div className="flex items-center gap-2 text-white font-medium text-sm">
                      <svg className="w-4 h-4 text-[#0CDBFF] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        {dataProject?.city || "Sin ciudad"}
                        {dataProject?.department ? `, ${dataProject.department}` : ""}
                      </span>
                    </div>
                    {dataProject?.address && (
                      <p className="text-xs text-white/60 pl-6">{dataProject.address}</p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Descripción
                    </span>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {dataProject?.description || "Sin descripción registrada."}
                    </p>
                  </div>

                  {/* Métricas adicionales */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                      <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block">
                        Área Registrada
                      </span>
                      <span className="text-lg font-bold text-white mt-1 block">
                        {(dataProject?.areaOfThisproyect || 0).toLocaleString()} m²
                      </span>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                      <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block">
                        Estado
                      </span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="text-sm font-semibold text-white">
                          {dataProject?.state || "Activo"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerShowInfoProject;