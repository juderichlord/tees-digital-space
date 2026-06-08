import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const [brand, setBrand] = useState('💎 TDS | TINA OREKE')

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('navbar_brand_text')
      .single()
      .then(({ data }) => {
        if (data?.navbar_brand_text) setBrand(data.navbar_brand_text)
      })
  }, [])

  return (
    <nav className="fixed top-0 w-full h-14 bg-black/90 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-6 z-50">
      <a href="/" className="font-display text-xl text-white">
        {brand}
      </a>
      <Link
        to="/admin/login"
        className="text-xs text-gray-400 hover:text-[#00e6ff] transition"
      >
        Admin
      </Link>
    </nav>
  )
}