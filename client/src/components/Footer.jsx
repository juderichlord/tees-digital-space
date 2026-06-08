import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="text-center py-16 text-gray-600 text-xs">
      <p className="mb-2">© 2026 TEES DIGITAL SPACE | TINA OREKE</p>
      <Link
        to="/admin/login"
        className="text-gray-500 hover:text-[#00e6ff] transition"
      >
        Admin
      </Link>
    </footer>
  )
}