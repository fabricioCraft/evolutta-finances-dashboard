// src/components/DashboardFilters.tsx 
'use client'; 
import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, ChevronDown } from 'lucide-react'; 

type Range = { start: string; end: string }; // YYYY-MM-DD

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthBounds(d: Date): Range {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: toISODate(start), end: toISODate(end) };
}

const presets = [
  {
    key: 'last7',
    label: 'Últimos 7 dias',
    getRange: () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return { start: toISODate(start), end: toISODate(today) };
    },
  },
  {
    key: 'last30',
    label: 'Últimos 30 dias',
    getRange: () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return { start: toISODate(start), end: toISODate(today) };
    },
  },
  {
    key: 'last90',
    label: 'Últimos 90 dias',
    getRange: () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 89);
      return { start: toISODate(start), end: toISODate(today) };
    },
  },
  {
    key: 'currentMonth',
    label: 'Mês atual',
    getRange: () => getMonthBounds(new Date()),
  },
  {
    key: 'lastMonth',
    label: 'Último mês',
    getRange: () => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return getMonthBounds(d);
    },
  },
  {
    key: 'currentYear',
    label: 'Ano atual',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { start: toISODate(start), end: toISODate(end) };
    },
  },
];

export default function DashboardFilters() { 
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const selectedStart = searchParams.get('startDate');
  const selectedEnd = searchParams.get('endDate');

  const label = useMemo(() => {
    if (selectedStart && selectedEnd) {
      // Checar se bate com algum preset
      for (const p of presets) {
        const r = p.getRange();
        if (r.start === selectedStart && r.end === selectedEnd) return p.label;
      }
      return 'Personalizado';
    }
    // Sem params: usar mês atual (alinhado ao backend)
    return 'Mês atual';
  }, [selectedStart, selectedEnd]);

  function applyRange(range: Range) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('startDate', range.start);
    params.set('endDate', range.end);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setOpen(false);
  }

  function clearRange() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('startDate');
    params.delete('endDate');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setOpen(false);
  }

  // Estado local para intervalo personalizado
  const [customStart, setCustomStart] = useState<string>(selectedStart ?? getMonthBounds(new Date()).start);
  const [customEnd, setCustomEnd] = useState<string>(selectedEnd ?? getMonthBounds(new Date()).end);

  function applyCustom() {
    if (!customStart || !customEnd) return;
    applyRange({ start: customStart, end: customEnd });
  }

  return ( 
    <div className="relative"> 
      <button onClick={() => setOpen((o) => !o)} className="flex items-center px-4 py-2 bg-dark-card border border-dark-border text-gray-300 rounded-lg text-sm hover:border-brand-primary transition-all"> 
        <CalendarDays size={18} className="mr-2" /> 
        <span className="mr-1">{label}</span> 
        <ChevronDown size={16} className="opacity-70" />
      </button> 

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] bg-dark-card border border-dark-border rounded-lg shadow-xl p-3 z-50"> 
          <div className="grid grid-cols-1 gap-2 mb-3">
            {presets.map((p) => (
              <button
                key={p.key}
                className="text-left px-3 py-2 rounded-md hover:bg-white/5 text-gray-200 border border-transparent hover:border-brand-primary/40"
                onClick={() => applyRange(p.getRange())}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="border-t border-dark-border my-2" />
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Início</label>
              <input
                type="date"
                className="bg-gray-900 text-gray-200 text-sm rounded-md border border-dark-border px-2 py-1"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Fim</label>
              <input
                type="date"
                className="bg-gray-900 text-gray-200 text-sm rounded-md border border-dark-border px-2 py-1"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <button onClick={clearRange} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Limpar</button>
            <button onClick={applyCustom} className="px-3 py-1.5 text-xs bg-brand-primary text-white rounded-md hover:bg-opacity-90">Aplicar</button>
          </div>
        </div>
      )}
    </div> 
  ); 
}