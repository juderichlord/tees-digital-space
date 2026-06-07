import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function PricingManager() {
  const [tiers, setTiers] = useState([])
  const [form, setForm] = useState({
    name: '',
    min_price: '',
    max_price: '',
    features: '[]',
    is_featured: false
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => { fetchTiers() }, [])

  async function fetchTiers() {
    const { data } = await supabase.from('price_tiers').select('*').order('display_order')
    if (data) setTiers(data)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      name: form.name,
      min_price: parseFloat(form.min_price),
      max_price: form.max_price ? parseFloat(form.max_price) : null,
      features: JSON.parse(form.features),
      is_featured: form.is_featured,
      display_order: editingId ? undefined : tiers.length
    }
    if (editingId) {
      await supabase.from('price_tiers').update(payload).eq('id', editingId)
      setEditingId(null)
    } else {
      await supabase.from('price_tiers').insert(payload)
    }
    setForm({ name: '', min_price: '', max_price: '', features: '[]', is_featured: false })
    fetchTiers()
  }

  async function handleEdit(tier) {
    setEditingId(tier.id)
    setForm({
      name: tier.name,
      min_price: tier.min_price,
      max_price: tier.max_price || '',
      features: JSON.stringify(tier.features),
      is_featured: tier.is_featured
    })
  }

  async function handleDelete(id) {
    await supabase.from('price_tiers').delete().eq('id', id)
    fetchTiers()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-display text-3xl text-[#00e6ff] mb-8">Manage Pricing</h2>
      <form onSubmit={handleSubmit} className="bg-black/40 p-6 rounded-xl border border-gray-800 mb-10 space-y-4">
        <input name="name" placeholder="Tier Name" value={form.name} onChange={handleChange} required className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white" />
        <div className="grid grid-cols-2 gap-4">
          <input name="min_price" type="number" placeholder="Min Price (₦)" value={form.min_price} onChange={handleChange} required className="p-4 bg-black border border-gray-700 rounded-xl text-white" />
          <input name="max_price" type="number" placeholder="Max Price (₦)" value={form.max_price} onChange={handleChange} className="p-4 bg-black border border-gray-700 rounded-xl text-white" />
        </div>
        <textarea name="features" placeholder='Features (JSON array)' value={form.features} onChange={handleChange} rows="4" className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white" />
        <label className="flex items-center gap-2 text-sm">
          <input name="is_featured" type="checkbox" checked={form.is_featured} onChange={handleChange} />
          Featured
        </label>
        <button type="submit" className="w-full py-3 bg-[#00e6ff] text-black rounded-xl font-extrabold">
          {editingId ? 'Update Tier' : 'Add Tier'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', min_price: '', max_price: '', features: '[]', is_featured: false }) }} className="w-full py-2 bg-gray-700 text-white rounded-xl">
            Cancel
          </button>
        )}
      </form>

      <div className="space-y-4">
        {tiers.map(tier => (
          <div key={tier.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-gray-800">
            <div>
              <p className="font-bold">{tier.name} {tier.is_featured && '(Featured)'}</p>
              <p className="text-sm text-gray-400">₦{tier.min_price} - ₦{tier.max_price}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(tier)} className="text-blue-400">Edit</button>
              <button onClick={() => handleDelete(tier.id)} className="text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}