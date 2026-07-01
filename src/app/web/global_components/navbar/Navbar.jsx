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
} from "@nextui-org/react";
import { Account } from "@/web/global_components/icons/UserAccount";
import { Bell } from "@/web/global_components/icons/Bell";
import { useSession, signOut } from "next-auth/react";
import style from './styles/navbar.module.css'

export default function NavBar({children}) {
  const { data: session } = useSession();
  const idUser = session?.user._id;
  const rol = session?.user.rol;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
          
        {rol === "company" ? ( 
          <>
          {/* company => this is my view */}     
            <NavbarItem>
              <Link className="text-white" href="/web/views/admin/allCompanies">
              Inmobiliarias
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className="text-white" href="/web/views/admin/analytics">
                Analiticas
              </Link>
            </NavbarItem>
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
              <Link className="text-white" href="#">
                Dasboard
              </Link>
            </NavbarItem>   
          </>
        ) : null
        }
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Dropdown 
            placement="bottom-end" 
            onOpenChange={handleDropdownOpen}
            classNames={{
              content: "max-h-[380px] overflow-y-auto w-[320px] bg-[#1A1F26]/95 backdrop-blur-xl border border-white/10"
            }}
          >
            <DropdownTrigger>
              <div className="flex gap-4 items-center cursor-pointer">
                {unreadCount > 0 ? (
                  <Badge color="danger" content={unreadCount} shape="circle" size="sm">
                    <Bell className="cursor-pointer text-white" />
                  </Badge>
                ) : (
                  <Bell className="cursor-pointer text-white" />
                )}
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Notifications" variant="flat" className="w-full">
              <DropdownItem key="header" isReadOnly className="opacity-100 cursor-default border-b border-white/10 pb-2 mb-1 pointer-events-none hover:bg-transparent focus:bg-transparent">
                <span className="font-bold text-sm text-[#0CDBFF] uppercase tracking-wider block text-center">
                  Notificaciones
                </span>
              </DropdownItem>
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <DropdownItem 
                    key={notif.id} 
                    as={Link}
                    href={`/proyectos/${notif.projectId}`}
                    className="py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all text-white"
                  >
                    <div className="flex flex-col gap-1 w-full text-left">
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
                    </div>
                  </DropdownItem>
                ))
              ) : (
                <DropdownItem key="no-notifications" showDivider={false}>
                  <p className="font-semibold text-center py-2 text-white/60">No hay notificaciones</p>
                </DropdownItem>
              )}
            </DropdownMenu> 
          </Dropdown>
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
              <DropdownItem key="configurations">Configuración</DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={() => signOut()}>
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem> 
      </NavbarContent>

      {/* menu when its a small screen, often a mobile's screen */}
      <NavbarMenu>
                
        {rol === "company" ? (
          <>
            {/* <NavbarItem>
              <Link className="text-white" href="/web/views/admin/feed">
                Nuevo proyecto
              </Link>
            </NavbarItem> */}
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
              <Link className="text-white" href="#">
                Dasboard
              </Link>
            </NavbarItem>   
          </>
        ) : null
        }
      </NavbarMenu>
    </Navbar>
  );
}
