import { useState, useEffect } from 'react'
import axiosInstance from '../../lib/axios'
import { CheckCircle, XCircle, Store, Clock, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const AdminSellers = () => {
    const [sellers, setSellers] = useState([])
    const [loading, setLoading] = useState(true)
    const { token } = useAuthStore()

    useEffect(() => {
        fetchSellers()
    }, [])

    const fetchSellers = async () => {
        try {
            const res = await axiosInstance.get('/seller/admin', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setSellers(res.data.sellers)
            }
        } catch (error) {
            toast.error('Failed to load sellers')
        } finally {
            setLoading(false)
        }
    }

    const handleStatus = async (id, status) => {
        if (!window.confirm(`Mark this seller as ${status}?`)) return
        try {
            await axiosInstance.put(`/seller/admin/${id}/status`, { status })
            toast.success(`Seller ${status}`)
            fetchSellers()
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Seller Applications</h2>

            <div className="grid gap-6">
                {sellers.map(seller => (
                    <div key={seller.id} className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Store size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    {seller.business_name}
                                    <span className={`text-xs px-2 py-1 rounded-full ${seller.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            seller.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {seller.status.toUpperCase()}
                                    </span>
                                </h3>
                                <p className="text-gray-500 text-sm mb-2">{seller.owner_name} ({seller.email})</p>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="flex items-center gap-2"><MapPin size={14} /> {seller.business_address}</p>
                                    <p className="text-xs text-gray-400">Tax ID: {seller.tax_id || 'N/A'}</p>
                                </div>
                                <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {seller.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[140px]">
                            {seller.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleStatus(seller.id, 'approved')}
                                        className="btn bg-green-50 text-green-600 hover:bg-green-100 justify-start"
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatus(seller.id, 'rejected')}
                                        className="btn bg-red-50 text-red-600 hover:bg-red-100 justify-start"
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </>
                            )}
                            <div className="text-xs text-gray-400 text-right mt-auto">
                                Applied: {new Date(seller.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}

                {sellers.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">No applications yet</div>
                )}
            </div>
        </div>
    )
}
export default AdminSellers

