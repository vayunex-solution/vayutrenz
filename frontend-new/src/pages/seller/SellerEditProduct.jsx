import { useState, useEffect } from 'react'
import axiosInstance from '../../lib/axios'
import { Edit2, Loader, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { useNavigate, useParams, Link } from 'react-router-dom'

const SellerEditProduct = () => {
    const { id } = useParams()
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', original_price: '',
        category_id: '', gender: 'unisex', brand: '',
        primary_image: '', images: ''
    })
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const { token } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                axiosInstance.get('/categories?gender=all'),
                axiosInstance.get(`/products/${id}`)
            ])

            if (catRes.data.success) {
                setCategories(catRes.data.categories)
            }

            if (prodRes.data.success) {
                const p = prodRes.data.product
                setFormData({
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    original_price: p.original_price || '',
                    category_id: p.category_id,
                    gender: p.gender,
                    brand: p.brand || '',
                    primary_image: p.primary_image,
                    images: p.images ? p.images.join(',') : ''
                })
            }
        } catch (error) {
            toast.error('Failed to load product data')
            navigate('/seller/products')
        } finally {
            setFetching(false)
        }
    }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            const payload = { ...formData, slug }

            await axiosInstance.put(`/products/${id}`, payload)
            toast.success('Product updated successfully!')
            navigate('/seller/products')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update product')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="p-8 text-center"><Loader className="animate-spin mx-auto" /></div>

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <Link to="/seller/products" className="text-gray-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <Edit2 size={24} />
                </div>
                <h1 className="text-2xl font-bold">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Product Name</label>
                        <input className="glossy-input w-full" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Price (₹)</label>
                        <input type="number" className="glossy-input w-full" name="price" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">MRP/Original Price (₹)</label>
                        <input type="number" className="glossy-input w-full" name="original_price" value={formData.original_price} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select className="glossy-input w-full" name="category_id" value={formData.category_id} onChange={handleChange} required>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <select className="glossy-input w-full" name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="unisex">Unisex</option>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea className="glossy-input w-full" rows="4" name="description" value={formData.description} onChange={handleChange} required />
                    </div>
                </div>

                {/* Images */}
                <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-semibold mb-4">Product Images</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Primary Image URL</label>
                            <input className="glossy-input w-full" name="primary_image" value={formData.primary_image} onChange={handleChange} placeholder="https://..." required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Additional Images (comma separated)</label>
                            <input className="glossy-input w-full" name="images" value={formData.images} onChange={handleChange} placeholder="https://..., https://..." />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                    <Link to="/seller/products" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Link>
                    <button type="submit" disabled={loading} className="btn btn-primary flex-1 py-4 text-base font-bold">
                        {loading ? <Loader className="animate-spin mx-auto" /> : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    )
}
export default SellerEditProduct

