import { create } from "zustand";
import { axiosInstance } from "../../lib/axios.js"; // baseURL should be set

export const useCategoryStore = create((set, get) => ({
    categoryMap: {},
    categoryObj: {},
    newCategory: { "new": [] },
    setCategoryMap: (data) => set({ categoryMap: data }),

    setCategoryObj: (data) => {
        const tempObj = {};
        Object.values(data).forEach((categoryList) => {
            categoryList.forEach(({ _id, categoryName }) => {
                tempObj[_id] = categoryName;
            });
        });
        set({ categoryObj: tempObj });
    },

    fetchCategories: async () => {
        try {
            const res = await axiosInstance.get("/category");
            set({ categoryMap: res.data });
            get().setCategoryObj(res.data);
            // console.log("Fetched Categories:", res.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    },

    createCategory: async (newData) => {
        try {
            const res = await axiosInstance.post("/category", newData);
            console.log("Category created:", res.data);

            set((state) => ({
                newCategory: {
                    ...state.newCategory,
                    new: [...state.newCategory.new, res.data],
                },
            }));

            console.log(res.data);
        } catch (err) {
            console.error("Failed to create category", err);
        }
    },

    editCategory: async (id, updatedData) => {
        try {
            const res = await axiosInstance.put(`/category/${id}`, updatedData);
            set((state) => ({
                categories: state.categories?.map((cat) =>
                    cat._id === id ? res.data.category : cat
                ),
            }));
        } catch (err) {
            console.error("Failed to edit category", err);
        }
    },

    deleteCategory: async (id) => {
        try {
            await axiosInstance.delete(`/category/${id}`);
            set((state) => ({
                newCategory: {
                    ...state.newCategory,
                    new: state.newCategory?.new?.filter((cat) => cat._id !== id),
                },
            }));
            set((state) => ({
                categoryMap: {
                    ...state.categoryMap,
                    new: state.categoryMap?.map(([, categories])=>
                        categories?.filter((cat) => cat._id !== id),
            )},
            }));
        } catch (err) {
            console.error("Failed to delete category", err);
        }
    },

}));
