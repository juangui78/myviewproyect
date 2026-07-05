"use client"
import React, { useEffect, useState } from "react";
import { getLeads, updateLeadStatus } from "./actions/leadActions";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, 
  Input, Spinner, Card, CardBody
} from "@heroui/react";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";

export default function LeadsAdminPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [companyFilter, setCompanyFilter] = useState("Todos");
  
  // Unique companies list for filtering (only for superadmin / platform admin)
  const [companies, setCompanies] = useState([]);

  const isPlatformAdmin = session?.user?.email === "darksus78@gmail.com" || session?.user?.rol === "company";

  const fetchLeadsData = async () => {
    setLoading(true);
    const res = await getLeads();
    if (res.success) {
      setLeads(res.data);
      
      // Extract unique companies for filtering
      const uniqueCompanies = [];
      const seen = new Set();
      res.data.forEach(lead => {
        const co = lead.idCompany;
        if (co && !seen.has(co._id)) {
          seen.add(co._id);
          uniqueCompanies.push(co);
        }
      });
      setCompanies(uniqueCompanies);
    } else {
      toast.error(res.message || "Error al cargar prospectos.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchLeadsData();
    }
  }, [session]);

  const handleStatusChange = async (leadId, newStatus) => {
    const res = await updateLeadStatus(leadId, newStatus);
    if (res.success) {
      toast.success(res.message);
      // Update state locally
      setLeads(prev => prev.map(lead => lead._id === leadId ? { ...lead, status: newStatus } : lead));
    } else {
      toast.error(res.message);
    }
  };

  // Color mapping for CRM status
  const getStatusColor = (status) => {
    switch (status) {
      case "Nuevo":
        return "warning"; // Yellow
      case "Contactado":
        return "primary"; // Blue
      case "Ganado":
        return "success"; // Green
      case "Perdido":
        return "danger"; // Red
      default:
        return "default";
    }
  };

  // Filter leads based on search and selected options
  const filteredLeads = leads.filter(lead => {
    const nameMatch = lead.name ? lead.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const emailMatch = lead.email ? lead.email.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const phoneMatch = lead.phone ? lead.phone.includes(searchTerm) : false;
    const messageMatch = lead.message ? lead.message.toLowerCase().includes(searchTerm.toLowerCase()) : false;

    const matchesSearch = nameMatch || emailMatch || phoneMatch || messageMatch;
      
    const matchesStatus = statusFilter === "Todos" || lead.status === statusFilter;
    
    const matchesCompany = companyFilter === "Todos" || (lead.idCompany && lead.idCompany._id === companyFilter);

    return matchesSearch && matchesStatus && matchesCompany;
  });

  return (
    <div className="min-h-[85vh] text-white p-6 md:p-12 max-w-7xl mx-auto space-y-8 relative z-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#0CDBFF] to-[#00C662] bg-clip-text text-transparent mb-2">
            Panel de Prospectos / Leads
          </h1>
          <p className="text-sm text-white/50">
            Administra, filtra y haz seguimiento de los clientes interesados en tus lotes y proyectos.
          </p>
        </div>
        <Button 
          onPress={fetchLeadsData} 
          variant="flat" 
          className="bg-white/5 border border-white/10 text-[#0CDBFF] font-bold"
        >
          🔄 Actualizar Lista
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0B151F] border border-white/5 shadow-xl">
          <CardBody className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-white/40 block font-black tracking-widest">Total Leads</span>
            <span className="text-3xl font-extrabold text-white mt-1">{filteredLeads.length}</span>
          </CardBody>
        </Card>
        <Card className="bg-[#0B151F] border border-white/5 shadow-xl">
          <CardBody className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-warning uppercase block font-black tracking-widest">Nuevos</span>
            <span className="text-3xl font-extrabold text-warning mt-1">
              {filteredLeads.filter(l => l.status === "Nuevo").length}
            </span>
          </CardBody>
        </Card>
        <Card className="bg-[#0B151F] border border-white/5 shadow-xl">
          <CardBody className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-primary uppercase block font-black tracking-widest">Contactados</span>
            <span className="text-3xl font-extrabold text-primary mt-1">
              {filteredLeads.filter(l => l.status === "Contactado").length}
            </span>
          </CardBody>
        </Card>
        <Card className="bg-[#0B151F] border border-white/5 shadow-xl">
          <CardBody className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-success block font-black tracking-widest uppercase">Cerrados / Ganados</span>
            <span className="text-3xl font-extrabold text-success mt-1">
              {filteredLeads.filter(l => l.status === "Ganado").length}
            </span>
          </CardBody>
        </Card>
      </div>

      {/* Filtros */}
      <div className="p-6 bg-[#0B151F] border border-white/10 rounded-2xl flex flex-col md:flex-row gap-4 items-end shadow-2xl">
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs text-white/60 font-semibold block">Búsqueda rápida</label>
          <Input
            placeholder="Buscar por nombre, correo, cel..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            variant="bordered"
            isClearable
            className="text-white"
          />
        </div>

        <div className="w-full md:w-[200px] space-y-2">
          <label className="text-xs text-white/60 font-semibold block">Estado CRM</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 bg-[#12202E] border border-white/20 text-white rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="Todos">Todos los Estados</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Contactado">Contactado</option>
            <option value="Ganado">Ganado</option>
            <option value="Perdido">Perdido</option>
          </select>
        </div>

        {isPlatformAdmin && companies.length > 0 && (
          <div className="w-full md:w-[200px] space-y-2">
            <label className="text-xs text-white/60 font-semibold block">Inmobiliaria</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full h-10 px-3 bg-[#12202E] border border-white/20 text-white rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="Todos">Todas las Empresas</option>
              {companies.map(co => (
                <option key={co._id} value={co._id}>{co.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 bg-[#0B151F]/40 border border-white/10 rounded-2xl">
          <Spinner size="lg" color="success" />
          <p className="mt-4 text-white/50 text-sm">Cargando prospectos de la base de datos...</p>
        </div>
      ) : filteredLeads.length > 0 ? (
        <Card className="bg-[#0B151F]/60 border border-white/10 overflow-hidden shadow-2xl">
          <Table aria-label="Tabla de Leads" className="dark" isHeaderSticky>
            <TableHeader>
              <TableColumn>FECHA / CLIENTE</TableColumn>
              <TableColumn>CONTACTO</TableColumn>
              {isPlatformAdmin && <TableColumn>INMOBILIARIA</TableColumn>}
              <TableColumn>PROYECTO / INTERÉS</TableColumn>
              <TableColumn>MENSAJE ADICIONAL</TableColumn>
              <TableColumn>ESTADO CRM</TableColumn>
              <TableColumn>ACCIONES RÁPIDAS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => {
                const formattedDate = new Date(lead.creation_date).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <TableRow key={lead._id} className="hover:bg-white/5 transition-colors border-b border-white/5">
                    {/* Fecha y Nombre */}
                    <TableCell>
                      <div>
                        <span className="text-[10px] text-white/40 block font-mono">{formattedDate}</span>
                        <span className="font-bold text-white text-sm block mt-0.5">{lead.name}</span>
                      </div>
                    </TableCell>

                    {/* Teléfono / Email */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="text-white/80 text-xs font-semibold block">{lead.phone}</span>
                        <span className="text-white/40 text-[11px] block">{lead.email}</span>
                      </div>
                    </TableCell>

                    {/* Inmobiliaria (solo para Platform Admins) */}
                    {isPlatformAdmin && (
                      <TableCell>
                        <span className="text-xs font-medium text-emerald-400">
                          {lead.idCompany?.name || "N/A"}
                        </span>
                      </TableCell>
                    )}

                    {/* Proyecto / Lote */}
                    <TableCell>
                      <div>
                        <span className="text-xs font-bold text-white block">{lead.idProyect?.name || "N/A"}</span>
                        {lead.terrainName ? (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black bg-[#0CDBFF]/15 text-[#0CDBFF] border border-[#0CDBFF]/20">
                            Lote: {lead.terrainName}
                          </span>
                        ) : (
                          <span className="text-[10px] text-white/30 block mt-0.5">Información general</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Mensaje */}
                    <TableCell className="max-w-[200px]">
                      <p className="text-xs text-white/70 truncate hover:whitespace-normal transition-all" title={lead.message}>
                        {lead.message || "Sin comentarios."}
                      </p>
                    </TableCell>

                    {/* Estado CRM (Chips interactivos con Dropdown) */}
                    <TableCell>
                      <Dropdown placement="bottom-start" className="dark">
                        <DropdownTrigger>
                          <Button 
                            size="sm" 
                            variant="light" 
                            className="p-0 bg-transparent min-w-0"
                          >
                            <Chip 
                              color={getStatusColor(lead.status)} 
                              size="sm" 
                              variant="flat" 
                              className="cursor-pointer font-bold hover:scale-105 transition-transform"
                            >
                              {lead.status} ▾
                            </Chip>
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu 
                          aria-label="Cambiar Estado del Lead" 
                          onAction={(key) => handleStatusChange(lead._id, key)}
                        >
                          <DropdownItem key="Nuevo" className="text-warning">🟡 Nuevo</DropdownItem>
                          <DropdownItem key="Contactado" className="text-primary">🔵 Contactado</DropdownItem>
                          <DropdownItem key="Ganado" className="text-success">🟢 Ganado (Cerrado)</DropdownItem>
                          <DropdownItem key="Perdido" className="text-danger">🔴 Perdido (Descartado)</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>

                    {/* Acciones Rápidas */}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          as="a"
                          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${lead.name}, nos dejas tus datos en MyView sobre el proyecto "${lead.idProyect?.name || ""}". ¿En qué te podemos ayudar?`)}`}
                          target="_blank"
                          size="sm"
                          className="bg-[#25D366]/10 text-[#25D366] font-bold hover:bg-[#25D366]/20 border border-[#25D366]/20"
                        >
                          WhatsApp
                        </Button>
                        <Button
                          as="a"
                          href={`mailto:${lead.email}?subject=Interés en proyecto ${lead.idProyect?.name || ""}`}
                          size="sm"
                          variant="bordered"
                          className="text-white/60 hover:text-white border-white/10 hover:border-white/20"
                        >
                          Correo
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="p-16 text-center bg-[#0B151F]/40 border border-white/10 rounded-2xl space-y-3">
          <p className="text-white/60 text-lg font-semibold">No se encontraron prospectos</p>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            Asegúrate de remover filtros o realizar una búsqueda diferente si esperas ver datos en este listado.
          </p>
        </div>
      )}
      
      <Toaster richColors position="top-right" />
    </div>
  );
}
