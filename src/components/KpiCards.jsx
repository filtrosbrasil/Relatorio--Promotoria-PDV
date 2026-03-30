import { Users, MapPin, Building2, TrendingUp, UserCheck, UserX } from 'lucide-react'

function KpiCard({ icon: Icon, label, value, subtitle, color = 'blue' }) {
  const colors = {
    blue: 'text-fb-navy bg-blue-50/50',
    green: 'text-emerald-600 bg-emerald-50/50',
    red: 'text-fb-red bg-red-50/50',
    amber: 'text-amber-600 bg-amber-50/50',
    slate: 'text-slate-600 bg-slate-50',
  }

  return (
    <div className="kpi-card">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  )
}

export default function KpiCards({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <KpiCard
        icon={TrendingUp}
        label="Visitas"
        value={stats.totalVisitas.toLocaleString('pt-BR')}
        subtitle="visitas únicas"
        color="blue"
      />
      <KpiCard
        icon={Users}
        label="Promotores"
        value={stats.totalPromotores}
        color="blue"
      />
      <KpiCard
        icon={Building2}
        label="PDVs"
        value={stats.totalPDVs.toLocaleString('pt-BR')}
        color="slate"
      />
      <KpiCard
        icon={UserCheck}
        label="Ativados"
        value={stats.comInteresse.toLocaleString('pt-BR')}
        subtitle={`${stats.taxaConversao}% de conversão`}
        color="green"
      />
      <KpiCard
        icon={UserX}
        label="Sem interesse"
        value={stats.semInteresse.toLocaleString('pt-BR')}
        color="red"
      />
      <KpiCard
        icon={MapPin}
        label="Cidades"
        value={stats.totalCidades}
        color="amber"
      />
    </div>
  )
}
