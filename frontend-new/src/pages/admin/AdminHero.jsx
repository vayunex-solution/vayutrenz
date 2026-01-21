import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const AdminHero = () => {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(null)
  
  const initialForm = {
    title: '',
    subtitle: '',
    image_url: '',
    category_link: '/products',
    accent_color: '#FFD700',
    is_active: 1
  }
  const [formData, setFormData] = useState(initialForm)
  const { token } = useAuthStore()

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/hero')
      setSlides(res.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch slides')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await axios.delete(`http://localhost:5001/api/hero/${id}`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Slide deleted')
      fetchSlides()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const handleEdit = (slide) => {
    setCurrentSlide(slide)
    setFormData(slide)
    setIsEditing(true)
  }

  const handleAddNew = () => {
    setCurrentSlide(null)
    setFormData(initialForm)
    setIsEditing(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (currentSlide) {
        await axios.put(`http://localhost:5001/api/hero/${currentSlide.id}`, formData, {
            headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Slide updated')
      } else {
        await axios.post('http://localhost:5001/api/hero', formData, {
            headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Slide created')
      }
      setIsEditing(false)
      fetchSlides()
    } catch (error) {
      toast.error('Failed to save slide')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hero Slideshow</h2>
        <button onClick={handleAddNew} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Slide
        </button>
      </div>

      {/* Slide List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {slides.map(slide => (
          <div key={slide.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="relative h-40 bg-gray-100">
              <img src={slide.image_url} alt={slide.title} className="w-full h-full object-contain p-4" />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(slide)} className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                  <Edit2 size={16} className="text-blue-600" />
                </button>
                <button onClick={() => handleDelete(slide.id)} className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: slide.accent_color }}></div>
                <h3 className="font-bold text-gray-800 truncate">{slide.title}</h3>
              </div>
              <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal (Simple overlay) */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{currentSlide ? 'Edit Slide' : 'New Slide'}</h3>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  type="text" 
                  className="glossy-input w-full"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input 
                  type="text" 
                  className="glossy-input w-full"
                  value={formData.subtitle}
                  onChange={e => setFormData({...formData, subtitle: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL (Transparent PNG recommended)</label>
                <div className="flex gap-2">
                    <input 
                    type="text" 
                    className="glossy-input flex-1"
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                    required
                    />
                    {formData.image_url && (
                        <div className="w-10 h-10 border rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      className="h-10 w-full rounded cursor-pointer border-0"
                      value={formData.accent_color}
                      onChange={e => setFormData({...formData, accent_color: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Link</label>
                  <input 
                    type="text" 
                    className="glossy-input w-full"
                    placeholder="/products?category=..."
                    value={formData.category_link}
                    onChange={e => setFormData({...formData, category_link: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default AdminHero
