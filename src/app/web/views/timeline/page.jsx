"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Progress, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Input, Textarea} from "@nextui-org/react";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";
import { File3d } from "@/web/global_components/icons/File3d";
import Timeline from "./configuration/Timeline";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import style from "./style/timeStyle.module.css";

const ModalTimeLine = () => {
  const [loading, setLoading] = useState(true);
  const [itemTimeLine, setItemTimeLine] = useState([]);
  const [send, setSend] = useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone();

  const searchParams = useSearchParams();
  const idProyect = searchParams.get("ind");

  const getData = async () => { //load initial data
    try {
      const response = await axios.get(`/api/controllers/models_/${idProyect}`);
      if (response.data != undefined && Array.isArray(response.data)) {
        setItemTimeLine(response.data);
        setLoading(false);
        return;
      }

      console.log("error to loaded");
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    getData();
  }, []);

  return (
    <Suspense fallback={<div>Cargando...</div>}>
    <div className={style.body}>
      {loading ? (
        <div className={style.loadingTimeLine}>
          Cargando
          <Progress
            size="sm"
            isIndeterminate
            aria-label="Loading..."
            className="max-w-md"
          />
        </div>
      ) : (
        <section className={style.bodyTimeLine}>
          <div className={style.boxOptions}>
            <File3d />
            <Button color="default" variant="faded" startContent={<PlusIcon />} onPress={onOpen}>
              Añadir modelo
            </Button>
          </div>
          <div>
            <Timeline items={itemTimeLine} />
          </div>
        </section>
      )}
    </div>

    <Modal    
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
      {(onclose) => (
        <>
          <ModalHeader>
            Añadir Modelo
          </ModalHeader>
          <ModalBody>
            <form 
              className={style.formModelNew}
              encType="multipart/form-data"
              onSubmit={async (e) => {
                e.preventDefault();
                const name = e.target.elements.name.value;
                const description = e.target.elements.description.value

                if (acceptedFiles.length < 0){
                  alert("error");
                  return
                }

                const form = new FormData();
                form.append("name", name);
                form.append("description", description);
                form.append("file", acceptedFiles[0]); // only accept .zip, .rar etc
                form.append('idProyect', idProyect);
                console.log('llegando a AWS');
                

                const response = await axios.post("/api/models_", form, {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                });

                const itemsTimeline = itemTimeLine;
                const newItemTimeLine = [response.data, ...itemsTimeline];

console.log(newItemTimeLine)
                setItemTimeLine(newItemTimeLine);

                console.log(response)

              }}
              >
              <div>
                <Input
                  type="text"
                  label="Nombre"
                  placeholder="Ingresa el nombre del modelo"
                  variant="underlined"
                  defaultValue=""
                  name="name"
                  className=""
                  radius="sm"
                  isRequired
                />
              </div>
              <div>
                <Textarea 
                  type="text"
                  label="Descripción"
                  placeholder="Ingresa una descripción del modelo"
                  variant="underlined"
                  defaultValue=""
                  name="description"
                  className=""
                  radius="sm"
                  isRequired
                 />
              </div>
              <div {...getRootProps({className: 'dropzone'})} className={style.dropzone}>
                <input {...getInputProps()} />
                <p>Arrastre y suelte los archivos</p>
              </div>
              <div>
                  <Button type="submit" color="primary">Enviar</Button>
              </div>
            </form>
          </ModalBody>
        </>
      )}
      </ModalContent>
    </Modal>
   </Suspense>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ModalTimeLine />
    </Suspense>
  );
}
