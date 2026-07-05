"use client";
import React, { useEffect, useState, useMemo } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Pagination, Input, Button, useDisclosure, Chip, Dropdown, DropdownTrigger, 
  DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Select, SelectItem
} from "@heroui/react";
import { Toaster, toast } from "sonner";
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";
import EditIconV2 from "@/web/global_components/icons/EditIconV2";
import DeleteOutline from "@/web/global_components/icons/DeleteIcon";
import Eye from "@/web/global_components/icons/Eye";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

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
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

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
      loadStats(); // Recalculate stats counts
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
          label: "Visitas / Vistas",
          data: data.length ? data : [0],
          backgroundColor: "rgba(255, 0, 122, 0.6)",
          borderColor: "rgba(255, 0, 122, 1)",
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    };
  }, [stats.popularProjects]);

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

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen px-4 md:px-12 py-8 mt-[80px]">
      <Toaster richColors position="top-right" />
      <div className="w-full max-w-7xl flex flex-col gap-8">
        
        {/* Page Title & Dashboard Intro */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Dashboard de <span className="text-[#0CDBFF]">Superadmin</span>
            </h1>
            <p className="text-white/60 mt-2 text-sm md:text-base">
              Administración global del sistema MyView_: usuarios, inmobiliarias, estadísticas y monitoreo.
            </p>
          </div>
          <Chip color="secondary" variant="shadow" className="text-white font-semibold">
            Superadmin Acceso: darksus78@gmail.com
          </Chip>
        </div>

        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Total Users */}
          <div className="relative overflow-hidden group bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-[#0CDBFF]/40 hover:-translate-y-1 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-16 h-16 bg-[#0CDBFF] rounded-full blur-xl" />
            </div>
            <p className="text-white/50 uppercase tracking-wider text-xs font-semibold">Total Usuarios</p>
            <h3 className="text-3xl md:text-4xl font-black text-white mt-2">
              {statsLoading ? "..." : stats.totalUsers}
            </h3>
            <div className="w-full bg-white/10 h-[2px] rounded-full mt-4 overflow-hidden">
              <div className="bg-[#0CDBFF] h-full w-[65%]" />
            </div>
          </div>

          {/* Card Total Companies */}
          <div className="relative overflow-hidden group bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-[#FF007A]/40 hover:-translate-y-1 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-16 h-16 bg-[#FF007A] rounded-full blur-xl" />
            </div>
            <p className="text-white/50 uppercase tracking-wider text-xs font-semibold">Inmobiliarias</p>
            <h3 className="text-3xl md:text-4xl font-black text-white mt-2">
              {statsLoading ? "..." : stats.totalCompanies}
            </h3>
            <div className="w-full bg-white/10 h-[2px] rounded-full mt-4 overflow-hidden">
              <div className="bg-[#FF007A] h-full w-[45%]" />
            </div>
          </div>

          {/* Card Total Projects */}
          <div className="relative overflow-hidden group bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-[#7000FF]/40 hover:-translate-y-1 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-16 h-16 bg-[#7000FF] rounded-full blur-xl" />
            </div>
            <p className="text-white/50 uppercase tracking-wider text-xs font-semibold">Proyectos 3D</p>
            <h3 className="text-3xl md:text-4xl font-black text-white mt-2">
              {statsLoading ? "..." : stats.totalProjects}
            </h3>
            <div className="w-full bg-white/10 h-[2px] rounded-full mt-4 overflow-hidden">
              <div className="bg-[#7000FF] h-full w-[55%]" />
            </div>
          </div>

          {/* Card Total Analytics */}
          <div className="relative overflow-hidden group bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-[#00FF87]/40 hover:-translate-y-1 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-16 h-16 bg-[#00FF87] rounded-full blur-xl" />
            </div>
            <p className="text-white/50 uppercase tracking-wider text-xs font-semibold">Visitas Registradas</p>
            <h3 className="text-3xl md:text-4xl font-black text-white mt-2">
              {statsLoading ? "..." : stats.totalAnalytics}
            </h3>
            <div className="w-full bg-white/10 h-[2px] rounded-full mt-4 overflow-hidden">
              <div className="bg-[#00FF87] h-full w-[80%]" />
            </div>
          </div>
        </div>

        {/* Charts & Visual Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#0B151F]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <h4 className="text-lg font-bold text-white uppercase tracking-wide">Proyectos por Inmobiliaria</h4>
            <div className="h-[260px] w-full flex items-center justify-center">
              {statsLoading ? (
                <div className="text-white/55">Cargando gráfico...</div>
              ) : (
                <Bar data={projectsChartData} options={chartOptions} />
              )}
            </div>
          </div>

          <div className="bg-[#0B151F]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <h4 className="text-lg font-bold text-white uppercase tracking-wide">Proyectos Más Visitados</h4>
            <div className="h-[260px] w-full flex items-center justify-center">
              {statsLoading ? (
                <div className="text-white/55">Cargando gráfico...</div>
              ) : (
                <Bar data={visitsChartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-[#0B151F]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
              Gestión de Usuarios
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                isClearable
                className="w-full sm:max-w-[280px]"
                placeholder="Buscar por nombre o correo..."
                startContent={<SearchIcon />}
                value={search}
                onValueChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                size="sm"
              />
              <Button
                color="primary"
                startContent={<PlusIcon />}
                onPress={() => {
                  resetForm();
                  onCreateOpen();
                }}
                className="font-semibold"
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
              th: "bg-white/5 text-white/70 font-semibold border-b border-white/10",
              td: "text-white/80 py-4 border-b border-white/5"
            }}
          >
            <TableHeader>
              <TableColumn>Nombre Completo</TableColumn>
              <TableColumn>Correo Electrónico</TableColumn>
              <TableColumn>Rol de Sistema</TableColumn>
              <TableColumn>Inmobiliaria Asociada</TableColumn>
              <TableColumn>Fecha de Registro</TableColumn>
              <TableColumn align="center">Acciones</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="No se encontraron usuarios registrados"
              items={users}
              isLoading={loading}
            >
              {(item) => (
                <TableRow key={item._id}>
                  <TableCell className="capitalize font-medium">
                    {item?.name} {item?.lastName}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item?.email}</TableCell>
                  <TableCell>
                    <Chip
                      className="capitalize border-none font-semibold text-xs"
                      color={
                        item?.type === "company" 
                          ? "success" 
                          : item?.type === "admin" 
                            ? "secondary" 
                            : "default"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {item?.type === "company" ? "Dueño / SaaS" : item?.type === "admin" ? "Inmo Admin" : "Usuario Visualizador"}
                    </Chip>
                  </TableCell>
                  <TableCell className="font-semibold text-[#0CDBFF] text-xs">
                    {item?.companyName}
                  </TableCell>
                  <TableCell className="text-xs text-white/60">
                    {item?.created ? new Date(item.created).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="relative flex justify-center items-center gap-2">
                      <Dropdown backdrop="blur">
                        <DropdownTrigger>
                          <Button size="sm" variant="bordered" className="text-white border-white/20 hover:bg-white/10">
                            Opciones
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu 
                          aria-label="Acciones de usuario"
                          className="bg-[#12202E]/95 border border-white/10 text-white"
                          onAction={(key) => {
                            if (key === "edit") openEditModal(item);
                            if (key === "delete") openDeleteModal(item);
                          }}
                        >
                          <DropdownItem
                            key="edit"
                            startContent={<EditIconV2 className="w-4 h-4" />}
                          >
                            Editar Usuario
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<DeleteOutline className="w-4 h-4" />}
                            isDisabled={item.email === "darksus78@gmail.com"}
                          >
                            Eliminar Usuario
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL CREATE USER */}
      <Modal 
        isOpen={isCreateOpen} 
        onOpenChange={onCreateOpenChange}
        placement="center"
        backdrop="blur"
        classNames={{
          content: "bg-[#0B151F] border border-white/10 text-white max-w-md",
          header: "border-b border-white/10",
          footer: "border-t border-white/10"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Añadir Nuevo Usuario</ModalHeader>
              <ModalBody className="flex flex-col gap-4 py-6">
                <Input
                  label="Nombre"
                  placeholder="Ej: Juan"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formName}
                  onValueChange={setFormName}
                  isRequired
                />
                <Input
                  label="Apellido"
                  placeholder="Ej: Pérez"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formLastName}
                  onValueChange={setFormLastName}
                />
                <Input
                  label="Correo Electrónico"
                  placeholder="usuario@ejemplo.com"
                  type="email"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formEmail}
                  onValueChange={setFormEmail}
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
                  isRequired
                />
                <Select
                  label="Rol de Sistema"
                  labelPlacement="outside"
                  variant="bordered"
                  className="w-full text-white"
                  classNames={{
                    trigger: "border-white/20 bg-transparent text-white",
                    value: "text-white",
                    listbox: "bg-[#0B151F] text-white"
                  }}
                  selectedKeys={[formType]}
                  onChange={(e) => setFormType(e.target.value)}
                  isRequired
                >
                  <SelectItem key="user" className="text-white" value="user">Usuario Visualizador (User)</SelectItem>
                  <SelectItem key="admin" className="text-white" value="admin">Admin Inmobiliaria (Admin)</SelectItem>
                  <SelectItem key="company" className="text-white" value="company">Dueño / MyView Administrador (Company)</SelectItem>
                </Select>
                <Select
                  label="Asociar Inmobiliaria / Compañía"
                  placeholder="Opcional"
                  labelPlacement="outside"
                  variant="bordered"
                  className="w-full text-white"
                  classNames={{
                    trigger: "border-white/20 bg-transparent text-white",
                    value: "text-white",
                    listbox: "bg-[#0B151F] text-white"
                  }}
                  selectedKeys={[formCompany]}
                  onChange={(e) => setFormCompany(e.target.value)}
                >
                  {companies.map((c) => (
                    <SelectItem key={c._id} className="text-white" value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleCreateUser}>
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
          content: "bg-[#0B151F] border border-white/10 text-white max-w-md",
          header: "border-b border-white/10",
          footer: "border-t border-white/10"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Editar Usuario</ModalHeader>
              <ModalBody className="flex flex-col gap-4 py-6">
                <Input
                  label="Nombre"
                  placeholder="Ej: Juan"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formName}
                  onValueChange={setFormName}
                  isRequired
                />
                <Input
                  label="Apellido"
                  placeholder="Ej: Pérez"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formLastName}
                  onValueChange={setFormLastName}
                />
                <Input
                  label="Correo Electrónico"
                  placeholder="usuario@ejemplo.com"
                  type="email"
                  labelPlacement="outside"
                  variant="bordered"
                  value={formEmail}
                  onValueChange={setFormEmail}
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
                />
                <Select
                  label="Rol de Sistema"
                  labelPlacement="outside"
                  variant="bordered"
                  className="w-full text-white"
                  classNames={{
                    trigger: "border-white/20 bg-transparent text-white",
                    value: "text-white",
                    listbox: "bg-[#0B151F] text-white"
                  }}
                  selectedKeys={[formType]}
                  onChange={(e) => setFormType(e.target.value)}
                  isRequired
                >
                  <SelectItem key="user" className="text-white" value="user">Usuario Visualizador (User)</SelectItem>
                  <SelectItem key="admin" className="text-white" value="admin">Admin Inmobiliaria (Admin)</SelectItem>
                  <SelectItem key="company" className="text-white" value="company">Dueño / MyView Administrador (Company)</SelectItem>
                </Select>
                <Select
                  label="Asociar Inmobiliaria / Compañía"
                  placeholder="Opcional"
                  labelPlacement="outside"
                  variant="bordered"
                  className="w-full text-white"
                  classNames={{
                    trigger: "border-white/20 bg-transparent text-white",
                    value: "text-white",
                    listbox: "bg-[#0B151F] text-white"
                  }}
                  selectedKeys={[formCompany]}
                  onChange={(e) => setFormCompany(e.target.value)}
                >
                  {companies.map((c) => (
                    <SelectItem key={c._id} className="text-white" value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleEditUser}>
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
          content: "bg-[#0B151F] border border-white/10 text-white max-w-sm",
          header: "border-b border-white/10",
          footer: "border-t border-white/10"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-danger flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
              <ModalBody className="py-6">
                <p className="text-sm text-white/80">
                  ¿Estás seguro de que deseas eliminar al usuario{" "}
                  <span className="font-semibold text-white capitalize">
                    {selectedUser?.name} {selectedUser?.lastName}
                  </span>
                  ? Esta acción no se puede deshacer y revocará todo acceso de manera inmediata.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="danger" className="font-semibold" onPress={handleDeleteUser}>
                  Eliminar permanentemente
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
