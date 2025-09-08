// ScrollToTop.jsx
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ScrollToTop.css"

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const [showTop, setShowTop] = useState(false);

    // Scroll to top
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    // Scroll event to load more and toggle back-to-top
    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, } = document.documentElement;
            // Toggle back-to-top button
            setShowTop(scrollTop > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Scroll to the top whenever the pathname changes
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <>
            {showTop && (
                <button className="back-to-top" onClick={scrollToTop}>
                    <ArrowUp className='scroll-arrow-up' />
                </button>
            )}
        </>
    ); // This component doesn't render anything
};

export default ScrollToTop;
