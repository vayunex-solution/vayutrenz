import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import "./MyOrders.css";
import ProductImage2 from "../../../../assets/product-image2.png";

const cartData = [
    {
        offerName: 'Buy 2 for 999 offer applied!',
        routeOffer: 'buy-2-for-999',
        createdAt:"2025-07-10T18:35:00.000Z",
        products: [
            {
                id: 1,
                title: 'Men\'s Red The Batman Graphic Printed Oversized T-shirt',
                price: 500,
                originalPrice: 1299,
                saved: 799,
                size: 'L',
                qty: 1,
                image: ProductImage2,
                deliveryDate: '25 Jun 2025',
            },
            {
                id: 2,
                title: 'Men\'s Black Batman Outline Logo Graphic Printed Oversized T-shirt',
                price: 499,
                originalPrice: 1299,
                saved: 800,
                size: 'L',
                qty: 1,
                image: ProductImage2,
                deliveryDate: '25 Jun 2025',
            },
            {
                id: 3,
                title: 'Men\'s Red Moon Rider Graphic Printed T-shirt',
                price: 399,
                originalPrice: 999,
                saved: 600,
                size: 'L',
                qty: 1,
                image: ProductImage2,
                deliveryDate: '25 Jun 2025',
            }
        ]
    },
    {
        offerName: 'Buy 3 for 999 offer applicable',
        routeOffer: 'buy-3-for-999',
        createdAt:"2025-07-10T18:35:00.000Z",
        products: [
            {
                id: 3,
                title: 'Men\'s Red Moon Rider Graphic Printed T-shirt',
                price: 399,
                originalPrice: 999,
                saved: 600,
                size: 'L',
                qty: 1,
                image: ProductImage2,
                deliveryDate: '25 Jun 2025',
            },
            {
                id: 3,
                title: 'Men\'s Red Moon Rider Graphic Printed T-shirt',
                price: 399,
                originalPrice: 999,
                saved: 600,
                size: 'L',
                qty: 1,
                image: ProductImage2,
                deliveryDate: '25 Jun 2025',
            }
        ]
    }
];

const MyOrders = () => {
    const navigate = useNavigate();

    function formatDateTime(timestamp) {
        const dateObj = new Date(timestamp);

        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        let hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // convert 0 -> 12, 13 -> 1, etc.
        const hourStr = String(hours).padStart(2, '0');

        return `${day}/${month}/${year} at ${hourStr}:${minutes} ${ampm}`;
    }


    function hourOld(createdAt) {
        const createdTime = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const diffInMs = now - createdTime;
        const diffInHours = diffInMs / (1000 * 60 * 60); // milliseconds to hours
        return diffInHours < 1; // true if order is less than 1 hour old
    }


    return (
        <div className="my-order-left">
            <div className="my-order-saving-banner">
                <span>You can cancel your order only within 1 hour of placing it — not after 1 hour.</span>
            </div>

            {cartData.map((group, i) => (
                <div className="my-order-group" key={i}>
                    <div className="my-order-group-header">
                        <h4>{formatDateTime(group.createdAt)}</h4>
                        {hourOld(group.createdAt) && <span to={`/collection/${group.routeOffer}`} className="my-order-add-items-btn">Cancel Order</span>}
                    </div>
                    {group.products.map((product) => (
                        <div className="my-order-product" key={product.id} onClick={() => navigate("/product/product1")}>
                            <div className="my-order-product-image-info-container">
                                <div className="my-order-product-image-container">
                                    <img src={product.image} alt={product.title} className="my-order-product-image" />
                                </div>

                                <div className="my-order-product-info">
                                    <div className="my-order-product-title-section">
                                        <div className="my-order-product-text">
                                            <h5 className='my-order-product-brand-name'>Bewakoof®</h5>
                                            <p className='my-order-product-name'>{product.title}</p>
                                            
                                        </div>
                                        <div className="my-order-product-footer ">
                                            <div className="my-order-footer-button-group">
                                                <div className="my-order-footer-option-button">Size: {product.size}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default MyOrders;
