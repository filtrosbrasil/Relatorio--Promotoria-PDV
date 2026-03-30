import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'

function StatusIcon({ status }) {
  if (status === 'Ativado') {
    return (
      <span className="inline-flex items-center gap-1.5 status-badge bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        <CheckCircle2 className="w-3 h-3" />
        Ativado
      </span>
    )
  }
  if (status === 'Sem interesse') {
    return (
      <span className="inline-flex items-center gap-1.5 status-badge bg-red-50 text-red-600 border border-red-200/60">
        <XCircle className="w-3 h-3" />
        Sem interesse
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 status-badge bg-slate-50 text-slate-400 border border-slate-200/60">
      <MinusCircle className="w-3 h-3" />
      Sem info
    </span>
  )
}

const PAGE_SIZE = 15

export default function PdvStatusList({ pdvList, statusFilter }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const filtered = pdvList.filter(p => {
    if (search) {
      const q = search.toLowerCase()
      if (!p.nomeFantasia.toLowerCase().includes(q) &&
          !p.cidade.toLowerCase().includes(q) &&
          !p.colaborador.toLowerCase().includes(q)) return false
    }
    if (statusFilter === 'Sim' && p.status !== 'Ativado') return false
    if (statusFilter === 'Não' && p.status !== 'Sem interesse') return false
    if (statusFilter === 'null' && p.status !== 'Sem info') return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const ativados = pdvList.filter(p => p.status === 'Ativado').length
  const semInteresse = pdvList.filter(p => p.status === 'Sem interesse').length
  const semInfo = pdvList.filter(p => p.status === 'Sem info').length

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Status por PDV</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {pdvList.length} PDVs — {ativados} ativados, {semInteresse} sem interesse, {semInfo} sem info
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar PDV, cidade ou promotor..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="filter-input w-full pl-9"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {ativados}
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {semInteresse}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              {semInfo}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">PDV</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Cidade</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">UF</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Promotor</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Visitas</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Última visita</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((p, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-2.5 text-slate-700 font-medium">{p.nomeFantasia}</td>
                <td className="px-4 py-2.5 text-slate-500">{p.cidade || '—'}</td>
                <td className="px-4 py-2.5 text-slate-500">{p.estado || '—'}</td>
                <td className="px-4 py-2.5 text-slate-600">{p.colaborador}</td>
                <td className="px-4 py-2.5 text-center text-slate-600">{p.totalVisitas}</td>
                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{p.ultimaVisitaStr}</td>
                <td className="px-4 py-2.5 text-center"><StatusIcon status={p.status} /></td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">
                  Nenhum PDV encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
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
