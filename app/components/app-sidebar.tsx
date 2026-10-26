"use client";

import {
  Bot,
  Command,
  Database,
  LayoutDashboard,
  MessageCircle,
  Settings2,
  Users,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const mainNavigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Target },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Conversations", href: "/conversations", icon: MessageCircle },
  { label: "Datasets", href: "/datasets", icon: Database },
];

const settingsNavigation = [
  { label: "AI Agent", href: "/agents", icon: Bot },
  { label: "Contact fields", href: "/contacts/fields", icon: Settings2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(
      localStorage.getItem("optr-sidebar-collapsed") === "true",
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    function handleSidebarToggle() {
      setCollapsed((current) => {
        const next = !current;
        localStorage.setItem("optr-sidebar-collapsed", String(next));
        return next;
      });
    }

    window.addEventListener("optr-toggle-sidebar", handleSidebarToggle);

    return () => {
      window.removeEventListener("optr-toggle-sidebar", handleSidebarToggle);
    };
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";

    // Keep Contact fields separate from the Contacts section.
    if (href === "/contacts/fields") {
      return pathname === href || pathname.startsWith(`${href}/`);
    }

    if (href === "/contacts") {
      return (
        pathname === "/contacts" ||
        (/^\/contacts\/[^/]+$/.test(pathname) &&
          pathname !== "/contacts/fields")
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const isCollapsed = !hydrated || collapsed;

  return (
    <aside
      className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white text-slate-950 transition-[width] duration-200 ${isCollapsed ? "w-[76px]" : "w-[250px]"
        }`}
    >
      <div
        className={`flex h-[72px] shrink-0 items-center border-b border-slate-100 ${isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
      >
        <Link
          href="/"
          aria-label="OPTR home"
          title="OPTR home"
          className="flex min-w-0 items-center gap-3 rounded-lg"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Command size={20} strokeWidth={2.2} />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight">optr</p>
              <p className="text-[11px] text-slate-500">
                AI lead operations
              </p>
            </div>
          )}
        </Link>
      </div>

      <div className="border-b border-slate-100 p-3">
        <div
          title={isCollapsed ? "Your workspace" : undefined}
          className={`flex h-11 items-center rounded-xl bg-slate-50 ${isCollapsed ? "justify-center" : "gap-3 px-2.5"
            }`}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-xs font-bold text-orange-700">
            OP
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                Your workspace
              </p>
              <p className="text-xs text-slate-500">
                Workspace overview
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 py-5">
        <NavigationSection
          title="Workspace"
          items={mainNavigation}
          collapsed={isCollapsed}
          isActive={isActive}
        />

        <NavigationSection
          title="Configuration"
          items={settingsNavigation}
          collapsed={isCollapsed}
          isActive={isActive}
        />
      </nav>
    </aside>
  );
}

function NavigationSection({
  title,
  items,
  collapsed,
  isActive,
}: {
  title: string;
  items: typeof mainNavigation;
  collapsed: boolean;
  isActive: (href: string) => boolean;
}) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </p>
      )}

      {items.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);

        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${collapsed ? "justify-center px-0" : ""
              } ${active
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
          >
            <Icon size={18} strokeWidth={1.9} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </div>
  );
}