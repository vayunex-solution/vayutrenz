import { useState, useEffect } from 'react'
import axios from 'axios'
import { Truck, MapPin, CheckCircle, Package, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const DeliveryDashboard = () => {
    const [profile, setProfile] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [registerData, setRegisterData] = useState({ vehicle_number: '', vehicle_type: 'bike', phone: '' })
    const { token, user } = useAuthStore()

    useEffect(() => {
        if (token) checkProfile()
    }, [token])

    const checkProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/delivery/profile', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success && res.data.profile) {
                setProfile(res.data.profile)
                fetchOrders()
            }
        } catch (error) {
            // Not registered
        } finally {
            setLoading(false)
        }
    }

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/delivery/orders', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) setOrders(res.data.orders)
        } catch (error) {
            toast.error('Failed to load orders')
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5001/api/delivery/register', registerData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Registered successfully')
            checkProfile()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
        }
    }

    const updateStatus = async (orderId, status) => {
        try {
            await axios.post(`http://localhost:5001/api/delivery/orders/${orderId}/track`, {
                status,
                location: 'Current Location', // simplified
                description: `Order is ${status}`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success(`Updated to ${status}`)
            fetchOrders()
        } catch (error) {
            toast.error('Update failed')
        }
    }

    if (loading) return <div className="p-20 text-center">Loading...</div>

    if (!profile) {
        return (
            <div className="pt-[100px] pb-20 container max-w-lg mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                    <Truck size={48} className="mx-auto text-blue-600 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Delivery Partner Registration</h1>
                    <p className="text-gray-500 mb-6">Join our delivery fleet and start earning.</p>

                    <form onSubmit={handleRegister} className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                            <input className="glossy-input w-full" value={registerData.vehicle_number} onChange={e => setRegisterData({ ...registerData, vehicle_number: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                            <select className="glossy-input w-full" value={registerData.vehicle_type} onChange={e => setRegisterData({ ...registerData, vehicle_type: e.target.value })}>
                                <option value="bike">Bike</option>
                                <option value="scooter">Scooter</option>
                                <option value="van">Van</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                            <input className="glossy-input w-full" value={registerData.phone} onChange={e => setRegisterData({ ...registerData, phone: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">Register</button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="pt-[100px] pb-20 container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
                    <p className="text-gray-500">Welcome, {user.name} ({profile.vehicle_type})</p>
                </div>
                <button onClick={fetchOrders} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <RefreshCw size={20} />
                </button>
            </div>

            <div className="grid gap-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">Order #{order.id}</h3>
                                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {order.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2 text-sm text-gray-700">
                            <p className="flex items-center gap-2"><CheckCircle size={16} className="text-gray-400" /> <b>Customer:</b> {order.customer_name}</p>
                            <p className="flex items-center gap-2"><CheckCircle size={16} className="text-gray-400" /> <b>Phone:</b> {order.customer_phone}</p>
                            <p className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> <b>Address:</b> {order.customer_address}, {order.customer_city} - {order.customer_zip}</p>
                        </div>

                        <div className="flex gap-2">
                            {order.status !== 'out_for_delivery' && (
                                <button onClick={() => updateStatus(order.id, 'out_for_delivery')} className="btn flex-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                                    Pickup / Out for Delivery
                                </button>
                            )}
                            <button onClick={() => updateStatus(order.id, 'delivered')} className="btn flex-1 bg-green-100 text-green-700 hover:bg-green-200">
                                Mark Delivered
                            </button>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                        <Package size={48} className="mx-auto text-gray-300 mb-2" />
                        <p>No assigned orders yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
export default DeliveryDashboard
