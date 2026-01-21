import { useState } from 'react'
import axios from 'axios'
import { Store, MapPin, FileText, Send, Loader, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

const SellerRegistration = () => {
    const [formData, setFormData] = useState({
        business_name: '',
        business_address: '',
        tax_id: '',
        description: ''
    })
    const [loading, setLoading] = useState(false)
    const { token, user } = useAuthStore()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!token) return toast.error('Please login first')
        
        setLoading(true)
        try {
            const res = await axios.post('http://localhost:5001/api/seller/apply', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success('Application Submitted! We will review it shortly.')
                navigate('/myaccount')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Application failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-[100px] min-h-screen container pb-20">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-block p-4 bg-yellow-100 rounded-full text-yellow-700 mb-4">
                        <Store size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
                    <p className="text-gray-500">Join our marketplace and reach millions of customers.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700 text-sm">
                            <Info className="shrink-0" size={20} />
                            <p>Your application will be reviewed by our team. Once approved, you can start listing products.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Business Name</label>
                            <div className="relative">
                                <Store className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    className="glossy-input pl-10 w-full"
                                    placeholder="My Awesome Store"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Business Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                <textarea 
                                    name="business_address"
                                    value={formData.business_address}
                                    onChange={handleChange}
                                    className="glossy-input pl-10 w-full"
                                    rows="3"
                                    placeholder="Where are you located?"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Tax ID / GSTIN</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    name="tax_id"
                                    value={formData.tax_id}
                                    onChange={handleChange}
                                    className="glossy-input pl-10 w-full"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Business Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="glossy-input w-full"
                                rows="4"
                                placeholder="Tell us about your products..."
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary w-full py-3 text-lg font-bold"
                        >
                            {loading ? <Loader className="animate-spin mr-2" /> : <Send className="mr-2" size={20} />}
                            Submit Application
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default SellerRegistration
