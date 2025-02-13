"use client";
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
              <Link className="text-white" href="#">
                Inmobiliarias
              </Link>
            </NavbarItem>

            <NavbarItem>
              <Link className="text-white" href="/web/views/admin/allProjects">
                Proyectos
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
          <Dropdown  placement="bottom-end">
            <DropdownTrigger>
              <div className="flex gap-4 items-center cursor-pointer">
                <Badge color="danger" content="5" shape="rectangle" showOutline={false}>
                  <Bell className="cursor-pointer text-white" />
                </Badge>
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Notifications" variant="flat">
              <DropdownItem key="notification">
                <p className="font-semibold">No hay notificaciones</p>
              </DropdownItem>
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
                <p className="font-semibold">Loguiado como </p>
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
            <NavbarItem>
              <Link className="text-white" href="/web/views/admin/feed">
                Nuevo proyecto
              </Link>
            </NavbarItem>
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
