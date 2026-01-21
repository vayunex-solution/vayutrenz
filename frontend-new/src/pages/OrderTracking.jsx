import { useState, useEffect } from 'react'
import axiosInstance from '../lib/axios'
import { useParams } from 'react-router-dom'
import { Package, MapPin, CheckCircle, Truck, Clock } from 'lucide-react'

const OrderTracking = () => {
    const { orderId } = useParams()
    const [timeline, setTimeline] = useState([])
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchTracking()
    }, [orderId])

    const fetchTracking = async () => {
        try {
            const res = await axiosInstance.get(`/delivery/track/${orderId}`)
            if (res.data.success) {
                setTimeline(res.data.timeline)
                setStatus(res.data.currentStatus)
            }
        } catch (error) {
            setError('Tracking info unavailable')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-center py-20">Loading Tracking Info...</div>
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>

    return (
        <div className="pt-[100px] pb-20 container max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-block p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
                    <Truck size={40} />
                </div>
                <h1 className="text-3xl font-bold mb-2">Order #{orderId}</h1>
                <p className="text-xl text-blue-600 font-semibold uppercase">{status.replace('_', ' ')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative">
                <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                <div className="space-y-8">
                    {timeline.map((event, index) => (
                        <div key={event.id} className="relative flex items-start gap-6">
                            <div className={`z-10 p-2 rounded-full border-4 border-white shadow-sm ${index === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {index === 0 ? <CheckCircle size={20} /> : <Clock size={20} />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{event.status.replace('_', ' ').toUpperCase()}</h3>
                                <p className="text-gray-600">{event.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(event.created_at).toLocaleString()}</span>
                                    {event.location && <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>}
                                </div>
                            </div>
                        </div>
                    ))}

                    {timeline.length === 0 && (
                        <div className="text-center text-gray-500">Order placed. Preparing for shipment.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default OrderTracking

