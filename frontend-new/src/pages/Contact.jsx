import { useState } from 'react'
import axiosInstance from '../lib/axios'
import { Mail, Phone, MapPin, Send, Loader } from 'lucide-react'
import { toast } from 'react-hot-toast'

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axiosInstance.post('/contact', formData)
            toast.success('Message sent successfully!')
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (error) {
            toast.error('Failed to send message')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-[100px] min-h-screen container pb-20">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Have questions about our products or your order? We're here to help.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {/* Info */}
                <div className="space-y-8">
                    <div className="glass-card p-8 rounded-2xl">
                        <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-yellow-100 p-3 rounded-full text-yellow-700">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Email Us</h4>
                                    <p className="text-gray-500">support@vayutrenz.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-yellow-100 p-3 rounded-full text-yellow-700">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Call Us</h4>
                                    <p className="text-gray-500">+91 98765 43210</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-yellow-100 p-3 rounded-full text-yellow-700">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Visit Us</h4>
                                    <p className="text-gray-500">123 Fashion Street, Cyber City,<br />New Delhi, India</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Your Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="glossy-input w-full"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="glossy-input w-full"
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Subject</label>
                            <input
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="glossy-input w-full"
                                placeholder="Order Inquiry"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className="glossy-input w-full"
                                rows="4"
                                placeholder="How can we help you?"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4 text-base"
                        >
                            {loading ? <Loader className="animate-spin mr-2" /> : <Send className="mr-2" size={20} />}
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Contact

