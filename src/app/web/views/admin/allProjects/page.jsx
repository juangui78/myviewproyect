"use client"
import React, { useEffect, useMemo, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination, Input, Button, useDisclosure, Chip, Tooltip } from "@nextui-org/react";
import { getPagination } from "./actions/pagination";
import { Toaster, toast } from "sonner";
import Link from 'next/link';
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";
import Eye from "@/web/global_components/icons/Eye";
import ModalCreateCompany from "./components/ModalCrateCompany";
import { encrypt } from "@/api/libs/crypto";

const Page = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [pageAlreadyLoaded, setPageAlreadyLoaded] = useState([])
  const { isOpen: isOpenCompany, onOpenChange: onOpenChangeCompany } = useDisclosure()

  useEffect(() => {
    document.title = "MyView_ | Proyectos"

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
              onClick={onOpenChangeCompany}
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

  return (
    <div className="flex justify-center h-screen w-full mt-[100px]">
      <div className="w-[70%]">
        <Table
          bottomContent={PaginationComponent}
          aria-label="tabla de inmobiliarias"
          topContentPlacement="outside"
          topContent={topContent}
          classNames={{
            table: " border-solid border-white",
            tableHeader: "bg-gray-100",
            tableBody: "divide-y divide-gray-200 border-solid border-white",
            tableRow: "hover:bg-gray-100 border-solid border-white",
            tableCell: "py-4 px-6 border-solid border-white",
            th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
            td: [
              "group-data-[first=true]/tr:first:before:rounded-none",
              "group-data-[first=true]/tr:last:before:rounded-none",
              "group-data-[middle=true]/tr:before:rounded-none",
              "group-data-[last=true]/tr:first:before:rounded-none",
              "group-data-[last=true]/tr:last:before:rounded-none",
            ],
          }}
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
                  <Link 
                    href={{ pathname: `/web/views/admin/Projects`, 
                            query: { id: encrypt(item._id), name: item?.name } 
                          }} 
                    target="_blank"
                  >
                    <Tooltip content="Ver proyectos">
                      <Eye />
                    </Tooltip>
                  </Link >
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Toaster richColors position="top-right" />
      <ModalCreateCompany isOpenCompany={isOpenCompany} onOpenChangeCompany={onOpenChangeCompany} addNewRecord={addNewRecord} />
    </div>
  )
}

export default Page;