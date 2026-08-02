import "./globals.css";
import { Providers } from './providers'

export const metadata = {
  title: "MyView_",
  description: "MyView_",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="shortcut icon" href="/logos/isotipo-full-color.png" type="image/x-icon" />
        <link rel="preload" href="/images/op11.webp" as="image" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>  
      </body>
    </html>
  );
}
