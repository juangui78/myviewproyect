'use client'
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';
import axios from "axios";
import { decrypt } from '@/api/libs/crypto';

const EasyView = dynamic(() => import('./EasyView'), {
    ssr: false,
    loading: () => (
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#020b12', color: '#fff', fontFamily: 'sans-serif' }}>
            <div style={{
                width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.1)',
                borderTop: '4px solid #0CDBFF', borderRadius: '50%',
                animation: 'spin 1s linear infinite', marginBottom: '16px'
            }} />
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Iniciando EasyView optimizado...</p>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
});

function EasyViewContent() {
    const searchParams = useSearchParams();
    const encryptedId = searchParams.get("id");
    const modelIndex = parseInt(searchParams.get("modelIndex") ?? "0", 10);
    const decryptedId = encryptedId ? decrypt(encryptedId) : null;
    
    const [modelUrl, setModelUrl] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
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
                const projectResponse = await axios.get(`/api/controllers/visualizer/${idProyect}?t=${Date.now()}`);
                if (projectResponse.data) {
                    setProjectInfo(projectResponse.data.proyect);
                }

                // Traer todos los modelos y seleccionar el índice correcto
                const modelsResponse = await axios.get(`/api/controllers/models_/${idProyect}/allmodels?t=${Date.now()}`);
                if (modelsResponse.data && modelsResponse.data.length > 0) {
                    const safeIndex = Math.min(modelIndex, modelsResponse.data.length - 1);
                    const selectedModel = modelsResponse.data[safeIndex];
                    setCurrentModel(selectedModel);
                    if (selectedModel?.model?.url) {
                        const mainUrl = selectedModel.model.mobileUrl || selectedModel.model.url;
                        const prevUrl = (selectedModel.model.previewUrl && selectedModel.model.previewUrl !== mainUrl)
                            ? selectedModel.model.previewUrl
                            : null;
                        setModelUrl(mainUrl);
                        setPreviewUrl(prevUrl);
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
            <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#020b12', color: '#fff', fontFamily: 'sans-serif' }}>
                <div style={{
                    width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)',
                    borderTop: '3px solid #0CDBFF', borderRadius: '50%',
                    animation: 'spin 1s linear infinite', marginBottom: '14px'
                }} />
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Cargando modelo 3D optimizado...</p>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (!modelUrl) {
        return (
            <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#020b12', color: '#fff', fontFamily: 'sans-serif' }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>No se pudo cargar el modelo o no se encontró un ID válido.</p>
            </div>
        );
    }

    return (
        <EasyView 
            key={encryptedId} 
            modelUrl={modelUrl} 
            previewUrl={previewUrl} 
            currentModel={currentModel} 
            projectInfo={projectInfo} 
            projectId={decryptedId} 
        />
    );
}

export default function EasyViewPage() {
    return (
        <Suspense fallback={
            <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#020b12', color: '#fff', fontFamily: 'sans-serif' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Cargando...</p>
            </div>
        }>
            <EasyViewContent />
        </Suspense>
    );
}
