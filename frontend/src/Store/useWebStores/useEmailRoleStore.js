import { create } from "zustand";
import { axiosInstance } from "../../lib/axios.js"; // adjust path

export const useEmailRoleStore = create((set) => ({
    emailRoles: [],
    loading: false,

    getEmailRoles: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get("/email-roles/get");
            set({ emailRoles: res.data });
        } catch (err) {
            console.error("Failed to fetch email roles", err);
        } finally {
            set({ loading: false });
        }
    },

    insertEmailRole: async (email, role) => {
        try {
            const res = await axiosInstance.post("/email-roles/insert", { email, role });
            set({ emailRoles: res.data });
        } catch (err) {
            console.error("Insert failed", err);
        }
    },

    deleteEmailRole: async (email) => {
        try {
            const res = await axiosInstance.delete(`/email-roles/${email}`);
            set({ emailRoles: res.data });
        } catch (err) {
            console.error("Delete failed", err);
        }
    },
}));
