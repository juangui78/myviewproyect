"use client";
import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const InteractiveBlobs = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Suavizamos el movimiento del mouse - Más rígido y rápido
    const springConfig = { damping: 20, stiffness: 200 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Normalizamos la posición del mouse entre -1 y 1
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth) * 2 - 1;
            const y = (e.clientY / innerHeight) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    // Transformaciones para cada orbe con mayor intensidad (Triplicado)
    const blob1X = useTransform(smoothX, [-1, 1], [-300, 300]);
    const blob1Y = useTransform(smoothY, [-1, 1], [-300, 300]);

    const blob2X = useTransform(smoothX, [-1, 1], [250, -250]);
    const blob2Y = useTransform(smoothY, [-1, 1], [250, -250]);

    const blob3X = useTransform(smoothX, [-1, 1], [-200, 200]);
    const blob3Y = useTransform(smoothY, [-1, 1], [200, -200]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div
                style={{ x: blob1X, y: blob1Y }}
                className="blob blob-primary top-[-10%] left-[-10%]"
            />
            <motion.div
                style={{ x: blob2X, y: blob2Y }}
                className="blob blob-secondary bottom-[-10%] right-[-10%]"
            />
            <motion.div
                style={{ x: blob3X, y: blob3Y }}
                className="blob blob-tertiary top-[40%] right-[20%]"
            />
        </div>
    );
};

export default InteractiveBlobs;
