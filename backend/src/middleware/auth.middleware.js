import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    const token = req.cookies?.jwt;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        req.user = decoded;
        req.userRole = decoded.role;
        // console.log("req.user._id=",req.user._id);

        next();
    } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(401).json({ message: "Unauthorized - Token Error" });
    }
};
