import { useState, useEffect } from 'react'
import axiosInstance from '../../lib/axios'
import { Upload, X, Loader, FolderPlus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

const SellerAddProduct = () => {
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', original_price: '',
        category_id: '', gender: 'unisex', brand: '',
        primary_image: '', images: ''
    })
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const { token } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get('/categories?gender=all')
            if (res.data.success) setCategories(res.data.categories)
        } catch (error) {
            toast.error('Failed to load categories')
        }
    }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            const payload = { ...formData, slug }

            await axiosInstance.post('/products', payload, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Product created successfully!')
            navigate('/seller/products')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create product')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <FolderPlus size={24} />
                </div>
                <h1 className="text-2xl font-bold">Add New Product</h1>
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

                <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 text-base font-bold mt-6">
                    {loading ? <Loader className="animate-spin" /> : 'Create Product'}
                </button>
            </form>
        </div>
    )
}
export default SellerAddProduct

