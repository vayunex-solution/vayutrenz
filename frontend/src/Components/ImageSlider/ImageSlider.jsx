import { useEffect, useState } from "react";
import "./ImageSlider.css";
import AdvertisementPanel from "../AdvertisementPanel/AdvertisementPanel";
import { useNavigate } from "react-router-dom";

function ImageSlider({ slideImages }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideWidth, setSlideWidth] = useState(33.3); // default vw
    const navigate = useNavigate();
    const [resetPoint, setResetPoint] = useState(slideImages?.length - 3)
    
    
    // Update slideWidth based on window width
    useEffect(() => {
    const updateSlideWidth = () => {
        const width = window.innerWidth; // ✅ Move this INSIDE
        if (width < 450) {
            setSlideWidth(99.8);
            setResetPoint(slideImages?.length - 1);
        } else if (width < 700) {
            setSlideWidth(50);
            setResetPoint(slideImages?.length - 2);
        } else {
            setSlideWidth(33.3);
            setResetPoint(slideImages?.length - 3);
        }
    };

    updateSlideWidth(); // run on mount
    window.addEventListener("resize", updateSlideWidth);

    return () => window.removeEventListener("resize", updateSlideWidth);
}, [slideImages?.length]); // ✅ dependency updated


    // Auto slide
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) =>
                prev >= resetPoint ? 0 : prev + 1
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [resetPoint]);

    return (
        <div className="image-slider">
            <div className="slider-container">
                <div className="slider-label">
                    <p className="slider-label-text">{"Best Deal For You"}</p>
                </div>

                <div
                    className={`slider-wrapper ${slideImages?.length < 3 ? 'slider-wrapper-center' : ''}`}
                    style={{ transform: `translateX(-${currentIndex * slideWidth}vw)` }}
                >
                    {slideImages?.map((item, index) => (
                        <img
                            onClick={() => navigate(`/collection${item.route[0]==="/"?"":"/"}${item.route}`)}
                            src={item.image}
                            alt={`Slide ${index + 1}`}
                            className="slider-image"
                            key={index}
                        />
                    ))}
                </div>

                <div className="slider-dots">
                    {Array.from({ length: resetPoint + 1 }).map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${currentIndex === index ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ImageSlider;
