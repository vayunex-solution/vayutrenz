import React, { useState } from "react";
import "./CartSelectModal.css";

// ✅ Reusable Modal Component
const CartSelectModal = ({
    type,
    selectedProduct,
    selectedValue,
    productData,
    setProductData,
    updateCartProductSize,
    updateCartProductQuantity,
    setIsCartSelect,
}) => {
    const [currentSelection, setCurrentSelection] = useState(selectedValue);
    const isChanged = currentSelection !== selectedValue;

    const quantityArray = Array.from({ length: 5 }, (_, i) => (i + 1));
    const sizeArray = ["S", "M", "L", "XL", "2XL", "3XL"];

    const title = type === "size" ? "Choose your perfect fit!" : "Select Quantity";

    const handleClose = () => setIsCartSelect(null);

    return (
        <div className="cart-select-overlay" onClick={handleClose}>
            <div className="cart-select-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cart-select-header">
                    <p>{title}</p>
                    <button className="cart-select-close" onClick={handleClose}>✕</button>
                </div>

                <div className="cart-select-options">
                    {(type === "size" ? sizeArray : quantityArray).map((item) => {
                        let isOut, isLow;
                        if (type === "size") {
                            isOut = !selectedProduct.sizes?.includes(item);
                            isLow = selectedProduct.lowStockSizes?.includes(item);
                        }
                        const isSelected = currentSelection === item;

                        return (
                            <div key={item} className="cart-select-size-wrapper">
                                <button
                                    style={{ outline: "none" }}
                                    disabled={isOut}
                                    className={`cart-select-option 
                                        ${isSelected ? "cart-select-selected" : ""}
                                        ${isLow ? "cart-select-lowstock" : ""}
                                    `}
                                    onClick={() => !isOut && setCurrentSelection(item)}
                                >
                                    {item}
                                </button>
                                {isLow && !isOut && (
                                    <div className="cart-select-lowstock-text">Low stock</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* {type === "size" && (
                    <div className="cart-select-fit-text">
                        <span>Fits to (Waist): <strong>30</strong></span>
                        <span>Fits to (Outseam Length): <strong>38.0</strong></span>
                    </div>
                )} */}

                <button
                    className={`cart-select-confirm ${!isChanged ? "cart-select-disabled" : ""}`}
                    disabled={!isChanged}
                    onClick={() =>
                        type === "size"
                            ? handleSizeConfirm({
                                selectedProduct,
                                currentSize: currentSelection,
                                productData,
                                setProductData,
                                updateCartProductSize,
                                setIsCartSelect,
                            })
                            : handleQuantityConfirm({
                                selectedProduct,
                                currentQuantity: parseInt(currentSelection),
                                productData,
                                setProductData,
                                updateCartProductQuantity,
                                setIsCartSelect,
                            })
                    }
                >
                    CONFIRM
                </button>
            </div>
        </div>
    );
};

export default CartSelectModal;

// ✅ Handle Size Update
const handleSizeConfirm = async ({
    selectedProduct,
    currentSize,
    productData,
    setProductData,
    updateCartProductSize,
    setIsCartSelect,
}) => {
    try {
        const res = await updateCartProductSize(selectedProduct.id, currentSize);
        if (res?.success) {
            const updatedProducts = productData.map((p) =>
                p.id === selectedProduct.id ? { ...p, selectedSize: currentSize } : p
            );
            setProductData(updatedProducts);
            setIsCartSelect(null);
        }
    } catch (error) {
        console.error("Failed to update size:", error);
    }
};

// ✅ Handle Quantity Update
const handleQuantityConfirm = async ({
    selectedProduct,
    currentQuantity,
    productData,
    setProductData,
    updateCartProductQuantity,
    setIsCartSelect,
}) => {
    try {
        const res = await updateCartProductQuantity(selectedProduct.id, currentQuantity);

        if (res?.success) {
            const updatedProducts = productData.map((p) =>
                p.id === selectedProduct.id
                    ? {
                        ...p,
                        price: (p.price / (p.quantity || 1)) * currentQuantity, // adjust if already multiplied
                        originalPrice: (p.originalPrice / (p.quantity || 1)) * currentQuantity,
                        quantity: currentQuantity,
                    }
                    : p
            );

            setProductData(updatedProducts);
            setIsCartSelect(null);
        }
    } catch (error) {
        console.error("Failed to update quantity:", error);
    }
};

