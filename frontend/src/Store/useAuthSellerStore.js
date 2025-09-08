import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

export const useSellerStore = create((set,) => ({
    sellerData: null,
    sellerList: [],
    sellerOrders: [],
    isLoading: false,

    sellerBusiness: [],
    sellerProducts: [],
    
    /////categories////////
    categoryMap: {},
    setCategoryMap: (data) => set({ categoryMap: data }),



    // createSeller: async (data) => {
    //     set({ isLoading: true });
    //     try {
    //         const res = await axiosInstance.post("/seller/create", data);
    //         set({ sellerData: res.data });
    //         toast.success("Seller created");
    //     } catch (error) {
    //         toast.error(error.response?.data?.message || "Create failed");
    //     } finally {
    //         set({ isLoading: false });
    //     }
    // },

    deleteSeller: async (sellerId) => {
        try {
            await axiosInstance.delete(`/seller/delete/${sellerId}`);
            toast.success("Seller deleted");
        } catch (error) {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    },

    // updateSellerDetails: async (sellerId, data) => {
    //     try {
    //         const res = await axiosInstance.put(`/seller/update/${sellerId}`, data);
    //         set({ sellerData: res.data });
    //         toast.success("Seller details updated");
    //     } catch (error) {
    //         toast.error(error.response?.data?.message || "Update failed");
    //     }
    // },

    // getSeller: async (userId) => {
    //     try {
    //         const res = await axiosInstance.get(`/seller/${userId}`);
    //         set({ sellerData: res.data });
    //     } catch (error) {
    //         toast.error(error.response?.data?.message || "Fetch failed");
    //     }
    // },

    getAllSellers: async () => {
        try {
            const res = await axiosInstance.get("/seller/all");
            set({ sellerList: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Fetch all sellers failed");
        }
    },

    // updateMobileNumber: async (sellerId, data) => {
    //     try {
    //         const res = await axiosInstance.put(`/seller/phone/${sellerId}`, data);
    //         set({ sellerData: res.data });
    //         toast.success("Phone number updated");
    //     } catch (error) {
    //         toast.error(error.response?.data?.message || "Phone update failed");
    //     }
    // },

    getOrdersDetails: async (sellerId) => {
        try {
            const res = await axiosInstance.get(`/seller/orders/${sellerId}`);
            set({ sellerOrders: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Fetch orders failed");
        }
    },

    getBusiness: async (sellerId) => {
        try {
            const res = await axiosInstance.get(`/seller/business/${sellerId}`);
            set({ sellerBusiness: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Fetch Business failed");
        }
    },

    createBusiness: async (data) => {
        try {
            const res = await axiosInstance.post("/seller/business/create", data);
            toast.success("Business created");
            console.log(res.data);
            set({ sellerBusiness: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Business creation failed");
            return null;
        }
    },

    fetchSellerProducts: async () => {
        try {
            const res = await axiosInstance.get("/seller/get/products");
            set({ sellerProducts: res.data });
        } catch (err) {
            console.error("Failed to fetch seller products", err);
        }
    },


    createOneProduct: async (productData) => {
        try {
            const res = await axiosInstance.post("/seller/create/one-product", productData);
            console.log(res.data);
            toast.success("Product created successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create product");
        }
    },

    createMultipleProduct: async (productArray) => {
        try {
            const res = await axiosInstance.post("/seller/create/multiple-product", productArray);
            console.log(res.data);
            toast.success("Products uploaded successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload products");
        }
    },
    
    updateProduct: async (id, data) => {
        try {
            const res = await axiosInstance.put(`/seller/product/${id}`, data);
            set((state) => ({
                products: state.products.map(p => p._id === id ? res.data : p)
            }));
        } catch (err) {
            console.error("Failed to update product", err);
        }
    },

    deleteProduct: async (id) => {
        try {
            await axiosInstance.delete(`/seller/product/${id}`);
            set((state) => ({
                products: state.products.filter(p => p._id !== id)
            }));
        } catch (err) {
            console.error("Failed to delete product", err);
        }
    },




}));
