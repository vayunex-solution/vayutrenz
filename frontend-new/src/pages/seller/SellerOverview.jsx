import { Package, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react'

const SellerOverview = () => {
    const stats = [
        { label: 'Total Sales', value: '₹0', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Total Orders', value: '0', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Products', value: '0', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Revenue', value: '₹0', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    ]

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+0%</span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 text-center py-20">
                <p className="text-gray-500">Sales Chart Coming Soon</p>
            </div>
        </div>
    )
}
export default SellerOverview
