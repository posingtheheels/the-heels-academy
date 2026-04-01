import type { Metadata } from "next";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Heels | Posing Academy by Alejandra Sanchis",
  description:
    "Culturismo es el arte de esculpir tu cuerpo. Posing es el arte de mostrar tu trabajo. Academia de posing para culturismo con clases online y presenciales.",
  keywords: [
    "posing",
    "culturismo",
    "bodybuilding",
    "academia",
    "clases posing",
    "Alejandra Sanchis",
    "The Heels",
  ],
  openGraph: {
    title: "The Heels | Posing Academy",
    description:
      "Culturismo es el arte de esculpir tu cuerpo. Posing es el arte de mostrar tu trabajo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-ES">
      <head>
        <meta name="version" content="1.0.4-blog-pro" />
      </head>
      <body className="font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
