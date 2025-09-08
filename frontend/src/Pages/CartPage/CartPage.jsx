import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, ShoppingCart, PackageCheck, AwardIcon } from 'lucide-react';
import './CartPage.css';
// import ProductImage2 from "../../assets/product-image2.png"
import WishList from "../WishList/WishList.jsx"
import { useUserStore } from '../../Store/useAuthUserStore.js';
import { useAuthStore } from '../../Store/useAuthStore.js';
import CartSelectModal from './Components/CartSelectModal/CartSelectModal.jsx';
import {useWebNavStore} from "../../Store/useWebStores/useWebNavStore"

const CartPage = () => {
    const {setIsLoadingComponent} = useWebNavStore();
    const { authUser } = useAuthStore();
    const { getCartData, userWishlist, deleteProductFromCart, updateCartProductSize, updateCartProductQuantity } = useUserStore();
    const [openPriceSummary, setOpenPriceSummary] = useState(false);
    const navigate = useNavigate();

    const [productData, setProductData] = useState(null)
    const [cartData, setCartData] = useState(null)
    const [isCartSelect, setIsCartSelect] = useState(null);
    const [selectedProduct, setSelectProduct] = useState(null);
    const [isRemoveActive, setIsRemoveActive] = useState(false)

    const [totalOriginalPrice, setTotalOriginalPrice] = useState(0);
    const [totalNewPrice, setTotalNewPrice] = useState(0);
    const [subTotalPrice, setSubTotalPrice] = useState(0);

    const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        const handelGetCartData = async () => {
            setIsLoadingComponent(true);
            setProductData(await getCartData(authUser._id));
            setIsLoadingComponent(false);
        }
        authUser && handelGetCartData();
    }, [getCartData, authUser, userWishlist,setIsLoadingComponent])

    // console.log("data=", productData);

    const groupProductsByBusinessAndOffer = React.useCallback((data) => {
        const grouped = new Map();
        const finalGroups = [];

        let totalOriginalPrice = 0;
        let totalNewPrice = 0;
        let subTotalPrice = 0;
        let totalProductsQuantity = 0;

        // 1️⃣ Group products and accumulate price totals
        for (const product of data) {
            const productNumber = product?.offerDetails?.productNumber;
            const comboPrice = product?.offerDetails?.comboPrice;

            const key =
                productNumber && comboPrice
                    ? `${product.business?.businessName || ""}--${productNumber}--${comboPrice}`
                    : `${product._id}--no-offer`;

            if (!grouped.has(key)) {
                grouped.set(key, []);
            }

            grouped.get(key).push(product);

            totalOriginalPrice += product.originalPrice || 0;
            totalNewPrice += product.price || 0;
            totalProductsQuantity += product.quantity || 1;
        }

        // 2️⃣ Process each group
        for (const [key, group] of grouped.entries()) {
            !grouped && console.log("key", key);
            const sampleProduct = group[0];
            const productNumber = parseInt(sampleProduct?.offerDetails?.productNumber);
            const comboPrice = parseFloat(sampleProduct?.offerDetails?.comboPrice);

            const isValidCombo =
                Number.isInteger(productNumber) && productNumber > 0 && comboPrice;

            if (!isValidCombo) {
                group.forEach((product) => {
                    finalGroups.push({ products: [product] });
                    subTotalPrice += product.price || 0; // individual price
                });
            } else {
                let start = 0;
                while (start < group.length) {
                    const chunk = group.slice(start, start + productNumber);
                    finalGroups.push({ products: chunk });

                    if (chunk.length === productNumber) {
                        subTotalPrice += comboPrice; // valid combo
                    } else {
                        // incomplete combo → add individual prices
                        subTotalPrice += chunk.reduce(
                            (sum, p) => sum + (p.price || 0),
                            0
                        );
                    }

                    start += productNumber;
                }
            }
        }

        setTotalOriginalPrice(totalOriginalPrice);
        setTotalNewPrice(totalNewPrice);
        setSubTotalPrice(subTotalPrice);
        setCartData(finalGroups);
        setTotalProducts(totalProductsQuantity);

    }, []);




    useEffect(() => {
        if (productData) {
            // console.log("productData", productData);
            groupProductsByBusinessAndOffer(productData);
        }
    }, [productData, groupProductsByBusinessAndOffer])

    const handelDeleteProductFromCart = async (productId) => {
        await deleteProductFromCart(productId)
        setProductData(productData.filter((product) => product.id !== productId))
    }



    const RemoveProduct = (product) => {

        return (
            <div className="cart-select-overlay" onClick={() => setIsRemoveActive(false)}>
                <div className="cart-select-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="cart-select-header">
                        <p>Remove product from Cart</p>
                        <button className="cart-select-close" onClick={() => setIsRemoveActive(false)}>✕</button>
                    </div>

                    <div className="cart-product">
                        <div className="cart-product-image-info-container">
                            <div className="cart-product-image-container" style={{ flexShrink: '0', width: '120px', height: '150px' }}>
                                <img src={product.image} alt={product.title} className="product-image" style={{ flexShrink: '0' }} />
                            </div>

                            <div className="cart-product-info"  style={{width:"fitContend"}}>
                                <div className="cart-product-title-section">
                                    <div className="cart-product-text">
                                        <h5 className='cart-product-brand-name'>{product.business.businessName}</h5>
                                        <p className='cart-product-name'>{product.title}</p>
                                        <p className="cart-item-offer-text" style={{ padding: "0", margin: '0' }}>{product.offerDetails.productNumber ? "Buy " + product.offerDetails.productNumber + " for " + product.offerDetails.comboPrice : product.offer}</p>
                                        <p className="cart-item-delivery-date">
                                            <span className="green-dot" /> Get it by <b>{product.deliveryDate}</b>
                                        </p>
                                    </div>
                                    <div className="cart-product-footer">
                                        <div className="cart-footer-product-price">
                                            <div className='cart-footer-price-box'>
                                                <p className="cart-footer-final-price">₹{product.price}</p>
                                                <p className="cart-footer-original-price">₹{product.originalPrice}</p>
                                            </div>
                                            <p className="cart-footer-saved-text">You saved ₹{product.originalPrice - product.price}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                    <button
                        className={`cart-select-confirm`}
                        onClick={() => {handelDeleteProductFromCart(product.id),setIsRemoveActive(false)}}
                    >
                        Remove
                    </button>
                </div>
            </div>
        )
    }

    if (!cartData) {
        return (
            <div></div>
        )
    }

    return (
        <div className="cart-page">
            <div className="cart-information-container">
                <div className='cart-heading-container'>
                    <span className="cart-term">Cart</span>
                    <span className="cart-item-count">({totalProducts} Items)</span>
                </div>
                <div className="cart-data">
                    <div className="cart-left">
                        <div className="cart-saving-banner">
                            <span>You are saving ₹2199 on this order</span>
                        </div>

                        {cartData.map((group, i) => (
                            <div className="cart-group" key={i}>
                                <div className="cart-group-header">
                                    <h4>{group.products[0].offer}</h4>
                                    {group.products.length !== group.products[0].offerDetails.productNumber && <Link to={`/collection/${group.products[0].offer}`} className="add-items-btn">ADD ITEMS</Link>}
                                </div>
                                {group.products.map((product, index) => (
                                    <div className="cart-product" key={index}>
                                        <div className="cart-product-image-info-container">
                                            <div className="cart-product-image-container">
                                                <img src={product.image} alt={product.title} className="product-image" />
                                            </div>

                                            <div className="cart-product-info">
                                                <div className="cart-product-title-section">
                                                    <div className="cart-product-text">
                                                        <h5 className='cart-product-brand-name'>{product.business.businessName}</h5>
                                                        <p className='cart-product-name'>{product.title}</p>
                                                        <p className="cart-item-offer-text">{product.offerDetails.productNumber ? "Buy " + product.offerDetails.productNumber + " for " + product.offerDetails.comboPrice : product.offer}</p>
                                                        <p className="cart-item-delivery-date">
                                                            <span className="green-dot" /> Get it by <b>{product.deliveryDate}</b>
                                                        </p>
                                                    </div>
                                                    <div className="cart-product-footer disable-ls-1000">
                                                        <div className="cart-footer-button-group">
                                                            <button className="cart-footer-option-button" onClick={() => { setIsCartSelect("size"), setSelectProduct(product) }}>Size: {product.selectedSize}<ChevronDown size={18} /></button>
                                                            <button className="cart-footer-option-button" onClick={() => { setIsCartSelect("quantity"), setSelectProduct(product) }}>Qty: {product.quantity}<ChevronDown size={18} /></button>
                                                        </div>
                                                        <div className="cart-footer-product-price">
                                                            <div className='cart-footer-price-box'>
                                                                <p className="cart-footer-final-price">₹{product.price}</p>
                                                                <p className="cart-footer-original-price">₹{product.originalPrice}</p>
                                                            </div>
                                                            <p className="cart-footer-saved-text">You saved ₹{product.originalPrice - product.price}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="remove-btn" onClick={() => { setSelectProduct(product), setIsRemoveActive(true) }}>✕</button>
                                            </div>
                                        </div>
                                        <div className="cart-product-footer enable-ls-1000">
                                            <div className="cart-footer-button-group">
                                                <button className="cart-footer-option-button" onClick={() => { setIsCartSelect("size"), setSelectProduct(product) }}>Size: {product.size}<ChevronDown size={18} /></button>
                                                <button className="cart-footer-option-button" onClick={() => { setIsCartSelect("quantity"), setSelectProduct(product) }}>Qty: {product.quantity}<ChevronDown size={18} /></button>
                                            </div>
                                            <div className="cart-footer-product-price">
                                                <div className='cart-footer-price-box'>
                                                    <p className="cart-footer-final-price">₹{product.price}</p>
                                                    <p className="cart-footer-original-price">₹{product.originalPrice}</p>
                                                </div>
                                                <p className="cart-footer-saved-text">You saved ₹{product.originalPrice - product.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                    </div>

                    <div className="cart-right">
                        <div className="cart-right-delivery-section">
                            <div className="cart-right-header">
                                <span>
                                    Deliver to: <b>135001</b>
                                </span>
                                <button
                                    className="cart-right-change-btn"
                                    onClick={() => navigate('/change-address')}
                                    style={{ outline: 'none' }}
                                >
                                    Change
                                </button>
                            </div>
                        </div>

                        <div className="cart-right-coupon-section">
                            <h4 className="cart-right-coupon-heading">Coupons & Offers</h4>

                            <div className="cart-right-header">
                                <div className="cart-right-icon-text">
                                    <div className="cart-right-percent-icon">%</div>

                                    <div className="cart-right-title">
                                        <span className="cart-right-bold-text">
                                            Apply Coupon / Gift Card
                                        </span>
                                        <p className="cart-right-subtext">
                                            Crazy deals and other amazing offers
                                        </p>
                                    </div>
                                </div>

                                <button
                                    className="cart-right-view-btn"
                                    style={{ outline: 'none' }}
                                >
                                    VIEW
                                </button>
                            </div>
                        </div>


                        <div className="cart-right-price-summary">
                            <div className="cart-right-header" onClick={() => setOpenPriceSummary(!openPriceSummary)}>
                                <h4 className="cart-right-title">Price Summary</h4>
                                <span className="cart-right-toggle-icon">
                                    <ChevronUp
                                        size={18}
                                        className={openPriceSummary ? "cart-transition-rotate-up" : "cart-transition-rotate-down"}
                                    />
                                </span>
                            </div>
                            <div className="cart-right-summary-item cart-right-subtotal">
                                <span>Subtotal</span>
                                <span>₹{subTotalPrice}</span>
                            </div>

                            <div className={`cart-right-details ${openPriceSummary ? 'open-cart-right-details' : 'closed-cart-right-details'}`}>
                                <div className="cart-right-summary-item">
                                    <span>Total MRP</span>
                                    <span>₹{totalOriginalPrice}</span>
                                </div>
                                <div className="cart-right-summary-item cart-right-discount">
                                    <span>Bag Discount</span>
                                    <span>-₹{totalOriginalPrice - totalNewPrice}</span>
                                </div>
                                <div className="cart-right-summary-item cart-right-discount">
                                    <span>
                                        Combo Offer Discount <a href="#">T&C</a>
                                    </span>
                                    <span>-₹{totalNewPrice - subTotalPrice}</span>
                                </div>
                                <div className="cart-right-summary-item">
                                    <span>Delivery Fee</span>
                                    <span className="cart-right-green">Free</span>
                                </div>
                            </div>

                            <p className="cart-right-free-msg">
                                Yay! You get <b>FREE delivery</b> on this order
                            </p>
                            <button
                                className="cart-right-proceed-btn"
                                style={{ outline: 'none' }}
                            >
                                PROCEED
                            </button>
                        </div>

                        <div className="cart-right-bottom-footer">
                            <div className="cart-right-feature-item">
                                <ShoppingCart size={40} color="#A6A6A6" />
                                <span>100% Secure Payment</span>
                            </div>
                            <div className="cart-right-feature-item">
                                <PackageCheck size={40} color="#A6A6A6" />
                                <span>Easy Returns & Instant Refunds</span>
                            </div>
                            <div className="cart-right-feature-item">
                                <AwardIcon size={40} color="#A6A6A6" />
                                <span>Quality Assurance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="cart-wishlist-container">
                <WishList />
            </div>

            {isRemoveActive && RemoveProduct(selectedProduct)}

            {isCartSelect && selectedProduct && (
                <CartSelectModal
                    type={isCartSelect}
                    selectedProduct={selectedProduct}
                    selectedValue={
                        isCartSelect === "size"
                            ? selectedProduct.selectedSize
                            : selectedProduct.quantity // or selectedProduct.quantity if needed
                    }
                    productData={productData}
                    setProductData={setProductData}
                    updateCartProductSize={updateCartProductSize}
                    updateCartProductQuantity={updateCartProductQuantity}
                    setIsCartSelect={setIsCartSelect}
                />
            )}


        </div>
    );
};

export default CartPage;
