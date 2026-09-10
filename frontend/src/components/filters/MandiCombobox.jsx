import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function MandiCombobox({ mandis, value, onChange, districtOf, placeholder = 'Search mandi' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const list = needle ? mandis.filter((name) => name.toLowerCase().includes(needle)) : mandis
    return list.slice(0, 50)
  }, [mandis, query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-medium">
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,90vw)] p-0">
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="h-11 border-0 px-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
        <ul className="max-h-64 overflow-y-auto p-1">
          {matches.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">No mandi matches “{query}”.</li>
          ) : (
            matches.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(name)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50',
                    name === value && 'bg-brand-50 font-semibold',
                  )}
                >
                  <Check className={cn('size-4 text-brand-700', name === value ? 'opacity-100' : 'opacity-0')} />
                  <span className="flex-1 truncate">{name}</span>
                  {districtOf?.(name) ? (
                    <span className="text-xs text-muted-foreground">{districtOf(name)}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
