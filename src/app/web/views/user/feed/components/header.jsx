"use client";
import React, { useState } from "react";
import {
  Input,
  Button,
  Progress
} from "@nextui-org/react";
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function Header() {

  const [valueSearching, setValueSearching] = useState("");

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();

  const handleChange = () => {
    const value = valueSearching
    const params = new URLSearchParams(searchParams);

    if (value.length > 0) params.set('search', value);
    else params.delete('search');

    console.log(value)
    replace(`${pathName}?${params.toString()}`);
  }

  return (
    <>
      <section className="flex flex-row justify-between w-full items-center mt-[30px] mb-[25px]">
        <section className="flex flex-row justify-between w-[70%] m-auto max-[780px]:flex-col max-[780px]:gap-[24px]">
          <div className="text-white w-[20%] max-[780px]:w-[50%] max-[1110px]:w-[60%] max-[427px]:w-[100%]">
              <div className="flex flex-row justify-between items-center">
                <div className="text-sm">Hectareas</div>
                <div className="text-sm">20h de 40h</div>
              </div>
              <Progress
                classNames={{
                  base: "max-w-md",
                  indicator: "bg-[#0CDBFF]",
                }}
                radius="sm"
                showValueLabel={false}
                size="sm"
                label=""
                value={20}
                maxValue={40}
              />
          </div>
          <div className="flex flex-col md:flex-row justify-end items-start w-full md:w-[80%] gap-4 max-[780px]:w-[100%] max-[780px]:flex-row">
            <Input
              className="w-full sm:w-[50%] md:w-[45%]"
              classNames={{
                base: "max-w-full h-5",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper:
                  "h-full font-normal text-default-500  dark:bg-default-500/20",
              }}
              placeholder="Buscar..."
              size="sm"
              aria-label="Search input"
              startContent={<SearchIcon size={18} />}
              type="search"
              onChange={(e) => setValueSearching(e.target.value)}
            />
            <Button className="w-[10%] h-[2rem]  bg-[#0CDBFF] shadow-lg ... text-black" onClick={handleChange}>Buscar</Button>
          </div>
        </section>
      </section>
    </>
  );
}
