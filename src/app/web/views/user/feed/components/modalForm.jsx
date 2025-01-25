"use client";
import React, { useMemo, useState } from "react";
import axios from "axios";
import {Modal, ModalContent, ModalBody, useDisclosure, Input, DateInput, Progress, Button, Textarea} from "@nextui-org/react";
import {CalendarDate} from "@internationalized/date";
import style from "../styles/feed.module.css"
import { Flip, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ModalForm({isOpenM, close, id_user}) {
  const [sendig, setSending] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data: session } = useSession();
  const sessionUser = session?.user;
  console.log(session)

  //validations
  //tel
  const [valueTel,setValueTel] = useState("");
  //name
  const [valueName, setValueName] = useState("");
  const [errorName, setErrorName] = useState("");
  //m2
  const [valueM2, setValueM2] = useState("");
  const [errorM2, setErrorM2] = useState("");
  //description
  const [valueDescription, setValueDescription] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  //date
  const [valueDate, setValueDate] = useState("");
  const [errorDate, setErrorDate] = useState("");
  //department
  const [valueDepartment, setValueDepartment] = useState("");
  const [errorDepartment, setErrorDepartment] = useState("");
  //city
  const [valueCity, setValueCity] = useState("");
  const [errorCity, setErrorCity] = useState("");
  //Address
  const [valueAddress, setValueAddress] = useState("");
  const [errorAddress, setErrorAddress] = useState("");
  //nameClient
  const [valueClientName, setValueClientName] = useState("");
  const [errorClientName, setErrorClientName] = useState("");
  //lastname
  const [valueClientLastName, setValueClientLastName] = useState("");
  const [errorClientLastName, setErrorClientLastName] = useState("");

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();

  const testCaracters = (value) => {
    const regex = /^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ´,.]*$/;
    if (regex.test(value)) return true;
    return false;
  }

  //validations
  //=========================

  const valideName = useMemo(() => {
    if (valueName === ""){
      setErrorName("Nombre es requerido");
      return false;
    } 
    if (valueName.length  > 60) {
      setErrorName("El nombre solo puedo contener maximo 60 caracteres");
      return true;
    }

    if (!testCaracters(valueName)){
      setErrorName("El nombre no puedo contener caracteres especiales");
      return true;
    }
  }, [valueName]);

  //=========================

  const validateM2 = useMemo(() => {
    if (valueM2 == ""){
      setErrorM2("M2 es requerido");
      return false;
    }

    if (typeof valueM2 != 'number' && isNaN(valueM2)){
      setErrorM2("M2 solo puede ser del tipo númerico");
      return true;
    }

    if (valueM2 > 1000000){
      setErrorM2("M2 no puede ser mayo a 1,000,000 de metros");
      return true;
    }
  }, [valueM2]);

   //=========================

  const validateDescription = useMemo(() => {
    if (valueDescription === ""){
      setErrorDescription("Descripción es requerido");
      return false;
    }

    if (valueDescription.length > 300){
      setErrorDescription("La descripción solo puede contener maximo 300 caracteres");
      return true;
    }

    if (!testCaracters(valueDescription)){
      setErrorDescription("La descripción no puede contener caracteres especiales");
      return true;
    }
  }, [valueDescription]);

   //=========================

  const validateDateFinal =  useMemo(() => {
  }, [valueDate]);

  //=========================

  const validateDepartment = useMemo(() => {
    if (valueDepartment === "") {
      setErrorDepartment("Departamento es requerido");
      return false;
    }

    if (valueDepartment.length > 60){
      setErrorDepartment("Departamento no puede contener mas de 60 caracteres");
      return true;
    }

    if (!testCaracters(valueDepartment)){
      setErrorDepartment("Departamento no puede contener caracteres especiales");
      return true;
    }
  }, [valueDepartment]);

   //=========================

   const validateCity = useMemo(() => {
    if (valueCity === ""){
      setErrorCity("Ciudad es requerido");
      return false;
    }

    if (valueCity.length > 60){
      setErrorCity("Ciudad no puede contener mas de 60 caracteres");
      return true;
    }

    if (!testCaracters(valueCity)){
      setErrorCity("Ciudad no puede contener caracteres especiales");
      return true;
    }
   }, [valueCity]);

   //=========================

   const validateAddress = useMemo(() => {
      if (valueAddress === ""){
        setErrorAddress("Dirección es requerido");
        return false;
      }

      if (valueAddress.length > 300){
        setErrorAddress("Dirección no puede contener mas de 300 caracteres");
        return true;
      }
   }, [valueAddress]);

  //=========================
  
  const validateNameClient = useMemo(() => {
    if (valueClientName === ""){
      setErrorClientName("Nombre(s) es requerido");
      return false;
    }

    if (valueClientName.length > 100){
      setErrorClientName("Nombre(s) no puede contener mas de 100 caracteres");
      return true;
    }

    if (!testCaracters(valueClientName)){
      setErrorClientName("Nombre(s) no puede contener caracteres especiales");
      return true;
    }

  }, [valueClientName]);

  //=========================
  
  const validateLastName = useMemo(() => {
    if (valueClientLastName === ""){
      setErrorClientLastName("Apellido(s) es requerido");
      return false;
    }

    if (valueClientLastName.length > 100){
      setErrorClientLastName("Apellido(s) no puede contener mas de 100 caracteres");
      return true;
    }
    if (!testCaracters(valueClientLastName)){
      setErrorClientLastName("Apellido(s) no puede contener caracteres especiales");
      return true;
    }

  }, [valueClientLastName]);

  //=========================

  const invalidTel = useMemo(() => {
      if (valueTel === "") return false;
      if (valueTel.length !== 10) return true
  }, [valueTel]);


  return (
    <>
    
    <Modal
      backdrop="opaque"
      size="5xl"
      isOpen={isOpenM}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      placement="auto"
      className={style.modal}
    >
      <ModalContent>
        {() => (
          <>
          {sendig ? (
            <Progress
            size="sm"
            isIndeterminate
            aria-label="Loading..."
            className={style.savingForm}
          />
          ): null}
            <ModalBody>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSending(true);

                  const name = e.target.elements.name.value;
                  const m2 = parseInt(e.target.elements.m2.value);
                  const description = e.target.elements.description.value;
                  const dateInit = e.target.elements.dateInit.value;
                  const dateFinish = e.target.elements.dateFinish.value;
                  const department = e.target.elements.department.value;
                  const city = e.target.elements.city.value;
                  const address = e.target.elements.address.value;
                  const clientNames = e.target.elements.clientNames.value;
                  const clientLastNames = e.target.elements.clientLastNames.value;
                  const clientEmail = e.target.elements.clientEmail.value;
                  const clientTel = e.target.clientTel.value;

                  const dataSend = {
                    name,
                    m2,
                    description,
                    dateInit,
                    dateFinish,
                    department ,
                    city ,
                    address ,
                    clientNames ,
                    clientLastNames ,
                    clientEmail,
                    clientTel,
                    id_user
                  }

                  const response = await axios.post("/api/controllers/proyects", dataSend);
                  if (response?.data?.message == 'ok'){ //saved 
                    console.log('data saved')
                    toast("Proyecto Creado");

                    const params = new URLSearchParams(searchParams);
                    params.delete('refresh');
                    params.set('refresh', true);

                    replace(`${pathName}?${params.toString()}`);

                    setTimeout(() => {
                      close();
                      setSending(false);
                    }, 500);

                    return;
                  }

                  alert('data no saved');
                }}
              >
                <div>
                  <div>
                    <div>
                      <h1 className={style.titleFormCreateProyect}>
                        Crear Nuevo Proyecto
                      </h1>
                    </div>
                    <div className={style.proyectFormSectionAddress}>
                      <div className={style.titleFormProyect}>
                        <h2>Información Del Proyecto</h2>
                      </div>
                      <div className={style.boxInputs}>
                        <div>
                          <Input
                            type="text"
                            label="Nombre"
                            placeholder="Ingresa el nombre"
                            variant="underlined"
                            defaultValue=""
                            name="name"
                            className=""
                            radius="sm"
                            isRequired
                            isInvalid={valideName}
                            errorMessage={errorName}
                            onValueChange={setValueName}
                            disabled={sendig}
                          />
                        </div>
                        <div>
                        <Input
                            type="number"
                            label="m2"
                            placeholder="Ingresa los m2"
                            variant="underlined"
                            defaultValue=""
                            name = "m2"
                            className=""
                            radius="sm"
                            isRequired
                            isInvalid={validateM2}
                            errorMessage={errorM2}
                            onValueChange={setValueM2}
                            disabled={sendig}
                          />
                        </div>
                      </div>
                      <div className={style.boxInputsDes}>
                        <div>
                          <Textarea
                            type="text"
                            label="Descripción"
                            placeholder="Ingresa una descripción"
                            variant="underlined"
                            defaultValue=""
                            name="description"
                            className=""
                            radius="sm"
                            isRequired
                            isInvalid={validateDescription}
                            errorMessage={errorDescription}
                            onValueChange={setValueDescription}
                            disabled={sendig}
                          />
                        </div>
                      </div>
                      <div className={style.boxInputs}>
                        <div>
                          <DateInput 
                            variant="underlined" 
                            label="Inicio Del Proyecto"
                            name="dateInit"
                            placeholderValue={new CalendarDate(1900, 11, 6)} 
                            disabled={sendig}
                           />
                        </div>
                        <div>
                          <DateInput 
                            variant="underlined" 
                            name="dateFinish"
                            label="Finalización Del Proyecto" 
                            placeholderValue={new CalendarDate(1900, 11, 6)}
                            isInvalid={validateDateFinal}
                            errorMessage={errorDate}
                            onValueChange={setValueDate}
                            disabled={sendig}
                           />
                        </div>
                      </div>
                      <div className={style.titleFormProyect}>
                        <h2>Información De La Ubicación</h2>
                      </div>
                      <div className={style.boxInputs}>
                        <div>
                          <Input
                            type="text"
                            label="Departamento"
                            placeholder="Ingresa el departamento"
                            variant="underlined"
                            name="department"
                            defaultValue=""
                            className=""
                            radius="sm"
                            isRequired
                            isInvalid={validateDepartment}
                            errorMessage={errorDepartment}
                            onValueChange={setValueDepartment}
                            disabled={sendig}
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            label="Ciudad"
                            variant="underlined"
                            placeholder="Ingresa la ciudad"
                            defaultValue=""
                            name="city"
                            className=""
                            radius="sm"
                            isRequired
                            isInvalid={validateCity}
                            errorMessage={errorCity}
                            onValueChange={setValueCity}
                            disabled={sendig}
                          />
                        </div>
                      </div>
                      <div className={style.boxInputs}>
                        <div>
                          <Input
                            type="text"
                            label="Dirección"
                            placeholder="Ingresa la dirección"
                            variant="underlined"
                            defaultValue=""
                            name="address"
                            className=""
                            radius="sm"
                            isRequired
                            isInvalid={validateAddress}
                            errorMessage={errorAddress}
                            onValueChange={setValueAddress}
                            disabled={sendig}
                          />
                        </div>
                      </div>
                      <div className={style.titleFormProyect}>
                        <h2>Información Del Cliente</h2>
                      </div>
                      <div className={style.boxInputs}>
                        <div>
                          <Input
                            type="text"
                            label="Nombre(s)"
                            placeholder="Ingrese el(los) nombre(s)"
                            variant="underlined"
                            defaultValue={sessionUser?.name}
                            name="clientNames"
                            className=""
                            radius="sm"
                            isRequired
                            isInvalid={validateNameClient}
                            errorMessage={errorClientName}
                            onValueChange={setValueClientName}
                            disabled={sendig}
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            label="Apellido(s)"
                            placeholder="Ingrese el(los) apellido(s)"
                            variant="underlined"
                            defaultValue={sessionUser?.lastName}
                            name="clientLastNames"
                            className=""
                            radius="sm"
                            isRequired
                            isInvalid={validateLastName}
                            errorMessage={errorClientLastName}
                            onValueChange={setValueClientLastName}
                            disabled={sendig}
                          />
                        </div>
                      </div>
                      <div className={style.boxInputs}>
                        <div>
                          <Input
                            type="email"
                            label="Correo"
                            placeholder="Ingrese el correo"
                            variant="underlined"
                            defaultValue={sessionUser?.email}
                            name="clientEmail"
                            className=""
                            radius="sm"
                            isRequired
                            disabled={sendig}
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            label="Telefono"
                            placeholder="Ingrese el telefono"
                            variant="underlined"
                            defaultValue=""
                            name="clientTel"
                            isInvalid={invalidTel}
                            errorMessage="Por favor ingresa un número valido"
                            onValueChange={setValueTel}
                            className=""
                            radius="sm"
                            isRequired
                            disabled={sendig}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button onClick={close}
                    type="button"
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Cancelar
                  </button>
                  <Button
                    isLoading={sendig}
                    disabled={sendig}
                    type="submit"
                    color="primary"
                  >
                   {sendig ? "Guardando" : "Guardar"}
                  </Button>
                </div>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
    <ToastContainer 
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      />
    </>
  );
}
