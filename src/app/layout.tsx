import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lívia Pisanello | Desenvolvedora Full Stack",
  description:
    "Portfólio de Lívia Pisanello, desenvolvedora full stack e estudante de Engenharia de Software.",
  openGraph: {
    title: "Lívia Pisanello | Desenvolvedora Full Stack",
    description: "Projetos em dados, inteligência artificial e educação acessível.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#140a10",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
