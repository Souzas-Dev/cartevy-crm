import type { ReactNode } from "react";

import { CrmShell } from "@/components/layout/crm-shell";

type CrmLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function CrmLayout({ children }: CrmLayoutProps) {
  return <CrmShell>{children}</CrmShell>;
}
