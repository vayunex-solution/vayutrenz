import React, { useEffect, useState } from "react";
import "../../AddProductPage/AddProductPage.css";
import { useAuthStore } from "../../../Store/useAuthStore";
import { useSellerStore } from "../../../Store/useAuthSellerStore";
import { useCategoryStore } from "../../../Store/useWebStores/useCategoryStore";
import { useDataStore } from "../../../Store/useDataStore";

const ProductEditingComponent = ({productId,setSelectedProductForEditing}) => {
    const { authUser } = useAuthStore();
    const { categoryMap, newCategory, fetchCategories } = useCategoryStore();
    const { getProductById } = useDataStore();
    const { updateProduct } = useSellerStore();

    const [formData, setFormData] = useState(null);
    
    useEffect(() => {
        console.log(productId);
        fetchCategories();
        (async () => {
            const product = await getProductById(productId);
            if (product) {
                setFormData({
                    ...product,
                    colors: product.colors?.join(", ") || "",
                    sizes: product.sizes?.join(", ") || "",
                    moreImages: product.moreImages?.join(", ") || "",
                    offerDetails: {
                        productNumber: product.offerDetails?.productNumber || "",
                        comboPrice: product.offerDetails?.comboPrice || "",
                    },
                });
            }
        })();
    }, [fetchCategories, getProductById, productId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOfferDetailsChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            offerDetails: {
                ...prev.offerDetails,
                [name]: value,
            },
        }));
    };

    const handleKeyHighlightChange = (index, field, value) => {
        const updated = [...formData.keyHighlights];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, keyHighlights: updated }));
    };

    const addKeyHighlight = () => {
        setFormData((prev) => ({
            ...prev,
            keyHighlights: [...prev.keyHighlights, { title: "", value: "" }],
        }));
    };

    const handleCheckboxChange = (category) => {
        setFormData((prev) => {
            const exists = prev.categories.includes(category);
            const updated = exists
                ? prev.categories.filter((cat) => cat !== category)
                : [...prev.categories, category];
            return { ...prev, categories: updated };
        });
    };

    const handleSubmit = async () => {
        const updatedData = {
            ...formData,
            business: authUser.business,
            price: Number(formData.price),
            originalPrice: Number(formData.originalPrice),
            discount: Number(formData.discount),
            offerDetails: {
                productNumber: Number(formData.offerDetails.productNumber),
                comboPrice: Number(formData.offerDetails.comboPrice),
            },
            colors: formData.colors.split(",").map((c) => c.trim()),
            sizes: formData.sizes.split(",").map((s) => s.trim()),
            moreImages: formData.moreImages.split(",").map((img) => img.trim()),
        };
        await updateProduct(productId, updatedData);
        setSelectedProductForEditing("")
    };

    if (!formData) return <p><button style={{backgroundColor:"red",height:"fitContend",width:"fitContend",color:"white"}} onClick={()=>setSelectedProductForEditing("")}>×</button><br />Loading product data...</p>;

    return (
        <div className="add-product-page-main">
            <div className="add-product-page-container">
                <button style={{backgroundColor:"red",height:"fitContend",width:"fitContend",color:"white"}} onClick={()=>setSelectedProductForEditing("")}>×</button><br />
                <h2 className="add-product-page-title">Edit Product</h2>

                <div className="add-product-page-form">
                    <div className="add-product-image-preview">
                        {[formData.image, ...formData.moreImages.split(",")].filter(Boolean).map((src, idx) => (
                            <img key={idx} src={src} alt={`preview-${idx}`} />
                        ))}
                    </div>

                    {[
                        ["Name", "name", "text"],
                        ["Price", "price", "number"],
                        ["Original Price", "originalPrice", "number"],
                        ["Main Image URL", "image", "text"],
                        ["More Images (comma separated)", "moreImages", "text"],
                        ["Gender (male, female, unisex)", "gender", "text"],
                        ["Discount", "discount", "number"],
                        ["Colors (comma separated)", "colors", "text"],
                        ["Selected Color", "selectedColor", "text"],
                        ["Sizes (comma separated)", "sizes", "text"],
                        ["Out of Stock Size", "outOfStockSize", "text"],
                        ["Low Stock Size", "lowStockSize", "text"],
                        ["Offer", "offer", "text"],
                    ].map(([label, name, type]) => (
                        <label key={name}>
                            {label}:
                            <input
                                name={name}
                                type={type}
                                value={formData[name]}
                                onChange={handleInputChange}
                            />
                        </label>
                    ))}

                    <label>
                        Product Number (Offer):
                        <input
                            name="productNumber"
                            type="number"
                            value={formData.offerDetails.productNumber}
                            onChange={handleOfferDetailsChange}
                        />
                    </label>

                    <label>
                        Combo Price (Offer):
                        <input
                            name="comboPrice"
                            type="number"
                            value={formData.offerDetails.comboPrice}
                            onChange={handleOfferDetailsChange}
                        />
                    </label>

                    <label>
                        Product Description:
                        <textarea
                            name="productDescription"
                            value={formData.productDescription}
                            onChange={handleInputChange}
                        />
                    </label>

                    <div className="add-product-page-category-dropdown">
                        <span>Categories:</span>
                        {categoryMap &&
                            Object.entries({ ...newCategory, ...categoryMap }).map(([type, list]) => (
                                <div key={type}>
                                    <strong>{type}</strong>
                                    <div className="add-product-page-checkbox-group">
                                        {list.map((cat) => (
                                            <label key={cat._id}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.categories.includes(cat._id)}
                                                    onChange={() => handleCheckboxChange(cat._id)}
                                                />
                                                {cat.categoryName}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="add-product-page-keyhighlights">
                        <span>Key Highlights:</span>
                        {formData.keyHighlights.map((kh, index) => (
                            <div key={index}>
                                <input
                                    placeholder="Title"
                                    value={kh.title}
                                    onChange={(e) =>
                                        handleKeyHighlightChange(index, "title", e.target.value)
                                    }
                                />
                                <input
                                    placeholder="Value"
                                    value={kh.value}
                                    onChange={(e) =>
                                        handleKeyHighlightChange(index, "value", e.target.value)
                                    }
                                />
                            </div>
                        ))}
                        <button type="button" onClick={addKeyHighlight}>
                            + Add Key Highlight
                        </button>
                    </div>

                    <button className="add-product-page-submit" onClick={handleSubmit}>
                        Update Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductEditingComponent;
