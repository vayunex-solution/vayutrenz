import { useState, useEffect } from 'react'
import axios from 'axios'
import { Mail, Trash2, Search, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const AdminInbox = () => {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const { token } = useAuthStore()

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/contact', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setMessages(res.data.messages)
            }
        } catch (error) {
            toast.error('Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete message?')) return
        try {
            await axios.delete(`http://localhost:5001/api/contact/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Message deleted')
            setMessages(prev => prev.filter(m => m.id !== id))
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const filtered = messages.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Inbox ({messages.length})</h2>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        className="glossy-input pl-10 py-2 w-full text-sm"
                        placeholder="Search messages..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filtered.map(msg => (
                    <div key={msg.id} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{msg.subject || 'No Subject'}</h3>
                                    <p className="text-sm text-gray-500">{msg.name} &lt;{msg.email}&gt;</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(msg.created_at).toLocaleDateString()}
                                </span>
                                <button onClick={() => handleDelete(msg.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                            {msg.message}
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        No messages found.
                    </div>
                )}
            </div>
        </div>
    )
}
export default AdminInbox
