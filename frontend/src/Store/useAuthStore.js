import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set,) => ({
    authUser: null,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: false,
    loginWithBusinessAccount: false,
    authAddresses:[],

    setLoginWithBusinessAccount: () => {
        const value = localStorage.getItem("loginWithBusinessAccount") === "true";
        set({ loginWithBusinessAccount: value });
    },

    checkAuth: async () => {
        try {
            set({ isCheckingAuth: true });

            const endpoint = localStorage.getItem("loginWithBusinessAccount") === "true"
                ? "/auth/check/business-account"
                : "/auth/check/user";

            const res = await axiosInstance.get(endpoint);
            set({ authUser: res.data });
        } catch (error) {
            set({ authUser: null });
            console.log("Error in checkAuth:", error);
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const endpoint = localStorage.getItem("loginWithBusinessAccount") === "true"
                ? "/auth/login/business-account"
                : "/auth/login/user";

            const res = await axiosInstance.post(endpoint, data);
            set({ authUser: res.data });
            // console.log("res.data", res.data);

            toast.success(`${res.data.role} Logged in successfully`);
            return res.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            const endpoint = localStorage.getItem("loginWithBusinessAccount") === "true"
                ? "/auth/logout/business-account"
                : "/auth/logout/user";

            await axiosInstance.post(endpoint);
            set({ authUser: null });
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Logout failed");
        }
    },

    updateAuthUser: async (updateData) => {
        try {
            const res = await axiosInstance.put("/auth/update-auth", updateData, {
                withCredentials: true,
            });
            set({ authUser: res.data });
            return { success: true, data: res.data };
        } catch (error) {
            console.error("Update failed:", error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    },
    getAddress: async () => {
        const res = await axiosInstance.get("/auth/get/address");
        set({ authAddresses: res.data.addresses });
    },

    createAddress: async (newAddress) => {
        const res = await axiosInstance.post("/auth/create/address", newAddress);
        set((state) => ({
            authAddresses: [...state.authAddresses, res.data.address],
        }));
    },

    editAddress: async (index, updatedAddress) => {
        const res = await axiosInstance.put("/auth/edit/address", {
            index,
            updatedAddress,
        });
        set((state) => {
            const updated = [...state.authAddresses];
            updated[index] = res.data.address;
            return { authAddresses: updated };
        });
    },

    deleteAddress: async (index) => {
        await axiosInstance.delete(`/auth/delete/address?index=${index}`);
        set((state) => {
            const updated = [...state.authAddresses];
            updated.splice(index, 1);
            return { authAddresses: updated };
        });
    },
}));


