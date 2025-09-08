
// In user.controller.js
import User from "../models/user.model.js";
import Product from "../models/product.model.js";


export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};





export const addProductIntoCart = async (req, res) => {
    const userId = req.user._id;
    const { quantity, selectedSize, selectedColor } = req.body;
    // console.log("req.body", req.body);
    try {
        const user = await User.findById(userId);
        const product = await Product.findById(req.params.productId);
        // console.log("user", user);
        user.cart.push({
            product: req.params.productId,
            quantity,
            selectedSize,
            selectedColor,
        });
        // console.log("cart",user.cart);

        user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId.toString());

        await user.save();

        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (err) {
        // console.log("err",err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getCartData = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId).populate({ path: "cart.product", populate: { path: 'business', select: 'businessName', } });

        if (!user) return res.status(404).json({ message: "User not found" });

        const cartItems = user.cart?.map((item,index) => {
            const product = item.product;
            return {
                index:index,
                id: product._id,
                title: product.name,
                price: product.price*item.quantity,
                originalPrice: product.originalPrice*item.quantity,
                sizes: product.sizes,
                colors: product.colors,
                quantity: item.quantity,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor,
                image: product.image,
                deliveryDate: getEstimatedDeliveryDate(),
                offer: product.offer,
                offerDetails: {
                    productNumber: product.offerDetails?.productNumber || null,
                    comboPrice: product.offerDetails?.comboPrice || null,
                },
                outOfStockSizes: product.outOfStockSize,
                lowStockSizes: product.lowStockSize,
                business: product.business,
            };
        });
        // console.log("data");

        res.json(cartItems);
    } catch (err) {
        console.error("Error in getCartData:", err);
        res.status(500).json({ message: "Server Error" });
    }
};


export const deleteProductFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        // console.log(userId,productId);

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.cart = user.cart.filter((item) => item.product.toString() !== productId);
        
        if (!user.wishlist.includes(productId)) user.wishlist.push(productId);
        await user.save();

        // console.log(user.cart.length,user.wishlist.length);

        res.json({ message: "Product removed from cart" });
    } catch (err) {
        console.error("Error in deleteProductFromCart:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateCartProductSize = async (req, res) => {
    try {
        const userId = req.user._id;
        const { size } = req.body;
        const { productId } = req.params;
        // console.log(userId,size,productId);

        const user = await User.findById(userId);

        const cartItem = user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (cartItem) {
            cartItem.selectedSize = size;
            await user.save();
        }
        // console.log(cartItem.selectedSize);

        res.json({ success: true });
    } catch (error) {
        console.log("Error updating cart size:", error);
        res.status(500).json({ success: false, message: "Something went wrong." });
    }
};

// ✅ Update product quantity in cart
export const updateCartProductQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { quantity } = req.body;
    const { productId } = req.params;

    const user = await User.findById(userId);

    // Find the cart item and update its quantity
    const cartItem = user.cart.find(
        (item) => item.product.toString() === productId
    );

    if (cartItem) {
        cartItem.quantity = quantity;
        await user.save();
        return res.json({ success: true });
    }

    // If no matching item found
    return res.status(404).json({ success: false, message: "Product not found in cart." });

  } catch (error) {
    console.log("Error updating cart quantity:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};



// Helper to calculate delivery date (e.g., +5 days)
function getEstimatedDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toISOString().split("T")[0];
}



//////wishlist////////
export const addProductIntoWishlist = async (req, res) => {
    const userId = req.user._id;
    const productId = req.params.productId
    try {
        const user = await User.findById(userId);
        const product = await Product.findById(productId);

        if (!user.wishlist.includes(product._id)) user.wishlist.push(product._id);
        if (!product.likes.includes(user._id)) product.likes.push(user._id);

        await user.save();
        await product.save();

        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUserWishlist = async (req, res) => {
    const userId = req.params.userId;
    // console.log("user-id=", userId)
    try {
        const user = await User.findById(userId);

        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteProductFromWishlist = async (req, res) => {
    const userId = req.user._id;
    // console.log("user-id=",userId)
    try {
        const user = await User.findById(userId);
        const product = await Product.findById(req.params.productId);

        user.wishlist = user.wishlist.filter(id => id.toString() !== product._id.toString());
        product.likes = product.likes.filter(id => id.toString() !== user._id.toString());

        await user.save();
        await product.save();

        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
/////wishlist////////


export const addProductIntoOrder = async (req, res) => {
    const { userId, products, totalAmount, address } = req.body;
    try {
        const user = await User.findById(userId);
        const newOrder = {
            orderId: new Date().getTime().toString(),
            products,
            totalAmount,
            address,
        };
        user.orders.push(newOrder);
        await user.save();
        res.status(200).json({ success: true, orders: user.orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteProductsFromOrder = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        user.orders = user.orders.filter(order => order.orderId !== req.params.orderId);
        await user.save();
        res.status(200).json({ success: true, orders: user.orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUserAddress = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.status(200).json({ success: true, address: user.address });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const changeUserAddress = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { address: req.body }, { new: true });
        res.status(200).json({ success: true, address: user.address });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getWalletData = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.status(200).json({ success: true, wallet: user.wallet });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getPaymentData = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.status(200).json({ success: true, payment: user.payment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
