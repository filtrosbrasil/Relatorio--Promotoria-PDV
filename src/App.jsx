import { useState, useMemo, useCallback } from 'react'
import { LayoutDashboard, Building2, Download, Upload, Gift } from 'lucide-react'
import UploadArea from './components/UploadArea'
import KpiCards from './components/KpiCards'
import FiltersBar from './components/FiltersBar'
import { ConversionByPromoterChart, ConversionRateChart, TimelineChart } from './components/Charts'
import VisitsTable from './components/VisitsTable'
import PdvStatusList from './components/PdvStatusList'
import TrocaPremiadaTab from './components/TrocaPremiadaTab'
import { parseExcelFile, deduplicateVisits, computeStats, computeTrocaPremiada } from './utils/parseExcel'
import { exportToExcel, exportPdvStatus, exportTrocaPremiada } from './utils/exportExcel'

export default function App() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filters, setFilters] = useState({ promotor: '', cidade: '', status: '', dataInicio: '', dataFim: '' })

  const handleFile = useCallback(async (file) => {
    setIsLoading(true)
    setError(null)
    try {
      const parsed = await parseExcelFile(file)
      const uniqueVisits = deduplicateVisits(parsed.visits)
      const uniqueFirst = deduplicateVisits(parsed.firstVisit)
      setData({ visits: uniqueVisits, firstVisit: uniqueFirst, bloco2: parsed.bloco2, bloco3: parsed.bloco3, sheetNames: parsed.sheetNames })
      setFileName(file.name)
      setFilters({ promotor: '', cidade: '', status: '', dataInicio: '', dataFim: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const filteredVisits = useMemo(() => {
    if (!data) return []
    return data.visits.filter(v => {
      if (filters.promotor && v.colaborador !== filters.promotor) return false
      if (filters.cidade && v.cidade !== filters.cidade) return false
      if (filters.dataInicio && v.data < new Date(filters.dataInicio + 'T00:00:00')) return false
      if (filters.dataFim && v.data > new Date(filters.dataFim + 'T23:59:59')) return false
      return true
    })
  }, [data, filters])

  const stats = useMemo(() => filteredVisits.length ? computeStats(filteredVisits) : null, [filteredVisits])
  const globalStats = useMemo(() => data ? computeStats(data.visits) : null, [data])

  const trocaData = useMemo(() => {
    if (!data?.firstVisit?.length) return null
    let fv = data.firstVisit
    if (filters.promotor) fv = fv.filter(v => v.colaborador === filters.promotor)
    if (filters.cidade) fv = fv.filter(v => v.cidade === filters.cidade)
    if (filters.dataInicio) fv = fv.filter(v => v.data >= new Date(filters.dataInicio + 'T00:00:00'))
    if (filters.dataFim) fv = fv.filter(v => v.data <= new Date(filters.dataFim + 'T23:59:59'))
    return fv.length ? computeTrocaPremiada(fv) : null
  }, [data, filters])

  const handleExport = () => {
    if (activeTab === 'troca' && trocaData) {
      exportTrocaPremiada(trocaData.interessadosList, 'troca-premiada-interessados')
    } else if (activeTab === 'pdvs' && stats) {
      exportPdvStatus(stats.pdvList, 'status-pdv')
    } else {
      exportToExcel(filteredVisits, 'relatorio-visitas')
    }
  }

  if (!data) return <UploadArea onFileLoaded={handleFile} isLoading={isLoading} />

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'troca', label: 'Troca Premiada', icon: Gift },
    { id: 'pdvs', label: 'Status PDVs', icon: Building2 },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <img src="/logo-icon.svg" alt="" className="w-8 h-8" />
              <div>
                <h1 className="text-sm font-bold text-[#002856] leading-none">Filtros Brasil</h1>
                <p className="text-[11px] text-slate-400 leading-none mt-0.5">Dashboard PDV</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:block">{fileName}</span>
              {data.sheetNames.length > 1 && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-[#002856] border border-blue-200/60">
                  {data.sheetNames.length} abas
                </span>
              )}
              <button onClick={handleExport}
                className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-[#002856] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Exportar</span>
              </button>
              <button onClick={() => { setData(null); setError(null); setFileName('') }}
                className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                <Upload className="w-3.5 h-3.5" /><span className="hidden sm:inline">Nova planilha</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`tab-btn ${activeTab === t.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}>
                <span className="flex items-center gap-1.5">
                  <t.icon className="w-3.5 h-3.5" />{t.label}
                </span>
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-x-auto">
            <FiltersBar filters={filters} setFilters={setFilters} stats={globalStats} />
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {activeTab === 'dashboard' && stats && (
          <div className="space-y-5">
            <KpiCards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ConversionByPromoterChart data={stats.conversaoPorPromotor} />
              <ConversionRateChart data={stats.conversaoPorPromotor} />
            </div>
            <TimelineChart data={stats.evolucao} />
            <VisitsTable visits={filteredVisits} />
          </div>
        )}

        {activeTab === 'troca' && (
          trocaData
            ? <TrocaPremiadaTab trocaData={trocaData} />
            : <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Gift className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Nenhum dado de 1a Visita encontrado</p>
                  <p className="text-xs text-slate-300 mt-1">A planilha precisa ter a aba "1Visita"</p>
                </div>
              </div>
        )}

        {activeTab === 'pdvs' && stats && (
          <PdvStatusList pdvList={stats.pdvList} statusFilter={filters.status} />
        )}

        {!stats && activeTab !== 'troca' && (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-slate-400">Nenhum dado encontrado com os filtros aplicados.</p>
          </div>
        )}
      </main>
    </div>
  )
}
