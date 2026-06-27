'use client';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Spinner, Button, Card, CardBody, Input, Textarea, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/react";
import LightViewer360 from "../components/LightViewer360";
import InteractiveBlobs from "../../InteractiveBlobs.client";
import Footer from "../../web/global_components/footer/Footer";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "sonner";
import { EditIcon } from "../../web/global_components/icons/EditIcon";
import CheckIcon from "../../web/global_components/icons/CheckIcon";
import { Ban } from "../../web/global_components/icons/Ban";
import { encrypt } from "@/api/libs/crypto";

// Las peticiones usarán rutas relativas para soportar tanto localhost como producción

export default function ProyectoPresentationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        // Usamos el endpoint del visualizador que nos retorna el modelo más reciente (con background360) y datos del proyecto
        const res = await axios.get(`/api/controllers/visualizer/${id}`);
        setProjectData(res.data);
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("No se pudo cargar la información del proyecto. Por favor, verifica el enlace.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [editedUrlImage, setEditedUrlImage] = useState("");
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

  if (loading) {
    return (
      <div className="bg-[#02121B] min-h-screen flex flex-col justify-center items-center text-white">
        <Spinner size="lg" color="success" />
        <p className="mt-4 text-white/60 font-medium">Cargando presentación del proyecto...</p>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="bg-[#02121B] min-h-screen flex flex-col justify-center items-center text-white p-4">
        <Card className="max-w-md bg-white/5 border border-white/10 backdrop-blur-md">
          <CardBody className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error al cargar</h2>
            <p className="text-white/70 mb-6">{error || "Proyecto no encontrado."}</p>
            <Button as={Link} href="/" color="success" variant="flat">
              Volver al Inicio
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const { proyect, model } = projectData;

  return (
    <div className="bg-[#02121B] bg-[url(/images/op11.webp)] bg-no-repeat bg-cover overflow-hidden min-h-screen text-white relative font-sans">
      <InteractiveBlobs />
      <Toaster position="top-right" closeButton richColors theme="dark" />

      <div className="overflow-y-auto h-screen scrollbar relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <Link href="/" className="flex items-center">
              <img
                src="/logos/completo-fullblanco.png"
                alt="MyView Logo"
                className="object-cover cursor-pointer"
                width={150}
                height={150}
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
                      <img
                        src={proyect.urlImage}
                        alt={proyect.name}
                        className="w-full h-full object-cover"
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                  <span className="text-white/50 text-xs block mb-1">ÁREA TOTAL</span>
                  <span className="text-xl font-bold text-white">
                    {proyect?.areaOfThisproyect ? `${proyect.areaOfThisproyect.toLocaleString()} m²` : "N/A"}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                  <span className="text-white/50 text-xs block mb-1">UBICACIÓN</span>
                  <span className="text-xl font-bold text-white truncate block">
                    {proyect?.city}, {proyect?.department}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md col-span-2 md:col-span-1">
                  <span className="text-white/50 text-xs block mb-1">DIRECCIÓN</span>
                  <span className="text-sm font-semibold text-white/95 block truncate">
                    {proyect?.address || "No especificada"}
                  </span>
                </div>
              </div>

              {/* Documentación y Estado Legal */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-4">
                <h3 className="text-lg font-bold text-gradient">Documentación y Estado Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                    <span className="text-green-400 text-lg">📄</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Escrituración</h4>
                      <p className="text-xs text-white/60">Escrituras al día en proindiviso listas para traspaso.</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                    <span className="text-green-400 text-lg">✅</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Licencia de Construcción</h4>
                      <p className="text-xs text-white/60">Viable según el Esquema de Ordenamiento Territorial (EOT).</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3 col-span-1 md:col-span-2">
                    <span className="text-green-400 text-lg">⚡</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Servicios Públicos</h4>
                      <p className="text-xs text-white/60">Fácil conexión de energía (EPM), agua veredal y cobertura de internet.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de Terrenos / Lotes Disponibles */}
              {model?.terrains && model.terrains.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gradient">Distribución de Lotes / Terrenos</h3>
                  <Table aria-label="Tabla de terrenos del proyecto" className="dark" isHeaderSticky>
                    <TableHeader>
                      <TableColumn>NOMBRE / NÚMERO</TableColumn>
                      <TableColumn>ÁREA ESTIMADA</TableColumn>
                      <TableColumn>ESTADO</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {model.terrains.map((terrain, idx) => {
                        // Calcular área si tiene marcadores
                        let terrainArea = "N/A";
                        if (terrain.markers && terrain.markers.length >= 3) {
                          let areaVal = 0;
                          const n = terrain.markers.length;
                          for (let i = 0; i < n; i++) {
                            const j = (i + 1) % n;
                            const xi = terrain.markers[i].position[0];
                            const zi = terrain.markers[i].position[2];
                            const xj = terrain.markers[j].position[0];
                            const zj = terrain.markers[j].position[2];
                            areaVal += xi * zj - xj * zi;
                          }
                          terrainArea = `${Math.abs(areaVal / 2).toFixed(1)} m²`;
                        }
                        return (
                          <TableRow key={terrain.id || idx}>
                            <TableCell className="font-semibold text-white">{terrain.name || `Lote ${terrain.id || idx + 1}`}</TableCell>
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
                      href={`/web/views/visualizer?id=${encodeURIComponent(encrypt(id))}`}
                      className="flex-1 bg-gradient-to-r from-[#0CDBFF] to-[#00C662] text-[#02121B] font-bold hover:opacity-90 transition-opacity"
                      size="lg"
                    >
                      Ver Modelo 3D
                    </Button>
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
    </div>
  );
}
