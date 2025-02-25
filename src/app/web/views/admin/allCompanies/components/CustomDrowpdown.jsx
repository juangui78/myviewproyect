import React from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button } from "@nextui-org/react";

const CustomDropdown = ({ field, form, label, options, ...props }) => {

    const handleSelectionChange = (key) => {
        const selectedValue = options.find((option) => option.key === key)?.value || "";
        form.setFieldValue(field.name, selectedValue); // Actualiza el valor en Formik
    };

    return (
        <div>
            <label className="text-white text-sm ml-[5px]">{label}</label>
            <Dropdown className="bg-[#fff] ">
                <DropdownTrigger>
                    <Button variant="bordered" className="w-full text-black bg-[#fff]">
                        {options.find((option) => option.value === field.value)?.key || "Seleccione una opción"}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="Dropdown"
                    onAction={(key) => handleSelectionChange(key)}
                >
                    {options.map((option) => (
                        <DropdownItem key={option.key}>{option.value}</DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}

export default CustomDropdown