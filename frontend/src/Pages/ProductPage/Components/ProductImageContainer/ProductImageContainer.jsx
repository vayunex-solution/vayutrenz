import React, { useState, useEffect } from 'react';
import './ProductImageContainer.css';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';


const ProductImageContainer = ({images}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [thumbStart, setThumbStart] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

    const visibleThumbs = 4;

    const handleResize = () => {
        setIsMobile(window.innerWidth < 600);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showPrevImage = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
        if (!isMobile && thumbStart > 0) setThumbStart(thumbStart - 1);
    };

    const showNextImage = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
        if (!isMobile && thumbStart + visibleThumbs < images.length) setThumbStart(thumbStart + 1);
    };

    const visibleImages = isMobile ? images : images.slice(thumbStart, thumbStart + visibleThumbs);

    return (
        <div className={`pic-wrapper ${isMobile ? 'mobile' : ''}`}>
            {!isMobile && (
                <div className="thumb-section">
                    <div className="arrow-btn" onClick={showPrevImage}>
                        <ChevronUp />
                    </div>

                    <div className="thumb-list vertical">
                        {visibleImages.map((img, idx) => {
                            const actualIndex = thumbStart + idx;
                            return (
                                <div
                                    key={actualIndex}
                                    className={`thumb-box ${actualIndex === currentIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentIndex(actualIndex)}
                                    style={{ backgroundImage: `url(${img})` }}
                                />
                            );
                        })}
                    </div>

                    <div className="arrow-btn" onClick={showNextImage}>
                        <ChevronDown />
                    </div>
                </div>
            )}

            <div className="main-img-section">
                <button
                    style={{ outline: "none", border: "none" }}
                    className="side-arrow left" onClick={showPrevImage}>
                    <ChevronLeft className='side-arrow-icon'/>
                </button>

                <div
                    className="main-img-box"
                    style={{ backgroundImage: `url(${images[currentIndex]})` }}
                ></div>

                <button
                    style={{ outline: "none", border: "none" }}
                    className="side-arrow right" onClick={showNextImage}>
                    <ChevronRight className='side-arrow-icon'/>
                </button>

                {isMobile && (
                    <div className="thumb-list horizontal-scroll">
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                className={`thumb-box ${idx === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(idx)}
                                style={{ backgroundImage: `url(${img})` }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductImageContainer;
