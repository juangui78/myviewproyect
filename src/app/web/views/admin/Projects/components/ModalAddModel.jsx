import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

const ModalAddModel = ({ isOpen, onOpenChange, idProject }) => {
    return (
        <Modal
            backdrop={"blur"}
            placement="center"
            size="2xl"
            isDismissable={false}
            isOpen={isOpen}
            onClose={onOpenChange}
            className="bg-[#000000ab]"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <h2 className="text-3xl font-bold text-white">Agregar modelo</h2>
                        </ModalHeader>
                        <ModalBody>
                            sad
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                className="text-white cursor-pointer"
                                variant="light"
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="cursor-pointer "
                                color="primary"
                                type="submit"
                            >
                                guardar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>

    )
}

export default ModalAddModel