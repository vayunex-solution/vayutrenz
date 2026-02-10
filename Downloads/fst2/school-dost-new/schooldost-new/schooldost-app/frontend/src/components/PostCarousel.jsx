import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUtils';

export default function PostCarousel({ media }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const goToSlide = (index, e) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className="post-carousel">
      {/* Media Wrapper */}
      <div className="carousel-wrapper">
        <div 
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {media.map((item, index) => (
            <div key={item.id || index} className="carousel-slide">
              {item.type === 'VIDEO' ? (
                <video 
                  src={getImageUrl(item.url)} 
                  controls 
                  className="post-media" 
                />
              ) : (
                <img 
                  src={getImageUrl(item.url)} 
                  alt={`Slide ${index + 1}`} 
                  className="post-media"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button className="carousel-arrow left" onClick={prevSlide}>
            <FiChevronLeft />
          </button>
          <button className="carousel-arrow right" onClick={nextSlide}>
            <FiChevronRight />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {media.length > 1 && (
        <div className="carousel-dots">
          {media.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${currentIndex === index ? 'active' : ''}`}
              onClick={(e) => goToSlide(index, e)}
            />
          ))}
        </div>
      )}

      {/* Slide Counter (Instagram style top right) */}
      {media.length > 1 && (
        <div className="carousel-counter">
          {currentIndex + 1}/{media.length}
        </div>
      )}
    </div>
  );
}
