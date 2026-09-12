import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cuestionario | The Heels",
  description:
    "Cuéntanos qué tal te va en The Heels: dos minutos de valoraciones y, si te apetece, un vídeo.",
  // El enlace se reparte por WhatsApp, no se busca en Google. Indexarlo sólo
  // serviría para que entren a contestar personas que nunca han pisado la sala.
  robots: { index: false, follow: false },
};

export default function EncuestaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
