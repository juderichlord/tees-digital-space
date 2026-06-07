import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import VideoManager from '../components/VideoManager'
import PricingManager from '../components/PricingManager'
import InvoiceCreator from '../components/InvoiceCreator'

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="bg-black/90 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex gap-6">
          <Link to="/admin/videos" className="text-[#00e6ff] font-semibold">Videos</Link>
          <Link to="/admin/pricing" className="text-[#00e6ff] font-semibold">Pricing</Link>
          <Link to="/admin/invoices" className="text-[#00e6ff] font-semibold">Invoices</Link>
        </div>
        <button onClick={handleLogout} className="text-red-400">Logout</button>
      </nav>
      <div className="p-8">
        <Routes>
          <Route index element={<VideoManager />} />
          <Route path="videos" element={<VideoManager />} />
          <Route path="pricing" element={<PricingManager />} />
          <Route path="invoices" element={<InvoiceCreator />} />
        </Routes>
      </div>
    </div>
  )
}