import React, { useEffect, useState } from "react";
import "./LoadingComponent.css";

// Importing loading icons
import loadingIcon1 from '../../assets/loading-icon-1.png';
import loadingIcon2 from '../../assets/loading-icon-2.png';
import loadingIcon3 from '../../assets/loading-icon-3.png';
import loadingIcon4 from '../../assets/loading-icon-4.png';
import loadingIcon5 from '../../assets/loading-icon-5.png';
import loadingIcon6 from '../../assets/loading-icon-6.png';
import { useWebNavStore } from "../../Store/useWebStores/useWebNavStore";

const loadingImages = [
    loadingIcon6,
    loadingIcon3,
    loadingIcon4,
    loadingIcon1,
    loadingIcon5,
    loadingIcon2,
];

const LoadingComponent = () => {

    const {isLoadingComponent} = useWebNavStore();
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        if (!isLoadingComponent) return;

        const interval = setInterval(() => {
            setImageIndex((prev) => (prev + 1) % loadingImages.length);
        }, 500); // Change image every 0.5 seconds

        return () => clearInterval(interval);
    }, [isLoadingComponent]);

    if (!isLoadingComponent) return null;

    return (
        <div className="loading-component-overlay">
            <img
                src={loadingImages[imageIndex]}
                alt={`Loading-image`}
                className="loading-component-image"
            />
        </div>
    );
};

export default LoadingComponent;
