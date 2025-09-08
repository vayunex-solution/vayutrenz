import React, { useState } from "react";
import "./AddToCartSelector.css";
import { X } from "lucide-react";

export default function AddToCartSelector({
  setAddToCartActive,
  sizes = [],
  outOfStockSizes = [],
  lowStockSizes = [],
  colors = [],
  addProductIntoCart,
  productId,
}) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const isConfirmEnabled = selectedSize && selectedColor;

  
    const handelAddToCart = async()=>{
        await addProductIntoCart(
          productId,
          { quantity:1, selectedSize:selectedSize, selectedColor:selectedColor}
        )
        setAddToCartActive("");
    }

  return (
    <div className="add-to-cart-background-hider" onClick={() => setAddToCartActive("")}>
      <div
        className="add-to-cart-selector-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="add-to-cart-selector-header">
          <h4>Choose your perfect fit!</h4>
          <X
            size={20}
            className="add-to-cart-close-icon"
            onClick={() => setAddToCartActive("")}
          />
        </div>

        <div className="add-to-cart-size-options">
          {sizes.map((size) => {
            const isOut = outOfStockSizes.includes(size);
            const isLow = lowStockSizes.includes(size);

            return (
              <button
                style={{outline: "none"}}
                key={size}
                disabled={isOut}
                onClick={() => setSelectedSize(size)}
                className={`add-to-cart-size-btn
                  ${selectedSize === size ? "add-to-cart-selected" : ""}
                  ${isOut ? "add-to-cart-disabled" : ""}
                  ${isLow ? "add-to-cart-low-stock" : ""}`}
              >
                {size}
                {isLow && <div className="add-to-cart-low-stock-text">Low stock</div>}
              </button>
            );
          })}
        </div>

        <div className="add-to-cart-color-options">
          {colors.map((color) => (
            <div
              key={color}
              className={`add-to-cart-color-outer ${
                selectedColor === color ? "add-to-cart-color-selected" : ""
              }`}
              onClick={() => setSelectedColor(color)}
            >
              <div
                className="add-to-cart-color-circle"
                style={{ backgroundColor: color }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={()=>handelAddToCart()}
          className={`add-to-cart-confirm-btn ${isConfirmEnabled ? "add-to-cart-enabled" : ""}`}
          disabled={!isConfirmEnabled}
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
}
