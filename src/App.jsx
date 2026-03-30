import { useState, useMemo, useCallback } from 'react'
import { FileSpreadsheet, LayoutDashboard, Building2, Download, Upload } from 'lucide-react'
import UploadArea from './components/UploadArea'
import KpiCards from './components/KpiCards'
import FiltersBar from './components/FiltersBar'
import { ConversionByPromoterChart, ConversionRateChart, TimelineChart } from './components/Charts'
import VisitsTable from './components/VisitsTable'
import PdvStatusList from './components/PdvStatusList'
import { parseExcelFile, deduplicateVisits, computeStats } from './utils/parseExcel'
import { exportToExcel, exportPdvStatus } from './utils/exportExcel'

export default function App() {
  const [rawVisits, setRawVisits] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filters, setFilters] = useState({
    promotor: '',
    cidade: '',
    status: '',
    dataInicio: '',
    dataFim: '',
  })

  const handleFile = useCallback(async (file) => {
    setIsLoading(true)
    setError(null)
    try {
      const visits = await parseExcelFile(file)
      const unique = deduplicateVisits(visits)
      setRawVisits(unique)
      setFileName(file.name)
      setFilters({ promotor: '', cidade: '', status: '', dataInicio: '', dataFim: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const filteredVisits = useMemo(() => {
    if (!rawVisits) return []
    return rawVisits.filter(v => {
      if (filters.promotor && v.colaborador !== filters.promotor) return false
      if (filters.cidade && v.cidade !== filters.cidade) return false
      if (filters.status === 'Sim' && v.possuiInteresse !== 'Sim') return false
      if (filters.status === 'Não' && v.possuiInteresse !== 'Não') return false
      if (filters.status === 'null' && v.possuiInteresse !== null) return false
      if (filters.dataInicio) {
        const start = new Date(filters.dataInicio + 'T00:00:00')
        if (v.data < start) return false
      }
      if (filters.dataFim) {
        const end = new Date(filters.dataFim + 'T23:59:59')
        if (v.data > end) return false
      }
      return true
    })
  }, [rawVisits, filters])

  const stats = useMemo(() => {
    if (!filteredVisits.length) return null
    return computeStats(filteredVisits)
  }, [filteredVisits])

  const globalStats = useMemo(() => {
    if (!rawVisits) return null
    return computeStats(rawVisits)
  }, [rawVisits])

  if (!rawVisits) {
    return <UploadArea onFileLoaded={handleFile} isLoading={isLoading} />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-fb-navy flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-fb-navy leading-none">Filtros Brasil</h1>
                <p className="text-[11px] text-slate-400 leading-none mt-0.5">Dashboard PDV</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:block">{fileName}</span>

              <button
                onClick={() => {
                  if (activeTab === 'pdvs' && stats) {
                    exportPdvStatus(stats.pdvList, 'status-pdv')
                  } else {
                    exportToExcel(filteredVisits, 'relatorio-visitas')
                  }
                }}
                className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-fb-navy
                           bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                onClick={() => {
                  setRawVisits(null)
                  setError(null)
                  setFileName('')
                }}
                className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-slate-500
                           hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nova planilha</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        {/* Tabs + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`tab-btn ${activeTab === 'dashboard' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              <span className="flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </span>
            </button>
            <button
              onClick={() => setActiveTab('pdvs')}
              className={`tab-btn ${activeTab === 'pdvs' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Status PDVs
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <FiltersBar
              filters={filters}
              setFilters={setFilters}
              stats={globalStats}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {stats && activeTab === 'dashboard' && (
          <div className="space-y-5">
            {/* KPIs */}
            <KpiCards stats={stats} />

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ConversionByPromoterChart data={stats.conversaoPorPromotor} />
              <ConversionRateChart data={stats.conversaoPorPromotor} />
            </div>

            {/* Timeline */}
            <TimelineChart data={stats.evolucao} />

            {/* Table */}
            <VisitsTable visits={filteredVisits} />
          </div>
        )}

        {stats && activeTab === 'pdvs' && (
          <PdvStatusList pdvList={stats.pdvList} statusFilter={filters.status} />
        )}

        {!stats && (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-slate-400">Nenhum dado encontrado com os filtros aplicados.</p>
          </div>
        )}
      </main>
    </div>
  )
}
