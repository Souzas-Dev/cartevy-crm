import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Cartevy CRM",
  description: "Sua carteira comercial em movimento."
};

const themeScript = `
(() => {
  try {
    const savedTheme = window.localStorage.getItem("crm-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const theme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : prefersDark
          ? "dark"
          : "light";

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();
`;

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body>{children}</body>
    </html>
  );
}
