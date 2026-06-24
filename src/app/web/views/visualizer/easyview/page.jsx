'use client'
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { decrypt } from '@/api/libs/crypto';
import EasyView from './EasyView';

function EasyViewContent() {
    const searchParams = useSearchParams();
    const encryptedId = searchParams.get("id");
    const modelIndex = parseInt(searchParams.get("modelIndex") ?? "0", 10);
    
    const [modelUrl, setModelUrl] = useState(null);
    const [currentModel, setCurrentModel] = useState(null);
    const [projectInfo, setProjectInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModel = async () => {
            if (!encryptedId) {
                if (typeof window !== 'undefined') {
                    const urlParams = new URLSearchParams(window.location.search);
                    if (!urlParams.get("id")) {
                        setLoading(false);
                    }
                }
                return;
            }

            try {
                setLoading(true);
                const idProyect = decrypt(encryptedId);
                if (!idProyect) {
                    throw new Error("ID de proyecto inválido");
                }

                // Traer info del proyecto
                const projectResponse = await axios.get(`/api/controllers/visualizer/${idProyect}`);
                if (projectResponse.data) {
                    setProjectInfo(projectResponse.data.proyect);
                }

                // Traer todos los modelos y seleccionar el índice correcto
                const modelsResponse = await axios.get(`/api/controllers/models_/${idProyect}/allmodels`);
                if (modelsResponse.data && modelsResponse.data.length > 0) {
                    const safeIndex = Math.min(modelIndex, modelsResponse.data.length - 1);
                    const selectedModel = modelsResponse.data[safeIndex];
                    setCurrentModel(selectedModel);
                    if (selectedModel?.model?.url) {
                        setModelUrl(selectedModel.model.url);
                    }
                }
            } catch (error) {
                console.error("Error al obtener el modelo para EasyView:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchModel();
    }, [encryptedId, modelIndex]);

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

    return <EasyView modelUrl={modelUrl} currentModel={currentModel} projectInfo={projectInfo} />;
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
