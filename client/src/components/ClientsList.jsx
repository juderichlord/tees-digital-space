import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ClientsList() {
  const [clients, setClients] = useState([])

  useEffect(() => {
    supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setClients(data)
      })
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-display text-3xl text-[#00e6ff] mb-8">Clients</h2>
      <div className="space-y-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-black/40 p-4 rounded-xl border border-gray-800 flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{client.name}</p>
              <p className="text-sm text-gray-400">
                {client.email} | {client.whatsapp}
              </p>
            </div>
          </div>
        ))}
        {clients.length === 0 && <p className="text-gray-500">No clients yet.</p>}
      </div>
    </div>
  )
}