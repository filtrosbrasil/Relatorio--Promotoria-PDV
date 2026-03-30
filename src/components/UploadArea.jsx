import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'

export default function UploadArea({ onFileLoaded, isLoading }) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = useCallback((file) => {
    setError(null)
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setError('Formato não suportado. Use .xlsx, .xls ou .csv')
      return
    }
    onFileLoaded(file)
  }, [onFileLoaded])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }, [handleFile])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-fb-navy flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-fb-navy tracking-tight">Filtros Brasil</h1>
          </div>
          <p className="text-slate-500 text-sm">Dashboard de visitas da promotoria</p>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={() => setDragOver(false)}
          className={`
            relative rounded-2xl border-2 border-dashed p-12
            transition-all duration-300 cursor-pointer
            ${dragOver
              ? 'border-fb-navy bg-blue-50/50 scale-[1.02]'
              : 'border-slate-200 hover:border-fb-navy/40 hover:bg-slate-50/50'
            }
          `}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <div className="flex flex-col items-center gap-4">
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
              ${dragOver ? 'bg-fb-navy text-white' : 'bg-slate-100 text-slate-400'}
            `}>
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                {isLoading ? 'Processando...' : 'Arraste a planilha de visitas aqui'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ou clique para selecionar (.xlsx, .xls, .csv)
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-6 p-4 bg-white/60 rounded-xl border border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-2">Colunas esperadas:</p>
          <div className="flex flex-wrap gap-1.5">
            {['Data', 'Colaborador', 'Nome Fantasia', 'Cidade', 'Estado', 'Pesquisa', 'Possui Interesse'].map(col => (
              <span key={col} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{col}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
