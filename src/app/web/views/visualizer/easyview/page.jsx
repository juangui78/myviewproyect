'use client'
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { decrypt } from '@/api/libs/crypto';
import EasyView from './EasyView';

function EasyViewContent() {
    const searchParams = useSearchParams();
    const encryptedId = searchParams.get("id");
    
    const [modelUrl, setModelUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModel = async () => {
            if (!encryptedId) {
                setLoading(false);
                return;
            }

            try {
                // Desencriptar el ID tal como se hace en el visualizador actual
                const idProyect = decrypt(encryptedId);
                const response = await axios.get(`/api/controllers/visualizer/${idProyect}`);
                
                if (response.data && response.data.model) {
                    const modelLocation = response.data.model.model;
                    if (modelLocation && modelLocation.url) {
                        setModelUrl(modelLocation.url);
                    }
                }
            } catch (error) {
                console.error("Error al obtener el modelo para EasyView:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchModel();
    }, [encryptedId]);

    if (loading) {
        return (
            <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', color: '#333', fontFamily: 'sans-serif' }}>
                <p>Cargando visualizador optimizado...</p>
            </div>
        );
    }

    if (!modelUrl) {
        return (
            <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', color: '#333', fontFamily: 'sans-serif' }}>
                <p>No se pudo cargar el modelo o no se encontró un ID válido.</p>
            </div>
        );
    }

    return <EasyView modelUrl={modelUrl} />;
}

export default function EasyViewPage() {
    return (
        <Suspense fallback={
            <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', color: '#333', fontFamily: 'sans-serif' }}>
                <p>Cargando página...</p>
            </div>
        }>
            <EasyViewContent />
        </Suspense>
    );
}
