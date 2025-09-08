import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

// Error handler utility
const handleError = (error, fallback = "Something went wrong") => {
    const message = error?.response?.data?.message || fallback;
    toast.error(message);
};

export const useOwnerStore = create((set) => ({
    ownerData: null,
    ownerList: [],
    isLoading: false,

    loginOwner: async (data) => {
        set({ isLoading: true });
        try {
            const { data: resData } = await axiosInstance.post("/owner/login", data);
            set({ ownerData: resData });
            toast.success("Logged in as owner");
        } catch (error) {
            handleError(error, "Login failed");
        } finally {
            set({ isLoading: false });
        }
    },

    deleteOwner: async (id) => {
        try {
            await axiosInstance.delete(`/owner/${id}`);
            toast.success("Owner deleted");
        } catch (error) {
            handleError(error, "Delete failed");
        }
    },

    deleteAllOwners: async () => {
        try {
            await axiosInstance.delete("/owner");
            toast.success("All owners deleted");
            set({ ownerList: [], ownerData: null });
        } catch (error) {
            handleError(error, "Delete all failed");
        }
    },

    getOwner: async (id) => {
        try {
            const { data } = await axiosInstance.get(`/owner/${id}`);
            set({ ownerData: data });
        } catch (error) {
            handleError(error, "Fetch owner failed");
        }
    },

    getAllOwners: async () => {
        try {
            const { data } = await axiosInstance.get("/owner");
            set({ ownerList: data });
        } catch (error) {
            handleError(error, "Fetch owners failed");
        }
    },

    updateOwnerDetails: async (id, updateData) => {
        try {
            const { data: updated } = await axiosInstance.put(`/owner/${id}`, updateData);
            set({ ownerData: updated });
            toast.success("Owner details updated");
        } catch (error) {
            handleError(error, "Update failed");
        }
    },
}));
