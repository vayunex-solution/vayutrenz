import React, { useState, useEffect } from "react";
import "./MyAddresses.css";
import { ArrowLeft } from "lucide-react";
import {useAuthStore} from "../../../../Store/useAuthStore";

export default function MyAddresses() {
  const {
    authAddresses,
    getAddress,
    createAddress,
    editAddress,
    deleteAddress,
  } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    country: "",
    pinCode: "",
    city: "",
    state: "",
    street: "",
    area: "",
    landmark: "",
    addressType: "Other",
  });

  useEffect(() => {
    getAddress();
  }, [getAddress]);

  const handleEdit = (index) => {
    const addr = authAddresses[index];
    setFormData({ ...addr });
    setFormMode({ mode: "edit", index });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setFormMode({ mode: "add" });
    setFormData({
      firstName: "",
      lastName: "",
      mobile: "",
      country: "",
      pinCode: "",
      city: "",
      state: "",
      street: "",
      area: "",
      landmark: "",
      addressType: "Other",
    });
    setShowForm(true);
  };

  const handleRemove = async (index) => {
    await deleteAddress(index);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, addressType: type }));
  };

  const isFormValid = () => {
    const { firstName, mobile, pinCode, city, state, area } = formData;
    return firstName && mobile && pinCode && city && state && area;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formMode.mode === "edit") {
      await editAddress(formMode.index, formData);
    } else {
      await createAddress(formData);
    }
    setShowForm(false);
  };

  return (
    <div className="my-address-container">
      {!showForm && (
        <>
          {authAddresses.map((address, index) => (
            <div className="my-address-card" key={index}>
              <div className="my-address-header">
                <div className="my-address-icon-name">
                  <span className="my-address-icon">📍</span>
                  <div>
                    <strong>{address.firstName} {address.lastName}</strong>
                    <div className="my-address-details">
                      {address.street}, {address.area}, {address.city}, {address.state}, {address.pinCode}
                    </div>
                    <div className="my-address-phone">Mobile: {address.mobile}</div>
                  </div>
                </div>
                <span className="my-address-type">{address.addressType}</span>
              </div>
              <div className="my-address-actions">
                <button className="my-address-edit-btn" onClick={() => handleEdit(index)}>
                  Edit
                </button>
                <button className="my-address-remove-btn" onClick={() => handleRemove(index)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button className="my-address-add-btn" onClick={handleAddNew}>
            ADD NEW ADDRESS
          </button>
        </>
      )}

      {showForm && (
        <>
          <div className="my-account-type-buttons back-btn-start">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={`my-account-type-btn back-btn`}
            >
              <ArrowLeft className="my-account-back-btn-icon" /> <h3>Back</h3>
            </button>
          </div>
          <form className="my-account-form" onSubmit={handleSubmit}>
            <div className="my-account-field">
              <label>Country</label>
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="my-account-input"
              />
            </div>

            <div className="my-account-field">
              <label>First Name *</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="my-account-input"
              />
            </div>

            <div className="my-account-field">
              <label>Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="my-account-input"
              />
            </div>

            <div className="my-account-field">
              <label>Mobile Number *</label>
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="my-account-input"
                placeholder="+91 -"
              />
            </div>

            <div className="my-account-field">
              <label>PIN Code *</label>
              <input
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                className="my-account-input"
              />
            </div>

            <div className="my-account-row">
              <div className="my-account-field" style={{ flex: 1 }}>
                <label>City *</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="my-account-input"
                />
              </div>
              <div className="my-account-field" style={{ flex: 1 }}>
                <label>State *</label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="my-account-input"
                />
              </div>
            </div>

            <div className="my-account-field">
              <label>Flat no/Building, Street name</label>
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="my-account-input"
              />
            </div>

            <div className="my-account-field">
              <label>Area/Locality *</label>
              <input
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="my-account-input"
              />
            </div>

            <div className="my-account-field">
              <label>Landmark</label>
              <input
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="my-account-input"
              />
            </div>

            <div className="my-account-type-buttons">
              {["Home", "Office", "Other"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`my-account-type-btn ${
                    formData.addressType === type ? "active" : ""
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className={`my-account-save-btn ${isFormValid() ? "active" : ""}`}
              disabled={!isFormValid()}
            >
              SAVE ADDRESS
            </button>
          </form>
        </>
      )}
    </div>
  );
}
