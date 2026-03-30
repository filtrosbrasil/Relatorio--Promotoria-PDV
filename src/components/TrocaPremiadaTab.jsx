import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, CheckCircle2, Phone, MapPin } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#002856', '#2D6AB4', '#5A9BD5', '#94C4F0', '#B8D4E8', '#D0E4F2']
const GREEN = '#10B981'

function MiniPie({ data, title }) {
  if (!data.length) return null
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-5">
      <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
      <div className="flex items-center gap-4">
        <div style={{ width: 120, height: 120 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={52} dataKey="value" stroke="none">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [v, 'PDVs']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-slate-600 truncate">{d.name}</span>
              <span className="text-slate-400 ml-auto flex-shrink-0">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 15

export default function TrocaPremiadaTab({ trocaData }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  if (!trocaData) return null

  const filtered = trocaData.interessadosList.filter(v => {
    if (!search) return true
    const q = search.toLowerCase()
    return v.nomeFantasia.toLowerCase().includes(q) ||
           v.cidade.toLowerCase().includes(q) ||
           v.colaborador.toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="kpi-card">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">1a Visita</span>
          <p className="text-2xl font-bold text-slate-800 mt-2">{trocaData.total}</p>
          <p className="text-xs text-slate-400 mt-1">PDVs visitados</p>
        </div>
        <div className="kpi-card">
          <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Interessados</span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{trocaData.interessados}</p>
          <p className="text-xs text-slate-400 mt-1">{trocaData.taxa}% de conversão</p>
        </div>
        <div className="kpi-card">
          <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Não interessados</span>
          <p className="text-2xl font-bold text-red-500 mt-2">{trocaData.naoInteressados}</p>
        </div>
        <div className="kpi-card">
          <span className="text-xs font-medium text-[#002856] uppercase tracking-wider">Conversão geral</span>
          <p className="text-2xl font-bold text-[#002856] mt-2">{trocaData.taxa}%</p>
          <p className="text-xs text-slate-400 mt-1">interesse na Troca Premiada</p>
        </div>
      </div>

      {/* Conversion by promoter */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-5">
        <h4 className="text-sm font-semibold text-slate-800 mb-1">Conversão por promotor — Troca Premiada</h4>
        <p className="text-xs text-slate-400 mb-4">Total de 1as visitas vs. interessados</p>
        <div style={{ height: Math.max(160, trocaData.conversaoPorPromotor.length * 48) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trocaData.conversaoPorPromotor} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={140} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="total" name="Visitas" fill="#002856" radius={[0, 4, 4, 0]} barSize={16} />
              <Bar dataKey="interesse" name="Interessados" fill={GREEN} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#002856' }} />1as Visitas</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: GREEN }} />Interessados</span>
        </div>
      </div>

      {/* Distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <MiniPie data={trocaData.volumeDistribution} title="Volume mensal de filtros" />
        <MiniPie data={trocaData.shareDistribution} title="Share Filtros Brasil no PDV" />
        <MiniPie data={trocaData.tempoDistribution} title="Tempo p/ juntar tampinhas" />
      </div>

      {/* Interested clients list */}
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Clientes interessados na Troca Premiada
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{trocaData.interessados} PDVs com interesse</p>
            </div>
          </div>
          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar PDV, cidade ou promotor..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="filter-input w-full pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">PDV</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Cidade/UF</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Promotor</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Telefone</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Volume mensal</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Share FB</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Tempo tampinhas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((v, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="text-slate-700 font-medium">{v.nomeFantasia}</p>
                    <p className="text-xs text-slate-400">{v.dataStr}</p>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                    {v.cidade}{v.estado ? `/${v.estado}` : ''}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{v.colaborador}</td>
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{v.telefone || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className="status-badge bg-blue-50 text-[#002856] border border-blue-200/60">
                      {v.volumeMensal}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="status-badge bg-slate-50 text-slate-600 border border-slate-200/60">
                      {v.shareFB}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="status-badge bg-amber-50 text-amber-700 border border-amber-200/60">
                      {v.tempoTampinhas}
                    </span>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">Nenhum PDV encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-xs text-slate-500 px-2">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
