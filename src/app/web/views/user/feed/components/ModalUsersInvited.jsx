import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, CheckboxGroup, Checkbox } from "@nextui-org/react";
import { Toaster, toast } from "sonner";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button } from "@nextui-org/react";
import { getTodoUsers, shareModelToUser } from "../js/todo";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";
import feedStyle from "../styles/feed.module.css";
import * as Yup from "yup";

//yup schmema to validate email
//=======================================================================================
const emailSchema = Yup.string()
.email("El correo electrónico no es válido")
.matches( /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Correo invalido")
.required("El correo electrónico es requerido");

const ModalUsersInvited = ({ isOpenUsers, onOpenChangeUsers, ID_USER, _ID}) => {

    const [data, setData] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [showPermissions, setShowPermissions] = useState(false);
    const [errorEmail, setErrorEmail] = useState(false);
    const [valueEmail, setValueEmail] = useState("");
    const [valueSelect, setValueSelect] = useState("");
    const [sending, setSending] = useState(false);

    //renitialize the necessary states
    //=======================================================================================
    const reinitializeStates = () => {
      setPermissions([])
      setShowPermissions(false)
      setErrorEmail(false)
      setValueEmail("")
      setValueSelect("")
      setSending(false)
    }

    //get data from user => the user he already invited
    //===========================================================================================
    useEffect(() => {
        const fetchData = async () => {

          try {
            const response = await getTodoUsers(ID_USER);
            const [status, json] = response;

            if (status != "success") {
              toast.error("Error al cargar los datos")
              return
            } 
            const { usersInvited } = json;

            const dataMap = usersInvited.map((user) => {
              return {
                ...user,
                label: user.email,
                key: user.email,
                description: user.email
              }
            })

            setData(dataMap)

          }catch (error) { toast.error("Error al cargar los datos") }
        }

        //reinitialize the states to avoid errors
        reinitializeStates()

        //fetch data
        fetchData()

    }, [isOpenUsers])

    //get user from autocomplete component with his permissions
    //=======================================================================================
    const getUserSelected = (key) => { 
      if (key === null) {
        setPermissions([])
        setShowPermissions(false)
        return
      }

      const userSelected = data.find((item) => item.key === key)
      if (userSelected) {
        let arrayPermissions = []
        for (const item in userSelected) {
          if (typeof userSelected[item] === "boolean" && userSelected[item]) {
            arrayPermissions.push(item)
          }
        }

        setPermissions(arrayPermissions)

      }else setPermissions([])
      
      setShowPermissions(true)
    } 

    //validate email width Yup
    //=======================================================================================
    const validateEmail = async (email) => {
      try {
        await emailSchema.validate(email);
        return true;
      } catch (error) {
        return false;
      }
    }

    //validate email while typing
    //=====================================================================================
    const handleChangeEmail = async (email) => {
      const isValid = await validateEmail(email);
      
      if (!isValid) setErrorEmail(true)
      else setErrorEmail(false)
    }

    //handle submit
    //=======================================================================================
    const handleSubmit = async () => {
      const inputEmail = valueEmail == null ? "" : valueEmail;
      const selectEmail = valueSelect == null ? "" : valueSelect;
      const errorInEmail = errorEmail;

      if (inputEmail.length == 0 && selectEmail.length == 0) {
        toast.error("Debe seleccionar un correo electrónico o digitar uno")
        return
      }

      if (errorInEmail) {
        toast.error("Correo electrónico invalido")
        return
      }

      setSending(true)

      const respose = await shareModelToUser(inputEmail == "" ? selectEmail : inputEmail, permissions, _ID);
      if (respose.status) toast.success(respose.message)
      else toast.error(respose.message)

      reinitializeStates()
    }

    return (
        <Modal 
          backdrop={"blur"}
          placement="center"
          isDismissable={false} 
          isOpen={isOpenUsers} 
          onClose={onOpenChangeUsers} 
          className="bg-[#000000ab] shadow-white"
        >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-white text-white">
                <h1 className="font-bold text-xl"> Compartir Modelo</h1>
                <p className="text-sm italic">Compartir visualizacíon del modelo y los documentos (si los tiene)</p>
              </ModalHeader>
              <ModalBody className="text-white">
                  <Autocomplete 
                    className="w-full mb-[5px]" 
                    label="Buscar correo existente" 
                    size="sm"
                    inputValue={valueSelect == null ? "" : valueSelect}
                    onSelectionChange={(key) => { getUserSelected(key); setValueSelect(key); setValueEmail(""); setErrorEmail(false) }} >
                      { data.map((item) => (
                        <AutocompleteItem key={item.key} textValue={item.label}>{item.label} </AutocompleteItem>
                      ))}
                  </Autocomplete>

                  <div className="flex gap-3 w-full justify-items-start">
                    <div className="w-full flex flex-col">
                      <Input
                       className={`w-full  ${errorEmail && feedStyle.errorInputColor } `} 
                       classNames={{
                        label: "text-white !important",
                        input: "text-black !important",
                        root: "text-black !important",
                        inputWrapper: [
                          "bg-[#fff]",
                          "backdrop-blur-xl",
                          "backdrop-saturate-200",
                          "!cursor-text",
                        ],
                      }}
                       defaultValue=""
                       value={valueEmail}
                       variant="bordered"
                       size="sm"
                       label="Email"
                       placeholder="Digite el correo electrónico"
                       radius={"sm"}
                       type="email"
                       onInput={(e) => handleChangeEmail(e.target.value)}
                       onChange={(e) => {
                        setValueEmail(e.target.value); 
                        setValueSelect("");
                        if (e.target.value == "") setShowPermissions(false)
                      }}
                       isInvalid={errorEmail}
                      /> 
                       {errorEmail && (<div className="text-sm text-[#FD6358] pl-[5px]">Correo electrónico invalido</div>)}
                    </div>
                    <div>
                      <Button 
                        className=" bg-[#0CDBFF] h-full flex items-center justify-center"
                        radius="sm"
                        size="sm"
                        disabled={valueSelect === "" && !errorEmail ? false : true}
                        onClick={() => getUserSelected(valueEmail)}
                      >
                        <PlusIcon className="h-[48px]"/>
                      </Button> 
                    </div>
                   
                  </div>

                    {showPermissions && (
                       <CheckboxGroup
                         label={`Permisos de usuario, ${valueSelect} ${valueEmail}`}
                         classNames={{
                            label: "text-white",
                            group: "text-white",
                         }}
                         value={permissions}
                         onValueChange={setPermissions}
                       >
                         <Checkbox value="cadastralFile" classNames={{ label: "text-white" }} color="success">Ficha catastral</Checkbox>
                         <Checkbox value="writing" classNames={{ label: "text-white" }} color="success">Escritura</Checkbox>
                         <Checkbox value="certificateOfFreedom" classNames={{ label: "text-white" }} color="success"> Certificado de libertad</Checkbox>
                         <Checkbox value="landUse" classNames={{ label: "text-white" }} color="success">Usos del suelo</Checkbox>
                         <Checkbox value="topographicalPlan" classNames={{ label: "text-white" }} color="success">Plano topográfico</Checkbox>
                       </CheckboxGroup>
                    )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  className="text-white cursor-pointer" 
                  variant="light"
                  disabled={sending} 
                  onPress={onClose}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-[#0CDBFF] cursor-pointer" 
                  onPress={handleSubmit}
                  disabled={sending}
                >
                  {sending ? "Enviando..." : "Enviar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
        <Toaster richColors position="top-right"/>
      </Modal>
    )
}

export default ModalUsersInvited