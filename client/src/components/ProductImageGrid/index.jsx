import React, { useState, useRef, useEffect } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export const ProductImageGrid = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  // Handle touch events for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && selectedImage < images.length - 1) {
      // Swipe left - next image
      setSelectedImage(selectedImage + 1);
    } else if (distance < -minSwipeDistance && selectedImage > 0) {
      // Swipe right - previous image
      setSelectedImage(selectedImage - 1);
    }
  };

  // Navigate to specific image
  const goToImage = (index) => {
    setSelectedImage(index);
  };

  // Arrange images in consistent 2-column grid for desktop
  const arrangeImages = () => {
    const arrangements = [];
    let currentIndex = 0;

    while (currentIndex < images.length) {
      const row = [];
      // Always try to fill 2 positions per row
      row.push(images[currentIndex]);
      currentIndex++;

      if (currentIndex < images.length) {
        row.push(images[currentIndex]);
        currentIndex++;
      } else {
        // If odd number, add null to maintain grid structure
        row.push(null);
      }

      arrangements.push(row);
    }
    return arrangements;
  };

  const imageArrangements = arrangeImages();

  return (
    <div className="w-full">
      {/* Mobile Carousel View */}
      {isMobile ? (
        <div className="relative">
          {/* Main Image Container */}
          <div 
            className="relative overflow-hidden aspect-[4/5] bg-gray-100"
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-300 ease-out h-full"
              style={{ transform: `translateX(-${selectedImage * 100}%)` }}
            >
              {images.map((image, index) => (
                <div key={index} className="w-full h-full flex-shrink-0">
                  <Zoom>
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: "center top" }}
                    />
                  </Zoom>
                </div>
              ))}
            </div>
            
            {/* Navigation Arrows */}
            {selectedImage > 0 && (
              <button 
                onClick={() => setSelectedImage(selectedImage - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {selectedImage < images.length - 1 && (
              <button 
                onClick={() => setSelectedImage(selectedImage + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center items-center space-x-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === selectedImage 
                    ? 'bg-gray-800 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Desktop Grid View */
        <div className="space-y-1">
          {imageArrangements.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-2 gap-1">
              {row.map((image, imageIndex) => {
                if (image === null) {
                  // Empty space for odd number of images
                  return <div key={imageIndex} className="aspect-[4/5]"></div>;
                }

                const globalIndex =
                  imageArrangements
                    .slice(0, rowIndex)
                    .reduce(
                      (acc, r) => acc + r.filter((img) => img !== null).length,
                      0
                    ) + imageIndex;
                return (
                  <div
                    key={globalIndex}
                    className="aspect-[4/5] overflow-hidden bg-gray-100 cursor-pointer group"
                  >
                    <Zoom>
                      <img
                        src={image}
                        alt={`Product image ${globalIndex + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        style={{ objectPosition: "center top" }}
                      />
                    </Zoom>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
