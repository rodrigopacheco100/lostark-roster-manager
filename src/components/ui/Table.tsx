"use client"

import type { ReactNode } from "react"

function Root({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className ?? ""}`}>
      <table className="w-full">{children}</table>
    </div>
  )
}

function Head({ children, className }: { children: ReactNode; className?: string }) {
  return <thead className={`border-b border-gray-700/50 ${className ?? ""}`}>{children}</thead>
}

function Header({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${className ?? ""}`}>
      {children}
    </th>
  )
}

function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <tbody className={className ?? ""}>{children}</tbody>
}

function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={`border-b border-gray-800/30 last:border-0 ${className ?? ""}`}>{children}</tr>
}

function Cell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-1.5 text-sm ${className ?? ""}`}>{children}</td>
}

export const Table = { Root, Head, Header, Body, Row, Cell }
