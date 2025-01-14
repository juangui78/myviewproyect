import "./globals.css";
import { Providers } from './providers'
import { Inter } from "next/font/google";


const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "MyView_",
  description: "Tu nueva forma de ver.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} antialiased`}
      >
        <Providers>
          {children}
        </Providers>  
      </body>
    </html>
  );
}
