import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function StatusBadge({ value }) {
  if (value === 'Sim') {
    return (
      <span className="status-badge bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        Sim
      </span>
    )
  }
  if (value === 'Não') {
    return (
      <span className="status-badge bg-red-50 text-red-600 border border-red-200/60">
        Não
      </span>
    )
  }
  return (
    <span className="status-badge bg-slate-50 text-slate-400 border border-slate-200/60">
      —
    </span>
  )
}

const PAGE_SIZE = 20

export default function VisitsTable({ visits }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(visits.length / PAGE_SIZE)
  const paginated = visits.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Visitas realizadas</h3>
          <p className="text-xs text-slate-400 mt-0.5">{visits.length.toLocaleString('pt-BR')} registros</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Data</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Hora</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Promotor</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">PDV</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Cidade</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">UF</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Interesse</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{v.dataStr}</td>
                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{v.hora || '—'}</td>
                <td className="px-4 py-2.5 text-slate-700 font-medium">{v.colaborador}</td>
                <td className="px-4 py-2.5 text-slate-700">{v.nomeFantasia}</td>
                <td className="px-4 py-2.5 text-slate-500">{v.cidade || '—'}</td>
                <td className="px-4 py-2.5 text-slate-500">{v.estado || '—'}</td>
                <td className="px-4 py-2.5 text-center"><StatusBadge value={v.possuiInteresse} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, visits.length)} de {visits.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs text-slate-500 px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
