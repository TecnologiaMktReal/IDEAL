import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema IDEAL | MKT Real",
  description: "Plataforma de gestao da metodologia IDEAL da MKT Real",
  icons: {
    icon: "/brand/favicon.png"
  }
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
