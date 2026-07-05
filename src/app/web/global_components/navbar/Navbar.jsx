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
} from "@nextui-org/react";
import { Account } from "@/web/global_components/icons/UserAccount";
import { Bell } from "@/web/global_components/icons/Bell";
import { useSession, signOut } from "next-auth/react";
import style from './styles/navbar.module.css'

export default function NavBar({children}) {
  const { data: session } = useSession();
  const idUser = session?.user._id;
  const rol = session?.user.rol;
  const isSuperadmin = session?.user?.email === "darksus78@gmail.com";

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
          
        {isSuperadmin && (
          <NavbarItem>
            <Link className="text-white hover:text-[#0CDBFF] font-bold" href="/web/views/superadmin/dashboard">
              Superadmin
            </Link>
          </NavbarItem>
        )}
          
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
        {isSuperadmin && (
          <NavbarItem>
            <Link className="text-[#0CDBFF] font-bold" href="/web/views/superadmin/dashboard">
              Superadmin
            </Link>
          </NavbarItem>
        )}
                
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
