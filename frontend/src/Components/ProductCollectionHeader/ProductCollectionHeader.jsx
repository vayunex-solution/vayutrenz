// ProductCollectionHeader.jsx
import React from 'react';
import './ProductCollectionHeader.css';
import { CheckCircle, Circle, LucideSortDesc } from 'lucide-react'; // Lucide icon
import { useLocation } from 'react-router-dom';

const ProductCollectionHeader = ({  productNum = 0 }) => {
    const { pathname, search } = useLocation();
    let searchQuery;
    if(pathname.split("/")[1]==="search"){
        const queryParams = new URLSearchParams(search);
        searchQuery = queryParams.get('q');
    }

    const pathnameArr=pathname.split("/");
    const headingName=pathnameArr[pathnameArr.length-1];
    const collectionHeading=headingName.charAt(0).toUpperCase() + headingName.slice(1)
    // console.log(collectionHeading);

    return (
        <div className="pch-container">
            {/* Left side */}
            <div className="pch-left">
                <h2 className="pch-title">
                    <span className="pch-term">{collectionHeading.split("--")[0].split("-").join(" ")}</span>
                    {searchQuery && <span className="pch-term"> Results For : "{searchQuery.split('+').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}"</span>}
                    <span className="pch-count">({productNum} Products)</span>
                </h2>
            </div>

        </div>
    );
};

export default ProductCollectionHeader;
