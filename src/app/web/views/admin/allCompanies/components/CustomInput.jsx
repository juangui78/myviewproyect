import { Input } from "@nextui-org/react";

const CustomInput = (props) => {

    return (
        <Input
            classNames={{
                label: "text-black",
                input: "text-black",
                root: "text-black",
                inputWrapper: [
                    "shadow-xl",
                    "bg-gray-200",
                    "backdrop-saturate-200",
                    "hover:bg-default-100/70",
                    "!cursor-text",
                ],
            }}
            {...props}
        />
    )
}

export default CustomInput