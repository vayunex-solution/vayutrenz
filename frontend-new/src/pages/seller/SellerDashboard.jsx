import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Settings, Store } from 'lucide-react'
import SellerOverview from './SellerOverview'
import SellerProducts from './SellerProducts'
import SellerAddProduct from './SellerAddProduct'
import SellerEditProduct from './SellerEditProduct'
import SellerOrders from './SellerOrders'

const SellerDashboard = () => {
    const location = useLocation()

    // Helper to check active route
    const isActive = (path) => location.pathname === path

    return (
        <div className="flex min-h-screen pt-[80px] bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-[calc(100vh-80px)] overflow-y-auto hidden md:block">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-indigo-600 text-white p-2 rounded-lg">
                            <Store size={20} />
                        </div>
                        <span className="font-bold text-lg">Seller Centre</span>
                    </div>

                    <nav className="space-y-1">
                        <Link to="/seller" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/seller') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <LayoutDashboard size={20} />
                            Overview
                        </Link>
                        <Link to="/seller/products" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/seller/products') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Package size={20} />
                            My Products
                        </Link>
                        <Link to="/seller/orders" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/seller/orders') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <ShoppingBag size={20} />
                            Orders
                        </Link>
                        <Link to="/seller/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/seller/settings') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Settings size={20} />
                            Settings
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <Routes>
                    <Route path="/" element={<SellerOverview />} />
                    <Route path="/products" element={<SellerProducts />} />
                    <Route path="/add" element={<SellerAddProduct />} />
                    <Route path="/edit/:id" element={<SellerEditProduct />} />
                    <Route path="/orders" element={<SellerOrders />} />
                    <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Seller Settings Coming Soon</div>} />
                </Routes>
            </main>
        </div>
    )
}
export default SellerDashboard
