import { useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import VideoManager from '../components/VideoManager'
import PricingManager from '../components/PricingManager'
import InvoiceCreator from '../components/InvoiceCreator'
import InvoicesList from '../components/InvoicesList'
import ClientsList from '../components/ClientsList'
import AdminOverview from '../components/AdminOverview'
import SiteImage from '../components/SiteImage'
import BrandSettings from '../components/BrandSettings'
import NavbarSettings from '../components/NavbarSettings'
import UpdateNotification from '../components/UpdateNotification'   // PWA update banner
import {
  LayoutDashboard,
  Video,
  DollarSign,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
} from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/admin/videos', label: 'Videos', icon: Video },
  { to: '/admin/pricing', label: 'Pricing', icon: DollarSign },
  {
    label: 'Invoices',
    icon: FileText,
    children: [
      { to: '/admin/invoices/create', label: 'Create Invoice' },
      { to: '/admin/invoices/list', label: 'Invoice List' },
    ],
  },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { to: '/admin/settings/image', label: 'Intro Image' },
      { to: '/admin/settings/branding', label: 'Branding' },
      { to: '/admin/settings/navbar', label: 'Navbar Brand' },
    ],
  },
]

export default function AdminDashboard() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      {/* Sidebar – Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-black/90 border-r border-white/10">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-display text-xl text-[#00e6ff] tracking-wider">TDS Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400">
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.children.map((child) => (
                  <Link
                    key={child.to}
                    to={child.to}
                    className={`flex items-center gap-3 pl-12 pr-4 py-2 rounded-xl text-sm font-medium transition ${
                      isActive(child.to)
                        ? 'bg-[#00e6ff]/20 text-[#00e6ff]'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <ChevronRight size={14} />
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive(item.to, item.exact)
                    ? 'bg-[#00e6ff]/20 text-[#00e6ff]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-xl transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar – Mobile (overlay) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full bg-black/95 border-r border-white/10 p-6">
            <button className="absolute top-4 right-4 text-white" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
            <h1 className="font-display text-xl text-[#00e6ff] mb-8">TDS Admin</h1>
            <nav className="space-y-2">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400">
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 pl-12 pr-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5"
                      >
                        <ChevronRight size={14} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5"
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                )
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-red-400"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-black/90 border-b border-white/10 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-white" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <span className="text-gray-400 text-sm">Welcome, {user?.email || 'Admin'}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="videos" element={<VideoManager />} />
            <Route path="pricing" element={<PricingManager />} />
            <Route path="invoices/create" element={<InvoiceCreator />} />
            <Route path="invoices/list" element={<InvoicesList />} />
            <Route path="clients" element={<ClientsList />} />
            <Route path="settings/image" element={<SiteImage />} />
            <Route path="settings/branding" element={<BrandSettings />} />
            <Route path="settings/navbar" element={<NavbarSettings />} />
          </Routes>
        </main>
      </div>

      {/* PWA Update Notification */}
      <UpdateNotification />
    </div>
  )
}