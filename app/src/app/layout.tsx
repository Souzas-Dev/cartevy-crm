import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Cartevy CRM",
  description: "Sua carteira comercial em movimento."
};

const themeScript = `
(() => {
  let saved;
  try { saved = localStorage.getItem("crm-theme"); } catch {}
  try {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved === "light" || saved === "dark" ? saved : (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();
`;

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body>{children}</body>
    </html>
  );
}
