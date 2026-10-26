import "./globals.css";
import { Providers } from './providers'

export const metadata = {
  title: "MyView_",
  description: "MyView_",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "MyView",
  },
  icons: {
    icon: "/logos/isotipo-full-color.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#030D1C",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="shortcut icon" href="/logos/isotipo-full-color.png" type="image/x-icon" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>  
      </body>
    </html>
  );
}
