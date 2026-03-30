import * as XLSX from 'xlsx'
import { parse, isValid, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function norm(s) { return String(s ?? '').trim().toLowerCase() }

function findCol(headers, aliases) {
  const normalized = headers.map(h => norm(h))
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
  for (const fmt of ['dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd', 'dd/MM/yyyy HH:mm:ss']) {
    const d = parse(str, fmt, new Date(), { locale: ptBR })
    if (isValid(d)) return d
  }
  const f = new Date(str)
  return isValid(f) ? f : null
}

export function yesNo(val) {
  if (val == null) return null
  const s = norm(val)
  if (['sim', 's', 'yes', 'y', '1', 'true'].includes(s)) return 'Sim'
  if (['não', 'nao', 'n', 'no', '0', 'false'].includes(s)) return 'Não'
  return null
}

function clean(val) {
  const s = String(val ?? '').trim()
  return (s === '-' || s === '') ? null : s
}

const VISIT_COLS = {
  idPesquisa: ['id_pesquisa'], data: ['data'], hora: ['hora'],
  colaborador: ['colaborador','promotor'], razaoSocial: ['razao social','razão social'],
  nomeFantasia: ['nome fantasia','pdv','cliente','loja'], canal: ['canal'],
  ddd: ['ddd'], telefone: ['telefone'], idPdv: ['id pdv','id_pdv'],
  endereco: ['endereco','endereço'], numero: ['numero','número'], bairro: ['bairro'],
  cidade: ['cidade'], estado: ['estado','uf'], cpfCnpj: ['cpf_cnpj'],
  pesquisa: ['pesquisa'],
}

const FIRST_VISIT_COLS = {
  distribuidora: ['distribuidora que atende'],
  conheceFB: ['conhece a filtros brasil'],
  marcasTrabalha: ['quais marcas trabalha hoje'],
  marcaPrincipal: ['marca principal'],
  volumeMensal: ['faixa de volume mensal de vendas de filtros','faixa de volume mensal'],
  shareFB: ['qual o share filtros brasil no pdv','share filtros brasil'],
  volumeFB: ['desse volume de vendas quanto representa filtros brasil'],
  participaProgramas: ['participa de programas de vantagem'],
  jaCompraFB: ['já compra filtros brasil','ja compra filtros brasil'],
  interesseTroca: ['tem interesse em participar da troca premiada','interesse em participar da troca premiada'],
  premiosDesejados: ['qual(is) prêmio(s) gostaria de ganhar','prêmio(s) gostaria'],
  tempoTampinhas: ['em quanto tempo acredita que consegue juntar as tampinhas','tempo acredita que consegue juntar'],
  dificuldades: ['dificuldades'],
}

const BLOCO2_COLS = {
  fbPresente: ['filtros brasil está presente hoje','fb está presente'],
  evolucao: ['houve evolução desde a última visita','houve evolução'],
  comprouFB: ['comprou filtros brasil desde a última visita','comprou filtros brasil'],
  acaoVisita: ['ação feita na visita'],
  dificuldadePrincipal: ['principal dificuldade atual'],
  notaVisita: ['nota da visita'],
  observacoes: ['observações rápidas','observações'],
}

const BLOCO3_COLS = {
  saldoTampas: ['saldo atual de tampas/pontos','saldo atual de tampas'],
  tampasColetadas: ['tampas/pontos coletados nesta visita','tampas coletados'],
  faraTroca: ['fará troca hoje'],
  premioResgatado: ['prêmio resgatado'],
  quantidade: ['quantidade'],
  prestacaoContas: ['prestação de contas','observações do programa'],
}

function parseSheet(ws, extraColMap = {}) {
  const raw = XLSX.utils.sheet_to_json(ws, { defval: '' })
  if (!raw.length) return []
  const headers = Object.keys(raw[0])
  const base = {}
  for (const [key, aliases] of Object.entries(VISIT_COLS)) base[key] = findCol(headers, aliases)
  const extra = {}
  for (const [key, aliases] of Object.entries(extraColMap)) extra[key] = findCol(headers, aliases)

  return raw.map((row, idx) => {
    const dateVal = parseDate(row[base.data])
    if (!dateVal) return null
    const entry = {
      id: idx, idPesquisa: clean(row[base.idPesquisa]), data: dateVal,
      dataStr: format(dateVal, 'dd/MM/yyyy'), hora: clean(row[base.hora]) || '',
      colaborador: String(row[base.colaborador] ?? '').trim(),
      razaoSocial: clean(row[base.razaoSocial]) || '',
      nomeFantasia: String(row[base.nomeFantasia] ?? '').trim(),
      canal: clean(row[base.canal]), ddd: clean(row[base.ddd]),
      telefone: clean(row[base.telefone]), idPdv: clean(row[base.idPdv]),
      endereco: clean(row[base.endereco]), numero: clean(row[base.numero]),
      bairro: clean(row[base.bairro]),
      cidade: String(row[base.cidade] ?? '').trim(),
      estado: String(row[base.estado] ?? '').trim().toUpperCase(),
      cpfCnpj: clean(row[base.cpfCnpj]),
      pesquisa: clean(row[base.pesquisa]) || '',
    }
    for (const [key, col] of Object.entries(extra)) {
      if (col) entry[key] = clean(row[col])
    }
    return entry
  }).filter(v => v && v.colaborador && v.nomeFantasia)
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true })
        const sheets = wb.SheetNames.map(n => n.toLowerCase().trim())
        const visitasIdx = sheets.findIndex(s => s === 'visitas')
        const primeiraIdx = sheets.findIndex(s => s.includes('1visita') || s.includes('primeira'))
        const bloco2Idx = sheets.findIndex(s => s.includes('2bloco') || s.includes('bloco 2') || s.includes('bloco2'))
        const bloco3Idx = sheets.findIndex(s => s.includes('3bloco') || s.includes('bloco 3') || s.includes('bloco3'))

        const allVisits = [], firstVisitData = [], bloco2Data = [], bloco3Data = []

        if (visitasIdx !== -1) allVisits.push(...parseSheet(wb.Sheets[wb.SheetNames[visitasIdx]]))
        if (primeiraIdx !== -1) {
          const rows = parseSheet(wb.Sheets[wb.SheetNames[primeiraIdx]], FIRST_VISIT_COLS)
          firstVisitData.push(...rows)
          if (visitasIdx === -1) allVisits.push(...rows)
        }
        if (bloco2Idx !== -1) {
          const rows = parseSheet(wb.Sheets[wb.SheetNames[bloco2Idx]], BLOCO2_COLS)
          bloco2Data.push(...rows)
          if (visitasIdx === -1) allVisits.push(...rows)
        }
        if (bloco3Idx !== -1) {
          const rows = parseSheet(wb.Sheets[wb.SheetNames[bloco3Idx]], BLOCO3_COLS)
          bloco3Data.push(...rows)
          if (visitasIdx === -1) allVisits.push(...rows)
        }
        if (!allVisits.length && !firstVisitData.length) {
          const rows = parseSheet(wb.Sheets[wb.SheetNames[0]], FIRST_VISIT_COLS)
          allVisits.push(...rows)
        }
        if (!allVisits.length && !firstVisitData.length) return reject(new Error('Nenhum dado encontrado'))

        resolve({ visits: allVisits, firstVisit: firstVisitData, bloco2: bloco2Data, bloco3: bloco3Data, sheetNames: wb.SheetNames })
      } catch (err) { reject(err) }
    }
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsArrayBuffer(file)
  })
}

