import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { MapPin, Plus, Check, Truck, CreditCard, ShieldCheck, Loader } from 'lucide-react'

const Checkout = () => {
    const navigate = useNavigate()
    const { items, getTotal, clearCart } = useCartStore()
    const { token, user } = useAuthStore()
    
    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showAddAddress, setShowAddAddress] = useState(false)
    const [placingOrder, setPlacingOrder] = useState(false)
    
    // New Address Form
    const [newAddress, setNewAddress] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        addressType: 'home'
    })

    const subtotal = getTotal()
    const shippingFee = subtotal > 1000 ? 0 : 0 // Free shipping for now logic
    const total = subtotal + shippingFee

    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart')
            return
        }
        fetchAddresses()
    }, [items, navigate])

    const fetchAddresses = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/users/addresses', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setAddresses(res.data.data)
                // Auto select default or first
                const defaultAddr = res.data.data.find(a => a.is_default)
                if (defaultAddr) setSelectedAddress(defaultAddr.id)
                else if (res.data.data.length > 0) setSelectedAddress(res.data.data[0].id)
            }
        } catch (error) {
            console.error('Fetch addresses error', error)
        }
    }

    const handleAddAddress = async (e) => {
        e.preventDefault()
        if(!newAddress.street || !newAddress.city || !newAddress.pincode) {
            toast.error('Please fill all required fields')
            return
        }

        try {
            setLoading(true)
            const res = await axios.post('http://localhost:5001/api/users/addresses', newAddress, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success('Address added!')
                await fetchAddresses()
                setShowAddAddress(false)
                setSelectedAddress(res.data.data.addressId)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add address')
        } finally {
            setLoading(false)
        }
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address')
            return
        }

        setPlacingOrder(true)
        try {
            const payload = {
                addressId: selectedAddress,
                items: items.map(item => ({
                    productId: item.product.id,
                    variantId: item.variant?.id || null,
                    quantity: item.quantity,
                    price: item.variant?.price_modifier ? parseFloat(item.product.price) + parseFloat(item.variant.price_modifier) : item.product.price
                })),
                subtotal,
                shippingFee,
                discount: 0,
                notes: ''
            }

            const res = await axios.post('http://localhost:5001/api/orders', payload, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.data.success) {
                toast.success('Order placed successfully! 🎉')
                clearCart()
                // Navigate to success or orders page
                navigate('/account/orders') 
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order')
        } finally {
            setPlacingOrder(false)
        }
    }

    return (
        <div className="pt-[100px] pb-20 px-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Address & Payment */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Address Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MapPin className="text-indigo-600" /> Delivery Address
                            </h2>
                            <button 
                                onClick={() => setShowAddAddress(!showAddAddress)}
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                                <Plus size={16} /> Add New
                            </button>
                        </div>

                        {showAddAddress && (
                            <form onSubmit={handleAddAddress} className="mb-6 bg-gray-50 p-6 rounded-xl border border-gray-200 animate-slideDown">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input placeholder="Full Name" className="glossy-input" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} required />
                                    <input placeholder="Phone Number" className="glossy-input" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} required />
                                    <div className="md:col-span-2">
                                        <input placeholder="Street Address / Flat No" className="glossy-input w-full" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} required />
                                    </div>
                                    <input placeholder="City" className="glossy-input" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} required />
                                    <input placeholder="State" className="glossy-input" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} required />
                                    <input placeholder="Pincode" className="glossy-input" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} required />
                                    <select className="glossy-input" value={newAddress.addressType} onChange={e => setNewAddress({...newAddress, addressType: e.target.value})}>
                                        <option value="home">Home</option>
                                        <option value="office">Office</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <button type="submit" disabled={loading} className="btn btn-primary px-6 py-2 text-sm">
                                        {loading ? 'Saving...' : 'Save Address'}
                                    </button>
                                    <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {addresses.length === 0 && !showAddAddress && (
                                <p className="text-gray-500 text-center py-4">No addresses found. Add one to proceed.</p>
                            )}
                            {addresses.map(addr => (
                                <div 
                                    key={addr.id} 
                                    onClick={() => setSelectedAddress(addr.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-indigo-300'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${selectedAddress === addr.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                            {selectedAddress === addr.id && <Check size={12} className="text-white" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900">{addr.full_name}</span>
                                                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full uppercase tracking-wide">{addr.address_type}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm">{addr.street}, {addr.city}</p>
                                            <p className="text-gray-600 text-sm">{addr.state} - {addr.pincode}</p>
                                            <p className="text-gray-600 text-sm mt-1">Phone: {addr.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                         <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <CreditCard className="text-indigo-600" /> Payment Method
                        </h2>
                        
                        <div className="space-y-3">
                             {/* COD (Selected) */}
                            <div className="p-4 rounded-xl border border-indigo-600 bg-indigo-50/30 flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-4">
                                     <div className="w-5 h-5 rounded-full border border-indigo-600 bg-indigo-600 flex items-center justify-center">
                                         <Check size={12} className="text-white" />
                                     </div>
                                     <span className="font-semibold text-gray-900">Cash on Delivery (COD)</span>
                                </div>
                                <Truck size={20} className="text-gray-400" />
                            </div>

                             {/* Online (Disabled) */}
                             <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                                     <span className="font-medium text-gray-500">Pay Online (Coming Soon)</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-5 bg-gray-300 rounded"></div>
                                    <div className="w-8 h-5 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-[100px]">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                        
                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        <img src={item.product.primary_image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} {item.variant?.size && `• Size: ${item.variant.size}`}</p>
                                        <p className="text-sm font-semibold mt-1">₹{item.variant?.price_modifier ? parseFloat(item.product.price) + parseFloat(item.variant.price_modifier) : item.product.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                {shippingFee === 0 ? <span className="text-green-600">Free</span> : <span>₹{shippingFee}</span>}
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handlePlaceOrder}
                            disabled={placingOrder}
                            className="btn btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            {placingOrder ? <Loader className="animate-spin" /> : <>Place Cash Order <Truck size={20} /></>}
                        </button>

                        <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg justify-center text-sm font-medium">
                            <ShieldCheck size={18} />
                            Safe & Secure Payment
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
