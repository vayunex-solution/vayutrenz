import React, { useEffect, useState } from "react";
import { useCategoryStore } from "../../Store/useWebStores/useCategoryStore";
import "./CreateCategoryForm.css";

const CreateCategoryForm = () => {
    const [form, setForm] = useState({
        categoryName: "",
        categoryType: "",
        categoryImage: "",
        gender: "",
        description: "",
        isActive: false,
    });

    const [selectedCategory, setSelectedCategory] = useState(null);
    const isEditing = !!selectedCategory;

    const { categoryMap, createCategory, newCategory, fetchCategories, editCategory, deleteCategory } = useCategoryStore();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const resetForm = () => {
        setForm({
            categoryName: "",
            categoryType: "",
            categoryImage: "",
            gender: "",
            description: "",
            isActive: false,
        });
        setSelectedCategory(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await editCategory(selectedCategory._id, form);
        } else {
            await createCategory(form);
        }
        await fetchCategories();
        resetForm();
    };

    const handleGenderChange = (genderValue) => {
        setForm((prev) => ({
            ...prev,
            gender: prev.gender === genderValue ? "" : genderValue,
        }));
    };

    const handleEditClick = () => {
        if (selectedCategory) {
            setForm({
                categoryName: selectedCategory.categoryName || "",
                categoryType: selectedCategory.categoryType || "",
                categoryImage: selectedCategory.categoryImage || "",
                gender: selectedCategory.gender || "",
                description: selectedCategory.description || "",
                isActive: selectedCategory.isActive || false,
            });
        }
    };

    const handleDeleteClick = async () => {
        if (selectedCategory && window.confirm("Are you sure you want to delete this category?")) {
            console.log("delete");
            await deleteCategory(selectedCategory._id);
            await fetchCategories();
            resetForm();
        }
    };

    return (
        <div className="create-category-form-container">
            <form onSubmit={handleSubmit} className="create-category-form-form">
                <h2>{isEditing ? "Edit Category" : "Create New Category"}</h2>

                <label className="create-category-form-label">
                    <p>Name:</p>
                    <input
                        className="create-category-form-input-box"
                        placeholder="Category Name"
                        value={form.categoryName}
                        onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                        required
                    />
                </label>

                <label className="create-category-form-label">
                    <p>Category Type:</p>
                    <input
                        className="create-category-form-input-box"
                        placeholder="Category Type"
                        value={form.categoryType}
                        onChange={(e) => setForm({ ...form, categoryType: e.target.value })}
                        required
                    />
                </label>

                <label className="create-category-form-label">
                    <p>Category Image URL</p>
                    <input
                        className="create-category-form-input-box"
                        placeholder="Category Image URL"
                        value={form.categoryImage}
                        onChange={(e) => setForm({ ...form, categoryImage: e.target.value })}
                    />
                </label>

                <div className="create-category-form-gender">
                    <p>Gender:</p>
                    {["men", "women", "unisex"].map((g) => (
                        <label key={g}>
                            <input
                                type="checkbox"
                                className="create-category-form-checkbox"
                                checked={form.gender === g}
                                onChange={() => handleGenderChange(g)}
                            />
                            {g}
                        </label>
                    ))}
                </div>

                <label className="create-category-form-label">
                    <p>Description:</p>
                    <textarea
                        className="create-category-form-input-box"
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </label>

                <br />
                <button type="submit" className="create-category-form-button">
                    {isEditing ? "Update Category" : "Create Category"}
                </button>
                {isEditing && (
                    <button type="button" onClick={resetForm} className="create-category-form-cancel-button">
                        Cancel Edit
                    </button>
                )}
            </form>

            {selectedCategory && (
                <div className="create-category-form-edit-delete-button">
                    <p>Selected Category: <b>{selectedCategory.categoryName}</b></p>
                    <div className="create-category-form-button-container">
                        <button className="create-category-form-edit-button" onClick={handleEditClick}>
                            Edit Category
                        </button>
                        <button className="create-category-form-delete-button" onClick={handleDeleteClick}>
                            Delete Category
                        </button>
                    </div>
                </div>
            )}

            <h2>All Categories</h2>
            <div className="create-category-form-list">
                {Object.entries({ ...newCategory, ...categoryMap }).map(([type, categories]) => (
                    <div key={type} className="create-category-form-type-block">
                        <h3>{type}</h3>
                        <ul className="create-category-form-ul">
                            {categories.map((cat) => (
                                <li
                                    key={cat._id}
                                    className="create-category-form-li"
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat.categoryName}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreateCategoryForm;
