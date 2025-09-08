import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import "./AddProductPage.css";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import CreateCategoryForm from "../CreateCategoryForm/CreateCategoryForm.jsx"
import { useAuthStore } from "../../Store/useAuthStore.js";
import { useSellerStore } from "../../Store/useAuthSellerStore.js";
import { useCategoryStore } from "../../Store/useWebStores/useCategoryStore.js";

// const fakeCategories = {
//     Clothing: ["T-Shirts", "Shirts", "Jeans"],
//     Footwear: ["Sneakers", "Boots", "Sandals"],
//     Accessories: ["Watches", "Belts", "Sunglasses"],
// };

const AddProductPage = () => {
    const {categoryMap,newCategory,fetchCategories}=useCategoryStore();
    const {createOneProduct,createMultipleProduct} = useSellerStore();
    const { authUser } = useAuthStore();
    const [showForm, setShowForm] = useState(true);
    const [uploadedProducts, setUploadedProducts] = useState([]);
    const [jsonTextInput, setJsonTextInput] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        originalPrice: "",
        image: "",
        moreImages: "",
        gender: "",
        discount: "",
        colors: "",
        selectedColor: "",
        sizes: "",
        outOfStockSize: "",
        lowStockSize: "",
        offer: "",
        offerDetails: {
            productNumber: "",
            comboPrice: "",
        },
        productDescription: "",
        categories: ["686cf5381d373792d0563aa1"],
        keyHighlights: [{ title: "", value: "" }],
    });


    useEffect(() => {
        fetchCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleSubmit = async() => {
        const processedData = {
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
        console.log("Final Product Data:", processedData);
        await createOneProduct(processedData);
    };


    ///////file data///////

    const handleFileData = (products) => {
        const formatted = products.map((product) => ({
            ...product,
            price: Number(product.price),
            originalPrice: Number(product.originalPrice),
            discount: Number(product.discount),
            offerDetails: {
                productNumber: Number(product.offerDetails?.productNumber || 0),
                comboPrice: Number(product.offerDetails?.comboPrice || 0),
            },
            colors: typeof product.colors === "string" ? product.colors.split(",").map((c) => c.trim()) : product.colors,
            sizes: typeof product.sizes === "string" ? product.sizes.split(",").map((s) => s.trim()) : product.sizes,
            moreImages: typeof product.moreImages === "string" ? product.moreImages.split(",").map((i) => i.trim()) : product.moreImages,
            business: authUser.business,
        }));
        setUploadedProducts(formatted);
    };

    const handleJSONUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                handleFileData(Array.isArray(json) ? json : [json]);
            } catch {
                alert("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    };

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => handleFileData(result.data),
        });
    };

    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet);
            handleFileData(data);
        };
        reader.readAsBinaryString(file);
    };

