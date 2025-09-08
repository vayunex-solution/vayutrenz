import React, { useEffect} from 'react'
import "./ProductListPage.css"
import ProductCard from "../../Components/ProductCard/ProductCard.jsx"
import { useAuthStore } from '../../Store/useAuthStore.js'
import { Pencil, Trash2 } from 'lucide-react';
import {useSellerStore} from '../../Store/useAuthSellerStore.js'
import {useWebNavStore} from '../../Store/useWebStores/useWebNavStore.js'
import { useState } from 'react';
import ProductEditingComponent from './Components/ProductEditingComponent.jsx';

const ProductListPage = () => {
    const {setIsLoadingComponent}=useWebNavStore();
    const { fetchSellerProducts, sellerProducts,deleteProduct } = useSellerStore();
    const { authUser } = useAuthStore();
    const [selectedProductForEditing, setSelectedProductForEditing] = useState("")
    // const [selectedProductForDeletion, setSelectedProductForDeletion] = useState("")

    // const [isProducts, setIsProducts] = useState(false);

    useEffect(() => {
        !sellerProducts.length && setIsLoadingComponent(true);
    },[setIsLoadingComponent,sellerProducts]);
    useEffect(() => {
        const handelFetchSellerProducts=async()=>{
            await fetchSellerProducts();
            setIsLoadingComponent(false);
        }
        // console.log("sellerProducts",sellerProducts);
        
        authUser && authUser.role==='seller' && handelFetchSellerProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchSellerProducts,authUser])
    

    return (
        <div className="product-collection-container">
            <div className='product-list-heading-container'>
                <span className="product-list-term">Product List</span>
                <span className="product-list-item-count">{`(${sellerProducts.length} Items)`}</span>
            </div>
            <div className={`product-list-container product-list-item`}>
                {sellerProducts.map((product, index) => (
                    <div className="product-card-box" key={index}>
                        <ProductCard product={product} key={index} WishListActive={true} />
                        <div className="p-l-card-bottom">
                            <button
                                className="p-l-delete p-l-button"
                                onClick={()=>setSelectedProductForEditing(product._id)}
                            >
                                Edit <Pencil size={16} />
                            </button>
                            <button
                                className="p-l-edit p-l-button"
                                onClick={async () => {
                                    if (window.confirm("Are you sure you want to delete this product?")) {
                                        setIsLoadingComponent(true);
                                        await deleteProduct(product._id);
                                        await fetchSellerProducts();
                                        setIsLoadingComponent(false);
                                    }
                                }}
                            >
                                Delete <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {selectedProductForEditing &&
                <div style={{display:"flex",height:"100vh",width:"100vw",zIndex:"100",position:"fixed",top:"0px",bottom:"0px",right:"0px",backgroundColor:"#ccca"}}>
                    <div style={{height:"100vw",width:"auto",flex:"1"}} onClick={()=>setSelectedProductForEditing("")}></div>
                    <div style={{height:"100vh",overflow:"scroll",width:"100vw",maxWidth:"700px",backgroundColor:"#ccc"}} className="product-list-page-product-editing-component">
                        <ProductEditingComponent productId={selectedProductForEditing} setSelectedProductForEditing={setSelectedProductForEditing}/>
                    </div>
                </div>
            }
        </div>
    )
}

export default ProductListPage;
