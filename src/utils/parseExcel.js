import * as XLSX from 'xlsx'
import { parse, isValid, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const COL_MAP = {
  data: ['data', 'dt', 'date'],
  hora: ['hora', 'horário', 'horario', 'time', 'hr'],
  colaborador: ['colaborador', 'promotor', 'promotora', 'nome colaborador', 'representante'],
  nomeFantasia: ['nome fantasia', 'pdv', 'ponto de venda', 'cliente', 'loja', 'razão social', 'razao social'],
  cidade: ['cidade', 'city', 'municipio', 'município'],
  estado: ['estado', 'uf', 'state'],
  pesquisa: ['pesquisa', 'survey', 'questionário', 'questionario'],
  possuiInteresse: ['possui interesse', 'interesse', 'ativado', 'interessado', 'interest'],
}

function findColumn(headers, aliases) {
  const normalized = headers.map(h => String(h ?? '').trim().toLowerCase())
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias)
    if (idx !== -1) return headers[idx]
  }
  for (const alias of aliases) {
    const idx = normalized.findIndex(h => h.includes(alias))
    if (idx !== -1) return headers[idx]
  }
  return null
}

function parseDate(val) {
  if (!val) return null
  if (val instanceof Date && isValid(val)) return val
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val)
    if (d) return new Date(d.y, d.m - 1, d.d, d.H || 0, d.M || 0, d.S || 0)
  }
  const str = String(val).trim()
  const fmts = ['dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd', 'dd/MM/yyyy HH:mm', 'dd/MM/yyyy HH:mm:ss']
  for (const fmt of fmts) {
    const d = parse(str, fmt, new Date(), { locale: ptBR })
    if (isValid(d)) return d
  }
  const fallback = new Date(str)
  return isValid(fallback) ? fallback : null
}

function normalizeInteresse(val) {
  if (val == null) return null
  const s = String(val).trim().toLowerCase()
  if (['sim', 's', 'yes', 'y', '1', 'true', 'ativado'].includes(s)) return 'Sim'
  if (['não', 'nao', 'n', 'no', '0', 'false', 'sem interesse'].includes(s)) return 'Não'
  return null
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json(ws, { defval: '' })
        if (!raw.length) return reject(new Error('Planilha vazia'))

        const headers = Object.keys(raw[0])
        const colMap = {}
        for (const [key, aliases] of Object.entries(COL_MAP)) {
          colMap[key] = findColumn(headers, aliases)
        }

        if (!colMap.data || !colMap.colaborador || !colMap.nomeFantasia) {
          return reject(
            new Error(
              `Colunas obrigatórias não encontradas. Esperado: Data, Colaborador, Nome Fantasia. Encontrado: ${headers.join(', ')}`
            )
          )
        }

        const visits = raw
          .map((row, idx) => {
            const dateVal = parseDate(row[colMap.data])
            if (!dateVal) return null
            return {
              id: idx,
              data: dateVal,
              dataStr: format(dateVal, 'dd/MM/yyyy'),
              hora: colMap.hora ? String(row[colMap.hora] ?? '').trim() : '',
              colaborador: String(row[colMap.colaborador] ?? '').trim(),
              nomeFantasia: String(row[colMap.nomeFantasia] ?? '').trim(),
              cidade: colMap.cidade ? String(row[colMap.cidade] ?? '').trim() : '',
              estado: colMap.estado ? String(row[colMap.estado] ?? '').trim() : '',
              pesquisa: colMap.pesquisa ? String(row[colMap.pesquisa] ?? '').trim() : '',
              possuiInteresse: normalizeInteresse(row[colMap.possuiInteresse]),
            }
          })
          .filter(Boolean)
          .filter(v => v.colaborador && v.nomeFantasia)

        resolve(visits)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsArrayBuffer(file)
  })
}

export function deduplicateVisits(visits) {
  const seen = new Map()
  const unique = []
  for (const v of visits) {
    const key = `${v.dataStr}|${v.nomeFantasia.toLowerCase()}`
    if (!seen.has(key)) {
      seen.set(key, true)
      unique.push(v)
    }
  }
  return unique
}

export function computeStats(visits) {
  const totalVisitas = visits.length
  const promotores = [...new Set(visits.map(v => v.colaborador))]
  const pdvs = [...new Set(visits.map(v => v.nomeFantasia))]
  const cidades = [...new Set(visits.map(v => v.cidade).filter(Boolean))]

  const comInteresse = visits.filter(v => v.possuiInteresse === 'Sim')
  const semInteresse = visits.filter(v => v.possuiInteresse === 'Não')
  const semInfo = visits.filter(v => v.possuiInteresse === null)

  const taxaConversao = totalVisitas > 0
    ? Math.round((comInteresse.length / totalVisitas) * 100)
    : 0

  const porPromotor = {}
  for (const v of visits) {
    if (!porPromotor[v.colaborador]) {
      porPromotor[v.colaborador] = { total: 0, interesse: 0 }
    }
    porPromotor[v.colaborador].total++
    if (v.possuiInteresse === 'Sim') porPromotor[v.colaborador].interesse++
  }

  const conversaoPorPromotor = Object.entries(porPromotor)
    .map(([name, data]) => ({
      name,
      total: data.total,
      interesse: data.interesse,
      taxa: data.total > 0 ? Math.round((data.interesse / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)

  const porPeriodo = {}
  for (const v of visits) {
    const weekKey = format(v.data, "dd/MM", { locale: ptBR })
    if (!porPeriodo[weekKey]) porPeriodo[weekKey] = { date: weekKey, visitas: 0, interesse: 0 }
    porPeriodo[weekKey].visitas++
    if (v.possuiInteresse === 'Sim') porPeriodo[weekKey].interesse++
  }
  const evolucao = Object.values(porPeriodo).sort((a, b) => {
    const [da, ma] = a.date.split('/').map(Number)
    const [db, mb] = b.date.split('/').map(Number)
    return ma !== mb ? ma - mb : da - db
  })

  const statusPorPDV = {}
  for (const v of visits) {
    const key = v.nomeFantasia
    if (!statusPorPDV[key]) {
      statusPorPDV[key] = {
        nomeFantasia: v.nomeFantasia,
        cidade: v.cidade,
        estado: v.estado,
        ultimaVisita: v.data,
        colaborador: v.colaborador,
        totalVisitas: 0,
        interesse: null,
      }
    }
    statusPorPDV[key].totalVisitas++
    if (v.data > statusPorPDV[key].ultimaVisita) {
      statusPorPDV[key].ultimaVisita = v.data
      statusPorPDV[key].colaborador = v.colaborador
    }
    if (v.possuiInteresse === 'Sim') statusPorPDV[key].interesse = 'Sim'
    else if (v.possuiInteresse === 'Não' && statusPorPDV[key].interesse !== 'Sim') {
      statusPorPDV[key].interesse = 'Não'
    }
  }

  const pdvList = Object.values(statusPorPDV).map(p => ({
    ...p,
    ultimaVisitaStr: format(p.ultimaVisita, 'dd/MM/yyyy'),
    status: p.interesse === 'Sim' ? 'Ativado' : p.interesse === 'Não' ? 'Sem interesse' : 'Sem info',
  }))

  return {
    totalVisitas,
    totalPromotores: promotores.length,
    totalPDVs: pdvs.length,
    totalCidades: cidades.length,
    comInteresse: comInteresse.length,
    semInteresse: semInteresse.length,
    semInfo: semInfo.length,
    taxaConversao,
    promotores,
    pdvs: pdvs.sort(),
    cidades: cidades.sort(),
    conversaoPorPromotor,
    evolucao,
    pdvList,
  }
}
