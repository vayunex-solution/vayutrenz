import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../../Store/useAuthStore.js";
import "./MyProfile.css";

export default function MyProfile() {
    const [isInputChange, setIsInputChange] = useState(false)
    const { authUser, updateAuthUser } = useAuthStore();

    const formatDateForInput = (dobObj) => {
        if (!dobObj || !dobObj.day || !dobObj.month || !dobObj.year) return "";
        const pad = (n) => n.toString().padStart(2, "0");
        return `${dobObj.year}-${pad(dobObj.month)}-${pad(dobObj.day)}`;
    };

    const parseDateInput = (dateStr) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        console.log({ day, month, year })
        return { day, month, year };
    };

    const [formData, setFormData] = useState({
        name: authUser?.name || "",
        email: authUser?.email || "",
        phoneNumber: authUser?.phoneNumber || "",
        dateOfBirth: formatDateForInput(authUser?.dateOfBirth),
        gender: authUser?.gender || "",
    });

    useEffect(() => {
        if (authUser) {
            setFormData({
                name: authUser.name || "",
                email: authUser.email || "",
                phoneNumber: authUser.phoneNumber || "",
                dateOfBirth: formatDateForInput(authUser.dateOfBirth),
                gender: authUser.gender || "",
            });
        }
    }, [authUser]);

    const handleChange = (e) => {
        setIsInputChange(true);
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGenderSelect = (gender) => {
        setIsInputChange(true);
        setFormData((prev) => ({ ...prev, gender }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            dateOfBirth: parseDateInput(formData.dateOfBirth),
        };
        console.log(finalData);
        await updateAuthUser(finalData);
        setIsInputChange(false);
    };

    return (
        <form className="my-profile-form" onSubmit={handleSubmit}>
            <div className="my-profile-row">
                <div className="my-profile-field">
                    <label>Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        // onChange={handleChange}
                        className="my-profile-input"
                    />
                </div>
            </div>

            <div className="my-profile-field">
                <label>Email Id *</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="my-profile-input"
                    onChange={()=>{}}
                />
            </div>

            <div className="my-profile-field my-profile-phone-row">
                <div style={{ flex: 1 }}>
                    <label>Mobile Number *</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="my-profile-input"
                    />
                </div>
            </div>

            <div className="my-profile-field">
                <label>DOB</label>
                <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="my-profile-input date-of-birth"
                />
                <p className="my-profile-dob-hint">
                    Share your DOB to get special gifts on the 1st day of your birthday month
                </p>
            </div>

            <div className="my-profile-field">
                <label>Gender</label>
                <div className="my-profile-gender-options">
                    {["male", "female", "other"].map((gender) => (
                        <button
                            type="button"
                            key={gender}
                            className={`my-profile-gender-btn ${formData.gender === gender ? "active" : ""}`}
                            onClick={() => handleGenderSelect(gender)}
                        >
                            {gender.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {isInputChange?(
                <button type="submit" className="my-profile-save-btn">
                    SAVE CHANGES
                </button>
            ):(
                <button type="button" className="my-profile-save-btn inactive">
                    SAVE CHANGES
                </button>
            )}
        </form>
    )
}
