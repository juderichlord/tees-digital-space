import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Common Google Fonts (add more if desired)
const fontOptions = [
  'Inter', 'Oswald', 'Dancing Script', 'Playfair Display',
  'Montserrat', 'Poppins', 'Lora', 'Raleway', 'Merriweather'
]

export default function BrandSettings() {
  const [settings, setSettings] = useState({
    visionary_script: '',
    visionary_paragraph: '',
    visionary_script_font: 'Dancing Script',
    visionary_script_color: '#00e6ff',
    visionary_paragraph_font: 'Inter',
    visionary_paragraph_color: '#ffffff'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .single()
      .then(({ data }) => {
        if (data) {
          setSettings({
            visionary_script: data.visionary_script || 'Meet the Visionary',
            visionary_paragraph: data.visionary_paragraph || '',
            visionary_script_font: data.visionary_script_font || 'Dancing Script',
            visionary_script_color: data.visionary_script_color || '#00e6ff',
            visionary_paragraph_font: data.visionary_paragraph_font || 'Inter',
            visionary_paragraph_color: data.visionary_paragraph_color || '#ffffff'
          })
        }
      })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const saveSettings = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('site_settings')
      .update({
        visionary_script: settings.visionary_script,
        visionary_paragraph: settings.visionary_paragraph,
        visionary_script_font: settings.visionary_script_font,
        visionary_script_color: settings.visionary_script_color,
        visionary_paragraph_font: settings.visionary_paragraph_font,
        visionary_paragraph_color: settings.visionary_paragraph_color
      })
      .eq('id', 1)

    if (error) {
      alert('Failed to save: ' + error.message)
    } else {
      alert('Branding settings saved!')
    }
    setSaving(false)
  }

  // Helpers to load the selected fonts dynamically (just for preview)
  const loadFontLink = () => {
    const fonts = [
      settings.visionary_script_font,
      settings.visionary_paragraph_font
    ].filter(Boolean).map(f => f.replace(/\s+/g, '+'))
    return `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}&display=swap`
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display text-3xl text-[#00e6ff] mb-8">Branding Settings</h2>

      {/* Dynamically load the selected fonts for preview */}
      <link href={loadFontLink()} rel="stylesheet" />

      <div className="bg-black/40 p-6 rounded-xl border border-gray-800 space-y-6">
        {/* Signature Text */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Signature Line</label>
          <input
            name="visionary_script"
            value={settings.visionary_script}
            onChange={handleChange}
            className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
          />
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="text-xs text-gray-500">Font</label>
              <select
                name="visionary_script_font"
                value={settings.visionary_script_font}
                onChange={handleChange}
                className="w-full p-3 bg-black border border-gray-700 rounded-xl text-white mt-1"
              >
                {fontOptions.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  name="visionary_script_color"
                  value={settings.visionary_script_color}
                  onChange={handleChange}
                  className="w-10 h-10 rounded border-0 cursor-pointer"
                />
                <span className="text-xs text-white">{settings.visionary_script_color}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-white/5 rounded-xl">
            <p style={{
              fontFamily: `'${settings.visionary_script_font}', cursive`,
              color: settings.visionary_script_color,
              fontSize: '1.5rem'
            }}>
              {settings.visionary_script || 'Your text preview'}
            </p>
          </div>
        </div>

        {/* Vision Paragraph */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Vision Paragraph</label>
          <textarea
            name="visionary_paragraph"
            value={settings.visionary_paragraph}
            onChange={handleChange}
            rows={4}
            className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
          />
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="text-xs text-gray-500">Font</label>
              <select
                name="visionary_paragraph_font"
                value={settings.visionary_paragraph_font}
                onChange={handleChange}
                className="w-full p-3 bg-black border border-gray-700 rounded-xl text-white mt-1"
              >
                {fontOptions.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  name="visionary_paragraph_color"
                  value={settings.visionary_paragraph_color}
                  onChange={handleChange}
                  className="w-10 h-10 rounded border-0 cursor-pointer"
                />
                <span className="text-xs text-white">{settings.visionary_paragraph_color}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-white/5 rounded-xl">
            <p style={{
              fontFamily: `'${settings.visionary_paragraph_font}', sans-serif`,
              color: settings.visionary_paragraph_color,
              lineHeight: 1.5
            }}>
              {settings.visionary_paragraph || 'Your paragraph preview'}
            </p>
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full py-3 bg-[#00e6ff] text-black rounded-xl font-extrabold disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Branding Settings'}
        </button>
      </div>
    </div>
  )
}