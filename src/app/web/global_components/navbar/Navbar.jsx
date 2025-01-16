"use client";
import { useState, Suspense } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useSession, signOut } from "next-auth/react";
import ModalForm from "@/web/views/feed/components/modalForm";
import style from './styles/navbar.module.css'

export default function NavBar({children}) {
  const [modal, setModal] = useState(false);
  const { data: session } = useSession();
  const idUser = session?.user._id;
  const permissions = session?.user.permissions

  const openModalForm = (e) => {
    setModal(true);
  };

  console.log(session);
  

  return (
    <Suspense>
      <Navbar disableAnimation isBordered className={style.NavBar}>
        <>
        <NavbarContent className="sm:hidden max-w-screen-2xl" justify="start">
          <NavbarMenuToggle />
        </NavbarContent>

        <NavbarContent className="sm:hidden pr-3" justify="center">
          <NavbarBrand>
            <p className="font-bold text-inherit ">MyView_</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarBrand>
            <p className="font-bold text-inherit ">MyView_</p>
          </NavbarBrand>
          <NavbarItem>
            <Link color="foreground" href="#" className="">
              Feed
            </Link>
          </NavbarItem>
          {session && permissions.createEdit ? (
            <NavbarItem>
              <Link color="foreground" href="#" className="">
                Socios
              </Link>
            </NavbarItem>) : null
            }
          <NavbarItem>
            <Link color="foreground" href="#" className="">
              Dashboard
            </Link>
          </NavbarItem>
          {session && permissions.createEdit ? (
            <NavbarItem>
              <Button
                color="primary"
                onClick={(e) => openModalForm()}
              >
              Nuevo Proyecto
              </Button>
            </NavbarItem>
            ) : null
          }
        </NavbarContent>

        { session ? <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name="Jason Hughes"
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Mi Cuenta</p>
                <p className="font-semibold">{session?.user.email}</p>
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="system">System</DropdownItem>
              <DropdownItem key="configurations">Configurations</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Ayuda y Soporte
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={() => signOut()}>
                Cerrar Sesion
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent> 
        :  <h2>Cargando...</h2> }
        </>
      </Navbar>
      <ModalForm isOpenM={modal} close={() => setModal(false)} id_user={`${idUser}`}/>
      {children}
    </Suspense>
  );
}
