// models/Order.model.js
import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: Number,
    priceAtPurchase: Number,
    selectedSize: String,
    selectedColor: String,
}, { _id: false });

const addressSchema = new mongoose.Schema({
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phoneNumber: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [orderProductSchema],
    totalAmount: Number,
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending",
    },
    deliveryStatus: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Processing",
    },
    address: addressSchema,
    orderedAt: {
        type: Date,
        default: Date.now,
    },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
