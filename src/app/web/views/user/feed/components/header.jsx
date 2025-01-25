"use client";
import React, { useEffect } from "react";
import {
  CheckboxGroup,
  Checkbox,
  Select,
  SelectItem,
  Input,
  DatePicker
} from "@nextui-org/react";
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import style from "../styles/feed.module.css";
import { useSession } from "next-auth/react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function Header() {

  useEffect(() => {
    document.title = "Myview | Feed";
  }, []);

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();
  const session = useSession();

  let user = null;
  if (session) {
    user = session?.data?.user?.name;
  }

  const handleChange = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value.length > 0){
      params.set('search', value);
    }else{
      params.delete('search');
    }
    replace(`${pathName}?${params.toString()}`);
  }

  const handlechangeCheck = (value) => {
    const params = new URLSearchParams(searchParams);
    const string = value.join(",");
    if (value.length > 0){
      params.set('options', string);
    }else{
      params.delete('options');
    }
    replace(`${pathName}?${params.toString()}`)
  }


  return (
    <>
      <section className={style.bottomNavbar}>
        <div className={style.boxSecondNavbar}>
          <CheckboxGroup
            label=""
            orientation="horizontal"
            color="primary"
            defaultValue={searchParams.get('options')?.split(",")}
            onChange={(e) => handlechangeCheck(e)}
          >
            <Checkbox value="all">Activos</Checkbox>
            <Checkbox value="order">Terminados</Checkbox>
          </CheckboxGroup>
          <DatePicker label="filtro por fecha" className="max-w-[284px]" variant='bordered' />
          {/* <Select
            label="Buscar por ciudad"
            variant="bordered"
            placeholder="Seleccionar ciudad"
            // selectedKeys={value}
            defaultSelectedKeys={[searchParams.get('search')?.toString()]}
            className={`max-w-xs ${style.selectCities}`}
            onChange={(e) => handleChange(e.target.value)}
          >
          {items.map((item) => (
            <SelectItem key={item} value={item} textValue={item}>{item}</SelectItem>
          ))}
          </Select> */}
          <Input
            className={style.inputSearch}
            classNames={{
              base: "max-w-full h-10",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper:
                "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            placeholder="Buscar..."
            size="sm"
            startContent={<SearchIcon size={18} />}
            type="search"
          />
        </div>
      </section>
    </>
  );
}
