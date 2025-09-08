import "./ProductPage.css"
import ProductSlider from "../../Components/ProductSlider/ProductSlider.jsx"
import ProductImageContainer from './Components/ProductImageContainer/ProductImageContainer.jsx'
import ProductDetail from './Components/ProductDetail/ProductDetail.jsx'
import { useEffect, useState } from "react"
import { useLocation} from "react-router-dom"
import { useDataStore } from "../../Store/useDataStore.js"
import {useWebNavStore} from "../../Store/useWebStores/useWebNavStore.js"

const ProductPage = () => {
  const {setIsLoadingComponent}= useWebNavStore();
  const {getProductById,productData} = useDataStore();
  const location = useLocation();
  const [productId, setProductId] = useState(null);
    
    

    function extractProductIdFromPath(pathname) {
        if (!pathname || typeof pathname !== "string") return null;

        // Expecting format: /product/p-name--product-id
        const lastSegment = pathname.split("/").pop();
        const parts = lastSegment.split("--");
        return parts.length > 1 ? parts[1] : null;
    }

    useEffect(() => {
      setIsLoadingComponent(true);
      const id = extractProductIdFromPath(location.pathname);
      setProductId(id);
      // console.log("productId=",productId);
      
      
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);
    
    useEffect(() => {
      const handelGetProductById =async()=>{
        await getProductById(productId)
        setIsLoadingComponent(false);
      }
      
      productId && handelGetProductById();
    },[productId,getProductById,setIsLoadingComponent])
    // console.log(productData);
    

  if(!productData) return <div className="product-page-background-loading"></div>


  return (
    <div className='product-box'>
      <div className='product-container'>
        <section className="product-image-container">
          <ProductImageContainer images={[productData?.image,...productData.moreImages]}/>
        </section>
        <section className="product-details-component">
          <ProductDetail productDetails={productData}/>
        </section>
      </div>
      <ProductSlider categoryId={productData.categories[0]} />
    </div>
  )
}

export default ProductPage