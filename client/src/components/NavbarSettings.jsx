import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function NavbarSettings() {
  const [brandText, setBrandText] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('navbar_brand_text')
      .single()
      .then(({ data }) => {
        if (data) setBrandText(data.navbar_brand_text || '💎 TDS | TINA OREKE')
      })
  }, [])

  const saveBrand = async () => {
    setSaving(true)
    setStatus('')
    const { error } = await supabase
      .from('site_settings')
      .update({ navbar_brand_text: brandText })
      .eq('id', 1)

    if (error) {
      setStatus('Error: ' + error.message)
    } else {
      setStatus('Navbar brand updated!')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display text-3xl text-[#00e6ff] mb-8">Navbar Brand</h2>
      <div className="bg-black/40 p-6 rounded-xl border border-gray-800 space-y-4">
        <label className="block text-sm text-gray-400">Brand Text (shown in top bar)</label>
        <input
          type="text"
          value={brandText}
          onChange={e => setBrandText(e.target.value)}
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        />
        <button
          onClick={saveBrand}
          disabled={saving}
          className="w-full py-3 bg-[#00e6ff] text-black rounded-xl font-extrabold disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Brand'}
        </button>
        {status && (
          <div className="p-3 bg-green-900/30 border border-green-500 rounded-xl text-green-300 text-sm">
            {status}
          </div>
        )}
      </div>
    </div>
  )
}