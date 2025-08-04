"use client"
import React, { useEffect, useMemo, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination, Input, Button, useDisclosure, Chip, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { getPagination } from "./actions/pagination";
import { Toaster, toast } from "sonner";
import Link from 'next/link';
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";
import Eye from "@/web/global_components/icons/Eye";
import EditIconV2 from "@/web/global_components/icons/EditIconV2";
import DeleteOutline from "@/web/global_components/icons/DeleteIcon";
import ModalCreateCompany from "./components/ModalCrateCompany";
import ModalEditCompany from "./components/ModalEditCompany";
import { encrypt } from "@/api/libs/crypto";

const Page = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [pageAlreadyLoaded, setPageAlreadyLoaded] = useState([])
  const [idInmoToEdit, setIdInmoToEdit] = useState(null)
  const { isOpen: isOpenCompany, onOpenChange: onOpenChangeCompany } = useDisclosure()
  const { isOpen: isOpenEditCompany, onOpenChange: onOpenChangeEditCompany } = useDisclosure()

  useEffect(() => {
    document.title = "MyView_ | Inmobiliarias"

    const fechtInitialData = async () => {
      const response = await getPagination(page)

      if (response.success) {
        const total = response.total
        const countPages = Math.ceil(total / 10)

        setPageAlreadyLoaded([...pageAlreadyLoaded, page])

        setData(response.data)
        setTotalPages(countPages)
        return
      }

      toast.error(response.message)
    }

    fechtInitialData()
  }, [page])

  const addNewRecord = (record) => {
    const updateRecords = [record, ...data]
    setData(updateRecords)
  }

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Buscar por nombre ..."
            startContent={<SearchIcon />}
            size="sm"
          />
          <div className="flex gap-3">
            <Button
              color="primary"
              startContent={<PlusIcon />}
              onPress={onOpenChangeCompany}
            >
              Añadir nueva inmobiliaria
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small"></span>
        </div>
      </div>
    );
  }, []);

  const PaginationComponent = useMemo(() => {
    return (
      <div className="flex w-full justify-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="default"
          page={page}
          total={totalPages}
          onChange={(page) => setPage(page)}
        />
      </div>
    )
  }, [page, totalPages])


  const handleModalChange = (key, _id) => {
    if (key === "view") return;

    if (key === "edit") {
      setIdInmoToEdit(_id)
      onOpenChangeEditCompany(true);
      return;
    }

  }


  const refreshRow = (row, _id) => {

    const index = data.findIndex(item => item._id === _id);
    const info = data[index];

    if (!info) return;
    row._id = info._id;

    data[index] = row;
    setData([...data]);

  }

  return (
    <div className="flex justify-center h-screen w-full mt-[100px]">
      <div className="w-[90%]">
        <Table
          bottomContent={PaginationComponent}
          aria-label="tabla de inmobiliarias"
          topContentPlacement="outside"
          topContent={topContent}
        >
          <TableHeader>
            <TableColumn>Nombre</TableColumn>
            <TableColumn>Telefono</TableColumn>
            <TableColumn>Correo</TableColumn>
            <TableColumn>Departamento</TableColumn>
            <TableColumn>Ciudad</TableColumn>
            <TableColumn>Alcance geográfico</TableColumn>
            <TableColumn>Tipo de propiedades</TableColumn>
            <TableColumn>Enfoque de mercado</TableColumn>
            <TableColumn>Estado</TableColumn>
            <TableColumn>Acciones</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent="No hay inmobiliarias registradas"
            items={data}
          >
            {(item) => (
              <TableRow key={item._id}>
                <TableCell>{item?.name}</TableCell>
                <TableCell>{item?.cell}</TableCell>
                <TableCell>{item?.email}</TableCell>
                <TableCell>{item?.department}</TableCell>
                <TableCell>{item?.city}</TableCell>
                <TableCell>{item?.geographicScope}</TableCell>
                <TableCell>{item?.propertyType}</TableCell>
                <TableCell>{item?.marketApproach}</TableCell>
                <TableCell>
                  <Chip
                    className="capitalize border-none gap-1 text-default-600"
                    color={item?.active ? "success" : "error"}
                    size="sm"
                    variant="dot"
                  >
                    {/* {item?.active ? "Activo" : "Inactivo"} */}
                  </Chip>
                </TableCell>
                <TableCell>

                  <Dropdown backdrop="blur">
                    <DropdownTrigger>
                      <Button variant="bordered">Open Menu</Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Dropdown menu" variant="faded" onAction={(key) => {
                      requestAnimationFrame(() => {
                        handleModalChange(key, item._id)
                      })
                    }}>
                      <DropdownItem
                        key="view"
                        startContent={<Eye />}
                        textValue="Ver proyectos"
                      >
                        <Link
                          href={{
                            pathname: `/web/views/admin/Projects`,
                            query: { id: encrypt(item._id), name: item?.name }
                          }}
                          target="_blank"
                        >
                          Ver proyectos
                        </Link >
                      </DropdownItem>
                      <DropdownItem
                        key="edit"
                        startContent={<EditIconV2 />}
                      >
                        Editar inmobiliaria
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<DeleteOutline />}
                      >
                        Eliminar inmobiliaria
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Toaster richColors position="top-right" />
      <ModalCreateCompany isOpenCompany={isOpenCompany} onOpenChangeCompany={onOpenChangeCompany} addNewRecord={addNewRecord} />
      <ModalEditCompany isOpenEditCompany={isOpenEditCompany} onOpenChangeEditCompany={onOpenChangeEditCompany} _idInmo={idInmoToEdit} refreshRow={refreshRow} />
    </div>
  )
}

export default Page;