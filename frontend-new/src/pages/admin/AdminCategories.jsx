import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, Edit2, X, Search, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const AdminCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentCat, setCurrentCat] = useState(null)
    const [search, setSearch] = useState('')
    const { token } = useAuthStore()

    const initialForm = {
        name: '',
        slug: '',
        description: '',
        image_url: '',
        gender: 'unisex',
        is_active: 1
    }
    const [formData, setFormData] = useState(initialForm)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/categories?gender=all')
            if (res.data.success) {
                setCategories(res.data.categories)
            }
        } catch (error) {
            toast.error('Failed to categories')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return
        try {
            await axios.delete(`http://localhost:5001/api/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Deleted')
            fetchCategories()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete')
        }
    }

    const handleEdit = (cat) => {
        setCurrentCat(cat)
        setFormData(cat)
        setIsEditing(true)
    }

    const handleAdd = () => {
        setCurrentCat(null)
        setFormData(initialForm)
        setIsEditing(true)
    }

    const generateSlug = (name) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const handleNameChange = (e) => {
        const name = e.target.value
        setFormData(prev => ({ ...prev, name, slug: generateSlug(name) }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (currentCat) {
                await axios.put(`http://localhost:5001/api/categories/${currentCat.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Category updated')
            } else {
                await axios.post('http://localhost:5001/api/categories', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Category created')
            }
            setIsEditing(false)
            fetchCategories()
        } catch (error) {
            toast.error('Failed to save')
        }
    }

    const filteredCats = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Categories</h2>
                    <p className="text-sm text-gray-500">Manage product categories</p>
                </div>
                <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
                    <Plus size={20} /> Add Category
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    className="glossy-input pl-10 w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Slug</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Gender</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredCats.map(cat => (
                            <tr key={cat.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        {cat.image_url ? (
                                            <img src={cat.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <ImageIcon size={16} className="text-gray-400" />
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-900">{cat.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{cat.slug}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${cat.gender === 'men' ? 'bg-blue-100 text-blue-800' :
                                            cat.gender === 'women' ? 'bg-pink-100 text-pink-800' :
                                                'bg-purple-100 text-purple-800'
                                        }`}>
                                        {cat.gender.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                                            <Edit2 size={16} className="text-blue-600" />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{currentCat ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    className="glossy-input w-full"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input
                                    className="glossy-input w-full bg-gray-50"
                                    value={formData.slug}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Gender</label>
                                <select
                                    className="glossy-input w-full"
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="unisex">Unisex</option>
                                    <option value="men">Men</option>
                                    <option value="women">Women</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input
                                    className="glossy-input w-full"
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="glossy-input w-full"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
export default AdminCategories
