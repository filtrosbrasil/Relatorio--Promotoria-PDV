# Filtros Brasil — Dashboard PDV

Dashboard de acompanhamento de visitas da equipe de promotoria da Filtros Brasil.

## Funcionalidades

- **Upload de planilha Excel** — Drag & drop de arquivos `.xlsx`, `.xls` ou `.csv`
- **Deduplicação automática** — Visitas ao mesmo PDV no mesmo dia contam como visita única
- **6 KPIs** — Visitas, Promotores, PDVs, Ativados (com interesse), Sem interesse, Cidades
- **Gráfico de conversão por promotor** — Total de visitas vs. ativados
- **Taxa de conversão** — % de visitas com interesse por promotor
- **Evolução temporal** — Gráfico de área com visitas e ativações ao longo do tempo
- **Status por PDV** — Lista filtrável com status Ativado / Sem interesse / Sem info
- **Filtros combinados** — Por período, promotor, cidade e status de interesse
- **Exportação Excel** — Exporta dados filtrados ou status de PDVs
- **Responsivo** — Funciona em desktop, tablet e celular

## Colunas esperadas na planilha

| Coluna | Obrigatória | Descrição |
|--------|:-----------:|-----------|
| Data | ✅ | Data da visita |
| Colaborador | ✅ | Nome do promotor |
| Nome Fantasia | ✅ | Nome do PDV / cliente |
| Hora | | Horário da visita |
| Cidade | | Cidade do PDV |
| Estado | | UF |
| Pesquisa | | Identificação da pesquisa |
| Possui Interesse | | "Sim" ou "Não" |

## Setup local

```bash
npm install
npm run dev
```

## Deploy na Vercel

1. Suba o repositório no GitHub
2. Conecte ao Vercel (vercel.com → New Project → Import do GitHub)
3. A configuração já está no `vercel.json`
4. Deploy automático a cada push

## Stack

- React 18 + Vite
- Tailwind CSS
- Recharts (gráficos)
- SheetJS/xlsx (leitura e exportação de planilhas)
- Lucide React (ícones)
- date-fns (formatação de datas)
