/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState,useEffect } from "react";
import "./BusinessAccountCreationPage.css";
import {useAuthStore} from "../../Store/useAuthStore.js";
import {useSellerStore} from "../../Store/useAuthSellerStore.js"

const BusinessAccountCreationPage = ( ) => {
  const {authUser} = useAuthStore();
  const {createBusiness,sellerBusiness,getBusiness} = useSellerStore();

  const [isInputChange, setIsInputChange] = useState(false)
  const [form, setForm] = useState({
  businessName: "",
  businessLogo: "",
  businessBanner: "",
  description: "",
  website: "",
  instagram: "",
  facebook: "",
  twitter: "",
  status: "Pending",
  email: "",
  sellerId: "",
  name: ""
});

// When data arrives from server, populate the form
useEffect(() => {
  if (sellerBusiness?.business && authUser) {
    setForm({
      businessName: sellerBusiness.business.businessName || "",
      businessLogo: sellerBusiness.business.businessLogo || "",
      businessBanner: sellerBusiness.business.businessBanner || "",
      description: sellerBusiness.business.description || "",
      website: sellerBusiness.business.socialLinks?.website || "",
      instagram: sellerBusiness.business.socialLinks?.instagram || "",
      facebook: sellerBusiness.business.socialLinks?.facebook || "",
      twitter: sellerBusiness.business.socialLinks?.twitter || "",
      status: sellerBusiness.business.status || "Pending",
      email: authUser.email || "",
      sellerId: authUser._id || "",
      name: authUser.name || ""
    });
  }
}, [sellerBusiness, authUser]);


  useEffect(()=>{
    authUser && getBusiness(authUser?._id)
  },[authUser]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsInputChange(true);
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    if(!isInputChange) {
      return
    };
    const finalData = {
      ...form,
      socialLinks: {
        website: form.website,
        instagram: form.instagram,
        facebook: form.facebook,
        twitter: form.twitter,
      },
    };
    createBusiness(finalData);
  };

  return (
    <div className="business-account-page-container">
      <h2>{sellerBusiness.business ? "Edit Business or Brand" : "Create New Business or Brand"}</h2>
      <form onSubmit={handleSubmit} className="business-account-form">
        <label>
          Email:
          <input
            name="email"
            defaultValue={form.email}
            value={form.email}
            required
          />
        </label>

        <label>
          Seller Name:
          <input
            name="name"
            defaultValue={form.name}
            value={form.name}
            required
          />
        </label>

        <label>
          Business Name:
          <input
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            required
          />
        </label>


        <div className="business-account-logo-image-container">
          {form.businessLogo ? (
            <img
              src={form.businessLogo}
              alt="Logo Preview"
              className="business-account-logo-image"
            />
          ) : (
            <div className="business-account-placeholder">Logo Preview</div>
          )}
        </div>

        <label>
          Logo URL:
          <input
            name="businessLogo"
            value={form.businessLogo}
            onChange={handleChange}
          />
        </label>


        <div className="business-account-banner-image-container">
          {form.businessBanner ? (
            <img
              src={form.businessBanner}
              alt="Banner Preview"
              className="business-account-banner-image"
            />
          ) : (
            <div className="business-account-placeholder">Banner Preview</div>
          )}
        </div>

        <label>
          Banner URL:
          <input
            name="businessBanner"
            value={form.businessBanner}
            onChange={handleChange}
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </label>


        <label>
          Website:
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
          />
        </label>

        <label>
          Instagram:
          <input
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
          />
        </label>

        <label>
          Facebook:
          <input
            name="facebook"
            value={form.facebook}
            onChange={handleChange}
          />
        </label>

        <label>
          Twitter:
          <input
            name="twitter"
            value={form.twitter}
            onChange={handleChange}
          />
        </label>

        <label>
          Status:
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        <button type="submit" className="business-account-submit-btn">
          {sellerBusiness?.business ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
};

export default BusinessAccountCreationPage;
