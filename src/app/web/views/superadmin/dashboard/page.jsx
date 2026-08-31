"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Pagination, Input, Button, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter
} from "@heroui/react";
import { Select, SelectItem, Tooltip } from "@nextui-org/react";
import { Toaster, toast } from "sonner";
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";
import EditIconV2 from "@/web/global_components/icons/EditIconV2";
import DeleteOutline from "@/web/global_components/icons/DeleteIcon";
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, 
  Tooltip as ChartTooltip, Legend 
} from "chart.js";
import { 
  getSuperadminStats, 
  getSuperadminUsers, 
  createUserBySuperadmin, 
  updateUserBySuperadmin, 
  deleteUserBySuperadmin, 
  getAllCompaniesList 
} from "./actions/superadminActions";
import ChartBrowsers from "@/web/views/admin/analytics/components/ChartBrowsers";
import ChartDeviceType from "@/web/views/admin/analytics/components/ChartDeviceType";
import ChartOs from "@/web/views/admin/analytics/components/ChartOs";
import ChartQuantyPerDay from "@/web/views/admin/analytics/components/ChartQuantyPerDay";
import { getAnalyticsData } from "@/web/views/admin/analytics/actions/getAnalyticsData";
import moment from "moment";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const AnimatedCounter = ({ value, duration = 1200 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) {
      setCount(0);
      return;
    }

    const totalSteps = 40; 
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

export default function SuperadminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalProjects: 0,
    totalAnalytics: 0,
    projectsPerCompany: [],
    popularProjects: []
  });
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debounceSearchRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("usuarios"); // "usuarios" | "analiticas"
  const [trafficAnalytics, setTrafficAnalytics] = useState([]);
  const [trafficLoading, setTrafficLoading] = useState(false);

  // Modal disclosures
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  // Selected User state for actions
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formType, setFormType] = useState("user");
  const [formCompany, setFormCompany] = useState("");

  const loadStats = async () => {
    setStatsLoading(true);
    const res = await getSuperadminStats();
    if (res.success) {
      setStats(res.stats);
    } else {
      toast.error("Error al cargar estadísticas: " + res.message);
    }
    setStatsLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    const res = await getSuperadminUsers(page, 8, search);
    if (res.success) {
      setUsers(res.data);
      setTotalPages(res.totalPages);
    } else {
      toast.error("Error al cargar usuarios: " + res.message);
    }
    setLoading(false);
  };

  const loadCompanies = async () => {
    const res = await getAllCompaniesList();
    if (res.success) {
      setCompanies(res.data);
    } else {
      toast.error("Error al cargar inmobiliarias: " + res.message);
    }
  };

  const loadTrafficAnalytics = async () => {
    setTrafficLoading(true);
    try {
      const res = await getAnalyticsData();
      if (res.status === 200) {
        setTrafficAnalytics(res.data);
      } else {
        toast.error("Error al cargar analíticas de tráfico: " + res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al conectar con el servidor de analíticas");
    } finally {
      setTrafficLoading(false);
    }
  };

  useEffect(() => {
    document.title = "MyView_ | Panel Superadmin";
    loadStats();
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => {
    if (activeTab === "analiticas" && trafficAnalytics.length === 0) {
      loadTrafficAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    if (debounceSearchRef.current) clearTimeout(debounceSearchRef.current);
    debounceSearchRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 250);
  };

  const handleSearchClear = () => {
    setSearchInput("");
    if (debounceSearchRef.current) clearTimeout(debounceSearchRef.current);
    setSearch("");
    setPage(1);
  };

  const handleCreateUser = async () => {
    if (!formName || !formEmail || !formPassword || !formType) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    const payload = {
      name: formName,
      lastName: formLastName,
      email: formEmail,
      password: formPassword,
      type: formType,
      id_Company: formCompany || null
    };

    const res = await createUserBySuperadmin(payload);
    if (res.success) {
      toast.success(res.message);
      onCreateOpenChange(false);
      resetForm();
      loadUsers();
      loadStats();
    } else {
      toast.error("Error: " + res.message);
    }
  };

  const handleEditUser = async () => {
    if (!formName || !formEmail || !formType) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    const payload = {
      name: formName,
      lastName: formLastName,
      email: formEmail,
      type: formType,
      id_Company: formCompany || null
    };

    if (formPassword.trim() !== "") {
      payload.password = formPassword;
    }

    const res = await updateUserBySuperadmin(selectedUser._id, payload);
    if (res.success) {
      toast.success(res.message);
      onEditOpenChange(false);
      resetForm();
      loadUsers();
    } else {
      toast.error("Error: " + res.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const res = await deleteUserBySuperadmin(selectedUser._id);
    if (res.success) {
      toast.success(res.message);
      onDeleteOpenChange(false);
      setSelectedUser(null);
      loadUsers();
      loadStats();
    } else {
      toast.error("Error: " + res.message);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormLastName("");
    setFormEmail("");
    setFormPassword("");
    setFormType("user");
    setFormCompany("");
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormLastName(user.lastName || "");
    setFormEmail(user.email);
    setFormPassword("");
    setFormType(user.type);
    setFormCompany(user.id_Company || "");
    onEditOpen();
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  // Chart configs
  const projectsChartData = useMemo(() => {
    const labels = stats.projectsPerCompany.map(item => item.companyName);
    const data = stats.projectsPerCompany.map(item => item.count);

    return {
      labels: labels.length ? labels : ["Sin Datos"],
      datasets: [
        {
          label: "Proyectos creados",
          data: data.length ? data : [0],
          backgroundColor: "rgba(12, 219, 255, 0.6)",
          borderColor: "rgba(12, 219, 255, 1)",
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    };
  }, [stats.projectsPerCompany]);

  const visitsChartData = useMemo(() => {
    const labels = stats.popularProjects.map(item => item.projectName);
    const data = stats.popularProjects.map(item => item.count);

    return {
      labels: labels.length ? labels : ["Sin Datos"],
      datasets: [
        {
          label: "Visitas registradas",
          data: data.length ? data : [0],
          backgroundColor: "rgba(0, 198, 98, 0.6)",
          borderColor: "rgba(0, 198, 98, 1)",
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    };
  }, [stats.popularProjects]);

  const formatDataPerGraphic = useMemo(() => {
    const info = {
      browser: { labels: [], values: [] },
      deviceType: { labels: [], values: [] },
      os: { labels: [], values: [] },
    };

    for (const item of trafficAnalytics) {
      const browser = item.browser;
      const deviceType = item.deviceType;
      const os = item.os;

      if (browser !== undefined) {
        const idx = info.browser.labels.indexOf(browser);
        if (idx === -1) {
          info.browser.labels.push(browser);
          info.browser.values.push(1);
        } else {
          info.browser.values[idx]++;
        }
      }

      if (deviceType !== undefined) {
        const idx = info.deviceType.labels.indexOf(deviceType);
        if (idx === -1) {
          info.deviceType.labels.push(deviceType);
          info.deviceType.values.push(1);
        } else {
          info.deviceType.values[idx]++;
        }
      }

      if (os !== undefined) {
        const idx = info.os.labels.indexOf(os);
        if (idx === -1) {
          info.os.labels.push(os);
          info.os.values.push(1);
        } else {
          info.os.values[idx]++;
        }
      }
    }

    return info;
  }, [trafficAnalytics]);

  const formatDateToChart = useMemo(() => {
    const info = { labels: [], values: [] };

    const sortedData = [...trafficAnalytics].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    for (const item of sortedData) {
      const createdDate = item.createdAt;
      const formatDate = moment(createdDate).format("DD/MM/YYYY");

      const idx = info.labels.indexOf(formatDate);
      if (idx === -1) {
        info.labels.push(formatDate);
        info.values.push(1);
      } else {
        info.values[idx]++;
      }
    }

    return info;
  }, [trafficAnalytics]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "rgba(255, 255, 255, 0.7)"
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)"
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)"
        }
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)"
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          precision: 0
        }
      }
    }
  };

  const renderTableRoleChip = (type) => {
    if (type === "company") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Empresa
        </span>
      );
    }
    if (type === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-[#0CDBFF] border border-[#0CDBFF]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0CDBFF]" />
          Administrador
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/5 text-white/70 border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
        Visualizador
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen px-4 md:px-12 py-8 mt-[80px]">
      <Toaster richColors position="top-right" />
      <div className="w-full max-w-7xl flex flex-col gap-8">
        
        {/* Page Title & Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Panel <span className="text-[#0CDBFF]">Superadmin</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-[#0CDBFF] border border-[#0CDBFF]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0CDBFF] animate-pulse" />
                Root
              </span>
            </div>
            <p className="text-white/60 mt-1.5 text-sm md:text-base">
              Supervisión global: gestión de usuarios, inmobiliarias, analíticas y telemetría de tráfico.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold select-none shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Servidor Operativo
          </div>
        </div>

        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card Total Users */}
          <div className="relative overflow-hidden group bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-[#0CDBFF]/40 hover:-translate-y-1 shadow-2xl">
            <div className="flex justify-between items-start">
              <p className="text-white/50 uppercase tracking-wider text-xs font-semibold">Total Usuarios</p>
              <div className="p-2 rounded-xl bg-[#0CDBFF]/10 text-[#0CDBFF] border border-[#0CDBFF]/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-black text-white mt-3">
              {statsLoading ? "..." : <AnimatedCounter value={stats.totalUsers} />}
            </h3>
            <div className="w-full bg-white/10 h-[2px] rounded-full mt-4 overflow-hidden">
              <div className="bg-[#0CDBFF] h-full w-[70%]" />
            </div>
          </div>

          {/* Card Total Companies */}
          <div className="relative overflow-hidden group bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-1 shadow-2xl">
            <div className="flex justify-between items-start">
              <p className="text-white/50 uppercase tracking-wider text-xs font-semibold">Inmobiliarias</p>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-black text-white mt-3">
              {statsLoading ? "..." : <AnimatedCounter value={stats.totalCompanies} />}
            </h3>
            <div className="w-full bg-white/10 h-[2px] rounded-full mt-4 overflow-hidden">
              <div className="bg-emerald-400 h-full w-[50%]" />
            </div>
          </div>

          {/* Card Total Projects */}
          <div className="relative overflow-hidden group bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-cyan-500/40 hover:-translate-y-1 shadow-2xl">
            <div className="flex justify-between items-start">
              <p className="text-white/50 uppercase tracking-wider text-xs font-semibold">Proyectos 3D</p>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-black text-white mt-3">
              {statsLoading ? "..." : <AnimatedCounter value={stats.totalProjects} />}
            </h3>
            <div className="w-full bg-white/10 h-[2px] rounded-full mt-4 overflow-hidden">
              <div className="bg-cyan-300 h-full w-[60%]" />
            </div>
          </div>

          {/* Card Total Analytics */}
          <div className="relative overflow-hidden group bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-teal-500/40 hover:-translate-y-1 shadow-2xl">
            <div className="flex justify-between items-start">
              <p className="text-white/50 uppercase tracking-wider text-xs font-semibold">Visitas Registradas</p>
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-black text-white mt-3">
              {statsLoading ? "..." : <AnimatedCounter value={stats.totalAnalytics} />}
            </h3>
            <div className="w-full bg-white/10 h-[2px] rounded-full mt-4 overflow-hidden">
              <div className="bg-teal-300 h-full w-[85%]" />
            </div>
          </div>
        </div>

        {/* Tab Navigation - Vector Segmented Control */}
        <div className="flex justify-start items-center gap-1 bg-[#0E1622]/90 backdrop-blur-xl p-1 border border-white/10 rounded-2xl w-fit self-start shadow-inner">
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === "usuarios"
                ? "bg-[#0CDBFF] text-black shadow-[0_0_15px_rgba(12,219,255,0.3)] font-extrabold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Gestión de Usuarios
          </button>
          <button
            onClick={() => setActiveTab("analiticas")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === "analiticas"
                ? "bg-[#0CDBFF] text-black shadow-[0_0_15px_rgba(12,219,255,0.3)] font-extrabold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analíticas del Sistema
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "usuarios" ? (
          /* User Management Section */
          <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Directorio de Usuarios
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Crea, actualiza permisos o gestiona las cuentas del ecosistema.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
                <Input
                  isClearable
                  onClear={handleSearchClear}
                  className="w-full sm:w-[280px]"
                  placeholder="Buscar por nombre o correo..."
                  startContent={<SearchIcon size={16} className="text-white/40" />}
                  value={searchInput}
                  onValueChange={handleSearchChange}
                  size="sm"
                  radius="lg"
                  classNames={{
                    input: "text-xs text-white placeholder:text-white/30",
                    inputWrapper: "bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 focus-within:!border-[#0CDBFF] h-10"
                  }}
                />
                <Button
                  startContent={<PlusIcon />}
                  onPress={() => {
                    resetForm();
                    onCreateOpen();
                  }}
                  size="sm"
                  className="h-10 px-4 bg-[#0CDBFF] text-black font-bold rounded-xl hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
                >
                  Añadir Usuario
                </Button>
              </div>
            </div>

            <Table
              bottomContent={
                totalPages > 1 ? (
                  <div className="flex w-full justify-center mt-4">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={totalPages}
                      onChange={(p) => setPage(p)}
                    />
                  </div>
                ) : null
              }
              aria-label="Tabla de gestión de usuarios"
              classNames={{
                wrapper: "bg-transparent border-0 p-0 shadow-none",
                th: "bg-white/[0.04] text-white/70 font-semibold text-xs border-b border-white/10 py-3",
                td: "text-white/80 py-3.5 border-b border-white/5 text-xs"
              }}
            >
              <TableHeader>
                <TableColumn key="name" isRowHeader>Nombre Completo</TableColumn>
                <TableColumn key="email">Correo Electrónico</TableColumn>
                <TableColumn key="role">Rol de Sistema</TableColumn>
                <TableColumn key="company">Inmobiliaria Asociada</TableColumn>
                <TableColumn key="created">Fecha de Registro</TableColumn>
                <TableColumn key="actions" align="center">Acciones</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent="No se encontraron usuarios registrados"
                items={users}
                isLoading={loading}
              >
                {(item) => (
                  <TableRow key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <TableCell className="capitalize font-semibold text-white">
                      {item?.name} {item?.lastName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/70">{item?.email}</TableCell>
                    <TableCell>
                      {renderTableRoleChip(item?.type)}
                    </TableCell>
                    <TableCell className="font-medium text-[#0CDBFF] text-xs">
                      {item?.companyName || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-white/50">
                      {item?.created ? new Date(item.created).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center gap-2">
                        <Tooltip content="Editar usuario" delay={200}>
                          <Button 
                            size="sm" 
                            isIconOnly
                            variant="flat" 
                            className="bg-[#0CDBFF]/10 text-[#0CDBFF] hover:bg-[#0CDBFF]/20 border border-[#0CDBFF]/30 min-w-8 h-8 rounded-lg"
                            onPress={() => openEditModal(item)}
                          >
                            <EditIconV2 className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>

                        <Tooltip content="Eliminar usuario" delay={200}>
                          <Button 
                            size="sm" 
                            isIconOnly
                            variant="flat" 
                            className={`min-w-8 h-8 rounded-lg ${
                              item.email === "darksus78@gmail.com" 
                                ? "opacity-30 cursor-not-allowed bg-white/5 text-white/30 border border-white/5" 
                                : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                            }`}
                            isDisabled={item.email === "darksus78@gmail.com"}
                            onPress={() => openDeleteModal(item)}
                          >
                            <DeleteOutline className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Analiticas Section */
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Proyectos por Inmobiliaria</h4>
                <div className="h-[260px] w-full flex items-center justify-center">
                  {statsLoading ? (
                    <div className="text-white/50 text-xs">Cargando métricas...</div>
                  ) : (
                    <Bar data={projectsChartData} options={chartOptions} />
                  )}
                </div>
              </div>

              <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Proyectos Más Visitados</h4>
                <div className="h-[260px] w-full flex items-center justify-center">
                  {statsLoading ? (
                    <div className="text-white/50 text-xs">Cargando métricas...</div>
                  ) : (
                    <Bar data={visitsChartData} options={chartOptions} />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navegadores</h4>
                <div className="h-[260px] w-full flex items-center justify-center">
                  {trafficLoading ? (
                    <div className="text-white/50 text-xs">Cargando métricas...</div>
                  ) : (
                    <ChartBrowsers data={formatDataPerGraphic} />
                  )}
                </div>
              </div>

              <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tipos de Dispositivo</h4>
                <div className="h-[260px] w-full flex items-center justify-center">
                  {trafficLoading ? (
                    <div className="text-white/50 text-xs">Cargando métricas...</div>
                  ) : (
                    <ChartDeviceType data={formatDataPerGraphic} />
                  )}
                </div>
              </div>

              <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sistemas Operativos</h4>
                <div className="h-[260px] w-full flex items-center justify-center">
                  {trafficLoading ? (
                    <div className="text-white/50 text-xs">Cargando métricas...</div>
                  ) : (
                    <ChartOs data={formatDataPerGraphic} />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Número de Entradas por Día</h4>
              <div className="h-[300px] w-full flex items-center justify-center">
                {trafficLoading ? (
                  <div className="text-white/50 text-xs">Cargando métricas...</div>
                ) : (
                  <ChartQuantyPerDay data={formatDateToChart} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREATE USER */}
      <Modal 
        isOpen={isCreateOpen} 
        onOpenChange={onCreateOpenChange}
        placement="center"
        backdrop="blur"
        classNames={{
          content: "bg-[#0E1622]/95 backdrop-blur-2xl border border-white/10 text-white max-w-md rounded-2xl shadow-2xl",
          header: "border-b border-white/10 py-4 px-6",
          footer: "border-t border-white/10 py-3 px-6"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 text-base font-bold text-white">
                Añadir Nuevo Usuario
              </ModalHeader>
              <ModalBody id="create-user-modal-body" className="flex flex-col gap-4 py-6">
                <Input
                  label="Nombre"
                  placeholder="Ej: Juan"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formName}
                  onValueChange={setFormName}
                  classNames={{
                    input: "text-sm text-white",
                    label: "text-xs text-white/70"
                  }}
                  isRequired
                />
                <Input
                  label="Apellido"
                  placeholder="Ej: Pérez"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formLastName}
                  onValueChange={setFormLastName}
                  classNames={{
                    input: "text-sm text-white",
                    label: "text-xs text-white/70"
                  }}
                />
                <Input
                  label="Correo Electrónico"
                  placeholder="usuario@ejemplo.com"
                  type="email"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formEmail}
                  onValueChange={setFormEmail}
                  classNames={{
                    input: "text-sm text-white",
                    label: "text-xs text-white/70"
                  }}
                  isRequired
                />
                <Input
                  label="Contraseña"
                  placeholder="Mínimo 6 caracteres"
                  type="password"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formPassword}
                  onValueChange={setFormPassword}
                  classNames={{
                    input: "text-sm text-white",
                    label: "text-xs text-white/70"
                  }}
                  isRequired
                />
                <Select
                  label="Rol de Sistema"
                  labelPlacement="outside"
                  variant="bordered"
                  className="w-full text-white"
                  classNames={{
                    trigger: "border-white/20 bg-transparent text-white",
                    value: "text-white text-xs",
                    listbox: "bg-[#0E1622] text-white"
                  }}
                  selectedKeys={formType ? new Set([formType]) : new Set()}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    if (selected) setFormType(selected);
                  }}
                  popoverProps={{
                    portalContainer: typeof window !== "undefined" ? document.getElementById("create-user-modal-body") || document.body : undefined,
                    className: "z-[99999]"
                  }}
                  isRequired
                >
                  <SelectItem key="user" className="text-white" value="user">Visualizador (User)</SelectItem>
                  <SelectItem key="admin" className="text-white" value="admin">Administrador (Admin)</SelectItem>
                  <SelectItem key="company" className="text-white" value="company">Empresa / Inmobiliaria (Company)</SelectItem>
                </Select>
                <Select
                  label="Asociar Inmobiliaria"
                  placeholder="Opcional"
                  labelPlacement="outside"
                  variant="bordered"
                  className="w-full text-white"
                  classNames={{
                    trigger: "border-white/20 bg-transparent text-white",
                    value: "text-white text-xs",
                    listbox: "bg-[#0E1622] text-white"
                  }}
                  selectedKeys={formCompany ? new Set([formCompany]) : new Set()}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    setFormCompany(selected || "");
                  }}
                  popoverProps={{
                    portalContainer: typeof window !== "undefined" ? document.getElementById("create-user-modal-body") || document.body : undefined,
                    className: "z-[99999]"
                  }}
                >
                  {companies.map((c) => (
                    <SelectItem key={c._id} className="text-white" value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="text-white/70" onPress={onClose}>
                  Cancelar
                </Button>
                <Button className="bg-[#0CDBFF] text-black font-bold" onPress={handleCreateUser}>
                  Crear Usuario
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL EDIT USER */}
      <Modal 
        isOpen={isEditOpen} 
        onOpenChange={onEditOpenChange}
        placement="center"
        backdrop="blur"
        classNames={{
          content: "bg-[#0E1622]/95 backdrop-blur-2xl border border-white/10 text-white max-w-md rounded-2xl shadow-2xl",
          header: "border-b border-white/10 py-4 px-6",
          footer: "border-t border-white/10 py-3 px-6"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 text-base font-bold text-white">
                Editar Usuario
              </ModalHeader>
              <ModalBody id="edit-user-modal-body" className="flex flex-col gap-4 py-6">
                <Input
                  label="Nombre"
                  placeholder="Ej: Juan"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formName}
                  onValueChange={setFormName}
                  classNames={{
                    input: "text-sm text-white",
                    label: "text-xs text-white/70"
                  }}
                  isRequired
                />
                <Input
                  label="Apellido"
                  placeholder="Ej: Pérez"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formLastName}
                  onValueChange={setFormLastName}
                  classNames={{
                    input: "text-sm text-white",
                    label: "text-xs text-white/70"
                  }}
                />
                <Input
                  label="Correo Electrónico"
                  placeholder="usuario@ejemplo.com"
                  type="email"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formEmail}
                  onValueChange={setFormEmail}
                  classNames={{
                    input: "text-sm text-white",
                    label: "text-xs text-white/70"
                  }}
                  isRequired
                />
                <Input
                  label="Contraseña"
                  placeholder="Dejar en blanco para no cambiar"
                  type="password"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formPassword}
                  onValueChange={setFormPassword}
                  classNames={{
                    input: "text-sm text-white",
                    label: "text-xs text-white/70"
                  }}
                />
                <Select
                  label="Rol de Sistema"
                  labelPlacement="outside"
                  variant="bordered"
                  className="w-full text-white"
                  classNames={{
                    trigger: "border-white/20 bg-transparent text-white",
                    value: "text-white text-xs",
                    listbox: "bg-[#0E1622] text-white"
                  }}
                  selectedKeys={formType ? new Set([formType]) : new Set()}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    if (selected) setFormType(selected);
                  }}
                  popoverProps={{
                    portalContainer: typeof window !== "undefined" ? document.getElementById("edit-user-modal-body") || document.body : undefined,
                    className: "z-[99999]"
                  }}
                  isRequired
                >
                  <SelectItem key="user" className="text-white" value="user">Visualizador (User)</SelectItem>
                  <SelectItem key="admin" className="text-white" value="admin">Administrador (Admin)</SelectItem>
                  <SelectItem key="company" className="text-white" value="company">Empresa / Inmobiliaria (Company)</SelectItem>
                </Select>
                <Select
                  label="Asociar Inmobiliaria"
                  placeholder="Opcional"
                  labelPlacement="outside"
                  variant="bordered"
                  className="w-full text-white"
                  classNames={{
                    trigger: "border-white/20 bg-transparent text-white",
                    value: "text-white text-xs",
                    listbox: "bg-[#0E1622] text-white"
                  }}
                  selectedKeys={formCompany ? new Set([formCompany]) : new Set()}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    setFormCompany(selected || "");
                  }}
                  popoverProps={{
                    portalContainer: typeof window !== "undefined" ? document.getElementById("edit-user-modal-body") || document.body : undefined,
                    className: "z-[99999]"
                  }}
                >
                  {companies.map((c) => (
                    <SelectItem key={c._id} className="text-white" value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="text-white/70" onPress={onClose}>
                  Cancelar
                </Button>
                <Button className="bg-[#0CDBFF] text-black font-bold" onPress={handleEditUser}>
                  Guardar Cambios
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL CONFIRM DELETE */}
      <Modal 
        isOpen={isDeleteOpen} 
        onOpenChange={onDeleteOpenChange}
        placement="center"
        backdrop="blur"
        classNames={{
          content: "bg-[#0E1622]/95 backdrop-blur-2xl border border-white/10 text-white max-w-sm rounded-2xl shadow-2xl",
          header: "border-b border-white/10 py-4 px-6",
          footer: "border-t border-white/10 py-3 px-6"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 text-base font-bold text-white">
                Eliminar Usuario
              </ModalHeader>
              <ModalBody className="py-5">
                <p className="text-sm text-white/80">
                  ¿Estás seguro de que deseas eliminar permanentemente al usuario{" "}
                  <strong className="text-white font-bold">{selectedUser?.name} {selectedUser?.lastName}</strong> ({selectedUser?.email})?
                </p>
                <p className="text-xs text-rose-400/80 mt-1">
                  Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="text-white/70" onPress={onClose}>
                  Cancelar
                </Button>
                <Button className="bg-rose-500 text-white font-bold hover:bg-rose-600" onPress={handleDeleteUser}>
                  Sí, Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
}
