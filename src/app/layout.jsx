import "./globals.css";
import { Providers } from './providers'

export const metadata = {
  title: "MyView_",
  description: "Tu nueva forma de ver.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="shortcut icon" href="../../logos/isotipo-full-color.png" type="image/x-icon" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>  
      </body>
    </html>
  );
}
