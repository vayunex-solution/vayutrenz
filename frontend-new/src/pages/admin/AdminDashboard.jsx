import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, ShoppingBag, Users, Package, Image as ImageIcon, LayoutGrid } from 'lucide-react'
import AdminSettings from './AdminSettings'
import AdminHero from './AdminHero'
import AdminCategories from './AdminCategories'
import AdminInbox from './AdminInbox'
import AdminSellers from './AdminSellers'
import { MessageSquare, Store } from 'lucide-react'

const AdminDashboard = () => {
    const location = useLocation()
    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen bg-gray-50 flex pt-[70px]"> {/* Offset Navbar */}
            {/* Sidebar Desktop */}
            <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-70px)] sticky top-[70px] hidden md:block">
                <nav className="p-4 space-y-2">
                    <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <LayoutDashboard size={20} />
                        Overview
                    </Link>
                    <Link to="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/products') ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Package size={20} />
                        Products
                    </Link>
                    <Link to="/admin/categories" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/categories') ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <LayoutGrid size={20} />
                        Categories
                    </Link>
                    <Link to="/admin/inbox" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/inbox') ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <MessageSquare size={20} />
                        Inbox
                    </Link>
                    <Link to="/admin/sellers" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/sellers') ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Store size={20} />
                        Sellers
                    </Link>
                    <Link to="/admin/orders" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/orders') ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <ShoppingBag size={20} />
                        Orders
                    </Link>
                    <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/users') ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Users size={20} />
                        Users
                    </Link>

                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</p>
                    </div>
                    <Link to="/admin/hero" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/hero') ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <ImageIcon size={20} />
                        Hero Slides
                    </Link>

                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Configuration</p>
                    </div>

                    <Link to="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/settings') ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Settings size={20} />
                        Site Settings
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                {/* Mobile Admin Nav Hint could be added here */}

                <Routes>
                    <Route path="/" element={<div className="p-8 text-center text-gray-500">Dashboard Overview (Coming Soon)</div>} />
                    <Route path="/settings" element={<AdminSettings />} />
                    <Route path="/hero" element={<AdminHero />} />
                    <Route path="/categories" element={<AdminCategories />} />
                    <Route path="/inbox" element={<AdminInbox />} />
                    <Route path="/sellers" element={<AdminSellers />} />
                    <Route path="*" element={<div className="p-8 text-center text-gray-500">Module Coming Soon</div>} />
                </Routes>
            </main>
        </div>
    )
}

export default AdminDashboard
