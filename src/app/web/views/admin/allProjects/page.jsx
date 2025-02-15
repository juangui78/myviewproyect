"use client"
import React, { useEffect, useMemo, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination, Input, Button, useDisclosure } from "@nextui-org/react";
import { getPagination } from "./actions/pagination";
import { Toaster, toast } from "sonner";
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";
import ModalCreateCompany from "./components/ModalCrateCompany";

const Page = () => {
    const [page, setPage] = useState(1);
    const [data, setData] = useState([])

    const { isOpen: isOpenCompany, onOpenChange: onOpenChangeCompany } = useDisclosure()

    useEffect(() => {
        document.title = "MyView_ | Proyectos"

        const fechtInitialData = async () => {
            const response = await getPagination(page)

            if (response.success) {
                setData(response.data)
                return
            }

            toast.error(response.message)
        }

        fechtInitialData()
    }, [page])


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
              <span className="text-default-400 text-small">Total users</span>
              <label className="flex items-center text-default-400 text-small">
                Rows per page:
                <select
                  className="bg-transparent outline-none text-default-400 text-small"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </label>
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
                    onChange={(page) => setPage(page)}
                />
            </div>
        )
    }, [page])

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
                        tableBody: "divide-y divide-gray-200 border-solid border-white" ,
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
                        <TableColumn>Id inmobiliaria</TableColumn>
                        <TableColumn>Nombre</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={data}
                    >
                        {(item) => (
                            <TableRow key={item._id}>
                                <TableCell>{item._id}</TableCell>
                                <TableCell>hoal</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Toaster richColors position="top-right" />
            <ModalCreateCompany isOpenCompany={isOpenCompany} onOpenChangeCompany={onOpenChangeCompany} />
        </div>
    )
}

export default Page;