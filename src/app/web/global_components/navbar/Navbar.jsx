"use client";
import { useState, useEffect } from "react";
import {
  Navbar,
  Badge,
  NavbarMenuToggle,
  NavbarContent,
  NavbarItem,
  Link,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Image,
  NavbarMenu,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Account } from "@/web/global_components/icons/UserAccount";
import { Bell } from "@/web/global_components/icons/Bell";
import { useSession, signOut } from "next-auth/react";
import style from './styles/navbar.module.css';
import { Toaster, toast } from "sonner";
import { updateUserProfile } from "./actions/profileActions";
import { encrypt } from "@/api/libs/crypto";

export default function NavBar({children}) {
  const { data: session } = useSession();
  const idUser = session?.user._id;
  const rol = session?.user.rol;
  const isSuperadmin = session?.user?.email === "darksus78@gmail.com";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onOpenChange: onProfileOpenChange } = useDisclosure();
  const [profileName, setProfileName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("profile_info");

  useEffect(() => {
    if (session?.user) {
      setProfileName(session.user.name || "");
      setProfileLastName(session.user.lastName || "");
    }
  }, [session]);

  const handleSaveProfile = async () => {
    if (!profileName) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setIsSavingProfile(true);
    const res = await updateUserProfile({
      name: profileName,
      lastName: profileLastName,
      password: profilePassword
    });
    if (res.success) {
      toast.success(res.message);
      onProfileOpenChange(false);
      setProfilePassword("");
    } else {
      toast.error(res.message);
    }
    setIsSavingProfile(false);
  };

  useEffect(() => {
    if (session?.user) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch("/api/controllers/notifications");
          if (res.ok) {
            const data = await res.json();
            setNotifications(data);
            
            // Calcular notificaciones no leídas usando localStorage
            const seenNotifications = JSON.parse(localStorage.getItem("seenNotifications") || "[]");
            const newUnreadCount = data.filter(n => !seenNotifications.includes(n.id)).length;
            setUnreadCount(newUnreadCount);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      
      fetchNotifications();
      
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const handleDropdownOpen = (isOpen) => {
    if (isOpen && notifications.length > 0) {
      const allIds = notifications.map(n => n.id);
      localStorage.setItem("seenNotifications", JSON.stringify(allIds));
      setUnreadCount(0);
    }
  };


  return (
    <Navbar disableAnimation isBordered className={style.NavBar}>
      <NavbarContent className="sm:hidden text-white" justify="start">
          <NavbarMenuToggle />
      </NavbarContent>

      <NavbarContent className="sm:hidden" justify="start">
          <Link href="/web/views/user/feed">
            <Image src="/logos/completo-fullblanco.png" className="object-cover" alt="logo" width={150} height={150} />
          </Link>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex" justify="center">
          <Link href="/web/views/user/feed">
            <Image className="object-cover" src="/logos/completo-fullblanco.png" alt="logo" width={150} height={65} />
          </Link>
          
        {isSuperadmin && (
          <>
            <NavbarItem>
              <Link className="text-white hover:text-[#0CDBFF] font-bold" href="/web/views/superadmin/dashboard">
                Superadmin
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className="text-white" href="/web/views/admin/leads">
                Prospectos
              </Link>
            </NavbarItem>
          </>
        )}
          
        {rol === "company" ? ( 
          <>
          {/* company => this is my view */}     
            <NavbarItem>
              <Link className="text-white" href="/web/views/admin/allCompanies">
              Inmobiliarias
              </Link>
            </NavbarItem>
            {!isSuperadmin && (
              <NavbarItem>
                <Link className="text-white" href="/web/views/admin/analytics">
                  Analiticas
                </Link>
              </NavbarItem>
            )}
            {!isSuperadmin && (
              <NavbarItem>
                <Link className="text-white" href="/web/views/admin/leads">
                  Prospectos
                </Link>
              </NavbarItem>
            )}
          </>
        ) :

        rol == "admin" ? (
          <>
          {/* admin => user  */}
            <NavbarItem>
              <Link className="text-white" href="/web/views/user/feed">
                Inicio
              </Link>
            </NavbarItem>

            <NavbarItem>
              <Link className="text-white" href={`/web/views/admin/Projects?id=${session?.user?.id_company ? encrypt(session.user.id_company) : ""}&name=Dashboard`}>
                Dashboard
              </Link>
            </NavbarItem>
            {!isSuperadmin && (
              <NavbarItem>
                <Link className="text-white" href="/web/views/admin/leads">
                  Prospectos
                </Link>
              </NavbarItem>
            )}   
          </>
        ) : null
        }
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Popover 
            placement="bottom-end" 
            onOpenChange={handleDropdownOpen}
            classNames={{
              content: "max-h-[380px] overflow-y-auto w-[320px] bg-[#1A1F26]/95 backdrop-blur-xl border border-white/10 p-0 text-white rounded-xl shadow-2xl"
            }}
          >
            <PopoverTrigger>
              <button className="flex gap-4 items-center justify-center p-2 focus:outline-none cursor-pointer bg-transparent border-0 select-none">
                {unreadCount > 0 ? (
                  <Badge color="danger" content={unreadCount} shape="circle" size="sm">
                    <Bell className="cursor-pointer text-white" />
                  </Badge>
                ) : (
                  <Bell className="cursor-pointer text-white" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="w-full flex flex-col p-3">
                <div className="border-b border-white/10 pb-2 mb-2 w-full text-center">
                  <span className="font-bold text-sm text-[#0CDBFF] uppercase tracking-wider block">
                    Notificaciones
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 w-full max-h-[290px] overflow-y-auto scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <Link 
                        key={notif.id} 
                        href={`/proyectos/${notif.projectId}`}
                        className="py-2 px-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all text-white flex flex-col gap-1 text-left rounded-lg w-full"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-xs text-[#0CDBFF] truncate max-w-[170px] uppercase tracking-wider">
                            {notif.projectName}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {new Date(notif.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-medium text-white/60 mb-0.5">
                            {notif.label}
                          </span>
                          <span className="font-bold text-xs text-white">
                            {notif.modelName}
                          </span>
                        </div>
                        {notif.versionNotes && (
                          <p className="text-[11px] text-white/70 line-clamp-2 italic bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
                            &quot;{notif.versionNotes}&quot;
                          </p>
                        )}
                      </Link>
                    ))
                  ) : (
                    <p className="font-semibold text-center py-4 text-white/60 text-sm">
                      No hay notificaciones
                    </p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </NavbarItem>

        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                size="sm"
                fullback = {
                  < Account />
                }
              />
             
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Sesion Iniciada como </p>
                <p className="font-semibold">{session?.user?.email}</p>
              </DropdownItem>
              <DropdownItem key="configurations" onClick={onProfileOpen}>Configuración</DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={() => signOut()}>
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem> 
      </NavbarContent>

      {/* menu when its a small screen, often a mobile's screen */}
      <NavbarMenu>
        {isSuperadmin && (
          <>
            <NavbarItem>
              <Link className="text-[#0CDBFF] font-bold" href="/web/views/superadmin/dashboard">
                Superadmin
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className="text-white" href="/web/views/admin/leads">
                Prospectos
              </Link>
            </NavbarItem>
          </>
        )}
                
        {rol === "company" ? (
          <>
            <NavbarItem>
              <Link className="text-white" href="/web/views/admin/allCompanies">
                Inmobiliarias
              </Link>
            </NavbarItem>
            {!isSuperadmin && (
              <NavbarItem>
                <Link className="text-white" href="/web/views/admin/analytics">
                  Analiticas
                </Link>
              </NavbarItem>
            )}
            {!isSuperadmin && (
              <NavbarItem>
                <Link className="text-white" href="/web/views/admin/leads">
                  Prospectos
                </Link>
              </NavbarItem>
            )}
          </>
        ) :

        rol == "admin" ? (
          <>
            <NavbarItem>
              <Link className="text-white"  href="/web/views/user/feed">
                Inicio
              </Link>
            </NavbarItem>

            <NavbarItem>
              <Link className="text-white" href={`/web/views/admin/Projects?id=${session?.user?.id_company ? encrypt(session.user.id_company) : ""}&name=Dashboard`}>
                Dashboard
              </Link>
            </NavbarItem>
            {!isSuperadmin && (
              <NavbarItem>
                <Link className="text-white" href="/web/views/admin/leads">
                  Prospectos
                </Link>
              </NavbarItem>
            )}   
          </>
        ) : null
        }
      </NavbarMenu>

      {/* MODAL CONFIGURACION DE PERFIL */}
      <Modal 
        isOpen={isProfileOpen} 
        onOpenChange={onProfileOpenChange}
        placement="center"
        backdrop="blur"
        size="3xl"
        classNames={{
          content: "bg-[#0B151F] border border-white/10 text-white rounded-2xl overflow-hidden",
          header: "border-b border-white/10 py-4 px-6",
          footer: "border-t border-white/10 py-3 px-6"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Configuración del Sistema</ModalHeader>
              <ModalBody className="flex flex-row p-0 min-h-[380px] overflow-hidden">
                {/* Sidebar Izquierdo */}
                <div className="w-1/3 border-r border-white/10 p-4 flex flex-col gap-1 bg-black/20">
                  <div
                    onClick={() => setActiveTab("profile_info")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-xs md:text-sm font-medium ${
                      activeTab === "profile_info"
                        ? "bg-[#0CDBFF]/15 text-[#0CDBFF] font-bold"
                        : "hover:bg-white/5 text-white/70 hover:text-white"
                    }`}
                  >
                    <span>👤</span>
                    <span>Mi Perfil</span>
                  </div>

                  <div
                    onClick={() => setActiveTab("credentials")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-xs md:text-sm font-medium ${
                      activeTab === "credentials"
                        ? "bg-[#0CDBFF]/15 text-[#0CDBFF] font-bold"
                        : "hover:bg-white/5 text-white/70 hover:text-white"
                    }`}
                  >
                    <span>🔑</span>
                    <span>Credenciales</span>
                  </div>

                  <div
                    onClick={() => setActiveTab("notifications")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-xs md:text-sm font-medium ${
                      activeTab === "notifications"
                        ? "bg-[#0CDBFF]/15 text-[#0CDBFF] font-bold"
                        : "hover:bg-white/5 text-white/70 hover:text-white"
                    }`}
                  >
                    <span>🔔</span>
                    <span>Notificaciones</span>
                  </div>

                  <div
                    onClick={() => setActiveTab("appearance")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-xs md:text-sm font-medium ${
                      activeTab === "appearance"
                        ? "bg-[#0CDBFF]/15 text-[#0CDBFF] font-bold"
                        : "hover:bg-white/5 text-white/70 hover:text-white"
                    }`}
                  >
                    <span>🎨</span>
                    <span>Apariencia</span>
                  </div>
                </div>

                {/* Contenido Derecho */}
                <div className="w-2/3 p-6 overflow-y-auto max-h-[420px]">
                  {activeTab === "credentials" && (
                    <div className="flex flex-col gap-5">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">Seguridad y Credenciales</h4>
                        <p className="text-xs text-white/50">Edita tus credenciales de inicio de sesión.</p>
                      </div>
                      <Input
                        label="Nombre"
                        placeholder="Tu nombre"
                        labelPlacement="outside"
                        variant="bordered"
                        value={profileName}
                        onValueChange={setProfileName}
                        isRequired
                        className="text-white"
                      />
                      <Input
                        label="Apellido"
                        placeholder="Tu apellido"
                        labelPlacement="outside"
                        variant="bordered"
                        value={profileLastName}
                        onValueChange={setProfileLastName}
                        className="text-white"
                      />
                      <Input
                        label="Nueva Contraseña"
                        placeholder="Mínimo 6 caracteres (Opcional)"
                        type="password"
                        labelPlacement="outside"
                        variant="bordered"
                        value={profilePassword}
                        onValueChange={setProfilePassword}
                        className="text-white"
                      />
                      <Input
                        label="Correo Electrónico (No editable)"
                        value={session?.user?.email || ""}
                        labelPlacement="outside"
                        variant="bordered"
                        isDisabled
                        className="text-white opacity-60"
                      />
                    </div>
                  )}

                  {activeTab === "profile_info" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">Información de Cuenta</h4>
                        <p className="text-xs text-white/50">Resumen y detalles de perfil de usuario.</p>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <Avatar
                          src={session?.user?.image || ""}
                          className="w-16 h-16 text-large border-2 border-[#0CDBFF]"
                          name={profileName}
                        />
                        <div>
                          <p className="font-bold text-white capitalize">{profileName} {profileLastName}</p>
                          <p className="text-xs text-white/40">{session?.user?.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-white/40 text-[10px] block uppercase font-bold">Rol de Acceso</span>
                          <span className="text-sm font-semibold text-white capitalize">{rol || "User"}</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-white/40 text-[10px] block uppercase font-bold">Plan Suscrito</span>
                          <span className="text-sm font-semibold text-white uppercase">{session?.user?.plan || "Básico"}</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl col-span-2">
                          <span className="text-white/40 text-[10px] block uppercase font-bold">Identificación de Empresa</span>
                          <span className="text-xs font-mono text-white/80">{session?.user?.id_company || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "notifications" && (
                    <div className="flex flex-col gap-5">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">Alertas y Notificaciones</h4>
                        <p className="text-xs text-white/50">Configura los canales y frecuencias de tus notificaciones.</p>
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                          <input type="checkbox" defaultChecked className="mt-1 accent-[#0CDBFF]" />
                          <div>
                            <span className="text-sm font-bold text-white block">Notificaciones por Correo</span>
                            <span className="text-xs text-white/60">Recibe correos con el resumen semanal y actualizaciones del sistema.</span>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                          <input type="checkbox" defaultChecked className="mt-1 accent-[#0CDBFF]" />
                          <div>
                            <span className="text-sm font-bold text-white block">Alertas de Comentarios</span>
                            <span className="text-xs text-white/60">Notificarme inmediatamente cuando un cliente agregue notas en un modelo 3D.</span>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                          <input type="checkbox" className="mt-1 accent-[#0CDBFF]" />
                          <div>
                            <span className="text-sm font-bold text-white block">Ofertas y boletines</span>
                            <span className="text-xs text-white/60">Mantente al día con nuevas plantillas, renders e innovaciones.</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeTab === "appearance" && (
                    <div className="flex flex-col gap-5">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">Personalización de Apariencia</h4>
                        <p className="text-xs text-white/50">Ajusta la apariencia visual del portal.</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <div>
                            <span className="text-sm font-bold text-white block">Tema del Sistema</span>
                            <span className="text-xs text-white/60">Tema de colores preferido.</span>
                          </div>
                          <select className="bg-[#12202E] border border-white/20 text-white rounded-lg p-1.5 text-xs font-semibold focus:outline-none">
                            <option>Tema Oscuro (Recomendado)</option>
                            <option>Tema Claro</option>
                            <option>Seguir Sistema</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <div>
                            <span className="text-sm font-bold text-white block">Densidad de Interfaz</span>
                            <span className="text-xs text-white/60">Tamaño y espaciado de controles.</span>
                          </div>
                          <select className="bg-[#12202E] border border-white/20 text-white rounded-lg p-1.5 text-xs font-semibold focus:outline-none">
                            <option>Cómodo</option>
                            <option>Compacto</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <div>
                            <span className="text-sm font-bold text-white block">Calidad de Render en 3D</span>
                            <span className="text-xs text-white/60">Configuración por defecto del visor web.</span>
                          </div>
                          <select className="bg-[#12202E] border border-white/20 text-white rounded-lg p-1.5 text-xs font-semibold focus:outline-none">
                            <option>Alta fidelidad (Texturas HD)</option>
                            <option>Máximo rendimiento</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                {activeTab === "credentials" ? (
                  <Button color="primary" onPress={handleSaveProfile} isLoading={isSavingProfile}>
                    Guardar Cambios
                  </Button>
                ) : (
                  <Button color="success" className="text-white font-bold" onPress={onClose}>
                    Listo
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Toaster richColors position="top-right" />
    </Navbar>
  );
}
