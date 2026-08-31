import { getProjectPresentationData } from "./actions/getProjectData";
import ProyectoPresentationClient from "./ProyectoPresentationClient";

export async function generateMetadata({ params }) {
  const { id } = params;
  const projectData = await getProjectPresentationData(id);
  const projectName = projectData?.proyect?.name || "Proyecto";

  return {
    title: `${projectName} | Presentación de Proyecto | MyView_`,
    description: projectData?.proyect?.description || "Explora el gemelo digital interactivo y lotes disponibles en MyView.",
    openGraph: {
      title: `${projectName} | MyView_`,
      description: projectData?.proyect?.description || "Explora el gemelo digital interactivo en MyView.",
      images: projectData?.proyect?.urlImage ? [projectData.proyect.urlImage] : [],
    }
  };
}

export default async function ProyectoPresentationPage({ params }) {
  const { id } = params;
  const initialProjectData = await getProjectPresentationData(id);

  return (
    <ProyectoPresentationClient 
      initialProjectData={initialProjectData} 
      id={id} 
    />
  );
}
