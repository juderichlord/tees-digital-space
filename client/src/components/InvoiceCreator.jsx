import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function InvoiceCreator() {
  const [tiers, setTiers] = useState([])
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientWhatsapp, setClientWhatsapp] = useState('')
  const [selectedTier, setSelectedTier] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('price_tiers').select('*').then(({ data }) => {
      if (data) setTiers(data)
    })
  }, [])

  const createInvoice = async () => {
    if (!clientName || !selectedTier || !amount) return alert('Fill all required fields')
    setLoading(true)
    setStatus('')
    setPaymentMessage('')

    // 1. Insert or get client
    let clientId = null
    if (clientEmail) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('email', clientEmail)
        .maybeSingle()
      if (existing) clientId = existing.id
    }
    if (!clientId) {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: clientName,
          email: clientEmail || null,
          whatsapp: clientWhatsapp || null
        })
        .select('id')
        .single()
      if (clientError) {
        setStatus('Error saving client: ' + clientError.message)
        setLoading(false)
        return
      }
      clientId = newClient.id
    }

    // 2. Generate invoice number
    const invoiceNumber = 'INV-' + Date.now()

    // 3. Insert invoice
    const { error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        client_id: clientId,
        tier_id: selectedTier,
        amount: parseFloat(amount),
        status: 'pending',
        invoice_number: invoiceNumber
      })

    if (invoiceError) {
      setStatus('Error creating invoice: ' + invoiceError.message)
      setLoading(false)
      return
    }

    // 4. Build WhatsApp message
    const tier = tiers.find(t => t.id === selectedTier)
    const tierName = tier ? tier.name : 'Selected Tier'
    const bankDetails = 'Bank: Opay\nAccount Name: Tina Oreke\nAccount Number: 8157568408'
    const message = `Hello ${clientName},\n\n` +
      `This is TDS (Tees Digital Space). Your invoice for *${tierName}* is ready.\n\n` +
      `Invoice: ${invoiceNumber}\n` +
      `Amount: ₦${parseFloat(amount).toLocaleString()}\n\n` +
      `Please make payment to:\n${bankDetails}\n\n` +
      `After payment, kindly share proof on WhatsApp.\n\nThank you!`

    setPaymentMessage(message)
    setStatus('Invoice created successfully!')

    // Optionally reset form
    // setClientName(''); setClientEmail(''); setClientWhatsapp(''); setSelectedTier(''); setAmount('');

    setLoading(false)
  }

  const whatsappLink = () => {
    if (!paymentMessage) return '#'
    const encoded = encodeURIComponent(paymentMessage)
    if (clientWhatsapp) {
      // Open chat with the client's number (strip any non-numeric characters)
      const phone = clientWhatsapp.replace(/\D/g, '')
      return `https://wa.me/${phone}?text=${encoded}`
    }
    // Fallback: share to any number (opens WhatsApp picker)
    return `https://wa.me/?text=${encoded}`
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display text-3xl text-[#00e6ff] mb-8">Create Invoice</h2>
      <div className="bg-black/40 p-6 rounded-xl border border-gray-800 space-y-4">
        <input
          placeholder="Client Name"
          value={clientName}
          onChange={e => setClientName(e.target.value)}
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        />
        <input
          placeholder="Client Email (optional)"
          value={clientEmail}
          onChange={e => setClientEmail(e.target.value)}
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        />
        <input
          placeholder="Client WhatsApp (e.g., 2348012345678)"
          value={clientWhatsapp}
          onChange={e => setClientWhatsapp(e.target.value)}
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        />

        <select
          value={selectedTier}
          onChange={e => setSelectedTier(e.target.value)}
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        >
          <option value="">Select a tier</option>
          {tiers.map(t => (
            <option key={t.id} value={t.id}>
              {t.name} (₦{t.min_price} - ₦{t.max_price})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount (₦)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        />

        <button
          onClick={createInvoice}
          disabled={loading}
          className="w-full py-4 bg-[#00e6ff] text-black rounded-xl font-extrabold"
        >
          {loading ? 'Creating...' : 'Generate Invoice'}
        </button>

        {status && (
          <div className="p-4 bg-green-900/30 border border-green-500 rounded-xl text-green-300 text-sm break-words">
            {status}
          </div>
        )}

        {paymentMessage && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap">
              {paymentMessage}
            </div>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-4 bg-green-500 text-white rounded-xl font-extrabold hover:bg-green-600 transition"
            >
              Share Invoice via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  )
}