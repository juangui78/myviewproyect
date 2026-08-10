"use client";
import React, { useState } from "react";
import { Card, CardBody, Button, Input, Textarea } from "@heroui/react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    setIsSubmitting(true);
    // Simular envío de formulario
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("¡Mensaje enviado con éxito! Nos pondremos en contacto muy pronto.");
      setFormData({ name: "", email: "", company: "", message: "" });
      
      // Reset state after a few seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 4000);
    }, 1500);
  };

  return (
    <div id="contacto" className="w-full py-16 md:py-24 relative z-20 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4"
          >
            ¿Listo para empezar?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Déjanos tus datos o escríbenos directamente. Te ayudaremos a optimizar tus proyectos con tecnología 3D.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
          {/* Left Column: Direct Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1, margin: "0px 0px -20px 0px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-between p-8 rounded-3xl border border-white/10 glass-card glow-card-hover bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden transform-gpu"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
            
            <div className="flex flex-col gap-6">
              <span className="text-4xl mb-4 block select-none">✉️</span>
              <h3 className="text-2xl font-bold text-white mb-2">Contacto Directo</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Si prefieres un contacto inmediato o tienes especificaciones técnicas complejas, puedes escribirnos directamente a nuestro correo corporativo o a través de WhatsApp.
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">Correo Corporativo</span>
                  <a
                    href="mailto:contacto@myview.com"
                    className="text-lg font-semibold text-primary hover:text-secondary transition-colors break-all"
                  >
                    contacto@myview.com
                  </a>
                </div>
                
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">Teléfono / WhatsApp</span>
                  <a
                    href="https://wa.me/+573054023539"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-white hover:text-primary transition-colors"
                  >
                    +57 305 402 3539
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-gray-400 text-xs">Soporte y cotizaciones activos hoy</span>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-3xl border border-white/10 glass-card glow-card-hover bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden"
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/10 blur-[60px] rounded-full pointer-events-none"></div>

            <h3 className="text-2xl font-bold text-white mb-6">Solicitar Información</h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="text"
                name="name"
                label="Nombre"
                placeholder="Ingresa tu nombre completo"
                value={formData.name}
                onChange={handleChange}
                required
                variant="bordered"
                classNames={{
                  label: "text-gray-400",
                  input: "text-white",
                  inputWrapper: "border-white/10 hover:border-primary/50 focus-within:!border-primary",
                }}
              />
              <Input
                type="email"
                name="email"
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleChange}
                required
                variant="bordered"
                classNames={{
                  label: "text-gray-400",
                  input: "text-white",
                  inputWrapper: "border-white/10 hover:border-primary/50 focus-within:!border-primary",
                }}
              />
              <Input
                type="text"
                name="company"
                label="Nombre de la Empresa"
                placeholder="Mi Empresa S.A.S."
                value={formData.company}
                onChange={handleChange}
                required
                variant="bordered"
                classNames={{
                  label: "text-gray-400",
                  input: "text-white",
                  inputWrapper: "border-white/10 hover:border-primary/50 focus-within:!border-primary",
                }}
              />
              <Textarea
                name="message"
                label="Mensaje (Opcional)"
                placeholder="¿En qué podemos ayudarte?"
                value={formData.message}
                onChange={handleChange}
                variant="bordered"
                classNames={{
                  label: "text-gray-400",
                  input: "text-white",
                  inputWrapper: "border-white/10 hover:border-primary/50 focus-within:!border-primary",
                }}
              />
              
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-secondary text-black font-bold shadow-[0_0_15px_rgba(12,219,255,0.25)] hover:shadow-[0_0_25px_rgba(12,219,255,0.45)] transition-all duration-300 mt-2"
                isLoading={isSubmitting}
              >
                {submitted ? "¡Mensaje Enviado!" : "Enviar Mensaje"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
