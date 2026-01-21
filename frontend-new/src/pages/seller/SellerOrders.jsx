import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../../store/authStore'
import { Package, Calendar, User, MapPin, Clock } from 'lucide-react'

const SellerOrders = () => {
    const { token } = useAuthStore()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/seller/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.data.success) {
                    setOrders(res.data.orders)
                }
            } catch (error) {
                console.error('Fetch seller orders error', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [token])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No orders yet</h3>
                <p className="text-gray-500 mt-2">When customers buy your products, orders will appear here.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((item) => (
                                <tr key={item.item_id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{item.product_name}</span>
                                            <span className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">#{item.order_number}</span>
                                            <span className="text-sm text-indigo-600 font-medium">Total: ₹{item.total_price}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-900">
                                                <User size={14} className="text-gray-400" />
                                                {item.customer_name}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <MapPin size={12} />
                                                {item.customer_city}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${item.order_status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                              item.order_status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {item.order_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <Calendar size={14} />
                                            {formatDate(item.created_at)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default SellerOrders
