import React, { useEffect, useState } from "react";
import "../HomeEditPage/HomeEditPage.css";
import { useEmailRoleStore } from "../../../../Store/useWebStores/useEmailRoleStore.js";

export default function AddOwnerSeller() {
    const {
        emailRoles,
        getEmailRoles,
        insertEmailRole,
        deleteEmailRole,
    } = useEmailRoleStore();

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [deleteEmailId, setDeleteEmailId] = useState("");

    useEffect(() => {
        getEmailRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInsert = () => {
        if (!email || !role) return;
        insertEmailRole(email.trim(), role);
        setEmail("");
    };

    const handleDelete = (emailToDelete) => {
        deleteEmailRole(emailToDelete);
    };

    return (
        <div className="home-edit-outer-div">
            <form className="home-edit-form">
                <h3 className="home-edit-sub-heading">Add Owner/Seller Email</h3>

                <label>
                    Enter Email of OWNER/SELLER:
                    <input
                        className="home-edit-input"
                        type="text"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                <label>Role:-{role}
                    <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
                        <button
                            type="button"
                            style={{ flex: 1, backgroundColor: role === "owner" ? "darkgreen" : "green", color: "white" }}
                            onClick={() => setRole("owner")}
                        >
                            Owner
                        </button>
                        <button
                            type="button"
                            style={{ flex: 1, backgroundColor: role === "seller" ? "darkblue" : "blue", color: "white" }}
                            onClick={() => setRole("seller")}
                        >
                            Seller
                        </button>
                    </div>
                </label>

                <div className="home-edit-submit-row">
                    <button
                        type="button"
                        className="home-edit-submit-button"
                        style={{ backgroundColor: "green" }}
                        onClick={handleInsert}
                    >
                        Submit
                    </button>
                </div>

                <div className="home-edit-preview">
                    <h4>Preview:</h4>
                    <ul style={{ padding: 0, margin: 0, width: "100%" }}>
                        {emailRoles.map((item, i) => (
                            <li
                                key={i}
                                style={{
                                    listStyle: "none",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "5px",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    padding: "6px 10px",
                                    color:"black",
                                    backgroundColor:item.role==="owner"?"lightgreen":"lightblue",
                                }}
                            >
                                <div>
                                    <strong>{item.email}</strong> — <em>{item.role.toUpperCase()}</em>
                                </div>
                                {deleteEmailId===item.email?
                                    <div style={{display:"flex"}}>
                                        <button
                                            onClick={(e) => {e.preventDefault();handleDelete(item.email);}}
                                            style={{background: "red",color: "white",border: "none",padding: "4px 8px",borderRadius: "4px",cursor: "pointer",}}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={(e) => {e.preventDefault();setDeleteEmailId("");}}
                                            style={{background: "blue",color: "white",border: "none",padding: "4px 8px",borderRadius: "4px",cursor: "pointer",}}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                :
                                    <button
                                        onClick={(e) => {e.preventDefault();setDeleteEmailId(item.email);}}
                                        style={{background: "red",color: "white",border: "none",padding: "4px 8px",borderRadius: "4px",cursor: "pointer",}}
                                    >
                                        ×
                                    </button>
                                }
                            </li>
                        ))}
                    </ul>
                </div>
            </form>
        </div>
    );
}
