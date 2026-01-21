import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Edit2, Trash2, Package } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'

const SellerProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const { token } = useAuthStore()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // 1. Get Seller ID
            const profileRes = await axios.get('http://localhost:5001/api/seller/status', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (profileRes.data.success && profileRes.data.profile) {
                const sellerId = profileRes.data.profile.id
                // 2. Get Products
                const res = await axios.get(`http://localhost:5001/api/products?seller_id=${sellerId}&limit=100`)
                if (res.data.success) {
                    setProducts(res.data.products)
                }
            }
        } catch (error) {
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return
        try {
            await axios.delete(`http://localhost:5001/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Product deleted')
            setProducts(prev => prev.filter(p => p.id !== id))
        } catch (error) {
            toast.error('Delete failed')
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Products</h1>
                <Link to="/seller/add" className="btn btn-primary flex items-center gap-2">
                    <Plus size={20} /> Add Product
                </Link>
            </div>
            
            {loading ? (
                <div className="text-center py-20">Loading...</div>
            ) : products.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-500">
                    <p className="mb-4">No products found.</p>
                    <p className="text-sm">Click "Add Product" to create your first listing.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {products.map(p => (
                         <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img src={p.primary_image} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                                    <p className="text-sm text-gray-500">₹{p.price} • {p.category_name} • {JSON.stringify(p.sizes)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link to={`/product/${p.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600">
                                    <Package size={20} />
                                </Link>
                                <Link to={`/seller/edit/${p.id}`} className="p-2 text-gray-400 hover:text-blue-600">
                                    <Edit2 size={20} />
                                </Link>
                                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
export default SellerProducts
