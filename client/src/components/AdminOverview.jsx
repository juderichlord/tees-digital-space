import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Video, FileText, Users, DollarSign } from 'lucide-react'

export default function AdminOverview() {
  const [stats, setStats] = useState({ videos: 0, invoices: 0, clients: 0, paidAmount: 0 })

  useEffect(() => {
    async function loadStats() {
      const { count: vCount } = await supabase.from('videos').select('*', { count: 'exact', head: true })
      const { count: iCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true })
      const { count: cCount } = await supabase.from('clients').select('*', { count: 'exact', head: true })
      const { data: paidData } = await supabase.from('invoices').select('amount').eq('status', 'paid')
      const totalPaid = paidData?.reduce((sum, inv) => sum + inv.amount, 0) || 0

      setStats({
        videos: vCount || 0,
        invoices: iCount || 0,
        clients: cCount || 0,
        paidAmount: totalPaid,
      })
    }
    loadStats()
  }, [])

  const cards = [
    { label: 'Total Videos', value: stats.videos, icon: Video, color: 'text-blue-400' },
    { label: 'Invoices', value: stats.invoices, icon: FileText, color: 'text-green-400' },
    { label: 'Clients', value: stats.clients, icon: Users, color: 'text-yellow-400' },
    { label: 'Paid Amount', value: `₦${stats.paidAmount.toLocaleString()}`, icon: DollarSign, color: 'text-purple-400' },
  ]

  return (
    <div>
      <h2 className="font-display text-3xl text-[#00e6ff] mb-8">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-black/40 p-6 rounded-xl border border-gray-800 flex items-center gap-4">
            <card.icon size={40} className={card.color} />
            <div>
              <p className="text-sm text-gray-400">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}