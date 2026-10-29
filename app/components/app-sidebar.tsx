
"use client";

import {
  Activity,
  Bot,
  ChevronRight,
  Command,
  Database,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Plug,
  Settings2,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth-client";

const mainNavigation: NavigationItem[] = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Target },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Conversations", href: "/conversations", icon: MessageCircle },
  { label: "Datasets", href: "/datasets", icon: Database },
];

const settingsNavigation: NavigationItem[] = [
  { label: "AI agents", href: "/agents", icon: Bot },
  { label: "Contact fields", href: "/contacts/fields", icon: Settings2 },
  { label: "WhatsApp", href: "/integrations/whatsapp", icon: Plug },
];

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavigationSectionProps = {
  title: string;
  items: NavigationItem[];
  collapsed: boolean;
  isActive: (href: string) => boolean;
};

const SIDEBAR_STORAGE_KEY = "optr-sidebar-collapsed";
const SIDEBAR_TOGGLE_EVENT = "optr-toggle-sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const [collapsed, setCollapsed] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(
        window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true",
      );
    } catch {
      // Storage can be unavailable in restricted browser environments.
    }

    setHydrated(true);
  }, []);

  const persistCollapsed = useCallback((next: boolean) => {
    setCollapsed(next);

    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    } catch {
      // The sidebar remains usable without persistent preferences.
    }
  }, []);

  useEffect(() => {
    function handleSidebarToggle() {
      setCollapsed((current) => {
        const next = !current;

        try {
          window.localStorage.setItem(
            SIDEBAR_STORAGE_KEY,
            String(next),
          );
        } catch {
          // Keep the interaction functional when storage is unavailable.
        }

        return next;
      });
    }

    window.addEventListener(SIDEBAR_TOGGLE_EVENT, handleSidebarToggle);

    return () => {
      window.removeEventListener(
        SIDEBAR_TOGGLE_EVENT,
        handleSidebarToggle,
      );
    };
  }, []);

  const isCollapsed = !hydrated || collapsed;

  const isActive = useCallback(
    (href: string) => {
      if (href === "/app") return pathname === "/app";

      if (href === "/contacts/fields") {
        return (
          pathname === href || pathname.startsWith(`${href}/`)
        );
      }

      if (href === "/contacts") {
        return (
          pathname === href ||
          (/^\/contacts\/[^/]+$/.test(pathname) &&
            pathname !== "/contacts/fields")
        );
      }

      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);
    setSignOutError(false);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setSignOutError(true);
        setSigningOut(false);
        return;
      }

      window.location.assign("/login");
    } catch {
      setSignOutError(true);
      setSigningOut(false);
    }
  }

  const userName = session?.user?.name?.trim() || "Account";
  const userEmail = session?.user?.email || "";
  const avatarLetter =
    userName !== "Account"
      ? userName.charAt(0).toUpperCase()
      : userEmail.charAt(0).toUpperCase() || "U";

  return (
    <aside
      aria-label="Main navigation"
      className={`sticky top-0 z-30 flex h-dvh shrink-0 flex-col border-r border-slate-200/80 bg-white text-slate-900 transition-[width] duration-200 ease-out ${
        isCollapsed ? "w-[68px]" : "w-[248px]"
      }`}
    >
      {/* Brand */}
      <div
        className={`flex h-[68px] shrink-0 items-center border-b border-slate-100 ${
          isCollapsed ? "justify-center px-2" : "px-4"
        }`}
      >
        <Link
          href="/"
          aria-label="OPTR home"
          className={`group flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition group-hover:bg-slate-800">
            <Command size={19} strokeWidth={2.1} />
          </span>

          {!isCollapsed && (
            <span className="min-w-0">
              <span className="block text-[17px] font-bold tracking-tight">
                optr
              </span>
              <span className="block text-[11px] text-slate-500">
                AI lead operations
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* Workspace identity */}
      <div className="border-b border-slate-100 p-3">
        <div
          title={isCollapsed ? "Your workspace" : undefined}
          className={`flex h-10 items-center rounded-lg border border-slate-100 bg-slate-50/80 ${
            isCollapsed ? "justify-center" : "gap-2.5 px-2"
          }`}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-orange-100 text-[10px] font-bold tracking-wide text-orange-800">
            OP
          </span>

          {!isCollapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-slate-800">
                Your workspace
              </span>
              <span className="block truncate text-[10px] text-slate-500">
                Workspace account
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Workspace navigation"
        className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-2.5 py-5"
      >
        <NavigationSection
          title="Workspace"
          items={mainNavigation}
          collapsed={isCollapsed}
          isActive={isActive}
        />

        <NavigationSection
          title="Settings"
          items={settingsNavigation}
          collapsed={isCollapsed}
          isActive={isActive}
        />
      </nav>

      {/* Account */}
      <div className="shrink-0 border-t border-slate-200/80 p-3">
        {signOutError && (
          <p
            role="alert"
            className="mb-2 rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-700"
          >
            Sign out failed. Please try again.
          </p>
        )}

        <div
          className={`flex min-w-0 items-center gap-2.5 ${
            isCollapsed ? "flex-col" : ""
          }`}
        >
          <div
            title={userEmail || userName}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700"
          >
            {isPending ? "…" : avatarLetter}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                {isPending ? "Loading account…" : userName}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {userEmail || "Signed-in account"}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            title={signingOut ? "Signing out…" : "Sign out"}
            aria-label={signingOut ? "Signing out" : "Sign out"}
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 outline-none transition hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-wait disabled:opacity-50 ${
              isCollapsed ? "" : "ml-auto"
            }`}
          >
            <LogOut
              size={17}
              className={signingOut ? "animate-pulse" : ""}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavigationSection({
  title,
  items,
  collapsed,
  isActive,
}: NavigationSectionProps) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <h2 className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </h2>
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
            className={`group relative flex h-10 items-center gap-3 rounded-lg text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 ${
              collapsed
                ? "justify-center px-0"
                : "px-2.5"
            } ${
              active
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <Icon
              size={18}
              strokeWidth={active ? 2 : 1.8}
              className="shrink-0"
              aria-hidden="true"
            />

            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {active && (
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-slate-400"
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
