"use client";
import React from "react";
import { Image, Button } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Whatsapp from "@/web/global_components/icons/Whatsapp";

export default function Footer() {
    const pathname = usePathname();

    // Determine content based on page
    let middleColumns = null;

    if (pathname === "/inmobiliarias") {
        middleColumns = (
            <>
                {/* Secciones Inmobiliarias */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-white font-bold text-lg">Inmobiliarias</h3>
                    <ul className="flex flex-col gap-4">
                        <li>
                            <Link href="#precios" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Planes y Precios
                            </Link>
                        </li>
                        <li>
                            <Link href="#contacto" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Solicitar Información
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Otros Servicios */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-white font-bold text-lg">Navegación</h3>
                    <ul className="flex flex-col gap-4">
                        <li>
                            <Link href="/" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Inicio
                            </Link>
                        </li>
                        <li>
                            <Link href="/ingenieria-topografia" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Ingeniería y Topografía
                            </Link>
                        </li>
                    </ul>
                </div>
            </>
        );
    } else if (pathname === "/ingenieria-topografia") {
        middleColumns = (
            <>
                {/* Secciones Topografía */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-white font-bold text-lg">Topografía</h3>
                    <ul className="flex flex-col gap-4">
                        <li>
                            <Link href="#precios" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Planes y Precios
                            </Link>
                        </li>
                        <li>
                            <Link href="#contacto" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Solicitar Información
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Otros Servicios */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-white font-bold text-lg">Navegación</h3>
                    <ul className="flex flex-col gap-4">
                        <li>
                            <Link href="/" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Inicio
                            </Link>
                        </li>
                        <li>
                            <Link href="/inmobiliarias" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Inmobiliarias
                            </Link>
                        </li>
                    </ul>
                </div>
            </>
        );
    } else {
        // Home page or other pages
        middleColumns = (
            <>
                {/* Servicios */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-white font-bold text-lg">Servicios</h3>
                    <ul className="flex flex-col gap-4">
                        <li>
                            <Link href="/inmobiliarias" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Inmobiliarias
                            </Link>
                        </li>
                        <li>
                            <Link href="/ingenieria-topografia" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Ingeniería y Topografía
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Empresa / Recursos */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-white font-bold text-lg">My View</h3>
                    <ul className="flex flex-col gap-4">
                        <li>
                            <Link href="#contacto" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Contáctanos
                            </Link>
                        </li>
                        <li>
                            <Link href="/web/views/login" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Iniciar Sesión
                            </Link>
                        </li>
                    </ul>
                </div>
            </>
        );
    }

    return (
        <footer className="w-full relative z-20 mt-20 border-t border-white/10 bg-black/40 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Logo & Info */}
                    <div className="flex flex-col gap-6">
                        <Image
                            src="/logos/completo-fullblanco.png"
                            alt="My View Logo"
                            width={180}
                            className="object-contain"
                        />
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Transformando el futuro de la gestión de tierras con fotogrametría avanzada y visualización 3D interactiva.
                        </p>
                        <div className="flex gap-4">
                            <Button isIconOnly variant="light" className="text-white hover:text-primary transition-colors h-10 w-10 min-w-10 rounded-full border border-white/10 hover:border-primary/50">
                                <Whatsapp className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {middleColumns}

                    {/* Legal */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-white font-bold text-lg">Legal</h3>
                        <ul className="flex flex-col gap-4">
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Términos de Servicio
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Política de Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Cookies
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-white font-bold text-lg">Contacto</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">Email</span>
                                <a href="mailto:contacto@myview.com" className="text-gray-300 hover:text-primary transition-colors text-sm">
                                    contacto@myview.com
                                </a>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">Teléfono</span>
                                <a href="tel:+573054023539" className="text-gray-300 hover:text-primary transition-colors text-sm">
                                    +57 305 402 3539
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-medium text-center md:text-left">
                        © {new Date().getFullYear()} My View. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.5)]"></span>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Sistemas Activos</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
