import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Central de Ajuda GoSports",
  description:
    "Tire suas dúvidas sobre o app GoSports — reservas de quadras, criação de conta, QR Code e muito mais.",
  keywords: ["GoSports", "ajuda", "suporte", "reserva de quadra", "esportes"],
  openGraph: {
    title: "Central de Ajuda GoSports",
    description: "Tire suas dúvidas sobre o app GoSports",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
