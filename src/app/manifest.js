export default function manifest() {
  return {
    name: "MyView_",
    short_name: "MyView",
    description: "Visualización 3D interactiva para proyectos inmobiliarios, topografía e ingeniería.",
    start_url: "/",
    display: "standalone",
    background_color: "#030D1C",
    theme_color: "#030D1C",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
