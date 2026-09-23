import type { ReactNode } from "react";

type CrmLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function CrmLayout({ children }: CrmLayoutProps) {
  return children;
}
