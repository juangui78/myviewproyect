"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Input, Button, Chip, Tooltip } from "@heroui/react";
import { toast } from "sonner";
import { getCompaniesWithActiveProjects } from "../actions/superadminActions";

export default function CompaniesProjectsView() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'withProjects' | 'noProjects'
  const [expandedCompanies, setExpandedCompanies] = useState(new Set());

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getCompaniesWithActiveProjects();
      if (res.success) {
        setCompanies(res.data);
        // Expand companies that have active projects by default
        const initialExpanded = new Set();
        res.data.forEach((c) => {
          if (c.activeProjectsCount > 0) {
            initialExpanded.add(c._id);
          }
        });
        setExpandedCompanies(initialExpanded);
      } else {
        toast.error("Error al cargar empresas y proyectos: " + res.message);
      }
    } catch (err) {
      toast.error("Error de conexión al cargar datos.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleExpand = (companyId) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(companies.map((c) => c._id));
    setExpandedCompanies(allIds);
  };

  const collapseAll = () => {
    setExpandedCompanies(new Set());
  };

  const copyProjectLink = (projectId, projectName) => {
    const fullUrl = `${window.location.origin}/proyectos/${projectId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success(`Enlace de "${projectName}" copiado al portapapeles.`);
  };

  // Metrics summary
  const summaryMetrics = useMemo(() => {
    const totalCompanies = companies.filter((c) => c._id !== "unassigned").length;
    const withActiveProjects = companies.filter((c) => c.activeProjectsCount > 0).length;
    const totalActiveProjects = companies.reduce((acc, c) => acc + c.activeProjectsCount, 0);

    return {
      totalCompanies,
      withActiveProjects,
      totalActiveProjects
    };
  }, [companies]);

  // Filtering
  const filteredCompanies = useMemo(() => {
    let list = [...companies];

    // Filter mode
    if (filterMode === "withProjects") {
      list = list.filter((c) => c.activeProjectsCount > 0);
    } else if (filterMode === "noProjects") {
      list = list.filter((c) => c.activeProjectsCount === 0);
    }

    // Search query
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      list = list.filter((c) => {
        const matchesCompany =
          c.name.toLowerCase().includes(query) ||
          c.city.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query);

        const matchesProject = c.activeProjects.some(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.city.toLowerCase().includes(query) ||
            p.department.toLowerCase().includes(query)
        );

        return matchesCompany || matchesProject;
      });
    }

    return list;
  }, [companies, filterMode, search]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0CDBFF] shadow-[0_0_10px_#0CDBFF]"></span>
            <span className="text-xs font-mono tracking-widest text-[#0CDBFF] uppercase font-bold">
              Supervisión de Inmobiliarias & Proyectos 3D
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Empresas y Proyectos Activos
          </h3>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Inspecciona cada inmobiliaria registrada en el ecosistema MyView, la cantidad de proyectos 3D activos y accede directamente al visor digital interactivo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="bordered"
            className="border-white/10 text-white/80 hover:text-white text-xs font-mono"
            onPress={loadData}
            isLoading={loading}
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar
          </Button>

          <Button
            size="sm"
            variant="flat"
            className="bg-white/5 hover:bg-white/10 text-white text-xs font-mono"
            onPress={expandedCompanies.size === companies.length ? collapseAll : expandAll}
          >
            {expandedCompanies.size === companies.length ? "Colapsar Todo" : "Expandir Todo"}
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0B151F]/90 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-white/50 uppercase tracking-wider text-[11px] font-semibold">Total Inmobiliarias</p>
            <h4 className="text-2xl font-black text-white mt-1">
              {loading ? "..." : summaryMetrics.totalCompanies}
            </h4>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        <div className="bg-[#0B151F]/90 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-white/50 uppercase tracking-wider text-[11px] font-semibold">Empresas con Proyectos</p>
            <h4 className="text-2xl font-black text-emerald-400 mt-1">
              {loading ? "..." : summaryMetrics.withActiveProjects}
            </h4>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-[#0B151F]/90 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-white/50 uppercase tracking-wider text-[11px] font-semibold">Proyectos 3D Activos</p>
            <h4 className="text-2xl font-black text-[#0CDBFF] mt-1">
              {loading ? "..." : summaryMetrics.totalActiveProjects}
            </h4>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-[#0CDBFF] border border-cyan-500/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0E1622]/90 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            isClearable
            size="sm"
            placeholder="Buscar por inmobiliaria, ciudad o nombre del proyecto..."
            value={search}
            onValueChange={setSearch}
            className="w-full text-white"
            classNames={{
              input: "text-sm text-white",
              inputWrapper: "bg-[#070D14] border border-white/10 hover:border-white/20"
            }}
            startContent={
              <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex bg-[#070D14] p-1 rounded-xl border border-white/10 text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === "all" ? "bg-white/20 text-white font-bold" : "text-white/50 hover:text-white"
            }`}
          >
            Todas ({companies.length})
          </button>
          <button
            onClick={() => setFilterMode("withProjects")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === "withProjects" ? "bg-[#0CDBFF] text-black font-bold shadow-[0_0_8px_rgba(12,219,255,0.4)]" : "text-[#0CDBFF]/70 hover:text-[#0CDBFF]"
            }`}
          >
            Con Proyectos Activos ({summaryMetrics.withActiveProjects})
          </button>
          <button
            onClick={() => setFilterMode("noProjects")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === "noProjects" ? "bg-white/20 text-white font-bold" : "text-white/50 hover:text-white"
            }`}
          >
            Sin Proyectos ({companies.length - summaryMetrics.withActiveProjects})
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0B151F]/90 border border-white/10 rounded-2xl p-6 animate-pulse flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10"></div>
                  <div className="flex flex-col gap-2">
                    <div className="w-48 h-4 bg-white/10 rounded"></div>
                    <div className="w-24 h-3 bg-white/5 rounded"></div>
                  </div>
                </div>
                <div className="w-28 h-6 bg-white/10 rounded-full"></div>
              </div>
              <div className="h-24 bg-white/5 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCompanies.length === 0 && (
        <div className="bg-[#0B151F]/90 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/40">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-white">No se encontraron inmobiliarias</h4>
          <p className="text-xs text-white/50 mt-1 max-w-md">
            No hay empresas que coincidan con el término de búsqueda o el filtro seleccionado.
          </p>
          <Button
            size="sm"
            variant="flat"
            className="mt-4 bg-white/10 text-white text-xs font-mono"
            onPress={() => {
              setSearch("");
              setFilterMode("all");
            }}
          >
            Restablecer Filtros
          </Button>
        </div>
      )}

      {/* Companies List */}
      {!loading && filteredCompanies.length > 0 && (
        <div className="flex flex-col gap-4">
          {filteredCompanies.map((company) => {
            const isExpanded = expandedCompanies.has(company._id);
            const initial = company.name.charAt(0).toUpperCase();

            return (
              <div
                key={company._id}
                className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:border-white/20"
              >
                {/* Company Header Row */}
                <div
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                  onClick={() => toggleExpand(company._id)}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-extrabold text-lg shadow-inner">
                      {initial}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-base font-bold text-white tracking-tight">
                          {company.name}
                        </h4>
                        {company.active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Empresa Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            Inactiva
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-white/50 mt-1 font-mono">
                        {company.city && <span>📍 {company.city}</span>}
                        {company.email && <span>✉️ {company.email}</span>}
                        <span>📁 {company.totalProjectsCount} proyectos registrados</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Badges & Toggle */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
                        company.activeProjectsCount > 0
                          ? "bg-cyan-500/15 text-[#0CDBFF] border-cyan-500/30 shadow-[0_0_10px_rgba(12,219,255,0.2)]"
                          : "bg-white/5 text-white/40 border-white/10"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          company.activeProjectsCount > 0 ? "bg-[#0CDBFF]" : "bg-white/30"
                        }`}
                      ></span>
                      {company.activeProjectsCount} {company.activeProjectsCount === 1 ? "Proyecto Activo" : "Proyectos Activos"}
                    </div>

                    <div className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white">
                      <svg
                        className={`w-4 h-4 transform transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : "rotate-0"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Collapsible Projects Grid */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-white/10 animate-fadeIn">
                    {company.activeProjects.length === 0 ? (
                      <div className="p-4 rounded-xl bg-[#070D14] border border-white/5 text-center text-xs text-white/50 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Esta inmobiliaria no tiene proyectos 3D con estado activo en este momento.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {company.activeProjects.map((project) => (
                          <div
                            key={project._id}
                            className="bg-[#070D14] border border-white/10 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 shadow-lg group"
                          >
                            {/* Project Image & Badge */}
                            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/5 flex items-center justify-center">
                              {project.urlImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={project.urlImage}
                                  alt={project.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-white/30">
                                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                  <span className="text-[10px] font-mono">Modelo 3D</span>
                                </div>
                              )}

                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-emerald-500/90 text-black shadow-md">
                                Activo
                              </span>
                            </div>

                            {/* Project Info */}
                            <div>
                              <h5 className="text-sm font-bold text-white group-hover:text-[#0CDBFF] transition-colors truncate">
                                {project.name}
                              </h5>
                              <p className="text-[11px] text-white/50 mt-0.5 font-mono">
                                📍 {project.city || "Ciudad"}{project.department ? `, ${project.department}` : ""}
                              </p>
                              {project.areaOfThisproyect > 0 && (
                                <p className="text-[11px] text-white/40 mt-0.5 font-mono">
                                  📐 {project.areaOfThisproyect} m²
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                              <a
                                href={`/proyectos/${project._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold bg-[#0CDBFF] hover:bg-[#0CDBFF]/90 text-black shadow-[0_0_10px_rgba(12,219,255,0.2)] transition-all"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ver en 3D
                              </a>

                              <Tooltip content="Copiar enlace público" className="bg-[#0E1622] text-white text-xs">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                                  onPress={() => copyProjectLink(project._id, project.name)}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </Button>
                              </Tooltip>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