export function deduplicateVisits(visits) {
  const seen = new Map()
  return visits.filter(v => {
    const key = `${v.dataStr}|${v.nomeFantasia.toLowerCase()}`
    if (seen.has(key)) return false
    seen.set(key, true)
    return true
  })
}

export function computeStats(visits) {
  const totalVisitas = visits.length
  const promotores = [...new Set(visits.map(v => v.colaborador))].sort()
  const pdvs = [...new Set(visits.map(v => v.nomeFantasia))].sort()
  const cidades = [...new Set(visits.map(v => v.cidade).filter(Boolean))].sort()

  const porPromotor = {}
  for (const v of visits) {
    if (!porPromotor[v.colaborador]) porPromotor[v.colaborador] = { total: 0, interesse: 0 }
    porPromotor[v.colaborador].total++
    if (yesNo(v.interesseTroca) === 'Sim') porPromotor[v.colaborador].interesse++
  }
  const conversaoPorPromotor = Object.entries(porPromotor)
    .map(([name, d]) => ({ name, total: d.total, interesse: d.interesse, taxa: d.total > 0 ? Math.round((d.interesse / d.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)

  const porPeriodo = {}
  for (const v of visits) {
    const dk = format(v.data, 'dd/MM', { locale: ptBR })
    if (!porPeriodo[dk]) porPeriodo[dk] = { date: dk, visitas: 0, interesse: 0 }
    porPeriodo[dk].visitas++
    if (yesNo(v.interesseTroca) === 'Sim') porPeriodo[dk].interesse++
  }
  const evolucao = Object.values(porPeriodo).sort((a, b) => {
    const [da, ma] = a.date.split('/').map(Number)
    const [db, mb] = b.date.split('/').map(Number)
    return ma !== mb ? ma - mb : da - db
  })

  const statusPorPDV = {}
  for (const v of visits) {
    const key = v.nomeFantasia.toLowerCase()
    if (!statusPorPDV[key]) {
      statusPorPDV[key] = { nomeFantasia: v.nomeFantasia, cidade: v.cidade, estado: v.estado, ultimaVisita: v.data, colaborador: v.colaborador, totalVisitas: 0, interesse: null, volumeMensal: null, shareFB: null, tempoTampinhas: null, jaCompraFB: null, premiosDesejados: null }
    }
    const p = statusPorPDV[key]
    p.totalVisitas++
    if (v.data > p.ultimaVisita) { p.ultimaVisita = v.data; p.colaborador = v.colaborador }
    const inter = yesNo(v.interesseTroca)
    if (inter === 'Sim') p.interesse = 'Sim'
    else if (inter === 'Não' && p.interesse !== 'Sim') p.interesse = 'Não'
    if (v.volumeMensal) p.volumeMensal = v.volumeMensal
    if (v.shareFB) p.shareFB = v.shareFB
    if (v.tempoTampinhas) p.tempoTampinhas = v.tempoTampinhas
    if (v.jaCompraFB) p.jaCompraFB = v.jaCompraFB
    if (v.premiosDesejados) p.premiosDesejados = v.premiosDesejados
  }
  const pdvList = Object.values(statusPorPDV).map(p => ({
    ...p, ultimaVisitaStr: format(p.ultimaVisita, 'dd/MM/yyyy'),
    status: p.interesse === 'Sim' ? 'Ativado' : p.interesse === 'Não' ? 'Sem interesse' : 'Sem info',
  }))

  const comInteresse = visits.filter(v => yesNo(v.interesseTroca) === 'Sim').length
  const semInteresse = visits.filter(v => yesNo(v.interesseTroca) === 'Não').length

  return {
    totalVisitas, totalPromotores: promotores.length, totalPDVs: pdvs.length, totalCidades: cidades.length,
    comInteresse, semInteresse, semInfo: totalVisitas - comInteresse - semInteresse,
    taxaConversao: totalVisitas > 0 ? Math.round((comInteresse / totalVisitas) * 100) : 0,
    promotores, pdvs, cidades, conversaoPorPromotor, evolucao, pdvList,
  }
}

export function computeTrocaPremiada(firstVisitData) {
  const interessados = firstVisitData.filter(v => yesNo(v.interesseTroca) === 'Sim')
  const toChart = (dist) => Object.entries(dist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const volumeDist = {}, shareDist = {}, tempoDist = {}
  for (const v of interessados) {
    const vol = v.volumeMensal || 'Não informado'; volumeDist[vol] = (volumeDist[vol] || 0) + 1
    const sh = v.shareFB || 'Não informado'; shareDist[sh] = (shareDist[sh] || 0) + 1
    const tp = v.tempoTampinhas || 'Não informado'; tempoDist[tp] = (tempoDist[tp] || 0) + 1
  }

  const porPromotor = {}
  for (const v of firstVisitData) {
    if (!porPromotor[v.colaborador]) porPromotor[v.colaborador] = { total: 0, interesse: 0 }
    porPromotor[v.colaborador].total++
    if (yesNo(v.interesseTroca) === 'Sim') porPromotor[v.colaborador].interesse++
  }

  return {
    total: firstVisitData.length, interessados: interessados.length,
    naoInteressados: firstVisitData.length - interessados.length,
    taxa: firstVisitData.length > 0 ? Math.round((interessados.length / firstVisitData.length) * 100) : 0,
    volumeDistribution: toChart(volumeDist), shareDistribution: toChart(shareDist), tempoDistribution: toChart(tempoDist),
    conversaoPorPromotor: Object.entries(porPromotor).map(([name, d]) => ({ name, total: d.total, interesse: d.interesse, taxa: d.total > 0 ? Math.round((d.interesse / d.total) * 100) : 0 })).sort((a, b) => b.total - a.total),
    interessadosList: interessados.map(v => ({
      nomeFantasia: v.nomeFantasia, cidade: v.cidade, estado: v.estado, colaborador: v.colaborador,
      dataStr: v.dataStr, telefone: v.ddd && v.telefone ? `(${v.ddd}) ${v.telefone}` : v.telefone || '',
      volumeMensal: v.volumeMensal || '—', shareFB: v.shareFB || '—',
      tempoTampinhas: v.tempoTampinhas || '—', jaCompraFB: v.jaCompraFB || '—',
      premiosDesejados: v.premiosDesejados || '—',
    })),
  }
}
