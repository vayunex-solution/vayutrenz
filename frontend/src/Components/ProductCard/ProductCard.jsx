import './ProductCard.css';
// import productImage from '../../assets/product-image2.png';
import {useNavigate} from "react-router-dom"
import { Heart } from 'lucide-react';
import { useUserStore } from '../../Store/useAuthUserStore';
import {useAuthStore} from "../../Store/useAuthStore"
import { useEffect, useState } from 'react';

const ProductCard = ({product,WishListActive}) => {
    const navigate = useNavigate();
    const {addProductIntoWishlist,userWishlist,deleteProductFromWishlist} = useUserStore();
    const {authUser} = useAuthStore()
    const [isProductInWishlist, setIsProductInWishlist] = useState(false);

    const heandelAddToWishList = () => {
        console.log("heandelAddToWishList");
        if (!authUser) {
            return navigate("/login");
        }
        
        if (authUser.role === "user") {
            console.log("heandelAddToWishList",product._id);
            if(isProductInWishlist){
                deleteProductFromWishlist(product._id);
            }else{
                addProductIntoWishlist(product._id);
            }
        } else {
            console.warn("Only users can add products to wishlist.");
            return;
        }
    };

    useEffect(() => {
        if (!authUser || !product?._id) return;

        const isInWishlist = userWishlist.some((item) => item === product._id);
        setIsProductInWishlist(isInWishlist);
    }, [userWishlist, product?._id, authUser]);

    if(!product){
        return <div></div>
    }

    return (
        <div className={`product-card ${WishListActive?"":"hover-true"}`} onClick={()=>navigate(`/product/${product.name.toLowerCase().split(" ").join("-").split("'").join("")}--${product._id}`)}>
            <div className="image-container">
                <img src={product.image} alt={product.name} />
                {product.offer && <span className="fit-label">{product.offer}</span>}
                <div className="rating">★ {product.rating}</div>
            </div>
            <div className="product-details">
                <div className='product-details-brand-heart'>
                    <h2 className="brand-name">{product?.business?.businessName || product?.businessName || "Business"}</h2>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            heandelAddToWishList();
                        }}
                        className='product-details-icon-box'
                    >
                        <Heart
                            className='product-details-heart-icon'
                            color={`${isProductInWishlist?"red":"black"}`}
                            fill={`${isProductInWishlist?"red":"transparent"}`}
                        />
                    </div>
                </div>
                <p className="product-name">{product.name}</p>
                <div className="price-section">
                    <span className="price">{product.price}</span>
                    <span className="original-price">{product.originalPrice}</span>
                    <span className="discount">{product.discount+"%"}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
