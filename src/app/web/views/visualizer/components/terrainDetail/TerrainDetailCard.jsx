'use client';
import React, { useState } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Textarea 
} from '@nextui-org/react';
import Whatsapp from '@/web/global_components/icons/Whatsapp';
import { createLead } from '@/proyectos/[id]/actions/leadActions';
import { toast } from 'sonner';

export default function TerrainDetailCard({ 
  terrain, 
  projectInfo, 
  isOpen, 
  onClose, 
  calculatedArea 
}) {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [countryCode, setCountryCode] = useState('+57');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!terrain) return null;

  const status = terrain.status || 'disponible';
  const isAvailable = status === 'disponible';
  const isReserved = status === 'reservado';
  const isSold = status === 'vendido';

  const terrainName = terrain.name || `Lote ${terrain.id}`;
  const projectName = projectInfo?.name || 'Proyecto';
  const companyPhone = projectInfo?.idCompany?.cell?.replace(/\D/g, '') || '';
  const fallbackPhone = '573054023539';
  const targetPhone = companyPhone || fallbackPhone;

  const whatsappMessage = `Hola, estoy viendo el lote "${terrainName}" del proyecto "${projectName}" en el visualizador 3D de MyView y quisiera recibir más información sobre precios y opciones de pago.`;
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  const getStatusBadge = () => {
    switch (status) {
      case 'reservado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-[#FFB74D] border border-amber-500/30 shadow-[0_0_12px_rgba(245,165,36,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#F5A524] animate-pulse" />
            Reservado
          </span>
        );
      case 'vendido':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-[#F87171] border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            Vendido
          </span>
        );
      case 'disponible':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-[#00FF7F] border border-emerald-500/30 shadow-[0_0_12px_rgba(0,255,127,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#00FF7F] animate-pulse" />
            Disponible
          </span>
        );
    }
  };

  const handleOpenLeadForm = () => {
    setLeadMessage(`Hola, me interesa recibir asesoría y detalles comerciales sobre el lote "${terrainName}" del proyecto "${projectName}".`);
    setIsLeadModalOpen(true);
  };

  const handleSendLead = async () => {
    if (!leadName.trim() || !leadEmail.trim() || !leadPhone.trim()) {
      setFormError('¡Hola! Por favor indícanos tu nombre, correo y teléfono para poder contactarte.');
      return;
    }
    setFormError('');

    setIsSubmitting(true);
    try {
      let finalPhone = leadPhone.trim().replace(/\s+/g, '');
      const numericCode = countryCode.replace('+', '');
      if (finalPhone.startsWith('+')) {
        // ok
      } else if (finalPhone.startsWith(numericCode)) {
        finalPhone = `+${finalPhone}`;
      } else {
        finalPhone = `${countryCode} ${finalPhone}`;
      }

      const res = await createLead({
        name: leadName.trim(),
        email: leadEmail.trim(),
        phone: finalPhone,
        message: leadMessage.trim(),
        idProyect: projectInfo?._id || projectInfo?.id,
        idCompany: projectInfo?.idCompany?._id || projectInfo?.idCompany,
        terrainId: terrain.id,
        terrainName: terrainName
      });

      if (res.success) {
        toast.success(res.message);
        setIsLeadModalOpen(false);
        setLeadName('');
        setLeadEmail('');
        setLeadPhone('');
        setLeadMessage('');
        onClose();
      } else {
        toast.error(res.message || 'Error al enviar la solicitud.');
      }
    } catch (err) {
      console.error('Error enviando lead desde visualizador:', err);
      toast.error('Error al registrar tus datos. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Tarjeta Flotante Principal del Lote */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-[420px] transition-all duration-300 transform ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="bg-[#07121D]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-white relative flex flex-col gap-4">
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Cerrar"
            type="button"
          >
            ✕
          </button>

          {/* Encabezado: Título y Estado */}
          <div className="flex items-center justify-between pr-8 gap-2">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#0CDBFF] uppercase block font-semibold">
                Lote Seleccionado
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">
                {terrainName}
              </h3>
            </div>
            {getStatusBadge()}
          </div>

          {/* Métricas: Área */}
          <div className="grid grid-cols-2 gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3">
            <div>
              <span className="text-[10px] text-white/50 block font-medium uppercase">Área Estimada</span>
              <span className="text-base font-bold text-white">
                {calculatedArea ? `${calculatedArea} m²` : 'En cálculo'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-white/50 block font-medium uppercase">Proyecto</span>
              <span className="text-xs font-semibold text-white/90 truncate block">
                {projectName}
              </span>
            </div>
          </div>

          {/* Acciones Comerciales */}
          {isSold ? (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-center">
              <p className="text-xs text-red-300 font-medium">
                Este lote ya no se encuentra disponible para venta.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-[#02121B] font-bold text-xs tracking-wide transition-transform active:scale-95 shadow-[0_0_20px_rgba(37,211,102,0.25)]"
              >
                <div className="w-4 h-4">
                  <Whatsapp />
                </div>
                <span>WhatsApp</span>
              </a>

              <Button
                onPress={handleOpenLeadForm}
                className="flex-1 bg-gradient-to-r from-[#0CDBFF] to-[#00C662] text-[#02121B] font-bold text-xs shadow-[0_0_20px_rgba(12,219,255,0.2)]"
                size="md"
              >
                Me Interesa
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Captura de Lead para el Lote */}
      <Modal 
        isOpen={isLeadModalOpen} 
        onOpenChange={setIsLeadModalOpen}
        placement="center"
        backdrop="blur"
        classNames={{
          content: "bg-[#0B151F] border border-white/15 text-white max-w-md rounded-3xl overflow-hidden relative shadow-2xl",
          header: "border-b border-white/10 py-4 px-6",
          footer: "border-t border-white/10 py-3 px-6",
          closeButton: "absolute right-4 top-4 hover:bg-white/10 transition-colors p-1.5 rounded-lg text-white/70 hover:text-white"
        }}
      >
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-xs font-mono text-[#0CDBFF] uppercase tracking-wider">Solicitar Cotización</span>
                <span className="text-lg font-bold">{terrainName} • {projectName}</span>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-3.5 py-5">
                <p className="text-xs text-white/60">
                  Déjanos tus datos de contacto para que el equipo comercial te envíe el plano detallado, precio de lista y formas de pago.
                </p>

                {formError && (
                  <div className="bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
                    <span className="text-base flex-shrink-0">👋</span>
                    <span className="leading-snug">{formError}</span>
                  </div>
                )}

                <Input
                  label="Nombre"
                  placeholder="Ej. Carlos"
                  labelPlacement="outside"
                  variant="bordered"
                  value={leadName}
                  onValueChange={(val) => {
                    setLeadName(val);
                    if (formError) setFormError('');
                  }}
                  className="text-white"
                />

                <Input
                  label="Correo Electrónico"
                  placeholder="Ej. carlos@correo.com"
                  type="email"
                  labelPlacement="outside"
                  variant="bordered"
                  value={leadEmail}
                  onValueChange={(val) => {
                    setLeadEmail(val);
                    if (formError) setFormError('');
                  }}
                  className="text-white"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/80 font-semibold">
                    Teléfono / Celular
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-[105px] h-10 px-2 bg-[#12202E] border border-white/20 text-white rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+507">🇵🇦 +507</option>
                      <option value="+58">🇻🇪 +58</option>
                      <option value="+593">🇪🇨 +593</option>
                      <option value="+51">🇵🇪 +51</option>
                    </select>
                    <Input
                      placeholder="300 123 4567"
                      type="tel"
                      variant="bordered"
                      value={leadPhone}
                      onValueChange={(val) => {
                        setLeadPhone(val);
                        if (formError) setFormError('');
                      }}
                      className="flex-1 text-white"
                    />
                  </div>
                </div>

                <Textarea
                  label="Mensaje o Pregunta"
                  placeholder="Escribe tus dudas sobre este lote..."
                  labelPlacement="outside"
                  variant="bordered"
                  value={leadMessage}
                  onValueChange={setLeadMessage}
                  minRows={2}
                  className="text-white"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" size="sm" onPress={onCloseModal}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-gradient-to-r from-[#0CDBFF] to-[#00C662] text-[#02121B] font-bold text-xs" 
                  size="sm"
                  onPress={handleSendLead} 
                  isLoading={isSubmitting}
                >
                  Enviar Solicitud
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
