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