//https://images.bewakoof.com/t1080/men-s-red-toxic-typography-oversized-t-shirt-534819-1736761703-1.jpg
//https://images.bewakoof.com/t1080/men-s-red-toxic-typography-oversized-t-shirt-534819-1680169648-2.jpg,https://images.bewakoof.com/t1080/men-s-red-toxic-typography-oversized-t-shirt-534819-1680169653-3.jpg,https://images.bewakoof.com/t1080/men-s-red-toxic-typography-oversized-t-shirt-534819-1680169659-5.jpg,

    const handlePasteJsonSubmit = () => {
        try {
            const parsed = JSON.parse(jsonTextInput);
            handleFileData(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
            alert("Invalid JSON format");
        }
    };

    const inputFields = [
        ["Name", "name", "text", true],
        ["Price", "price", "number", true],
        ["Original Price", "originalPrice", "number", true],
        ["Main Image URL", "image", "text", false],
        ["More Images (comma separated)", "moreImages", "text", false],
        ["Gender (male, female, unisex)", "gender", "text", false],
        ["Discount", "discount", "number", true],
        ["Colors (comma separated)", "colors", "text", false],
        ["Selected Color", "selectedColor", "text", false],
        ["Sizes (comma separated)", "sizes", "text", false],
        ["Out of Stock Size", "outOfStockSize", "text", false],
        ["Low Stock Size", "lowStockSize", "text", false],
        ["Offer", "offer", "text", false],
    ];

    const exampleJSON = `[
    {
        "name": "Blue Shirt",
        "price": 500,
        "originalPrice": 800,
        "image": "img.jpg",
        "moreImages": "img1.jpg,img2.jpg",
        "gender": "male",
        "discount": 20,
        "colors": "red,blue",
        "selectedColor": "blue",
        "sizes": "S,M,L",
        "outOfStockSize": "L",
        "lowStockSize": "M",
        "offer": "Bye 2 for 900",
        "offerDetails": {
            "productNumber": 2,
            "comboPrice": 900
        },
        "productDescription": "Cotton Shirt"
    }
]`;

    ///////  Submit Multiple Product ////////

    const handleMultipleProductSubmit = async()=>{
        await createMultipleProduct(uploadedProducts);

    }

    return (
        <div className="add-product-page-main">
            <div className="add-product-page-container">
                <h2 className="add-product-page-title">Add New Product</h2>

                <div className="add-product-page-toggle-buttons">
                    <button onClick={() => setShowForm(true)}>+ Add Single Product</button>
                    <button onClick={() => setShowForm(false)}>+ Upload Products by File</button>
                </div>

                {showForm ? (
                    <div className="add-product-page-form">
                        <div className="add-product-image-preview" >
                            {
                                [formData.image, ...formData.moreImages.split(",").map((img) => img.trim())]
                                    .filter(Boolean)
                                    .map((src, idx) => (
                                        <img key={idx} src={src} alt={`preview-${idx}`} />
                                    ))
                            }
                        </div>
                        {inputFields.map(([label, name, type, required]) => (
                            <label key={name}>
                                {label}:
                                <input
                                    name={name}
                                    type={type}
                                    required={required}
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
                            {categoryMap && Object.entries({...newCategory,...categoryMap}).map(([type, list]) => (
                                <div key={type} className="add-product-page-category-dropdown-item">
                                    <strong>{type}</strong>
                                    <div className="add-product-page-checkbox-group">
                                        {list.map((cat) => (
                                            <label key={cat._id} className="add-product-page-checkbox-item">
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
                                <div key={index} className="add-product-page-keyhighlight-row">
                                    <input
                                        placeholder="Title"
                                        value={kh.title}
                                        onChange={(e) => handleKeyHighlightChange(index, "title", e.target.value)}
                                    />
                                    <input
                                        placeholder="Value"
                                        value={kh.value}
                                        onChange={(e) => handleKeyHighlightChange(index, "value", e.target.value)}
                                    />
                                </div>
                            ))}
                            <button type="button" onClick={addKeyHighlight}>
                                + Add Key Highlight
                            </button>
                        </div>

                        <button className="add-product-page-submit" onClick={handleSubmit}>
                            Submit Product
                        </button>
                        <CreateCategoryForm/>
                    </div>
                ) : (
                    <div className="add-product-page-multi-upload">

                        <div className="add-product-page-upload-container">
                            <label style={{ paddingTop: "5px" }}>
                                <b>Upload CSV File (.csv) : {" "}</b>
                                <input type="file" accept=".csv" onChange={handleCSVUpload} />
                            </label>
                            <pre className="add-product-page-example-box">CSV HEADERS: name, price, originalPrice, image, moreImages, gender, discount, colors, selectedColor, sizes, outOfStockSize, lowStockSize, offer, keyHighlights_1_title, keyHighlights_1_value, keyHighlights_2_title, keyHighlights_2_value,productDescription</pre>

                            <label style={{ paddingTop: "5px" }}>
                                <b>Upload Excel File (.xlsx) : {" "}</b>
                                <input type="file" accept=".xlsx" onChange={handleExcelUpload} />
                            </label>
                            <pre className="add-product-page-example-box">Excel Format: Same headers as CSV</pre>

                            <label style={{ paddingTop: "5px" }}>
                                <b>Upload JSON File :{" "}</b>
                                <input type="file" accept=".json" onChange={handleJSONUpload} />
                            </label>
                            <label>
                                <b
                                    style={{ padding: "0", margin: "0",marginTop:"20px" , paddingTop: "5px", display: "block" }}
                                >
                                    Or Paste JSON Data: 
                                    <Upload
                                        size={20}
                                        style={{border:"solid black 2px",width:"50px",padding:"5px",backgroundColor:"#6d6df8ff"}}
                                        onClick={handlePasteJsonSubmit}
                                    />
                                </b>
                                <textarea
                                    className="add-product-page-json-textarea"
                                    name="paste-json"
                                    placeholder="Paste JSON array here..."
                                    value={jsonTextInput}
                                    onChange={(e) => setJsonTextInput(e.target.value)}
                                />
                            </label>

                            <pre className="add-product-page-example-box">{exampleJSON}</pre>

                            <button className="add-product-page-submit" onClick={handleMultipleProductSubmit}>
                                Submit File Data
                            </button>
                        </div>

                        {uploadedProducts.length > 0 && (
                            <div className="">
                                {uploadedProducts.map((product, index) => (
                                    <div className="add-product-image-preview" style={{flex:"1",margin:"5px 0px"}} key={index}>
                                        <b>{index}</b>
                                        {
                                            [product.image, ...product.moreImages]
                                                .filter(Boolean)
                                                .map((src, idx) => (
                                                    <img key={idx} src={src} alt={`preview-${idx}`} />
                                                ))
                                        }
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddProductPage;