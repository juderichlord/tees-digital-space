import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchInvoices() }, [])

  async function fetchInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(name, email, whatsapp), price_tiers(name)')
      .order('created_at', { ascending: false })
    if (!error && data) setInvoices(data)
  }

  async function markAsPaid(invoiceId) {
    setLoading(true)
    await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', invoiceId)
    fetchInvoices()
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="font-display text-3xl text-[#00e6ff] mb-8">Invoices</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black/40">
            <tr>
              <th className="p-4 text-left">Invoice #</th>
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-left">Tier</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-800">
                <td className="p-4">{inv.invoice_number}</td>
                <td className="p-4">{inv.clients?.name || '—'}</td>
                <td className="p-4">{inv.price_tiers?.name || '—'}</td>
                <td className="p-4">₦{inv.amount?.toLocaleString()}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      inv.status === 'paid' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="p-4">{new Date(inv.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  {inv.status !== 'paid' && (
                    <button
                      onClick={() => markAsPaid(inv.id)}
                      disabled={loading}
                      className="text-[#00e6ff] hover:underline"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}