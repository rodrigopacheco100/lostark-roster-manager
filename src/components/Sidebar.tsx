"use client"

import { signOut } from "next-auth/react"
import { Coffee, ExternalLink, Group, LayoutDashboard, LogOut, Sword, UserCircle, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navGroups = [
  {
    label: "Roster Management",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/rosters", label: "Rosters", icon: Sword },
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex w-64 flex-col bg-surface-elevated p-4">
      <Link href="/dashboard" className="mb-6 px-3 text-xl font-bold tracking-tight text-gray-100">
        LAR Manager
      </Link>

      <div className="flex flex-1 flex-col gap-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{group.label}</p>
            {group.links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-surface-active text-blue-400"
                      : "text-gray-400 hover:bg-surface-hover hover:text-gray-200"
                  }`}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-3">
        <a
          href="https://buymeacoffee.com/axiosz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors duration-200 hover:bg-surface-hover hover:text-yellow-400"
        >
          <Coffee className="h-4 w-4 shrink-0" />
          Buy me a coffee
          <ExternalLink className="ml-auto h-3 w-3 shrink-0" />
        </a>
      </div>

      <div className="pt-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors duration-200 hover:bg-surface-hover hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </nav>
  )
}
