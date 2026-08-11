import { Icon } from './Icon'

interface PaginationProps {
  page: number
  pages: number
  showing: string
  onPage?: (page: number) => void
  compact?: boolean
}

export function Pagination({ page, pages, showing, onPage, compact = false }: PaginationProps) {
  const pageList: (number | '...')[] = []
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) pageList.push(i)
    else if (pageList[pageList.length - 1] !== '...') pageList.push('...')
  }

  const btn = (active: boolean) =>
    `w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
      active
        ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20'
        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
    }`

  const btnCompact = (active: boolean) =>
    `w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
      active ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container-high text-on-surface-variant'
    }`

  const cls = compact ? btnCompact : btn

  return (
    <div className="p-lg flex flex-col sm:flex-row items-center justify-between gap-lg border-t border-outline-variant/10">
      <p className="font-label text-label-md text-on-surface-variant">{showing}</p>
      <div className="flex items-center gap-sm">
        <button className={cls(false)} disabled={page <= 1} onClick={() => onPage?.(Math.max(1, page - 1))}>
          <Icon name="chevron_left" className="text-md" />
        </button>
        {pageList.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="px-2 text-on-surface-variant">
              ...
            </span>
          ) : (
            <button key={p} className={cls(p === page)} onClick={() => onPage?.(p)}>
              {p}
            </button>
          )
        )}
        <button className={cls(false)} disabled={page >= pages} onClick={() => onPage?.(Math.min(pages, page + 1))}>
          <Icon name="chevron_right" className="text-md" />
        </button>
      </div>
    </div>
  )
}
