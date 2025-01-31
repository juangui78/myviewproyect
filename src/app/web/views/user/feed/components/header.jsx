"use client";
import React, { useEffect } from "react";
import {
  Input,
  Button,
  Progress
} from "@nextui-org/react";
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function Header() {

  useEffect(() => {
    document.title = "Myview | Feed";
  }, []);

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();

  const handleChange = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value.length > 0){
      params.set('search', value);
    }else{
      params.delete('search');
    }
    replace(`${pathName}?${params.toString()}`);
  }

  return (
    <>
      <section className="flex flex-row justify-between w-full items-center mt-[30px] mb-[25px]">
        <section className="flex flex-row justify-between w-[70%] m-auto">
          <div className="text-white w-[20%]">
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
          <div className="flex flex-col md:flex-row justify-end items-start w-full md:w-[80%] gap-4">
            <Input
              className="w-full md:w-[25%]"
              classNames={{
                base: "max-w-full h-5",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper:
                  "h-full font-normal text-default-500  dark:bg-default-500/20",
              }}
              placeholder="Buscar..."
              size="sm"
              startContent={<SearchIcon size={18} />}
              type="search"
            />
            <Button className="w-[10%] h-[2rem]  bg-[#0CDBFF] shadow-lg ... text-black">Buscar</Button>
          </div>
        </section>
      </section>
    </>
  );
}
