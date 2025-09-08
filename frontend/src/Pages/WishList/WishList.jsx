import {useEffect,useState} from 'react'
import "./WishList.css"
import ProductCard from "../../Components/ProductCard/ProductCard.jsx"
import { useDataStore } from '../../Store/useDataStore.js';
import { useUserStore } from '../../Store/useAuthUserStore.js';
import { ShoppingBag, Trash2 } from 'lucide-react';
import AddToCartSelector from './Components/AddToCartSelector/AddToCartSelector.jsx';
import {useWebNavStore} from "../../Store/useWebStores/useWebNavStore.js"

const WishList = () => {
    const {setIsLoadingComponent} = useWebNavStore()
    const { getMultipleProducts } = useDataStore();
    const { userWishlist, deleteProductFromWishlist, addProductIntoCart } = useUserStore();
    const [products, setProducts] = useState([]);
    const [addToCartActive, setAddToCartActive] = useState("");

    useEffect(() => {
        const getProductData=async()=>{
        setProducts(await getMultipleProducts(userWishlist));
        setIsLoadingComponent(false)

        }
    if(userWishlist.length){
        setIsLoadingComponent(true)
        getProductData();
    }
    }, [userWishlist,getMultipleProducts,setIsLoadingComponent]);

    if(products.length<1){
        return (
            <div style={{height:"100vh",width:"100vw",backgroundColor:"white"}}></div>
        )
    }
    

  return (
    <div className="product-collection-container">
        <div className='wishlist-heading-container'>
            <span className="wishlist-term">WishList</span>
            <span className="wishlist-item-count">({userWishlist.length} Items)</span>
        </div>
        <div className={`product-list-container wish-list-item`}>
            {/* Product cards here */}
            {products.map((product, index) => (
            <div className="product-card-box" key={index}>
                <ProductCard product={product} key={index} WishListActive={true}/>
                <div className="w-l-card-bottom">
                    <button className="w-l-delete w-l-button" onClick={()=>deleteProductFromWishlist(product._id)}><Trash2 size={18}/></button>
                    <button className="w-l-add-to-card w-l-button" onClick={()=>setAddToCartActive(product._id)}>Add To Cart <ShoppingBag size={18}/></button>
                    {/* <button className="w-l-add-to-card w-l-button" onClick={()=>addProductIntoCart(product._id,{userId, quantity, selectedSize, selectedColor})}>Add To Cart <ShoppingBag size={18}/></button> */}
                </div>
                {addToCartActive===product._id &&
                    <AddToCartSelector
                        productId={product._id}
                        setAddToCartActive={setAddToCartActive}
                        sizes={product.sizes}
                        outOfStockSizes={product.outOfStockSize}
                        lowStockSizes={product.lowStockSize}
                        colors={product.colors}
                        addProductIntoCart={addProductIntoCart}
                    />
                }
            </div>
            ))}
        </div>
    </div>
  )
}

export default WishList