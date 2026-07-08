"use client"
import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getAllProjects, getProjectsTimelineStats } from "./actions/getAllProjects";
import { toast } from "sonner";
import { Button, Chip, useDisclosure } from "@nextui-org/react";
import Link from "next/link";
import ModalAddModel from "./components/ModalAddModel";
import ModalNewProject from "./components/ModalNewProject";
import DrawerShowModels from "./components/DrawerShowModels";
import DrawerShowInfoProject from "./components/DrawerShowInfoProject";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";
import Eye from "@/web/global_components/icons/Eye";
import { getModels } from "./actions/getModels";
import { encrypt } from "@/api/libs/crypto";
import { Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, 
  Tooltip as ChartTooltip, Legend, Filler 
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

const hoverLinePlugin = {
    id: 'hoverLine',
    afterDraw: (chart) => {
        if (chart.tooltip?._active?.length) {
            const activePoint = chart.tooltip._active[0];
            const ctx = chart.ctx;
            const x = activePoint.element.x;
            const topY = chart.scales.y.top;
            const bottomY = chart.scales.y.bottom;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(12, 219, 255, 0.4)";
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.restore();
        }
    }
};

const AnimatedCounter = ({ value, duration = 1200 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const end = parseInt(value, 10);
        if (isNaN(end) || end === 0) {
            setCount(0);
            return;
        }

        const totalSteps = 50; 
        const stepTime = Math.max(Math.floor(duration / totalSteps), 16);
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / totalSteps;
            const easeProgress = progress * (2 - progress); // Ease out quad
            const nextValue = Math.round(easeProgress * end);

            if (currentStep >= totalSteps) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(nextValue);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count.toLocaleString()}</span>;
};

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

    const [timelineData, setTimelineData] = useState([]);
    const [chartLoading, setChartLoading] = useState(true);
    const [chartRange, setChartRange] = useState("30");

    useEffect(() => {
        const fetchChartData = async () => {
            if (!id) return;
            setChartLoading(true);
            const res = await getProjectsTimelineStats(id, chartRange);
            if (res.success) {
                setTimelineData(res.data);
            }
            setChartLoading(false);
        };
        fetchChartData();
    }, [id, chartRange]);

    const chartData = useMemo(() => {
        return {
            labels: timelineData.map(d => d.label),
            datasets: [
                {
                    label: chartRange === "1" ? "Vistas de la hora" : "Vistas del día",
                    data: timelineData.map(d => d.views),
                    fill: true,
                    borderColor: "#0CDBFF",
                    backgroundColor: "rgba(12, 219, 255, 0.05)",
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: "#0CDBFF",
                    pointHoverRadius: 6,
                    pointRadius: 2,
                }
            ]
        };
    }, [timelineData, chartRange]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#12202E",
                titleColor: "#0CDBFF",
                bodyColor: "#ffffff",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderWidth: 1,
                padding: 10,
                displayColors: false,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: "rgba(255, 255, 255, 0.4)", font: { size: 10 } }
            },
            y: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: { color: "rgba(255, 255, 255, 0.4)", font: { size: 10 }, precision: 0 },
                min: 0
            }
        }
    };

    const periodTotalViews = useMemo(() => {
        return timelineData.reduce((sum, item) => sum + (item.views || 0), 0);
    }, [timelineData]);

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

        if (id) {
            fecthData();
        }
    }, [id]);

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

    // Dynamically calculate dashboard KPIs
    const stats = useMemo(() => {
        const total = data.length;
        const totalArea = data.reduce((sum, item) => sum + (item.areaOfThisproyect || 0), 0);
        const active = data.filter(item => item.state === "Actived").length;
        const totalViews = data.reduce((sum, item) => sum + (item.views || 0), 0);
        return { total, totalArea, active, totalViews };
    }, [data]);

    return (
        <>
            <section className="w-full min-h-screen py-10 px-4 md:px-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-white to-white/70 bg-clip-text">
                                {nameProject || "Dashboard"}
                            </h2>
                            <p className="text-white/60 text-sm mt-2 font-light">
                                Panel administrativo y visualización 3D de tus desarrollos inmobiliarios.
                            </p>
                        </div>
                        <Button 
                            className="bg-gradient-to-r from-[#0CDBFF] to-[#00A8CC] hover:from-[#33E2FF] hover:to-[#00C5ED] text-[#02121B] font-bold shadow-lg shadow-[#0CDBFF]/20 px-6 py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                            startContent={<PlusIcon className="w-5 h-5 text-[#02121B]" />} 
                            onClick={() => onOpenChangeNewProject()}
                        >
                            Crear nuevo proyecto
                        </Button>
                    </div>

                    {/* Stats Dashboard Panels */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        
                        {/* Total Projects */}
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex items-center justify-between shadow-xl">
                            <div>
                                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider block">Total Proyectos</span>
                                <span className="text-3xl font-extrabold text-white mt-1.5 block">
                                    <AnimatedCounter value={stats.total} />
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#0CDBFF]/10 text-[#0CDBFF] border border-[#0CDBFF]/20 shadow-inner">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>

                        {/* Total Area */}
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex items-center justify-between shadow-xl">
                            <div>
                                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider block">Área Total Controlada</span>
                                <span className="text-3xl font-extrabold text-white mt-1.5 block">
                                    <AnimatedCounter value={stats.totalArea} /> <span className="text-lg font-medium text-white/60">m²</span>
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                        </div>

                        {/* Active Projects */}
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex items-center justify-between shadow-xl">
                            <div>
                                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider block">Proyectos Activos</span>
                                <span className="text-3xl font-extrabold text-emerald-400 mt-1.5 block">
                                    <AnimatedCounter value={stats.active} />
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Total Views */}
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex items-center justify-between shadow-xl">
                            <div>
                                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider block">Visualizaciones Totales</span>
                                <span className="text-3xl font-extrabold text-[#0CDBFF] mt-1.5 block">
                                    <AnimatedCounter value={stats.totalViews} />
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#0CDBFF]/10 text-[#0CDBFF] border border-[#0CDBFF]/20 shadow-inner">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>

                    </div>

                    {/* Views Timeline Chart */}
                    <div className="p-6 rounded-2xl bg-[#0B151F]/80 border border-white/10 backdrop-blur-md shadow-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                                    Historial de Visualizaciones ({chartRange === "1" ? "Últimas 24 horas" : chartRange === "15" ? "Últimos 15 días" : chartRange === "30" ? "Últimos 30 días" : "Histórico Total"})
                                </h3>
                                <p className="text-white/40 text-xs mt-1">
                                    Monitorea la frecuencia de visitas y el interés en tus desarrollos inmobiliarios 3D.
                                </p>
                            </div>
                            <div className="flex items-center gap-6 w-fit self-end sm:self-auto">
                                <div className="text-right select-none">
                                    <span className="text-[10px] text-white/40 block font-semibold uppercase tracking-wider">Vistas en período</span>
                                    <span className="text-2xl font-black text-[#0CDBFF] block leading-none mt-1">
                                        <AnimatedCounter value={periodTotalViews} />
                                    </span>
                                </div>
                                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 gap-1">
                                {[
                                    { key: "1", label: "24h" },
                                    { key: "15", label: "15d" },
                                    { key: "30", label: "30d" },
                                    { key: "all", label: "Histórico" }
                                ].map((rangeOpt) => (
                                    <button
                                        key={rangeOpt.key}
                                        onClick={() => setChartRange(rangeOpt.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                                            chartRange === rangeOpt.key
                                                ? "bg-[#0CDBFF] text-black shadow-md shadow-[#0CDBFF]/15"
                                                : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                    >
                                        {rangeOpt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="h-[220px] w-full">
                            {chartLoading ? (
                                <div className="h-full w-full flex items-center justify-center text-white/50 text-xs">
                                    Cargando estadísticas de vistas...
                                </div>
                            ) : (
                                <Line data={chartData} options={chartOptions} plugins={[hoverLinePlugin]} />
                            )}
                        </div>
                    </div>

                    {/* Main Projects Display Grid */}
                    {data.length === 0 ? (
                        <div className="p-16 text-center rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center space-y-4">
                            <div className="p-4 rounded-full bg-white/5 text-white/30">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">No tienes proyectos registrados</h3>
                            <p className="text-white/45 text-sm max-w-md mx-auto">
                                Comienza agregando tu primer desarrollo inmobiliario para subir modelos 3D y gestionar prospectos.
                            </p>
                            <Button 
                                className="bg-[#0CDBFF]/15 text-[#0CDBFF] border border-[#0CDBFF]/30 font-bold px-6 rounded-xl hover:bg-[#0CDBFF]/25"
                                onClick={() => onOpenChangeNewProject()}
                            >
                                Crear mi primer proyecto
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.map((item) => (
                                <div 
                                    key={item._id} 
                                    className="group flex flex-col rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-950/20"
                                >
                                    
                                    {/* Cover Image & Badge */}
                                    <div className="relative h-48 w-full overflow-hidden bg-white/[0.02]">
                                        {item.urlImage ? (
                                            <img 
                                                src={item.urlImage} 
                                                alt={item.name} 
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-tr from-[#02121B] to-[#0D293E] flex items-center justify-center p-6 border-b border-white/5">
                                                <span className="text-white/20 font-bold tracking-widest text-sm uppercase">MyView Model 3D</span>
                                            </div>
                                        )}
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4">
                                            <Chip 
                                                size="sm" 
                                                radius="full" 
                                                className="font-bold border border-white/10"
                                                color={item.state === "Actived" ? "success" : item.state === "ended" ? "warning" : "danger"}
                                                variant="solid"
                                            >
                                                {item.state === "Actived" ? "Activo" : item.state === "ended" ? "Terminado" : "Cancelado"}
                                            </Chip>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-bold text-white group-hover:text-[#0CDBFF] transition-colors duration-300 truncate">
                                                {item.name}
                                            </h4>
                                            <p className="text-white/50 text-xs font-light leading-relaxed line-clamp-2 h-8">
                                                {item.description}
                                            </p>
                                            
                                            {/* Attributes list */}
                                            <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
                                                
                                                {/* Location */}
                                                <div className="flex items-center gap-2.5 text-white/60 text-xs font-medium">
                                                    <svg className="w-4 h-4 text-[#0CDBFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="truncate">{item.city}, {item.department}</span>
                                                </div>

                                                {/* Area */}
                                                <div className="flex items-center gap-2.5 text-white/60 text-xs font-medium">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                    </svg>
                                                    <span>Área total: <strong className="text-white font-bold">{item.areaOfThisproyect.toLocaleString()} m²</strong></span>
                                                </div>

                                                {/* Views */}
                                                <div className="flex items-center gap-2.5 text-white/60 text-xs font-medium">
                                                    <svg className="w-4 h-4 text-[#0CDBFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>Visualizaciones: <strong className="text-white font-bold">{(item.views || 0).toLocaleString()} vistas</strong></span>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Actions Section */}
                                        <div className="pt-4 border-t border-white/5 flex gap-2">
                                            
                                            {/* Eye Visualizer */}
                                            <Button 
                                                as={Link}
                                                href={`/web/views/visualizer?id=${encrypt(item._id)}`}
                                                target="_blank"
                                                size="sm" 
                                                isIconOnly
                                                variant="flat" 
                                                className="bg-[#0CDBFF]/10 hover:bg-[#0CDBFF]/20 text-[#0CDBFF] border border-[#0CDBFF]/15 min-w-0"
                                                title="Abrir Visor interactivo 3D"
                                            >
                                                <Eye className="w-4 h-4 text-[#0CDBFF]" />
                                            </Button>

                                            {/* Info */}
                                            <Button 
                                                size="sm" 
                                                variant="flat" 
                                                className="bg-white/5 hover:bg-white/10 text-white min-w-0 text-xs font-semibold"
                                                onClick={() => filterDataProjects(item._id)}
                                            >
                                                Ver Info
                                            </Button>

                                            {/* Model History */}
                                            <Button 
                                                size="sm" 
                                                variant="flat" 
                                                className="bg-white/5 hover:bg-white/10 text-white min-w-0 flex-grow text-xs font-semibold"
                                                onClick={(e) => getModelsFecth(item._id, e)}
                                                disabled={isFetchinModels}
                                            >
                                                Modelos
                                            </Button>

                                            {/* Add Model */}
                                            <Button 
                                                size="sm" 
                                                className="bg-gradient-to-r from-[#0CDBFF] to-[#00A8CC] hover:from-[#33E2FF] hover:to-[#00C5ED] text-[#02121B] font-bold text-xs"
                                                onClick={(e) => handleAddModel(item._id)}
                                            >
                                                + Modelo
                                            </Button>

                                        </div>

                                    </div>

                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </section>
            
            {isOpen && <ModalAddModel isOpen={isOpen} onOpenChange={onOpenChange} idProject={idProject}/>}
            {isOpenNewProject && <ModalNewProject isOpenNewProject={isOpenNewProject} onOpenChangeNewProject={onOpenChangeNewProject} idCompany={id}/>}
            {IsOpenDrawerModels && <DrawerShowModels IsOpenDrawerModels={IsOpenDrawerModels} onOpenChangeDrawerModels={onOpenChangeDrawerModels} dataModels={dataModels}/>}
            {IsOpenDrawerInfoProject && <DrawerShowInfoProject IsOpenDrawerInfoProject={IsOpenDrawerInfoProject} onOpenChangeDrawerShowInfoProject={onOpenChangeDrawerShowInfoProject} dataProject={dataProject}/>}
        </>
    );
}

const Page = () => {
    return (
        <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center text-white bg-[#02121B]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-[#0CDBFF] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold tracking-wider text-[#0CDBFF]">Cargando Dashboard...</span>
                </div>
            </div>
        }>
            <ContentPage />
        </Suspense>
    )
}

export default Page;