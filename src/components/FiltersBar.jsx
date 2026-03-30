import { Filter, X } from 'lucide-react'

export default function FiltersBar({ filters, setFilters, stats }) {
  const hasActiveFilter = filters.promotor || filters.cidade || filters.status || filters.dataInicio || filters.dataFim

  const clearAll = () => {
    setFilters({ promotor: '', cidade: '', status: '', dataInicio: '', dataFim: '' })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-1">
        <Filter className="w-3.5 h-3.5" />
        Filtros
      </div>

      <input
        type="date"
        value={filters.dataInicio}
        onChange={(e) => setFilters(f => ({ ...f, dataInicio: e.target.value }))}
        className="filter-input w-[140px]"
        placeholder="Data início"
      />
      <input
        type="date"
        value={filters.dataFim}
        onChange={(e) => setFilters(f => ({ ...f, dataFim: e.target.value }))}
        className="filter-input w-[140px]"
        placeholder="Data fim"
      />

      <select
        value={filters.promotor}
        onChange={(e) => setFilters(f => ({ ...f, promotor: e.target.value }))}
        className="filter-select min-w-[160px]"
      >
        <option value="">Todos promotores</option>
        {stats.promotores.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={filters.cidade}
        onChange={(e) => setFilters(f => ({ ...f, cidade: e.target.value }))}
        className="filter-select min-w-[140px]"
      >
        <option value="">Todas cidades</option>
        {stats.cidades.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
        className="filter-select min-w-[150px]"
      >
        <option value="">Todos status</option>
        <option value="Sim">Com interesse</option>
        <option value="Não">Sem interesse</option>
        <option value="null">Sem informação</option>
      </select>

      {hasActiveFilter && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 h-9 px-3 text-xs font-medium text-fb-red
                     hover:bg-red-50 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Limpar
        </button>
      )}
    </div>
  )
}
