interface PageHeaderProps {
  title: string
  action?: React.ReactNode
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-100">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  )
}
