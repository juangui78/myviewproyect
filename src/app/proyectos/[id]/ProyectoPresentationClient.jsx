"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import dynamic from "next/dynamic";
import axios from "axios";
import { 
  Spinner, Button, Card, CardBody, Input, Textarea, 
  Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, 
  Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter 
} from "@heroui/react";
import { createLead } from "./actions/leadActions";
import InteractiveBlobs from "../../InteractiveBlobs.client";
import Footer from "../../web/global_components/footer/Footer";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "sonner";
import { EditIcon } from "../../web/global_components/icons/EditIcon";
import CheckIcon from "../../web/global_components/icons/CheckIcon";
import { Ban } from "../../web/global_components/icons/Ban";
import { encrypt } from "@/api/libs/crypto";

const LightViewer360 = dynamic(() => import("../components/LightViewer360"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-[450px] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 glass-card">
      <Spinner color="primary" size="lg" />
    </div>
  )
});

export default function ProyectoPresentationClient({ initialProjectData, id }) {
  const [projectData, setProjectData] = useState(initialProjectData);
  const [selectedTerrain, setSelectedTerrain] = useState(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadContextTerrain, setLeadContextTerrain] = useState(null);
  const [countryCode, setCountryCode] = useState("+57");

  const encryptedId = useMemo(() => (id ? encrypt(id) : ""), [id]);

  const terrainAreasMap = useMemo(() => {
    const map = {};
    if (projectData?.model?.terrains) {
      projectData.model.terrains.forEach((t, idx) => {
        const key = t.id || idx;
        if (t.markers && t.markers.length >= 3) {
          let aVal = 0;
          const n = t.markers.length;
          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const xi = t.markers[i].position[0];
            const zi = t.markers[i].position[2];
            const xj = t.markers[j].position[0];
            const zj = t.markers[j].position[2];
            aVal += xi * zj - xj * zi;
          }
          map[key] = `${Math.abs(aVal / 2).toFixed(1)} m²`;
        } else {
          map[key] = "N/A";
        }
      });
    }
    return map;
  }, [projectData?.model?.terrains]);

  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(initialProjectData?.proyect?.name || "");
  const [editedDesc, setEditedDesc] = useState(initialProjectData?.proyect?.description || "");
  const [editedAddress, setEditedAddress] = useState(initialProjectData?.proyect?.address || "");
  const [editedUrlImage, setEditedUrlImage] = useState(initialProjectData?.proyect?.urlImage || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (projectData?.proyect) {
      setEditedName(projectData.proyect.name || "");
      setEditedDesc(projectData.proyect.description || "");
      setEditedAddress(projectData.proyect.address || "");
      setEditedUrlImage(projectData.proyect.urlImage || "");
    }
  }, [projectData]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(`/api/controllers/proyects/${id}`, {
        name: editedName,
        description: editedDesc,
        address: editedAddress,
        urlImage: editedUrlImage
      });

      if (response.status === 200) {
        toast.success("Información del proyecto actualizada correctamente");
        setProjectData(prev => ({
          ...prev,
          proyect: {
            ...prev.proyect,
            name: editedName,
            description: editedDesc,
            address: editedAddress,
            urlImage: editedUrlImage
          }
        }));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error("Error al actualizar la información del proyecto");
    } finally {
      setIsSaving(false);
    }
  };

  if (!projectData || !projectData.proyect) {
    return (
      <div className="bg-[#02121B] min-h-screen flex flex-col justify-center items-center text-white p-4">
        <InteractiveBlobs />
        <Card className="max-w-md bg-white/5 border border-white/10 backdrop-blur-md relative z-10">
          <CardBody className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Proyecto no encontrado</h2>
            <p className="text-white/70 mb-6">El proyecto que buscas no está disponible o fue eliminado.</p>
            <div className="flex gap-3 justify-center">
              <Button as={Link} href="/web/views/user/feed" color="primary" variant="flat" className="text-white">
                Volver al Feed
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const { proyect, model } = projectData;

  const handleOpenLeadModal = (terrainContext = null) => {
    setLeadContextTerrain(terrainContext);
    if (terrainContext) {
      setLeadMessage(`Hola, estoy interesado en obtener más información sobre el lote "${terrainContext.name || `Lote ${terrainContext.id}`}" del proyecto "${proyect?.name}".`);
    } else {
      setLeadMessage(`Hola, estoy interesado en obtener más información sobre el proyecto "${proyect?.name}".`);
    }
    setIsLeadModalOpen(true);
  };

  const handleSendLead = async () => {
    if (!leadName || !leadEmail || !leadPhone) {
      toast.error("Por favor, completa los campos Nombre, Correo y Teléfono.");
      return;
    }
    setIsSubmittingLead(true);
    try {
      let finalPhone = leadPhone.trim().replace(/\s+/g, "");
      const numericCountryCode = countryCode.replace("+", "");
      if (finalPhone.startsWith("+")) {
        // Keep as typed
      } else if (finalPhone.startsWith(numericCountryCode)) {
        finalPhone = `+${finalPhone}`;
      } else {
        finalPhone = `${countryCode} ${finalPhone}`;
      }

      const res = await createLead({
        name: leadName,
        email: leadEmail,
        phone: finalPhone,
        message: leadMessage,
        idProyect: id,
        idCompany: proyect?.idCompany?._id || proyect?.idCompany,
        terrainId: leadContextTerrain?.id || null,
        terrainName: leadContextTerrain?.name || null
      });
      if (res.success) {
        toast.success(res.message);
        setIsLeadModalOpen(false);
        setLeadName("");
        setLeadEmail("");
        setLeadPhone("");
        setLeadMessage("");
        setLeadContextTerrain(null);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error("Error submitting lead:", err);
      toast.error("Error al registrar tus datos de contacto.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="bg-[#02121B] bg-[url(/images/op11.webp)] bg-no-repeat bg-cover overflow-hidden min-h-screen text-white relative font-sans">
      <InteractiveBlobs />
      <Toaster position="top-right" closeButton richColors theme="dark" />

      <div className="overflow-y-auto h-screen scrollbar relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <Link href="/" className="flex items-center">
              <NextImage
                src="/logos/completo-fullblanco.png"
                alt="MyView Logo"
                className="object-contain cursor-pointer"
                width={150}
                height={48}
                priority
              />
            </Link>
            <div className="flex items-center gap-3">
              {session && !isEditing && (
                <Button
                  onPress={() => setIsEditing(true)}
                  color="warning"
                  variant="flat"
                  startContent={<EditIcon className="w-4 h-4" />}
                >
                  Editar Info
                </Button>
              )}
              {session ? (
                <Button as={Link} href="/web/views/user/feed" variant="light" className="text-white/80 hover:text-white">
                  Feed
                </Button>
              ) : (
                <Button as={Link} href="/" variant="light" className="text-white/80 hover:text-white">
                  Inicio
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: Basic Info & Image */}
            <div className="lg:col-span-7 space-y-6">
              {isEditing ? (
                <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                  <h3 className="text-lg font-bold text-gradient">Editar información del proyecto</h3>
                  <Input
                    label="Nombre del Proyecto"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    variant="bordered"
                    className="text-white"
                  />
                  <Textarea
                    label="Descripción"
                    value={editedDesc}
                    onChange={(e) => setEditedDesc(e.target.value)}
                    variant="bordered"
                    minRows={4}
                    className="text-white"
                  />
                  <Input
                    label="Dirección"
                    value={editedAddress}
                    onChange={(e) => setEditedAddress(e.target.value)}
                    variant="bordered"
                    className="text-white"
                  />
                  <Input
                    label="URL de Imagen de Portada"
                    value={editedUrlImage}
                    onChange={(e) => setEditedUrlImage(e.target.value)}
                    variant="bordered"
                    className="text-white"
                  />
                  <div className="flex gap-3 justify-end pt-2">
                    <Button 
                      variant="flat" 
                      className="bg-white/10 text-white" 
                      startContent={<Ban className="w-4 h-4" />}
                      onPress={() => {
                        setIsEditing(false);
                        if (projectData?.proyect) {
                          setEditedName(projectData.proyect.name || "");
                          setEditedDesc(projectData.proyect.description || "");
                          setEditedAddress(projectData.proyect.address || "");
                          setEditedUrlImage(projectData.proyect.urlImage || "");
                        }
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      color="success"
                      className="font-bold"
                      startContent={<CheckIcon className="w-4 h-4" />}
                      onPress={handleSaveChanges}
                      isLoading={isSaving}
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {proyect?.urlImage && (
                    <div className="relative w-full h-[250px] md:h-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                      <NextImage
                        src={proyect.urlImage}
                        alt={proyect.name || "Proyecto"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#02121B] via-transparent to-transparent" />
                    </div>
                  )}

                  <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-4">
                      {proyect?.name}
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed whitespace-pre-line">
                      {proyect?.description}
                    </p>
                  </div>
                </>
              )}

              {/* Stats / Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-center">
                  <span className="text-white/50 text-xs block mb-1">ÁREA TOTAL</span>
                  <span className="text-lg md:text-xl font-bold text-white block break-words">
                    {proyect?.areaOfThisproyect ? `${proyect.areaOfThisproyect.toLocaleString()} m²` : "N/A"}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-center">
                  <span className="text-white/50 text-xs block mb-1">UBICACIÓN</span>
                  <span className="text-lg md:text-xl font-bold text-white block break-words leading-tight">
                    {proyect?.city}{proyect?.department ? `, ${proyect.department}` : ''}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md sm:col-span-2 md:col-span-1 flex flex-col justify-center">
                  <span className="text-white/50 text-xs block mb-1">DIRECCIÓN</span>
                  <span className="text-sm md:text-base font-semibold text-white/95 block break-words leading-snug">
                    {proyect?.address || "No especificada"}
                  </span>
                </div>
              </div>

              {/* Documentación y Estado Legal */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-4">
                <h3 className="text-lg font-bold text-gradient">Documentación y Estado Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Escrituración</h4>
                      <p className="text-xs text-white/60">Escrituras al día en proindiviso listas para traspaso.</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Licencia de Construcción</h4>
                      <p className="text-xs text-white/60">Viable según el Esquema de Ordenamiento Territorial (EOT).</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3 col-span-1 md:col-span-2">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Servicios Públicos</h4>
                      <p className="text-xs text-white/60">Fácil conexión de energía, agua veredal y cobertura de telecomunicaciones.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de Terrenos / Lotes Disponibles */}
              {model?.terrains && model.terrains.length > 0 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gradient">Distribución de Lotes / Terrenos</h3>
                    <p className="text-xs text-white/50">Selecciona un lote de la lista para ver sus detalles específicos.</p>
                  </div>
                  <Table aria-label="Tabla de terrenos del proyecto" className="dark" isHeaderSticky>
                    <TableHeader>
                      <TableColumn>NOMBRE / NÚMERO</TableColumn>
                      <TableColumn>ÁREA ESTIMADA</TableColumn>
                      <TableColumn>ESTADO</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {model.terrains.map((terrain, idx) => {
                        const terrainArea = terrainAreasMap[terrain.id || idx] || "N/A";
                        const isSelected = selectedTerrain?.id === terrain.id;
                        return (
                          <TableRow 
                            key={terrain.id || idx} 
                            className={`cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? "bg-[#0CDBFF]/15 border-l-4 border-l-[#0CDBFF] font-bold" 
                                : "hover:bg-white/5"
                            }`}
                            onClick={() => setSelectedTerrain(isSelected ? null : terrain)}
                          >
                            <TableCell className="font-semibold text-white">
                              {terrain.name || `Lote ${terrain.id || idx + 1}`}
                            </TableCell>
                            <TableCell className="text-white/80">{terrainArea}</TableCell>
                            <TableCell>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Disponible
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Panel de detalles del terreno seleccionado */}
                  {selectedTerrain && (
                    <div className="p-6 rounded-2xl border border-[#0CDBFF]/30 bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 backdrop-blur-md shadow-2xl transition-all duration-300 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <Chip color="success" size="sm" variant="flat" className="mb-2 font-semibold">
                            Lote Seleccionado
                          </Chip>
                          <h4 className="text-2xl font-black text-white">
                            {selectedTerrain.name || `Lote ${selectedTerrain.id}`}
                          </h4>
                        </div>
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="light" 
                          className="text-white/60 hover:text-white"
                          onPress={() => setSelectedTerrain(null)}
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Lado izquierdo: Foto */}
                        <div className="md:col-span-5 relative w-full h-[180px] rounded-xl overflow-hidden border border-white/10 shadow-lg">
                          <NextImage
                            src={selectedTerrain.urlImage || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"}
                            alt={selectedTerrain.name || `Lote ${selectedTerrain.id}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 bg-[#02121B]/80 px-3 py-1 rounded-lg border border-white/10">
                            <span className="text-xs font-bold text-[#0CDBFF]">
                              Área: {terrainAreasMap[selectedTerrain.id] || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Lado derecho: Info & CTA */}
                        <div className="md:col-span-7 space-y-4">
                          <p className="text-white/85 text-sm leading-relaxed">
                            {selectedTerrain.description || "Lote campestre con topografía ideal y ubicación privilegiada dentro del proyecto. Perfecto para edificación residencial con amplias zonas verdes y excelente orientación solar."}
                          </p>
                          
                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                              as={Link}
                              href={`/web/views/visualizer?id=${encodeURIComponent(encryptedId)}&terrainId=${selectedTerrain.id}`}
                              className="w-full sm:flex-1 bg-gradient-to-r from-[#0CDBFF] to-[#00C662] text-[#02121B] font-bold hover:opacity-90 transition-opacity"
                              size="md"
                            >
                              Ver en Modelo 3D
                            </Button>
                            <Button
                              onPress={() => handleOpenLeadModal(selectedTerrain)}
                              className="w-full sm:flex-1 bg-[#0CDBFF]/20 hover:bg-[#0CDBFF]/30 text-[#0CDBFF] font-bold border border-[#0CDBFF]/40 transition-colors"
                              size="md"
                            >
                              Me Interesa
                            </Button>
                            {proyect?.idCompany?.cell && (
                              <Button
                                as="a"
                                href={`https://wa.me/${proyect.idCompany.cell.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, estoy interesado en obtener más información sobre el lote "${selectedTerrain.name || `Lote ${selectedTerrain.id}`}" del proyecto "${proyect.name}"`)}`}
                                target="_blank"
                                className="w-full sm:flex-1 bg-white/10 hover:bg-white/15 text-white font-bold"
                                size="md"
                              >
                                WhatsApp
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Visor 360 & CTA */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Visor 360 si hay background360 configurado */}
              {model?.background360 ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white/90">Vista panorámica interactiva</h3>
                  <LightViewer360 url={model.background360} />
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-center">
                  <p className="text-white/60 mb-2">Vista panorámica 360° no disponible</p>
                  <p className="text-xs text-white/40">Este proyecto solo cuenta con el visualizador 3D.</p>
                </div>
              )}

              {/* CTA card */}
              <Card className="bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden">
                <CardBody className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-white">Explora en 3D interactivo</h3>
                  <p className="text-white/70 text-sm">
                    Ingresa a la experiencia tridimensional interactiva completa. Podrás medir distancias, simular áreas, cambiar terrenos y ver el diseño en tiempo real.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      as={Link}
                      href={`/web/views/visualizer?id=${encodeURIComponent(encryptedId)}`}
                      className="w-full bg-gradient-to-r from-[#0CDBFF] to-[#00C662] text-[#02121B] font-bold hover:opacity-90 transition-opacity"
                      size="lg"
                    >
                      Ver Modelo 3D
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Contact card */}
              <Card className="bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden">
                <CardBody className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-white">¿Te interesa este proyecto?</h3>
                  <p className="text-white/70 text-sm">
                    Ponte en contacto con nuestro equipo de asesores de {proyect?.idCompany?.name ? <strong>{proyect.idCompany.name}</strong> : "la inmobiliaria"} para obtener más detalles, agendar una visita o resolver tus dudas.
                  </p>
                  
                  <div className="flex flex-col gap-3 pt-1">
                    <Button
                      onPress={() => handleOpenLeadModal(null)}
                      className="w-full bg-gradient-to-r from-[#0CDBFF] to-[#00C662] text-[#02121B] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      size="md"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Estoy Interesado
                    </Button>
                    {proyect?.idCompany?.cell && (
                      <Button
                        as="a"
                        href={`https://wa.me/${proyect.idCompany.cell.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, estoy interesado en obtener más información sobre el proyecto/terreno "${proyect.name}" que vi en MyView.`)}`}
                        target="_blank"
                        className="w-full bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 font-bold hover:bg-[#25D366]/20 transition-all flex items-center justify-center gap-2"
                        size="md"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Contactar por WhatsApp
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Google Maps / Ubicación Geográfica */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white/90">Ubicación Geográfica</h3>
                <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-white/10 glass-card">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      `${proyect?.address || ""}, ${proyect?.city || ""}, ${proyect?.department || ""}`
                    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              </div>
            </div>

          </div>
          
          <Footer />
        </div>
      </div>

      {/* MODAL DE CAPTURA DE LEADS (Estoy Interesado) */}
      <Modal 
        isOpen={isLeadModalOpen} 
        onOpenChange={setIsLeadModalOpen}
        placement="center"
        backdrop="blur"
        classNames={{
          content: "bg-[#0B151F] border border-white/10 text-white max-w-md rounded-2xl overflow-hidden relative",
          header: "border-b border-white/10 py-4 px-6",
          footer: "border-t border-white/10 py-3 px-6",
          closeButton: "absolute right-4 top-4 hover:bg-white/10 transition-colors p-1 rounded-lg text-white/70 hover:text-white"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Solicitar Información
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4 py-6">
                <p className="text-xs text-white/60 mb-2">
                  Déjanos tus datos de contacto y un asesor de ventas se comunicará contigo lo antes posible para brindarte una atención personalizada.
                </p>
                {leadContextTerrain && (
                  <div className="p-3 bg-[#0CDBFF]/10 border border-[#0CDBFF]/25 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-[#0CDBFF] uppercase block font-bold">Lote de Interés</span>
                      <span className="text-sm font-bold text-white">
                        {leadContextTerrain.name || `Lote ${leadContextTerrain.id}`}
                      </span>
                    </div>
                    <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      Área Estimada: {terrainAreasMap[leadContextTerrain.id] || "N/A"}
                    </span>
                  </div>
                )}
                <Input
                  label="Nombre Completo"
                  placeholder="Ej. Juan Pérez"
                  labelPlacement="outside"
                  variant="bordered"
                  value={leadName}
                  onValueChange={setLeadName}
                  isRequired
                  className="text-white"
                />
                <Input
                  label="Correo Electrónico"
                  placeholder="Ej. juan@correo.com"
                  type="email"
                  labelPlacement="outside"
                  variant="bordered"
                  value={leadEmail}
                  onValueChange={setLeadEmail}
                  isRequired
                  className="text-white"
                />
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white font-semibold">Teléfono / Celular <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-[110px] h-10 px-2 bg-[#12202E] border border-white/20 text-white rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+507">🇵🇦 +507</option>
                      <option value="+58">🇻🇪 +58</option>
                      <option value="+593">🇪🇨 +593</option>
                      <option value="+51">🇵🇪 +51</option>
                    </select>
                    <Input
                      placeholder="300 123 4567"
                      type="tel"
                      variant="bordered"
                      value={leadPhone}
                      onValueChange={setLeadPhone}
                      isRequired
                      className="flex-1 text-white"
                    />
                  </div>
                </div>
                <Textarea
                  label="Mensaje"
                  placeholder="Escribe tus dudas o comentarios aquí..."
                  labelPlacement="outside"
                  variant="bordered"
                  value={leadMessage}
                  onValueChange={setLeadMessage}
                  minRows={3}
                  className="text-white"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-gradient-to-r from-[#0CDBFF] to-[#00C662] text-[#02121B] font-bold" 
                  onPress={handleSendLead} 
                  isLoading={isSubmittingLead}
                >
                  Enviar Información
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
