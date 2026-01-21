import { Link, useParams } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const OrderSuccess = () => {
    useEffect(() => {
        // Fire confetti
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }, [])

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-4 flex items-center justify-center bg-gray-50/50">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl shadow-indigo-100 text-center border border-gray-100 animate-slideUp">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600 w-10 h-10" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8">
                    Your order has been placed successfully. We'll send you shipping updates via email.
                </p>

                <div className="space-y-4">
                    <Link to="/account/orders" className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
                        <Package size={20} /> View Order Status
                    </Link>
                    
                    <Link to="/" className="w-full py-3 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                        <Home size={20} /> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default OrderSuccess
