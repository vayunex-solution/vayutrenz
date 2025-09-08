import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

// Helper to handle errors and fallback toast messages
const handleError = (error, fallback = "Something went wrong") => {
    const message = error?.response?.data?.message || fallback;
    toast.error(message);
};

export const useUserStore = create((set,) => ({
    userData: null,
    isLoading: false,
    userWishlist: [],


    addProductIntoCart: async (productId, data) => {
        try {
            const res = await axiosInstance.post(`/user/cart/${productId}`, data);
            toast.success("Added to cart");
            console.log("add-to-cart");
            set({ userWishlist: res.data.wishlist })
        } catch (error) {
            handleError(error, "Add to cart failed");
        }
    },

    getCartData: async (userId) => {
        try {
            const res = await axiosInstance.get(`/user/cart/${userId}`);
            toast.success("Added to cart");
            return res.data;
        } catch (error) {
            handleError(error, "Add to cart failed");
        }
    },

    updateCartProductSize: async (productId, size) => {
        try {
            console.log("productId",productId);
            const res = await axiosInstance.put(`/user/cart/size/${productId}`, { size });
            return res.data;
        } catch (error) {
            console.log("updateCartProductSize error:", error);
            return { success: false };
        }
    },

    updateCartProductQuantity: async (productId, quantity) => {
        try {
            const res = await axiosInstance.put(`/user/cart/quantity/${productId}`, { quantity });
            return res.data;
        } catch (error) {
            console.log("updateCartProductQuantity error:", error);
            return { success: false };
        }
    },

        deleteProductFromCart: async (productId) => {
            try {
                const res = await axiosInstance.delete(`/user/cart/${productId}`);
                toast.success("Removed from cart");
                return res.data.cart;
            } catch (error) {
                handleError(error, "Remove from cart failed");
            }
        },


        ///// wishlist /////
        addProductIntoWishlist: async (productId) => {
            try {
                const res = await axiosInstance.post(`/user/wishlist/${productId}`);
                set({ userWishlist: res.data.wishlist })
                toast.success("Added to wishlist")

            } catch (error) {
                handleError(error, "Add to wishlist failed");
            }
        },

        getUserWishlist: async (userId) => {
            try {
                const res = await axiosInstance.get(`/user/wishlist/${userId}`);
                set({ userWishlist: res.data.wishlist })
            } catch (error) {
                handleError(error, "get wishlist failed");
            }
        },

        deleteProductFromWishlist: async (productId) => {
            try {
                const res = await axiosInstance.delete(`/user/wishlist/${productId}`);
                set({ userWishlist: res.data.wishlist })
                toast.success("Removed from wishlist");
            } catch (error) {
                handleError(error, "Remove from wishlist failed");
            }
        },

        addProductIntoOrder: async (orderData) => {
            try {
                await axiosInstance.post("/user/order", orderData);
                toast.success("Order placed");
            } catch (error) {
                handleError(error, "Order failed");
            }
        },

        //// order //////
        deleteProductsFromOrder: async (orderId) => {
            try {
                await axiosInstance.delete(`/user/order/${orderId}`);
                toast.success("Order deleted");
            } catch (error) {
                handleError(error, "Delete order failed");
            }
        },

        getWalletData: async (userId) => {
            try {
                const { data } = await axiosInstance.get(`/user/wallet/${userId}`);
                set({ userData: data });
            } catch (error) {
                handleError(error, "Fetch wallet failed");
            }
        },

        getPaymentData: async (userId) => {
            try {
                const { data } = await axiosInstance.get(`/user/payment/${userId}`);
                set({ userData: data });
            } catch (error) {
                handleError(error, "Fetch payment failed");
            }
        },
    }));


//     set({ isLoading: true });
//     try {
//         const { data: resData } = await axiosInstance.post("/user/login", data);
//         set({ userData: resData });
//         toast.success("User logged in");
//     } catch (error) {
//         handleError(error, "Login failed");
//     } finally {
//         set({ isLoading: false });
//     }
// },

// deleteUser: async (userId) => {
//     try {
//         await axiosInstance.delete(`/user/delete/${userId}`);
//         toast.success("User deleted");
//     } catch (error) {
//         handleError(error, "Delete failed");
//     }
// },

// getUser: async (userId) => {
//     try {
//         const { data } = await axiosInstance.get(`/user/${userId}`);
//         set({ userData: data });
//     } catch (error) {
//         handleError(error, "Fetch user failed");
//     }
// },


// getUserAddress: async (userId) => {
//     try {
//         const { data } = await axiosInstance.get(`/user/address/${userId}`);
//         set({ userData: data });
//     } catch (error) {
//         handleError(error, "Fetch address failed");
//     }
// },

// changeUserAddress: async (userId, data) => {
//     try {
//         const { data: updated } = await axiosInstance.put(`/user/address/change/${userId}`, data);
//         set({ userData: updated });
//         toast.success("Address updated");
//     } catch (error) {
//         handleError(error, "Address update failed");
//     }
// },