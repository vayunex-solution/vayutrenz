/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useDataStore = create((set, get) => ({

    productData: null,
    filteredProducts: [],
    loading: false,
    gender: "male",
    setGender: (gender) => {
        set({ gender: gender });
        localStorage.setItem("WebGender", gender);
    },

    getProductById: async (productId) => {
        try {
            set({ loading: true });

            const res = await axiosInstance.get(`/product/${productId}`);
            set({ productData: res.data, loading: false });
            return res.data;
        } catch (err) {
            console.error("Error fetching product:", err);
            set({ loading: false });
        }
    },
    getMultipleProducts: async (productIds) => {
        try {
            const res = await axiosInstance.post("/product/multiple", { productIds });
            // console.log("Fetched multiple products:", res.data);
            return res.data;
        } catch (err) {
            console.error("Failed to fetch multiple products", err);
        }
    },
    getProductsByCategoryId: async ({ categoryId, gender }) => {
        try {
            // console.log("gender=", gender)
            const res = await axiosInstance.post(`/product/category/${categoryId}`, { gender });
            // console.log("productsByCategory=", res.data.products)
            return res.data.products;
        } catch (err) {
            console.error("Failed to fetch products by CategoryId", err);
        }
    },


    getProductsByCategory: async (data) => {
        try {
            const res = await axiosInstance.post('/product/filter/category', data);
            set({ filteredProducts: res.data });
            return res.data;
        } catch (err) {
            console.error("Failed to fetch products by category", err);
        }
    },
    getProductsByOffer: async (data) => {
        try {
            const res = await axiosInstance.post('/product/filter/offer', data);
            set({ filteredProducts: res.data });
            return res.data;
        } catch (err) {
            console.error("Failed to fetch products by offer", err);
        }
    },

    getProductsByAllCategories: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post('/product/filter/all-categories', data);
            set({ filteredProducts: res.data, loading: false });
            return res.data;
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    getProductsByCategoryArray: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post('/product/filter/category-array', data);
            set({ filteredProducts: res.data, loading: false });
            return res.data;
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },
    getProductsBySearchKeyword: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post('/product/filter/search', data);
            set({ filteredProducts: res.data, loading: false });
            return res.data
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },


    products: [
        {
            image: './product-image2.png',
            label: 'OVERSIZED FIT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Be Yourself Graphic...",
            price: '₹699',
            original: '₹2,249',
            discount: '68% off',
            like: true,
        },
        {
            image: './product-image2.png',
            label: '',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue To The Moon Graphic...",
            price: '₹399',
            original: '₹1,499',
            discount: '73% off',
        },
        {
            image: './product-image2.png',
            label: 'BUY 3 FOR 999',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Hope Graphic Print...",
            price: '₹449',
            original: '₹1,349',
            discount: '66% off',
            like: true,
        },
        {
            image: './product-image2.png',
            label: 'FEW LEFT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Escape Graphic Print...",
            price: '₹499',
            original: '₹1,299',
            discount: '61% off',
        },
        {
            image: './product-image2.png',
            label: 'OVERSIZED FIT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Be Yourself Graphic...",
            price: '₹699',
            original: '₹2,249',
            discount: '68% off',
            like: true,
        },
        {
            image: './product-image2.png',
            label: '',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue To The Moon Graphic...",
            price: '₹399',
            original: '₹1,499',
            discount: '73% off',
        },
        {
            image: './product-image2.png',
            label: 'BUY 3 FOR 999',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Hope Graphic Print...",
            price: '₹449',
            original: '₹1,349',
            discount: '66% off',
        },
        {
            image: './product-image2.png',
            label: 'FEW LEFT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Escape Graphic Print...",
            price: '₹499',
            original: '₹1,299',
            discount: '61% off',
        },

        {
            image: './product-image2.png',
            label: 'OVERSIZED FIT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Be Yourself Graphic...",
            price: '₹699',
            original: '₹2,249',
            discount: '68% off',
        },
        {
            image: './product-image2.png',
            label: '',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue To The Moon Graphic...",
            price: '₹399',
            original: '₹1,499',
            discount: '73% off',
        },
        {
            image: './product-image2.png',
            label: 'BUY 3 FOR 999',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Hope Graphic Print...",
            price: '₹449',
            original: '₹1,349',
            discount: '66% off',
        },
        {
            image: './product-image2.png',
            label: 'FEW LEFT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Escape Graphic Print...",
            price: '₹499',
            original: '₹1,299',
            discount: '61% off',
        },
        {
            image: './product-image2.png',
            label: 'OVERSIZED FIT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Be Yourself Graphic...",
            price: '₹699',
            original: '₹2,249',
            discount: '68% off',
        },
        {
            image: './product-image2.png',
            label: '',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue To The Moon Graphic...",
            price: '₹399',
            original: '₹1,499',
            discount: '73% off',
        },
        {
            image: './product-image2.png',
            label: 'BUY 3 FOR 999',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Hope Graphic Print...",
            price: '₹449',
            original: '₹1,349',
            discount: '66% off',
        },
        {
            image: './product-image2.png',
            label: 'FEW LEFT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Escape Graphic Print...",
            price: '₹499',
            original: '₹1,299',
            discount: '61% off',
        },

        {
            image: './product-image2.png',
            label: 'OVERSIZED FIT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Be Yourself Graphic...",
            price: '₹699',
            original: '₹2,249',
            discount: '68% off',
        },
        {
            image: './product-image2.png',
            label: '',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue To The Moon Graphic...",
            price: '₹399',
            original: '₹1,499',
            discount: '73% off',
        },
        {
            image: './product-image2.png',
            label: 'BUY 3 FOR 999',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Hope Graphic Print...",
            price: '₹449',
            original: '₹1,349',
            discount: '66% off',
        },
        {
            image: './product-image2.png',
            label: 'FEW LEFT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Escape Graphic Print...",
            price: '₹499',
            original: '₹1,299',
            discount: '61% off',
        },
        {
            image: './product-image2.png',
            label: 'OVERSIZED FIT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Be Yourself Graphic...",
            price: '₹699',
            original: '₹2,249',
            discount: '68% off',
        },
        {
            image: './product-image2.png',
            label: '',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue To The Moon Graphic...",
            price: '₹399',
            original: '₹1,499',
            discount: '73% off',
        },
        {
            image: './product-image2.png',
            label: 'BUY 3 FOR 999',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Hope Graphic Print...",
            price: '₹449',
            original: '₹1,349',
            discount: '66% off',
        },
        {
            image: './product-image2.png',
            label: 'FEW LEFT',
            rating: '4.5',
            brand: 'Bewakoof®',
            name: "Men's Blue Escape Graphic Print...",
            price: '₹499',
            original: '₹1,299',
            discount: '61% off',
        },
    ],
}));