import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Hero() {
  const [content, setContent] = useState({
    script: 'Meet the Visionary',
    paragraph: 'TeeDigital, spearheaded by the visionary Tina Oreke, specializes in bridging the gap between imagination and digital reality through elite AI filmmaking and design.',
    scriptFont: 'Dancing Script',
    scriptColor: '#00e6ff',
    paragraphFont: 'Inter',
    paragraphColor: '#ffffff'
  })

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .single()
      .then(({ data }) => {
        if (data) {
          setContent({
            script: data.visionary_script || 'Meet the Visionary',
            paragraph: data.visionary_paragraph || '',
            scriptFont: data.visionary_script_font || 'Dancing Script',
            scriptColor: data.visionary_script_color || '#00e6ff',
            paragraphFont: data.visionary_paragraph_font || 'Inter',
            paragraphColor: data.visionary_paragraph_color || '#ffffff'
          })
        }
      })
  }, [])

  // Load the fonts
  const fontLink = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(content.scriptFont.replace(/\s+/g, '+'))}&family=${encodeURIComponent(content.paragraphFont.replace(/\s+/g, '+'))}&display=swap`

  return (
    <header className="text-center pt-10 pb-16">
      <link href={fontLink} rel="stylesheet" />
      <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
        TEES DIGITAL <span className="text-[#00e6ff]">SPACE</span>
      </h1>
      <p className="tracking-[6px] text-[#00e6ff] font-extrabold text-xs mt-4 uppercase">
        CINEMATIC AI PRODUCTION • 2026
      </p>
      <div className="max-w-xl mx-auto mt-12 p-8 border-l-4 border-[#00e6ff] bg-white/5 backdrop-blur-md rounded-r-3xl">
        <span
          style={{
            fontFamily: `'${content.scriptFont}', cursive`,
            color: content.scriptColor,
            fontSize: '1.5rem'
          }}
        >
          {content.script}
        </span>
        <p
          className="mt-3 leading-relaxed"
          style={{
            fontFamily: `'${content.paragraphFont}', sans-serif`,
            color: content.paragraphColor
          }}
        >
          {content.paragraph}
        </p>
      </div>
    </header>
  )
}