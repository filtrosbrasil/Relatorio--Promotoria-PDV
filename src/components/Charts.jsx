import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, Cell
} from 'recharts'

const NAVY = '#1B3A6D'
const NAVY_LIGHT = '#4A7CC9'
const RED = '#E31E24'
const GREEN = '#10B981'
const SLATE = '#94A3B8'

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2 text-xs">
      <p className="font-medium text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ConversionByPromoterChart({ data }) {
  return (
    <ChartCard
      title="Conversão por promotor"
      subtitle="Total de visitas vs. ativados por promotor"
    >
      <div style={{ height: Math.max(200, data.length * 48) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" name="Visitas" fill={NAVY} radius={[0, 4, 4, 0]} barSize={16} />
            <Bar dataKey="interesse" name="Ativados" fill={GREEN} radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: NAVY }} />
          Visitas
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: GREEN }} />
          Ativados
        </div>
      </div>
    </ChartCard>
  )
}

export function ConversionRateChart({ data }) {
  return (
    <ChartCard
      title="Taxa de conversão por promotor"
      subtitle="% de visitas com interesse"
    >
      <div style={{ height: Math.max(200, data.length * 48) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              formatter={(v) => [`${v}%`, 'Conversão']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="taxa" name="Conversão" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.taxa >= 50 ? GREEN : entry.taxa >= 25 ? NAVY_LIGHT : SLATE}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export function TimelineChart({ data }) {
  if (!data.length) return null
  return (
    <ChartCard
      title="Evolução de visitas"
      subtitle="Visitas e ativações ao longo do tempo"
    >
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradVisitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={NAVY} stopOpacity={0.15} />
                <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradInteresse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GREEN} stopOpacity={0.15} />
                <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="visitas"
              name="Visitas"
              stroke={NAVY}
              strokeWidth={2}
              fill="url(#gradVisitas)"
            />
            <Area
              type="monotone"
              dataKey="interesse"
              name="Ativados"
              stroke={GREEN}
              strokeWidth={2}
              fill="url(#gradInteresse)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: NAVY }} />
          Visitas
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: GREEN }} />
          Ativados
        </div>
      </div>
    </ChartCard>
  )
}
