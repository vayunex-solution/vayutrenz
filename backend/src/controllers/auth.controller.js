import User from "../models/user.model.js";
import Seller from "../models/seller.model.js";
import Owner from "../models/owner.model.js";
import EmailRole from "../models/emailRole.model.js";
import { generateToken } from "../lib/utils.js";
// import { verifyAuth0Token } from "../lib/auth0Verify.js";

// USER LOGIN
export const loginUser = async (req, res) => {
    const { email } = req.body;
    try {
        if(!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        // console.log("User logged in:", email);
        let user = await User.findOne({ email });
        if (!user) {
            user = new User(req.body);
            await user.save();
        }
        // console.log("User logged in:", user.email);

        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber || null,
            dateOfBirth: user.dateOfBirth || null,
            gender: user.gender || null,
            role: user.role || "user"
        };
        generateToken(userData, res);

        res.status(200).json(userData);
    } catch (err) {
        console.error("User login failed", err);
        res.status(500).json({ message: "User login failed" });
    }
};

// BUSINESS LOGIN
export const loginBusinessAccount = async (req, res) => {
    // console.log("loginBusinessAccount", req.body.token);
    // const token = req.body.token; // The token received from Auth0
    // const decoded = await verifyAuth0Token(token);
    // console.log("Decoded token:", JSON.stringify(decoded));
    try {
        const { email } = req.body;
        const data = await EmailRole.findOne();
        const emails = data?.emails || [];

        const matchedEntry = emails.find(e => e.email === email);

        let userData ;
        if (matchedEntry) {
            userData = {
                email: matchedEntry.email,
                role: matchedEntry.role,
            }
        }
        let OWNER_EMAIL= process.env.OWNER_EMAIL || "";
        
        if (!userData && email !== OWNER_EMAIL) {
            // console.log("Unauthorized email:", email);
            return res.status(403).json({ message: "Unauthorized email" });
        }

        if (email === OWNER_EMAIL || userData.role === "owner") {
            let owner = await Owner.findOne({ email });
            if (!owner) {
                owner = new Owner(req.body);
                await owner.save();
            }

            const userData = {
                _id: owner._id,
                name: owner.name,
                email: owner.email,
                phoneNumber: owner.phoneNumber || null,
                gender: owner.gender || null,
                dateOfBirth: owner.dateOfBirth || null,
                role: "owner"
            };
            generateToken(userData, res);

            return res.status(200).json(userData);
        }

        if (userData.role === "seller") {
            // console.log("Seller login attempt for email:", email);
            let seller = await Seller.findOne({ email });
            if (!seller) {
                seller = new Seller(req.body);
                await seller.save();
            }

            const userData = {
                _id: seller._id,
                name: seller.name,
                email: seller.email,
                phoneNumber: seller.phoneNumber || null,
                gender: seller.gender || null,
                dateOfBirth: seller.dateOfBirth || null,
                business:seller.business || null,
                role: "seller"
            };
            generateToken(userData, res);

            return res.status(200).json(userData);
        }

        return res.status(403).json({ message: "Only allowed persons can login with business account" });
    } catch (err) {
        console.error("Business login failed", err);
        res.status(500).json({ message: "Business login failed" });
    }
};

// AUTH CHECKS
export const checkAuthUser = async (req, res) => {
    if (req.userRole !== "user") {
        return res.status(403).json({ message: "Access denied for non-user" });
    }

    res.json(req.user);
};

export const checkAuthBusiness = async (req, res) => {
    if (req.userRole !== "owner" && req.userRole !== "seller") {
        return res.status(403).json({ message: "Access denied for user role" });
    }

    res.json(req.user);
};

// LOGOUT
export const logoutUser = (req, res) => {
    res.clearCookie("jwt");
    res.json({ message: "User logged out" });
};

export const logoutBusiness = (req, res) => {
    res.clearCookie("jwt");
    res.json({ message: "Business account logged out" });
};

// UPDATE AUTH PROFILE
export const updateAuth = async (req, res) => {
    const { phoneNumber, gender, dateOfBirth } = req.body;
    // console.log(gender,dateOfBirth);

    try {
        let updatedUser;

        if (req.userRole === "user") {
            updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                { phoneNumber, gender, dateOfBirth },
                { new: true }
            );

            const userData = {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                gender: updatedUser.gender,
                dateOfBirth: updatedUser.dateOfBirth,
                role: "user"
            };
            generateToken(userData, res);
            return res.json(userData);
        }

        if (req.userRole === "seller") {
            updatedUser = await Seller.findByIdAndUpdate(
                req.user._id,
                { phoneNumber, gender, dateOfBirth },
                { new: true }
            );
            console.log("updatedUser=", updatedUser);

            const userData = {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber || null,
                gender: updatedUser.gender || null,
                dateOfBirth: updatedUser.dateOfBirth || null,
                business:updatedUser.business || null,
                role: "seller"
            };
            generateToken(userData, res);
            return res.json(userData);
        }

        if (req.userRole === "owner") {
            updatedUser = await Owner.findByIdAndUpdate(
                req.user._id,
                { phoneNumber, gender, dateOfBirth },
                { new: true }
            );

            const userData = {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber || null,
                gender: updatedUser.gender || null,
                dateOfBirth: updatedUser.dateOfBirth || null,
                role: "owner"
            };
            generateToken(userData, res);
            return res.json(userData);
        }

        return res.status(403).json({ message: "Unauthorized role" });
    } catch (err) {
        console.error("Failed to update authenticated user:", err);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

////// address ///////////

const getModel = (role) => {
    if (role === "seller") return Seller;
    if (role === "owner") return Owner;
    return User;
};

export const getAddress = async (req, res) => {
    const Model = getModel(req.userRole);
    const user = await Model.findById(req.user._id);
    console.log("getAddress",user.addresses);
    res.json({ addresses: user.addresses || [] });
};

export const createAddress = async (req, res) => {
    const Model = getModel(req.userRole);
    const user = await Model.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();
    const newAddress = user.addresses[user.addresses.length - 1];
    console.log("createAddress",newAddress);
    res.json({ address: newAddress });
};

export const editAddress = async (req, res) => {
    const { index, updatedAddress } = req.body;
    const Model = getModel(req.userRole);
    const user = await Model.findById(req.user._id);
    if (index < 0 || index >= user.addresses.length) {
        return res.status(400).json({ error: "Invalid address index" });
    }
    user.addresses[index] = updatedAddress;
    await user.save();
    console.log("editAddress");
    res.json({ address: updatedAddress });
};

export const deleteAddress = async (req, res) => {
    const index = parseInt(req.query.index);
    const Model = getModel(req.userRole);
    const user = await Model.findById(req.user._id);
    if (index < 0 || index >= user.addresses.length) {
        return res.status(400).json({ error: "Invalid address index" });
    }
    user.addresses.splice(index, 1);
    await user.save();
    console.log("deleteAddress");
    res.json({ message: "Address deleted" });
};

