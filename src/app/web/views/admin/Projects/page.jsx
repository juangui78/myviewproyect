"use client"
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAllProjects } from "./actions/getAllProjects";
import { Toaster, toast } from "sonner";
import { Button } from "@nextui-org/react";
import { useDisclosure } from "@nextui-org/react";
import ModalAddModel from "./components/ModalAddModel";
import ModalNewProject from "./components/ModalNewProject";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";

const ContentPage = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const nameProject = searchParams.get("name");

    const [data, setData] = useState([]);
    const [idProject, setIdProject] = useState(null);
    const { isOpen, onOpenChange} = useDisclosure()
    const { isOpen: isOpenNewProject, onOpenChange: onOpenChangeNewProject} = useDisclosure()

    useEffect(() => {
        document.title = "MyView_ | Proyectos";

        const fecthData = async () => {
            try {
                const response = await getAllProjects(id);
                if (response.success) {
                    setData(response.data);
                    return
                }

                toast.error(response.message);

            } catch (error) {
                toast.error("Error en el servidor.");
            }
        }

        fecthData()

    }, []);

    const handleAddModel = (id) => {
        setIdProject(id);
        onOpenChange();
    }

    return (
        <>
            <section className="w-full mt-[20px]">
                <section className="w-[70%] m-auto">
                    <div className="flex w-full items-center justify-between ...">
                        <h2 className="text-3xl font-bold mt-5 text-white text-left ">{nameProject}</h2>
                        <Button startContent={<PlusIcon/>} onClick={() => onOpenChangeNewProject()}>Crear nuevo proyecto</Button>
                    </div>
                    <div className="w-full">
                        {data.map((item) => (
                            <div key={item._id} className="w-full border border-gray-300 mt-5 p-5 rounded-lg flex justify-between items-center">
                                <div>
                                    <h4 className="text-lg font-bold text-white">{item.name}</h4>
                                    <p className="text-white italic text-sm">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button  size="sm" className="mt-3">Historial de modelos</Button>
                                    <Button color="default" size="sm" className="mt-3" onClick={(e) => handleAddModel(item._id)}>Añadir modelo</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </section>
            <Toaster richColors position="top-right"  />
            {isOpen && <ModalAddModel isOpen={isOpen} onOpenChange={onOpenChange} idProject={idProject}/>}
            {isOpenNewProject && <ModalNewProject isOpenNewProject={isOpenNewProject} onOpenChangeNewProject={onOpenChangeNewProject}/>}
        </>
    );
}

const Page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ContentPage />
        </Suspense>
    )
}

export default Page;