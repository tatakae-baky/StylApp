import React, { useEffect, useMemo, useRef, useState } from 'react';

const BrandList = ({ brandsByLetter, hoveredBrand, onBrandHover, onBrandClick }) => {
  const containerRef = useRef(null);
  const [activeLetter, setActiveLetter] = useState(brandsByLetter?.[0]?.letter || 'A');

  const letters = useMemo(() => {
    return Array.from(new Set(brandsByLetter.map((g) => g.letter)));
  }, [brandsByLetter]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const headers = container.querySelectorAll('[data-letter]');
    const observers = [];

    headers.forEach((el) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const letter = entry.target.getAttribute('data-letter');
              setActiveLetter(letter);
            }
          });
        },
        { root: container, threshold: 1.0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [brandsByLetter]);

  const scrollToLetter = (letter) => {
    const container = containerRef.current;
    if (!container) return;
    const target = container.querySelector(`[data-letter="${letter}"]`);
    if (target) {
      container.scrollTo({
        top: target.offsetTop - container.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="brand-list-container flex gap-2">
      <div className="flex-1 min-w-[240px]">
        {/* Featured Brands Header - Always visible at top */}
        <div className="mb-4">
          <button
            className={`w-full text-left py-2 px-3 text-sm font-medium transition-colors border border-gray-300 ${
              !hoveredBrand ? 'text-gray-600 hover:text-black hover:font-bold' : ''
            }`}
            onMouseEnter={() => onBrandHover && onBrandHover(null)}
          >
            Featured Brands
          </button>
        </div>

        {/* Scrollable Brand List */}
        <nav
          ref={containerRef}
          className="flex flex-col space-y-1 max-h-[350px] overflow-y-auto pr-2 brand-list-scroll"
          aria-label="Brand Navigation"
        >
          {brandsByLetter.map((group) => (
            <div key={group.letter} className="brand-group">
              {/* Letter Header - plain text, no background */}
              <div
                data-letter={group.letter}
                className="text-[14px] font-bold text-gray-700 px-2 py-0.5 uppercase tracking-wider bg-transparent z-10"
              >
                {group.letter}
              </div>

              {/* Brands in this letter group - names only */}
              <div className="space-y-1 ">
                {group.brands.map((brand) => (
                  <button
                    key={brand._id}
                    className={`w-full text-left py-0.5 px-3 text-sm whitespace-nowrap transition-colors ${
                      hoveredBrand?._id === brand._id 
                        ? 'text-[#FF2E4D] font-bold ' 
                        : 'text-gray-700' 
                    }`}
                    onMouseEnter={() => onBrandHover(brand)} 
                    onClick={() => onBrandClick(brand)} 
                    title={`View ${brand.name} products`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Brand count indicator */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 px-3">
            {brandsByLetter.reduce((total, group) => total + group.brands.length, 0)} brands available
          </p>
        </div>
      </div>

      {/* Alphabet quick nav */}
      <div className="flex flex-col items-center justify-start select-none">
        {letters.map((ltr) => (
          <button
            key={ltr}
            className={`w-6 h-6 my-0.5 text-[11px] rounded-full flex items-center justify-center transition-colors ${
              activeLetter === ltr ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-black'
            }`}
            onClick={() => scrollToLetter(ltr)}
            aria-label={`Jump to brands starting with ${ltr}`}
          >
            {ltr}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandList;
