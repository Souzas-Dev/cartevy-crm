import type { ReactNode } from "react";

import { CrmShell } from "@/components/layout/crm-shell";
import { requireAuthContext } from "@/server/auth/context";
import { logoutAction } from "./actions";

type CrmLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function CrmLayout({ children }: CrmLayoutProps) {
  await requireAuthContext();
  return <CrmShell logoutAction={logoutAction}>{children}</CrmShell>;
}
