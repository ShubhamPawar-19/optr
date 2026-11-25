
"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/app/components/app-sidebar";

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/privacy",
  "/terms",
  "/contact",
  "/data-deletion",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublicPage = publicRoutes.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)),
  );

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
