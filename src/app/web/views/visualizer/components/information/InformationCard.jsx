import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@heroui/react";
import styles from "./InformationCard.module.css";

export const InformationCard = ({ info }) => {
  return (
    <Card className="w-full max-w-[70vh] border-none bg-black text-white" shadow="none">
      <CardHeader className="justify-between">
        <div className="flex gap-3">
            <h2 className="text-lg"><strong>{info?.name}</strong></h2>
        </div>
      </CardHeader>
      <CardBody className="px-3 py-0">
        <p className="text-small pl-px pb-[5px]"><strong>Ubicacion:</strong> {info?.department}, {info?.city}, {info?.address}</p>
        <p className="text-small pl-px pb-[5px]"><strong>Área: </strong>{info?.hectares} hectareas</p>
        <p className="text-small pl-px pb-[5px]"><strong>Descripción: </strong>{info?.description}</p>
      </CardBody>
      {/* <CardFooter className="gap-3">
        <div className="flex gap-1 text-lg">
          <p className="font-semibold">Email: </p>
          <p>{info?.clientEmail}</p>
        </div>
        <div className="flex gap-1 text-lg">
          <p className="font-semibold ">Celular: </p>
          <p>{info?.clientTel}</p>
        </div>
      </CardFooter> */}
    </Card>
  );
};


export default function App({ info }) {
  return (
    <div className={styles.InformationContainer}>
      <Popover className="" showArrow placement="bottom">
        <PopoverTrigger>
          <Button
            className=" border-none bg-black p-2 text-white"
          >
            Datos del proyecto
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-1 border-none bg-black">
          <InformationCard info = {info} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
