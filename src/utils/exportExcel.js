import * as XLSX from 'xlsx'

export function exportToExcel(data, filename = 'relatorio-pdv') {
  const ws = XLSX.utils.json_to_sheet(
    data.map(v => ({
      'Data': v.dataStr,
      'Hora': v.hora,
      'Promotor': v.colaborador,
      'PDV': v.nomeFantasia,
      'Cidade': v.cidade,
      'UF': v.estado,
      'Pesquisa': v.pesquisa,
      'Possui Interesse': v.possuiInteresse ?? '',
    }))
  )

  const colWidths = [
    { wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 30 },
    { wch: 18 }, { wch: 5 }, { wch: 15 }, { wch: 16 },
  ]
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Visitas')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportPdvStatus(pdvList, filename = 'status-pdv') {
  const ws = XLSX.utils.json_to_sheet(
    pdvList.map(p => ({
      'PDV': p.nomeFantasia,
      'Cidade': p.cidade,
      'UF': p.estado,
      'Promotor': p.colaborador,
      'Total Visitas': p.totalVisitas,
      'Última Visita': p.ultimaVisitaStr,
      'Status': p.status,
    }))
  )

  const colWidths = [
    { wch: 30 }, { wch: 18 }, { wch: 5 }, { wch: 20 },
    { wch: 12 }, { wch: 14 }, { wch: 16 },
  ]
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Status PDV')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportTrocaPremiada(interessados, filename = 'troca-premiada') {
  const ws = XLSX.utils.json_to_sheet(
    interessados.map(v => ({
      'PDV': v.nomeFantasia,
      'Cidade': v.cidade,
      'UF': v.estado,
      'Promotor': v.colaborador,
      'Data Visita': v.dataStr,
      'Telefone': v.telefone,
      'Volume Mensal': v.volumeMensal,
      'Share FB': v.shareFB,
      'Já Compra FB': v.jaCompraFB,
      'Tempo Tampinhas': v.tempoTampinhas,
      'Prêmios Desejados': v.premiosDesejados,
    }))
  )
  ws['!cols'] = [
    { wch: 30 }, { wch: 16 }, { wch: 5 }, { wch: 22 }, { wch: 12 },
    { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 30 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Interessados Troca Premiada')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}
