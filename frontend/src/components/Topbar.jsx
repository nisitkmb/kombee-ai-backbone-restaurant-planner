export default function Topbar({ title, subtitle, children }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 min-h-[56px]">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-mono mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
    </header>
  )
}
