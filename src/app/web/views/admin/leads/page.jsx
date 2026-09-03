"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { getLeads, updateLeadStatus } from "./actions/leadActions";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, 
  Input, Spinner, Select, SelectItem, Tooltip
} from "@heroui/react";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import Whatsapp from "@/web/global_components/icons/Whatsapp";
import moment from "moment";

export default function LeadsAdminPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debounceTimer = useRef(null);

  const [statusFilter, setStatusFilter] = useState("Todos");
  const [companyFilter, setCompanyFilter] = useState("Todos");
  const [companies, setCompanies] = useState([]);

  const isPlatformAdmin = session?.user?.email === "darksus78@gmail.com" || session?.user?.rol === "company";

  const fetchLeadsData = async () => {
    setLoading(true);
    const res = await getLeads();
    if (res.success) {
      setLeads(res.data);
      
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchTerm(val);
    }, 250);
  };

  const handleSearchClear = () => {
    setSearchInput("");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSearchTerm("");
  };

  const handleStatusChange = async (leadId, newStatus) => {
    const res = await updateLeadStatus(leadId, newStatus);
    if (res.success) {
      toast.success(res.message);
      setLeads(prev => prev.map(lead => lead._id === leadId ? { ...lead, status: newStatus } : lead));
    } else {
      toast.error(res.message);
    }
  };

  // Filter leads based on search and selected options
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const nameMatch = lead.name ? lead.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const emailMatch = lead.email ? lead.email.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const phoneMatch = lead.phone ? lead.phone.includes(searchTerm) : false;
      const messageMatch = lead.message ? lead.message.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const projectMatch = lead.idProyect?.name ? lead.idProyect.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const terrainMatch = lead.terrainName ? lead.terrainName.toLowerCase().includes(searchTerm.toLowerCase()) : false;

      const matchesSearch = nameMatch || emailMatch || phoneMatch || messageMatch || projectMatch || terrainMatch;
      const matchesStatus = statusFilter === "Todos" || lead.status === statusFilter;
      const matchesCompany = companyFilter === "Todos" || (lead.idCompany && lead.idCompany._id === companyFilter);

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [leads, searchTerm, statusFilter, companyFilter]);

  // Conversion Metrics
  const stats = useMemo(() => {
    const total = leads.length;
    const nuevos = leads.filter(l => l.status === "Nuevo").length;
    const contactados = leads.filter(l => l.status === "Contactado").length;
    const ganados = leads.filter(l => l.status === "Ganado").length;
    const conversionRate = total > 0 ? Math.round((ganados / total) * 100) : 0;

    return { total, nuevos, contactados, ganados, conversionRate };
  }, [leads]);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      toast.error("No hay prospectos para exportar con los filtros actuales");
      return;
    }

    const headers = ["Fecha", "Nombre", "Telefono", "Correo", "Inmobiliaria", "Proyecto", "Lote", "Estado CRM", "Mensaje"];
    const rows = filteredLeads.map(lead => [
      `"${new Date(lead.creation_date).toLocaleDateString('es-ES')}"`,
      `"${lead.name || ""}"`,
      `"${lead.phone || ""}"`,
      `"${lead.email || ""}"`,
      `"${lead.idCompany?.name || "N/A"}"`,
      `"${lead.idProyect?.name || "N/A"}"`,
      `"${lead.terrainName || "N/A"}"`,
      `"${lead.status || "Nuevo"}"`,
      `"${(lead.message || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prospectos_myview_${moment().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Listado de prospectos exportado a CSV");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Nuevo":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Nuevo
          </span>
        );
      case "Contactado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-[#0CDBFF] border border-[#0CDBFF]/30 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0CDBFF]" />
            Contactado
          </span>
        );
      case "Ganado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ganado
          </span>
        );
      case "Perdido":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Perdido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/70 border border-white/10 select-none">
            {status}
          </span>
        );
    }
  };

  const renderCell = (lead, columnKey) => {
    const formattedDate = new Date(lead.creation_date).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    switch (columnKey) {
      case "date_client":
        return (
          <div className="flex flex-col min-w-0 pr-2">
            <span className="font-bold text-white text-sm truncate">{lead.name}</span>
            <span className="text-[10px] text-white/40 font-mono mt-0.5">{formattedDate}</span>
          </div>
        );

      case "contact":
        return (
          <div className="flex flex-col gap-1 text-xs min-w-0 pr-2">
            <div className="flex items-center gap-1.5 group/phone">
              <span className="text-white font-medium select-all truncate">{lead.phone}</span>
              <Tooltip content="Copiar teléfono" delay={200}>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(lead.phone);
                    toast.success("Teléfono copiado");
                  }}
                  className="opacity-0 group-hover/phone:opacity-100 p-0.5 text-white/40 hover:text-[#0CDBFF] transition-opacity flex-shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center gap-1.5 group/mail">
              <span className="text-white/60 truncate select-all">{lead.email}</span>
              <Tooltip content="Copiar correo" delay={200}>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(lead.email);
                    toast.success("Correo copiado");
                  }}
                  className="opacity-0 group-hover/mail:opacity-100 p-0.5 text-white/40 hover:text-[#0CDBFF] transition-opacity flex-shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </Tooltip>
            </div>
          </div>
        );

      case "project":
        return (
          <div className="flex flex-col gap-0.5 min-w-0 pr-2">
            <span className="text-xs font-bold text-white truncate">{lead.idProyect?.name || "—"}</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isPlatformAdmin && lead.idCompany?.name && (
                <span className="text-[11px] font-medium text-[#0CDBFF] truncate">
                  {lead.idCompany.name}
                </span>
              )}
              {lead.terrainName && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Lote {lead.terrainName}
                </span>
              )}
            </div>
          </div>
        );

      case "message":
        return (
          <Tooltip content={lead.message || "Sin comentarios"} delay={300} placement="top-start" className="max-w-xs">
            <p className="text-xs text-white/60 truncate cursor-help max-w-[260px]">
              {lead.message || "Sin comentarios."}
            </p>
          </Tooltip>
        );

      case "crm":
        return (
          <Dropdown placement="bottom-start" classNames={{
            content: "bg-[#0E1622]/95 backdrop-blur-2xl border border-white/10 text-white rounded-2xl shadow-2xl p-1 min-w-[170px]"
          }}>
            <DropdownTrigger>
              <button className="cursor-pointer focus:outline-none flex items-center gap-1 group">
                {getStatusBadge(lead.status)}
                <svg className="w-3 h-3 text-white/40 group-hover:text-white transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Cambiar Estado del Lead" 
              onAction={(key) => handleStatusChange(lead._id, key)}
            >
              <DropdownItem key="Nuevo" className="text-amber-400 rounded-xl">
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Nuevo
                </span>
              </DropdownItem>
              <DropdownItem key="Contactado" className="text-[#0CDBFF] rounded-xl">
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0CDBFF]" />
                  Contactado
                </span>
              </DropdownItem>
              <DropdownItem key="Ganado" className="text-emerald-400 rounded-xl">
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ganado (Cierre)
                </span>
              </DropdownItem>
              <DropdownItem key="Perdido" className="text-rose-400 rounded-xl">
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Perdido (Descartado)
                </span>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );

      case "actions":
        const cleanPhone = (lead.phone || "").replace(/\D/g, "");
        const waText = encodeURIComponent(`Hola ${lead.name}, gracias por tu interés en MyView respecto al proyecto "${lead.idProyect?.name || ""}"${lead.terrainName ? ` (Lote: ${lead.terrainName})` : ""}. ¿En qué te podemos ayudar?`);

        return (
          <Button
            as="a"
            href={`https://wa.me/${cleanPhone}?text=${waText}`}
            target="_blank"
            size="sm"
            className="bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 font-bold text-xs h-7 px-2.5 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <div className="w-3.5 h-3.5 flex-shrink-0">
              <Whatsapp />
            </div>
            WhatsApp
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[85vh] text-white p-6 md:px-12 md:py-8 max-w-7xl mx-auto space-y-8 relative z-10 font-sans mt-[70px]">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Gestión de <span className="text-[#0CDBFF]">Prospectos</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CRM Activo
            </span>
          </div>
          <p className="text-white/60 mt-1.5 text-sm md:text-base">
            Seguimiento de clientes potenciales, contacto inmediato y conversión de ventas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onPress={exportToCSV}
            size="sm"
            variant="flat"
            className="bg-white/5 border border-white/10 text-white hover:text-[#0CDBFF] font-semibold h-10 px-4 rounded-xl"
            startContent={
              <svg className="w-4 h-4 text-[#0CDBFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            Exportar CSV
          </Button>

          <Button 
            onPress={fetchLeadsData} 
            size="sm"
            variant="flat" 
            className="bg-[#0CDBFF]/10 border border-[#0CDBFF]/30 text-[#0CDBFF] font-bold h-10 px-4 rounded-xl hover:bg-[#0CDBFF]/20"
            startContent={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Funnel Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Total Prospectos</span>
            <div className="p-1.5 rounded-lg bg-[#0CDBFF]/10 text-[#0CDBFF]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-2">{stats.total}</p>
          <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#0CDBFF] h-full w-full" />
          </div>
        </div>

        {/* Nuevos */}
        <div className="bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Nuevos por Atender</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse block" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400 mt-2">{stats.nuevos}</p>
          <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-400 h-full transition-all" 
              style={{ width: `${stats.total > 0 ? (stats.nuevos / stats.total) * 100 : 0}%` }} 
            />
          </div>
        </div>

        {/* Contactados */}
        <div className="bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">En Seguimiento</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-cyan-300 mt-2">{stats.contactados}</p>
          <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-cyan-300 h-full transition-all" 
              style={{ width: `${stats.total > 0 ? (stats.contactados / stats.total) * 100 : 0}%` }} 
            />
          </div>
        </div>

        {/* Ganados / Cierres */}
        <div className="bg-gradient-to-br from-[#0B151F]/90 to-[#12202E]/90 border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Ganados / Cierre</span>
              <span className="text-[10px] font-mono text-emerald-400/70 font-bold">({stats.conversionRate}%)</span>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2">{stats.ganados}</p>
          <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full transition-all" 
              style={{ width: `${stats.total > 0 ? (stats.ganados / stats.total) * 100 : 0}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-5 bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-2xl">
        <div className="flex-1 w-full max-w-md">
          <Input
            placeholder="Buscar por cliente, teléfono, lote, correo..."
            value={searchInput}
            onValueChange={handleSearchChange}
            isClearable
            onClear={handleSearchClear}
            startContent={<SearchIcon size={16} className="text-white/40" />}
            size="sm"
            radius="lg"
            classNames={{
              input: "text-xs text-white placeholder:text-white/30",
              inputWrapper: "bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 focus-within:!border-[#0CDBFF] h-10"
            }}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <div className="w-full sm:w-[180px]">
            <Select
              placeholder="Estado CRM"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => {
                const sel = Array.from(keys)[0];
                setStatusFilter(sel || "Todos");
              }}
              size="sm"
              radius="lg"
              variant="bordered"
              classNames={{
                trigger: "bg-white/[0.04] border-white/10 h-10 text-xs text-white",
                value: "text-xs text-white",
                listbox: "bg-[#0E1622] text-white"
              }}
            >
              <SelectItem key="Todos" className="text-white">Todos los Estados</SelectItem>
              <SelectItem key="Nuevo" className="text-amber-400">Nuevo</SelectItem>
              <SelectItem key="Contactado" className="text-[#0CDBFF]">Contactado</SelectItem>
              <SelectItem key="Ganado" className="text-emerald-400">Ganado</SelectItem>
              <SelectItem key="Perdido" className="text-rose-400">Perdido</SelectItem>
            </Select>
          </div>

          {/* Company Filter (Superadmin / Platform Admin only) */}
          {isPlatformAdmin && companies.length > 0 && (
            <div className="w-full sm:w-[200px]">
              <Select
                placeholder="Inmobiliaria"
                selectedKeys={[companyFilter]}
                onSelectionChange={(keys) => {
                  const sel = Array.from(keys)[0];
                  setCompanyFilter(sel || "Todos");
                }}
                size="sm"
                radius="lg"
                variant="bordered"
                classNames={{
                  trigger: "bg-white/[0.04] border-white/10 h-10 text-xs text-white",
                  value: "text-xs text-white",
                  listbox: "bg-[#0E1622] text-white"
                }}
              >
                <SelectItem key="Todos" className="text-white">Todas las Empresas</SelectItem>
                {companies.map(co => (
                  <SelectItem key={co._id} className="text-white" value={co._id}>
                    {co.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 bg-[#0B151F]/60 backdrop-blur-xl border border-white/10 rounded-2xl">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-white/50 text-xs">Cargando directorio de prospectos...</p>
        </div>
      ) : filteredLeads.length > 0 ? (
        <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-2 md:p-4">
          <Table 
            aria-label="Tabla de Leads" 
            className="dark w-full"
            classNames={{
              wrapper: "bg-transparent border-0 p-0 shadow-none overflow-x-hidden",
              table: "w-full min-w-full table-auto",
              th: "bg-white/[0.04] text-white/70 font-semibold text-xs border-b border-white/10 py-3",
              td: "text-white/80 py-3.5 border-b border-white/5 text-xs"
            }}
          >
            <TableHeader>
              <TableColumn className="w-[18%]">INTERESADO / FECHA</TableColumn>
              <TableColumn className="w-[24%]">CONTACTO</TableColumn>
              <TableColumn className="w-[20%]">PROYECTO / DETALLES</TableColumn>
              <TableColumn className="w-[18%]">MENSAJE</TableColumn>
              <TableColumn className="w-[10%]">ESTADO</TableColumn>
              <TableColumn className="w-[10%]" align="end">ACCIÓN</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No se encontraron prospectos">
              {filteredLeads.map((lead) => (
                <TableRow key={lead._id} className="hover:bg-white/[0.02] transition-colors">
                  <TableCell>{renderCell(lead, "date_client")}</TableCell>
                  <TableCell>{renderCell(lead, "contact")}</TableCell>
                  <TableCell>{renderCell(lead, "project")}</TableCell>
                  <TableCell>{renderCell(lead, "message")}</TableCell>
                  <TableCell>{renderCell(lead, "crm")}</TableCell>
                  <TableCell>{renderCell(lead, "actions")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-16 text-center bg-[#0B151F]/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-white/30">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-white/80 text-base font-bold">No se encontraron prospectos</p>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            Prueba ajustando los filtros o realizando otra búsqueda de cliente.
          </p>
        </div>
      )}
    </div>
  );
}
