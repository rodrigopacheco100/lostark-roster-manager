"use client"

import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  ExternalLink,
  Group,
  LayoutDashboard,
  LogOut,
  Sword,
  UserCircle,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { LoaLogsIcon } from "./LoaLogsIcon"

const navGroups = [
  {
    label: "Roster Management",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/rosters", label: "Rosters", icon: Sword },
      { href: "/loa-logs", label: "Loa Logs", icon: LoaLogsIcon },
    ],
  },
  {
    label: "Social",
    links: [
      { href: "/friends", label: "Friends", icon: Users },
      { href: "/groups", label: "Groups", icon: Group },
      { href: "/profile", label: "Profile", icon: UserCircle },
    ],
  },
]

function CollapsibleText({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
        show ? "max-w-40 opacity-100" : "max-w-0 opacity-0"
      }`}
    >
      {children}
    </span>
  )
}

function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  if (!label) return <>{children}</>
  return (
    <div className="group relative">
      {children}
      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-collapsed") === "true")
  const pathname = usePathname()

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed))
  }, [collapsed])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  return (
    <div className="relative flex shrink-0">
      <nav
        className={`flex flex-col bg-surface-elevated p-4 transition-all duration-300 ${collapsed ? "w-18" : "w-64"}`}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 mb-6 transition-all duration-200 text-gray-100"
        >
          <img
            src="/favicon.ico"
            alt="LAR"
            className={`shrink-0 rounded-sm transition-all duration-200 ${collapsed ? "h-4 w-4" : "h-6 w-6"}`}
          />
          <CollapsibleText show={!collapsed}>
            <span className="text-xl font-bold tracking-tight text-gray-100">LAR Manager</span>
          </CollapsibleText>
        </Link>

        <div className="flex flex-1 flex-col">
          {navGroups.map((group, index) => (
            <div key={group.label}>
              {index > 0 && <div className="border-t border-gray-700 my-4" />}
              <CollapsibleText show={!collapsed}>
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{group.label}</p>
              </CollapsibleText>
              {group.links.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <NavTooltip key={link.href} label={collapsed ? link.label : ""}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? "bg-surface-active text-blue-400"
                          : "text-gray-400 hover:bg-surface-hover hover:text-gray-200"
                      }`}
                    >
                      <link.icon className="h-4 w-4 shrink-0" />
                      <CollapsibleText show={!collapsed}>{link.label}</CollapsibleText>
                    </Link>
                  </NavTooltip>
                )
              })}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-3">
          <NavTooltip label={collapsed ? "Buy me a coffee" : ""}>
            <a
              href="https://buymeacoffee.com/axiosz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors duration-200 hover:bg-surface-hover hover:text-yellow-400"
            >
              <Coffee className="h-4 w-4 shrink-0" />
              <CollapsibleText show={!collapsed}>Buy me a coffee</CollapsibleText>
              {!collapsed && <ExternalLink className="ml-auto h-3 w-3 shrink-0" />}
            </a>
          </NavTooltip>
        </div>

        <div className="pt-3">
          <NavTooltip label={collapsed ? "Sign out" : ""}>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors duration-200 hover:bg-surface-hover hover:text-red-400"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <CollapsibleText show={!collapsed}>Sign out</CollapsibleText>
            </button>
          </NavTooltip>
        </div>
      </nav>

      <button
        type="button"
        onClick={toggleCollapsed}
        className="absolute -right-3 top-6 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-gray-700 bg-surface-elevated text-gray-400 shadow-sm transition-colors duration-200 hover:bg-surface-hover hover:text-gray-200"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  )
}
