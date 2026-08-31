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
import { Bell } from "@/web/global_components/icons/Bell";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import style from './styles/navbar.module.css';
import { Toaster, toast } from "sonner";
import { updateUserProfile } from "./actions/profileActions";
import { encrypt } from "@/api/libs/crypto";

export default function NavBar({children}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const idUser = session?.user._id;
  const rol = session?.user.rol;
  const isSuperadmin = session?.user?.email === "darksus78@gmail.com";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isLinkActive = (path) => {
    if (!pathname) return false;
    if (path === "/web/views/user/feed") {
      return pathname === "/web/views/user/feed" || pathname.startsWith("/proyectos");
    }
    return pathname.startsWith(path);
  };

  const getLinkClasses = (path) => {
    const active = isLinkActive(path);
    return active
      ? "bg-white/[0.08] text-[#0CDBFF] font-semibold px-3 py-1.5 rounded-xl border border-[#0CDBFF]/30 shadow-[0_0_15px_rgba(12,219,255,0.12)] transition-all text-sm"
      : "text-white/70 hover:text-white hover:bg-white/[0.04] px-3 py-1.5 rounded-xl transition-all text-sm font-medium";
  };

  const renderRoleBadge = () => {
    if (isSuperadmin) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-[#0CDBFF] border border-[#0CDBFF]/30 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0CDBFF] animate-pulse" />
          Superadmin
        </span>
      );
    }
    if (rol === "company") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Empresa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/5 text-white/80 border border-white/10 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
        Admin
      </span>
    );
  };

  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onOpenChange: onProfileOpenChange } = useDisclosure();
  const [profileName, setProfileName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("profile_info");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfileName(session.user.name || "");
      setProfileLastName(session.user.lastName || "");
    }
  }, [session]);

  const handleUpdateProfile = async () => {
    if (profilePassword && profilePassword !== profileConfirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setIsUpdatingProfile(true);
    const result = await updateUserProfile(idUser, {
      name: profileName,
      lastName: profileLastName,
      password: profilePassword || undefined
    });
    setIsUpdatingProfile(false);
    if (result.success) {
      toast.success(result.message);
      onProfileOpenChange(false);
    } else {
      toast.error(result.message);
    }
  };

  const [seenIds, setSeenIds] = useState([]);

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Reciente";
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  useEffect(() => {
    if (session?.user) {
      const fetchNotifications = async () => {
        try {
          const res = await axios.get("/api/controllers/notifications");
          if (res.status === 200) {
            setNotifications(res.data);
            const savedSeen = JSON.parse(localStorage.getItem("seenNotifications") || "[]");
            setSeenIds(savedSeen);
            const unread = res.data.filter(n => !savedSeen.includes(n.id)).length;
            setUnreadCount(unread);
          }
        } catch (error) {
          console.error("Error fetching notifications", error);
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
      setSeenIds(allIds);
      setUnreadCount(0);
    }
  };

  const handleMarkAllAsRead = (e) => {
    e?.stopPropagation?.();
    if (notifications.length > 0) {
      const allIds = notifications.map(n => n.id);
      localStorage.setItem("seenNotifications", JSON.stringify(allIds));
      setSeenIds(allIds);
      setUnreadCount(0);
    }
  };


  const firstName = session?.user?.name ? session.user.name.trim().split(" ")[0] : "Usuario";

  return (
    <Navbar disableAnimation isBordered className={style.NavBar}>
      <NavbarContent className="sm:hidden text-white" justify="start">
          <NavbarMenuToggle />
      </NavbarContent>

      <NavbarContent className="sm:hidden" justify="start">
          <Link href="/web/views/user/feed">
            <Image src="/logos/completo-fullblanco.png" className="object-cover" alt="logo" width={130} height={130} />
          </Link>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-2" justify="center">
        <Link href="/web/views/user/feed" className="mr-3">
          <Image className="object-cover" src="/logos/completo-fullblanco.png" alt="logo" width={140} height={60} />
        </Link>
          
        {isSuperadmin ? (
          <>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/superadmin/dashboard")} href="/web/views/superadmin/dashboard">
                Superadmin
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/user/feed")} href="/web/views/user/feed">
                Proyectos
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/allCompanies")} href="/web/views/admin/allCompanies">
                Inmobiliarias
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/leads")} href="/web/views/admin/leads">
                Prospectos
              </Link>
            </NavbarItem>
          </>
        ) : rol === "company" ? ( 
          <>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/user/feed")} href="/web/views/user/feed">
                Proyectos
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/allCompanies")} href="/web/views/admin/allCompanies">
                Inmobiliarias
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/analytics")} href="/web/views/admin/analytics">
                Analíticas
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/leads")} href="/web/views/admin/leads">
                Prospectos
              </Link>
            </NavbarItem>
          </>
        ) : rol === "admin" ? (
          <>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/user/feed")} href="/web/views/user/feed">
                Proyectos
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/Projects")} href={`/web/views/admin/Projects?id=${session?.user?.id_company ? encrypt(session.user.id_company) : ""}&name=Dashboard`}>
                Dashboard
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/leads")} href="/web/views/admin/leads">
                Prospectos
              </Link>
            </NavbarItem>   
          </>
        ) : null}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2.5">
        <NavbarItem className="hidden sm:flex">
          {renderRoleBadge()}
        </NavbarItem>

        <NavbarItem>
          <Popover 
            placement="bottom-end" 
            onOpenChange={handleDropdownOpen}
            classNames={{
              content: "max-h-[420px] overflow-hidden w-[360px] sm:w-[380px] bg-[#0E1622]/95 backdrop-blur-2xl border border-white/10 p-0 text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
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
              <div className="w-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white tracking-tight">Notificaciones</span>
                    {unreadCount > 0 && (
                      <span className="bg-[#0CDBFF]/15 text-[#0CDBFF] border border-[#0CDBFF]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-white/50 hover:text-[#0CDBFF] transition-colors font-medium"
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>
                
                {/* Notification List */}
                <div className="flex flex-col p-2 gap-1 w-full max-h-[330px] overflow-y-auto scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const isUnread = !seenIds.includes(notif.id);
                      return (
                        <Link 
                          key={notif.id} 
                          href={`/proyectos/${notif.projectId}`}
                          className={`p-3 rounded-xl border transition-all text-white flex gap-3 text-left w-full group relative ${
                            isUnread 
                              ? "bg-white/[0.04] border-[#0CDBFF]/20 hover:bg-white/[0.08]" 
                              : "bg-transparent border-transparent hover:bg-white/[0.04]"
                          }`}
                        >
                          {/* Icon Indicator */}
                          <div className="w-8 h-8 rounded-lg bg-[#0CDBFF]/10 border border-[#0CDBFF]/20 flex items-center justify-center flex-shrink-0 text-[#0CDBFF] mt-0.5 shadow-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline gap-2 mb-0.5">
                              <span className="font-bold text-xs text-white group-hover:text-[#0CDBFF] transition-colors truncate">
                                {notif.projectName}
                              </span>
                              <span className="text-[10px] text-white/40 font-mono flex-shrink-0">
                                {formatRelativeTime(notif.date)}
                              </span>
                            </div>

                            <p className="text-xs text-white/80 font-medium line-clamp-1">
                              {notif.label || "Actualización"}: <span className="text-white font-semibold">{notif.modelName}</span>
                            </p>

                            {notif.versionNotes && (
                              <p className="text-[11px] text-white/60 line-clamp-2 mt-1.5 pl-2 border-l-2 border-[#0CDBFF]/40 italic">
                                &quot;{notif.versionNotes}&quot;
                              </p>
                            )}
                          </div>

                          {isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0CDBFF] shadow-[0_0_8px_rgba(12,219,255,0.8)] absolute top-3 right-3" />
                          )}
                        </Link>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 text-white/40 shadow-inner">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-white/80 mb-0.5">Sin novedades</p>
                      <p className="text-xs text-white/40 max-w-[220px]">
                        Te avisaremos cuando haya nuevos levantamientos o notas en tus proyectos.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </NavbarItem>

        <NavbarItem>
          <Dropdown placement="bottom-end" classNames={{
            content: "bg-[#0E1622]/95 backdrop-blur-2xl border border-white/10 text-white rounded-2xl shadow-2xl p-1.5 min-w-[250px]"
          }}>
            <DropdownTrigger>
              <button className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 transition-all group cursor-pointer focus:outline-none select-none">
                <Avatar
                  className="transition-transform ring-2 ring-[#0CDBFF]/30 group-hover:ring-[#0CDBFF]/70"
                  size="sm"
                  name={firstName ? firstName[0]?.toUpperCase() : "U"}
                />
                <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors hidden sm:inline-block truncate max-w-[120px]">
                  {firstName}
                </span>
                <svg className="w-3 h-3 text-white/40 group-hover:text-white transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-auto py-2.5 gap-2 cursor-default" textValue="Usuario">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white text-sm truncate">
                      {firstName}
                    </p>
                    {renderRoleBadge()}
                  </div>
                  <p className="text-xs text-white/50 truncate font-mono">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownItem>
              <DropdownItem 
                key="configurations" 
                onClick={onProfileOpen} 
                className="text-white/80 hover:text-white rounded-xl"
                startContent={
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                Configuración
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger" 
                onClick={() => signOut()} 
                className="text-rose-400 hover:text-rose-300 rounded-xl"
                startContent={
                  <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                }
              >
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem> 
      </NavbarContent>

      {/* menu when its a small screen, often a mobile's screen */}
      <NavbarMenu className="bg-[#02121B]/95 backdrop-blur-2xl border-t border-white/10 pt-6 gap-3">
        {isSuperadmin ? (
          <>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/superadmin/dashboard")} href="/web/views/superadmin/dashboard">
                Superadmin
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/user/feed")} href="/web/views/user/feed">
                Proyectos
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/allCompanies")} href="/web/views/admin/allCompanies">
                Inmobiliarias
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/leads")} href="/web/views/admin/leads">
                Prospectos
              </Link>
            </NavbarItem>
          </>
        ) : rol === "company" ? (
          <>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/user/feed")} href="/web/views/user/feed">
                Proyectos
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/allCompanies")} href="/web/views/admin/allCompanies">
                Inmobiliarias
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/analytics")} href="/web/views/admin/analytics">
                Analíticas
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/leads")} href="/web/views/admin/leads">
                Prospectos
              </Link>
            </NavbarItem>
          </>
        ) : rol === "admin" ? (
          <>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/user/feed")} href="/web/views/user/feed">
                Proyectos
              </Link>
            </NavbarItem>

            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/Projects")} href={`/web/views/admin/Projects?id=${session?.user?.id_company ? encrypt(session.user.id_company) : ""}&name=Dashboard`}>
                Dashboard
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className={getLinkClasses("/web/views/admin/leads")} href="/web/views/admin/leads">
                Prospectos
              </Link>
            </NavbarItem>   
          </>
        ) : null}
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
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-xs font-semibold ${
                      activeTab === "profile_info"
                        ? "bg-[#0CDBFF]/15 text-[#0CDBFF] font-bold shadow-sm"
                        : "hover:bg-white/5 text-white/70 hover:text-white"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Mi Perfil</span>
                  </div>

                  <div
                    onClick={() => setActiveTab("credentials")}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-xs font-semibold ${
                      activeTab === "credentials"
                        ? "bg-[#0CDBFF]/15 text-[#0CDBFF] font-bold shadow-sm"
                        : "hover:bg-white/5 text-white/70 hover:text-white"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Credenciales</span>
                  </div>

                  <div
                    onClick={() => setActiveTab("notifications")}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-xs font-semibold ${
                      activeTab === "notifications"
                        ? "bg-[#0CDBFF]/15 text-[#0CDBFF] font-bold shadow-sm"
                        : "hover:bg-white/5 text-white/70 hover:text-white"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>Notificaciones</span>
                  </div>

                  <div
                    onClick={() => setActiveTab("appearance")}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-xs font-semibold ${
                      activeTab === "appearance"
                        ? "bg-[#0CDBFF]/15 text-[#0CDBFF] font-bold shadow-sm"
                        : "hover:bg-white/5 text-white/70 hover:text-white"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4 5 5 0 013-4.5V10a6 6 0 1112 0v2.5a5 5 0 013 4.5 4 4 0 01-4 4H7z" />
                    </svg>
                    <span>Apariencia</span>
                  </div>
                </div>

                {/* Contenido Derecho */}
                <div className="w-2/3 p-6 overflow-y-auto max-h-[420px]">
                  {activeTab === "credentials" && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="text-base font-bold text-white mb-0.5">Seguridad y Credenciales</h4>
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
                        classNames={{ input: "text-sm text-white", label: "text-xs text-white/70" }}
                      />
                      <Input
                        label="Apellido"
                        placeholder="Tu apellido"
                        labelPlacement="outside"
                        variant="bordered"
                        value={profileLastName}
                        onValueChange={setProfileLastName}
                        classNames={{ input: "text-sm text-white", label: "text-xs text-white/70" }}
                      />
                      <Input
                        label="Nueva Contraseña"
                        placeholder="Mínimo 6 caracteres (Opcional)"
                        type="password"
                        labelPlacement="outside"
                        variant="bordered"
                        value={profilePassword}
                        onValueChange={setProfilePassword}
                        classNames={{ input: "text-sm text-white", label: "text-xs text-white/70" }}
                      />
                      {profilePassword && (
                        <Input
                          label="Confirmar Nueva Contraseña"
                          placeholder="Repite la contraseña"
                          type="password"
                          labelPlacement="outside"
                          variant="bordered"
                          value={profileConfirmPassword}
                          onValueChange={setProfileConfirmPassword}
                          classNames={{ input: "text-sm text-white", label: "text-xs text-white/70" }}
                        />
                      )}
                      <Input
                        label="Correo Electrónico (No editable)"
                        value={session?.user?.email || ""}
                        labelPlacement="outside"
                        variant="bordered"
                        isDisabled
                        classNames={{ input: "text-sm text-white/50", label: "text-xs text-white/70" }}
                      />
                    </div>
                  )}

                  {activeTab === "profile_info" && (
                    <div className="flex flex-col gap-5">
                      <div>
                        <h4 className="text-base font-bold text-white mb-0.5">Información de Cuenta</h4>
                        <p className="text-xs text-white/50">Resumen y detalles de tu perfil en MyView.</p>
                      </div>
                      <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
                        <Avatar
                          src={session?.user?.image || ""}
                          className="w-14 h-14 text-medium border-2 border-[#0CDBFF]"
                          name={profileName}
                        />
                        <div>
                          <p className="font-bold text-white text-sm capitalize">{profileName} {profileLastName}</p>
                          <p className="text-xs text-white/40">{session?.user?.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-white/40 text-[10px] block uppercase font-bold">Rol de Acceso</span>
                          <span className="text-xs font-semibold text-white capitalize">{rol || "User"}</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-white/40 text-[10px] block uppercase font-bold">Plan Suscrito</span>
                          <span className="text-xs font-semibold text-white uppercase">{session?.user?.plan || "Básico"}</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl col-span-2">
                          <span className="text-white/40 text-[10px] block uppercase font-bold">Identificación de Empresa</span>
                          <span className="text-xs font-mono text-white/70">{session?.user?.id_company || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "notifications" && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="text-base font-bold text-white mb-0.5">Alertas y Notificaciones</h4>
                        <p className="text-xs text-white/50">Configura los canales y preferencias.</p>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                          <input type="checkbox" defaultChecked className="mt-1 accent-[#0CDBFF]" />
                          <div>
                            <span className="text-xs font-bold text-white block">Notificaciones por Correo</span>
                            <span className="text-[11px] text-white/60">Recibe resúmenes de actividad y prospectos.</span>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                          <input type="checkbox" defaultChecked className="mt-1 accent-[#0CDBFF]" />
                          <div>
                            <span className="text-xs font-bold text-white block">Alertas de Prospectos en Tiempo Real</span>
                            <span className="text-[11px] text-white/60">Aviso instantáneo cuando un cliente deje sus datos.</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeTab === "appearance" && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="text-base font-bold text-white mb-0.5">Personalización Visual</h4>
                        <p className="text-xs text-white/50">Ajustes visuales del entorno.</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <div>
                            <span className="text-xs font-bold text-white block">Tema de Interfaz</span>
                            <span className="text-[11px] text-white/60">Esquema de colores oscuro.</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#0CDBFF] bg-cyan-500/10 border border-[#0CDBFF]/20 px-2.5 py-1 rounded-lg">
                            Deep Slate
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="text-white/70" onPress={onClose}>
                  Cerrar
                </Button>
                {activeTab === "credentials" && (
                  <Button className="bg-[#0CDBFF] text-black font-bold" onPress={handleUpdateProfile} isLoading={isUpdatingProfile}>
                    Guardar Cambios
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
