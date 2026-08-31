"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@nextui-org/react";
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function Header() {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();

  const currentSearch = searchParams.get("search") || "";
  const [valueSearching, setValueSearching] = useState(currentSearch);
  const debounceTimer = useRef(null);

  // Sincronizar el input si la URL cambia externamente (ej: botón de reset en empty state)
  useEffect(() => {
    setValueSearching(currentSearch);
  }, [currentSearch]);

  const triggerSearch = (query) => {
    const params = new URLSearchParams(searchParams);
    const trimmed = query.trim();

    if (trimmed.length > 0) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }

    replace(`${pathName}?${params.toString()}`);
  };

  const handleInputChange = (e) => {
    const nextValue = e.target.value;
    setValueSearching(nextValue);

    // Debounce dinámico de 250ms para búsqueda fluida en tiempo real
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      triggerSearch(nextValue);
    }, 250);
  };

  const handleClear = () => {
    setValueSearching("");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    triggerSearch("");
  };

  return (
    <section className="w-full flex justify-center mt-6 mb-2">
      <div className="w-[95%] xl:w-[85%] 2xl:w-[75%] max-w-[1800px] px-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Left Side: Section Title */}
        <div className="flex items-center">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Proyectos
          </h2>
        </div>

        {/* Right Side: Live Search Command Input */}
        <div className="flex items-center w-full sm:w-auto sm:min-w-[340px] md:min-w-[400px] lg:min-w-[460px]">
          <div className="relative w-full">
            <Input
              value={valueSearching}
              onChange={handleInputChange}
              placeholder="Buscar proyecto en tiempo real..."
              size="md"
              radius="xl"
              aria-label="Buscar proyectos"
              startContent={<SearchIcon size={18} className="text-white/40 flex-shrink-0 ml-1" />}
              classNames={{
                base: "w-full",
                input: "text-sm text-white placeholder:text-white/30 bg-transparent pl-1",
                inputWrapper:
                  "h-11 bg-[#121B26]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 focus-within:!border-[#0CDBFF] transition-all shadow-inner px-3",
              }}
              endContent={
                valueSearching ? (
                  <button
                    onClick={handleClear}
                    className="text-xs text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                    type="button"
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                ) : null
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
