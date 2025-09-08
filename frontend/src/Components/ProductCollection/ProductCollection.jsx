import "./ProductCollection.css"
import { useDataStore } from "../../Store/useDataStore"
import ProductCard from "../ProductCard/ProductCard"
import ProductCollectionHeader from "../ProductCollectionHeader/ProductCollectionHeader.jsx"
import { useEffect, useState } from "react"
import { useLocation } from 'react-router-dom';
// import { ShoppingBag, Trash2 } from "lucide-react"

const ProductCollection = () => {
    const location = useLocation();
    const {pathname} = useLocation();
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadFunction, setLoadFunction] = useState(null);

    const { getProductsByCategory, getProductsByOffer, getProductsByAllCategories, getProductsByCategoryArray, getProductsBySearchKeyword } = useDataStore();

    // Parse route and query only once when route changes
    useEffect(() => {
        const routeArray= pathname.split('/'); // e.g., 'tshirt', 'offer--buy-1-get-1', etc.
        const routeName = routeArray[routeArray.length-1]
        // console.log("routeName",routeName);
        const query = new URLSearchParams(location.search);

        const filtersArray = [];
        for (const [key, value] of query.entries()) {
            const options = value.split('_');
            filtersArray.push({ [key]: options });
        }

        const filterItems = Object.assign({}, ...filtersArray);
        const keyword = query.get("q");
        const limit = 20;

        // Define which function to call
        let fetchFunction = null;

        if (routeName.endsWith("--offer")) {
            const [offerValue,] = routeName.split("--offer"); // e.g., ['offer', 'buy-1-get-1']
            fetchFunction = (page) => getProductsByOffer({ offer: offerValue, filterItems, skip: (page - 1) * limit, limit });
        } else if (routeName === "all-cloths") {
            // console.log("all-cloths");
            fetchFunction = (page) => getProductsByAllCategories({ filterItems, skip: (page - 1) * limit, limit });
        } else if (routeName.endsWith("--trending")) {
            const [gender,] = routeName.split("-");
            fetchFunction = (page) => getProductsByCategoryArray({ gender:gender.toLowerCase()==="womens"?"female":"male",filterItems, skip: (page - 1) * limit, limit });
        } else if (routeName === "search") {
            fetchFunction = (page) => getProductsBySearchKeyword({ keyword, filterItems, skip: (page - 1) * limit, limit });
        } else {
            // console.log(" routeName.split(--)[1]", routeName.split("--")[1])
            // default: categoryName route like /tshirt
            fetchFunction = (page) => getProductsByCategory({ categoryId: routeName.split("--")[1],categoryName: routeName.split("--")[0], filterItems, skip: (page - 1) * limit, limit });
        }

        setLoadFunction(() => fetchFunction);
        setProducts([]);
        setPage(1);
        setHasMore(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, location.search]);

    // Load products on page change
    useEffect(() => {
        if (!loadFunction || !hasMore) return;

        loadFunction(page).then(() => {
            const newProducts = useDataStore.getState().filteredProducts;
            if (newProducts.length < 20) setHasMore(false);
            setProducts((prev) => [...prev, ...newProducts]);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, loadFunction]);

    // Scroll listener
    useEffect(() => {
        const onScroll = () => {
            if (!hasMore) return;
            const scrollTop = window.scrollY;
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.offsetHeight;

            if (scrollTop + winHeight >= docHeight - winHeight ) {
                setPage((prev) => prev + 1);
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [hasMore]);

    // if (products) {
    //     return (
    //         <div>
    //             {products.map((item, i) => (
    //                 <div key={i}>{item.name}</div> // Replace with your product component
    //             ))}
    //             {!hasMore && <div style={{ textAlign: "center", padding: "2rem" }}>No more products</div>}
    //         </div>
    //     )
    // }
    // if (!products) {
    //     return (
    //         <div>
    //             {products.map((item, i) => (
    //                 <div key={i}>{item.name}</div> // Replace with your product component
    //             ))}
    //             {!hasMore && <div style={{ textAlign: "center", padding: "2rem" }}>No more products</div>}
    //         </div>
    //     )
    // }


    return (
        <div className="product-collection-container">
            <ProductCollectionHeader productNum={products.length} />
            <div className={`product-list-container `}>
                {/* Product cards here */}
                {products.map((product, index) => (
                    <div className="product-card-box" key={index}>
                        <ProductCard product={product} key={index} />

                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProductCollection
