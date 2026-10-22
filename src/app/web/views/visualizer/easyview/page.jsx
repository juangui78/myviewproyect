'use client'
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';
import axios from "axios";
import { decrypt } from '@/api/libs/crypto';

const EasyView = dynamic(() => import('./EasyView'), {
    ssr: false
});

function LoadingSpinner({ progress = 0 }) {
    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            backgroundColor: '#020b12', zIndex: 50, color: '#fff', fontFamily: 'sans-serif'
        }}>
            <div style={{
                width: '45px', height: '45px', border: '3px solid rgba(255,255,255,0.1)',
                borderTop: '3px solid #0CDBFF', borderRadius: '50%',
                animation: 'spin 1s linear infinite', marginBottom: '16px'
            }} />
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
                {progress > 0 && progress < 100 ? `Cargando modelo 3D... ${progress}%` : 'Cargando modelo 3D...'}
            </p>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

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
    const [isModelReady, setIsModelReady] = useState(false);
    const [progress, setProgress] = useState(0);

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

    if (!loading && !modelUrl) {
        return (
            <div style={{ width: '100%', height: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#020b12', color: '#fff', fontFamily: 'sans-serif' }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>No se pudo cargar el modelo o no se encontró un ID válido.</p>
            </div>
        );
    }

    const showLoader = loading || !isModelReady;

    return (
        <div style={{ width: '100%', height: '100dvh', position: 'relative', overflow: 'hidden', backgroundColor: '#020b12' }}>
            {showLoader && <LoadingSpinner progress={progress} />}

            {modelUrl && (
                <EasyView 
                    key={encryptedId} 
                    modelUrl={modelUrl} 
                    previewUrl={previewUrl} 
                    currentModel={currentModel} 
                    projectInfo={projectInfo} 
                    projectId={decryptedId} 
                    onReady={() => setIsModelReady(true)}
                    onProgress={(p) => setProgress(p)}
                />
            )}
        </div>
    );
}

export default function EasyViewPage() {
    return (
        <Suspense fallback={<LoadingSpinner progress={0} />}>
            <EasyViewContent />
        </Suspense>
    );
}
