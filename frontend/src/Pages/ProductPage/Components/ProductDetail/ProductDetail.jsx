import React, { useState } from "react";
import "./ProductDetail.css";
import { Heart, ShoppingBag, Star } from "lucide-react";


const ProductDetail = ({productDetails}) => {
    const [selectedColor, setSelectedColor] = useState(productDetails?.colors[0]);
    const [selectedSize, setSelectedSize] = useState(null);

    return (
        productDetails && (<div className="product-detail-container-box">
            <h2 className="brand">{productDetails.business.businessName || "Business"}</h2>
            <p className="title">{productDetails.name}</p>

            <div className="price-section">
                <span className="current-price">₹{productDetails.price}</span>
                <span className="original-price">₹{productDetails.originalPrice}</span>
                <span className="discount">{productDetails.discount}% OFF</span>
                <div className="rating">
                    <Star size={16} fill="gold" stroke="none" /> {productDetails.rating} |{" "}
                    {productDetails.reviews}
                </div>
            </div>

            <p className="sold-info">many people bought this in the last 7 days</p>
            <div className="tag">100% Cotton</div>

            <div className="section">
                <span className="section-label">Colour:</span>{" "}
                {productDetails.selectedColor}
                <div className="color-list">
                    {productDetails.colors.map((color, index) => (
                        <div
                            key={index}
                            className={`color-circle ${selectedColor === color ? "active" : ""
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSelectedColor(color)}
                        />
                    ))}
                </div>
            </div>

            <div className="section">
                <div className="size-header">
                    <span>Select Size</span>
                    <a href="#size-guide" className="guide">
                        Size guide
                    </a>
                </div>
                <div className="size-list">
                    {productDetails.sizes.map((size, index) => (
                        <div
                            key={index}
                            className={`size-btn ${selectedSize === size ? "active" : ""} ${productDetails.lowStockSize === size ? "low-stock" : ""
                                }`}
                            onClick={() => setSelectedSize(size)}
                        >
                            {size}
                        </div>
                    ))}
                    <div className="size-btn disabled">
                        {productDetails.outOfStockSize}
                    </div>
                </div>
                {selectedSize === productDetails.lowStockSize && (
                    <span className="low-stock-text">4 left</span>
                )}
            </div>

            <div className="action-buttons">
                <div className="add-btn"><ShoppingBag size={16}/> ADD TO BAG</div>
                <div className="wishlist-btn"><Heart size={16}/> WISHLIST</div>
            </div>

            <div className="offers">
                <div className="offer-card">
                    <span role="img" aria-label="tag">
                        🏷️
                    </span>{" "}
                    {productDetails.offer.label || "Offer included"}
                    <div className="auto-applied">Auto applied offer</div>
                    {/* <a href="#view-all" className="view-all">
                        View all items ›
                    </a> */}
                </div>
            </div>
                
            {/* Delivery Section */}
            {/* <div className="delivery-box">
                <p className="section-heading">Check for Delivery Details</p>
                <div className="delivery-info">
                    <p>Delivering to <strong>135001</strong> ✏️</p>
                    <div className="delivery-status">
                        <p><span role="img" aria-label="truck">📦</span> Get this product by <span className="delivery-date">Mon, 30 Jun</span></p>
                        <p className="size-info">For sizes: S, M, L, XL, 2XL, 3XL</p>
                        <p className="cod">💰 <strong>Cash on Delivery</strong> available</p>
                    </div>
                </div>
            </div> */}

            {/* Key Highlights */}
            <div className="key-highlights">
                <h3 className="section-heading">Key Highlights</h3>
                <div className="highlight-grid">
                    {productDetails.keyHighlights.map((item,index)=>(
                        <div key={index}>
                            <strong>{item.title}</strong>
                            <br />
                            {item.value}
                        </div>
                        
                    ))}
                </div>
            </div>

            {/* Accordion-style Section */}
            <div className="accordion-box">
                <div className="accordion-item">
                    <p><strong>📄 Product Description</strong></p>
                    <p className="accordion-sub">{productDetails.productDescription}</p>
                </div>
                {/* <div className="accordion-item">
                    <p><strong>🔄 15 Days Returns & Exchange</strong></p>
                    <p className="accordion-sub">Know about return & exchange policy</p>
                </div> */}
            </div>

            {/* Footer icons */}
            <div className="bottom-icons">
                <div>✅<br />100% Genuine Product</div>
                <div>🔐<br />100% Secure Payment</div>
                <div>🔄<br />Easy Returns & Instant Refunds</div>
            </div>

            {/* Product Reviews Section */}
            {productDetails.rating? <div className="product-reviews-box">
                <div className="review-tabs">
                    <button className="active">Product Reviews</button>
                </div>

                <div className="review-rating-summary">
                    <div className="average-rating">4.4</div>
                    <div className="rating-details">
                        <p className="rating-count">417 ratings</p>
                        <div className="star-row">
                            ⭐⭐⭐⭐✬
                        </div>
                        <button className="rate-button">RATE</button>
                    </div>
                </div>

                <div className="rating-bar-group">
                    <div className="bar-item"><span>5</span><div className="outer-bar"><div className="bar green" style={{ width: '70%',height:"8px" }}></div></div><span className="count">(230)</span></div>
                    <div className="bar-item"><span>4</span><div className="outer-bar"><div className="bar light-green" style={{ width: '40%' }}></div></div><span className="count">(130)</span></div>
                    <div className="bar-item"><span>3</span><div className="outer-bar"><div className="bar orange" style={{ width: '15%' }}></div></div><span className="count">(56)</span></div>
                    <div className="bar-item"><span>2</span><div className="outer-bar"><div className="bar grey" style={{ width: '1%' }}></div></div><span className="count">(0)</span></div>
                    <div className="bar-item"><span>1</span><div className="outer-bar"><div className="bar red" style={{ width: '1%' }}></div></div><span className="count">(1)</span></div>
                </div>
            </div>:""}


        </div>)
    );
};

export default ProductDetail;
