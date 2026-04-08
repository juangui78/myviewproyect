"use client"
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAllProjects } from "./actions/getAllProjects";
import { Toaster, toast } from "sonner";
import { Button } from "@nextui-org/react";
import { useDisclosure } from "@nextui-org/react";
import ModalAddModel from "./components/ModalAddModel";
import ModalNewProject from "./components/ModalNewProject";
import DrawerShowModels from "./components/DrawerShowModels";
import DrawerShowInfoProject from "./components/DrawerShowInfoProject";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";
import { getModels } from "./actions/getModels";
import { Chip } from "@nextui-org/react";

const ContentPage = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const nameProject = searchParams.get("name");

    const [data, setData] = useState([]); // all projects from one company
    const [idProject, setIdProject] = useState(null);
    const [dataModels, setDataModels] = useState([]);
    const [isFetchinModels, setIsFetchinModels] = useState(false);
    const [dataProject, setDataProject] = useState({});
    const { isOpen, onOpenChange} = useDisclosure()
    const { isOpen: isOpenNewProject, onOpenChange: onOpenChangeNewProject} = useDisclosure()
    const { isOpen: IsOpenDrawerModels, onOpenChange: onOpenChangeDrawerModels} = useDisclosure()
    const { isOpen: IsOpenDrawerInfoProject, onOpenChange: onOpenChangeDrawerShowInfoProject} = useDisclosure()

    //get all data from project by id
    //===================================================================================================
    useEffect(() => {
        document.title = "MyView_ | Proyectos";

        const fecthData = async () => {
            try {
                const response = await getAllProjects(id);
                if (response.success) {
                    setData(response.data);
                    console.log(response.data)
                    return
                }

                toast.error(response.message);

            } catch (error) {
                toast.error("Error en el servidor.");
            }
        }

        fecthData()

    }, []);

    //open modal to add new model
    //===================================================================================================
    const handleAddModel = (id) => {
        setIdProject(id);
        onOpenChange();
    }

    //get All versions of models from one project
    //===================================================================================================
    const getModelsFecth = async (idProject, event) => {
        event.preventDefault(); //prevent event default behavior
        setDataModels([])
        setIsFetchinModels(true);

        try {
            const response = await getModels(idProject); // call server action to get all models
            if (!response.success) {
                toast.error(response.message);
                return
            }

            setDataModels(response.data);
            onOpenChangeDrawerModels()

        } catch (error) {
            toast.error("Error en el servidor.");
        } finally {
            setIsFetchinModels(false);
        }
    }

    //filter data to get only the json from one id => project
    //===================================================================================================
    const filterDataProjects = (id) => {
        const dataFilter = data.filter((item) => item._id === id)
        
        if (dataFilter.length > 0) {
            setDataProject(dataFilter[0]);
            onOpenChangeDrawerShowInfoProject()
            return
        }

        toast.error("Error al obtener la información del proyecto.")
    }

    return (
        <>
            <section className="w-full mt-[20px]">
                <section className="w-[90%] m-auto">
                    <div className="flex w-full items-center justify-between ...">
                        <h2 className="text-3xl font-bold mt-5 text-white text-left ">{nameProject}</h2>
                        <Button startContent={<PlusIcon/>} onClick={() => onOpenChangeNewProject()}>Crear nuevo proyecto</Button>
                    </div>
                    <p className="text-white text-sm mt-2">Aquí puedes ver todos los proyectos de la inmobiliaria.</p>
                    <div className="w-full mt-7">
                        {data.map((item) => (
                            <div key={item._id} className="w-full border-b-1 p-5 flex justify-between items-center bg-white rounded-lg mb-3 hover:bg-gray-100 transition-all duration-300">
                                <div>
                                    <h4 className="text-lg font-bold text-black">
                                        <Chip size="sm" radius="full" color={item.state === "Actived" ? "success" : "error"}>
                                            *
                                            {/* Falta implementar este estado cuando hayan datos pesistentes 
                                                en al base de datos
                                            */}
                                        </Chip> 
                                        {item.name}
                                    </h4>
                                    <p className="text-black italic text-sm">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                <Button 
                                        size="sm" 
                                        className="mt-3" 
                                        disabled={isFetchinModels}
                                        onClick={() => filterDataProjects(item._id)}
                                    >
                                        Información
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="mt-3" 
                                        onClick={(e) => getModelsFecth(item._id, e)}
                                        disabled={isFetchinModels}
                                    >
                                        {isFetchinModels ? "Cargando..." : "Historial de modelos"}
                                    </Button>
                                    <Button 
                                        color="default" 
                                        size="sm" 
                                        className="mt-3" 
                                        onClick={(e) => handleAddModel(item._id)}
                                        disabled={isFetchinModels}
                                    >
                                        Añadir modelo
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </section>
            <Toaster richColors position="top-right" 
            toastOptions={{
                className: 'font-work-sans', // Aplica la clase personalizada
                style: {
                  fontFamily: 'Work Sans, sans-serif', // Asegúrate de que esta fuente esté cargada en tu proyecto
                },
              }}
              />
            {isOpen && <ModalAddModel isOpen={isOpen} onOpenChange={onOpenChange} idProject={idProject}/>}
            {isOpenNewProject && <ModalNewProject isOpenNewProject={isOpenNewProject} onOpenChangeNewProject={onOpenChangeNewProject} idCompany={id}/>}
            {IsOpenDrawerModels && <DrawerShowModels IsOpenDrawerModels={IsOpenDrawerModels} onOpenChangeDrawerModels={onOpenChangeDrawerModels} dataModels={dataModels}/>}
            {IsOpenDrawerInfoProject && <DrawerShowInfoProject IsOpenDrawerInfoProject={IsOpenDrawerInfoProject} onOpenChangeDrawerShowInfoProject={onOpenChangeDrawerShowInfoProject} dataProject={dataProject}/>}
        </>
    );
}

const Page = () => {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ContentPage />
        </Suspense>
    )
}

export default Page;