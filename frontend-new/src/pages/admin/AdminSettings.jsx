import { useState, useEffect } from 'react'
import axiosInstance from '../../lib/axios'
import { Save, Loader } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    site_title: '',
    site_logo: '',
    contact_email: '',
    contact_phone: '',
    shipping_fee: '',
    free_shipping_threshold: '',
    social_links: { facebook: '', instagram: '', twitter: '' }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { token, user } = useAuthStore()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get('/cms/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setSettings(prev => ({ ...prev, ...res.data.settings }))
      }
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleSocialChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [name]: value }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axiosInstance.put('/cms/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Settings updated successfully')
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8"><Loader className="animate-spin" /></div>

  return (
    <div className="admin-page p-6">
      <h2 className="text-2xl font-bold mb-6">Site Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">General Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
              <input 
                type="text" 
                name="site_title"
                value={settings.site_title}
                onChange={handleChange}
                className="glossy-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input 
                type="email" 
                name="contact_email"
                value={settings.contact_email}
                onChange={handleChange}
                className="glossy-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input 
                type="text" 
                name="contact_phone"
                value={settings.contact_phone}
                onChange={handleChange}
                className="glossy-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input 
                type="text" 
                name="site_logo"
                value={settings.site_logo}
                onChange={handleChange}
                className="glossy-input"
              />
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Shipping Configuration</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard Shipping Fee (₹)</label>
              <input 
                type="number" 
                name="shipping_fee"
                value={settings.shipping_fee}
                onChange={handleChange}
                className="glossy-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (₹)</label>
              <input 
                type="number" 
                name="free_shipping_threshold"
                value={settings.free_shipping_threshold}
                onChange={handleChange}
                className="glossy-input"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input 
                type="text" 
                name="instagram"
                value={settings.social_links?.instagram || ''}
                onChange={handleSocialChange}
                className="glossy-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input 
                type="text" 
                name="facebook"
                value={settings.social_links?.facebook || ''}
                onChange={handleSocialChange}
                className="glossy-input"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="btn btn-primary w-full md:w-auto"
        >
          {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  )
}

export default AdminSettings

