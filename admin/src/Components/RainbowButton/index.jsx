import React from 'react';
import { Link } from 'react-router-dom';

// Add CSS animation for rainbow effect
const rainbowKeyframes = `
  @keyframes rainbow {
    0% { background-position: 0% 0%; }
    50% { background-position: 100% 0%; }
    100% { background-position: 0% 0%; }
  }
`;

// Inject the CSS if not already present
if (typeof document !== 'undefined' && !document.getElementById('rainbow-button-styles')) {
  const style = document.createElement('style');
  style.id = 'rainbow-button-styles';
  style.textContent = rainbowKeyframes;
  document.head.appendChild(style);
}

/**
 * Custom Rainbow Button Component
 * Creates a button with animated rainbow border effect and glow
 * Matches the design from the screenshot with black background and white text
 */
const RainbowButton = ({ 
  children, 
  to, 
  onClick, 
  className = "", 
  disabled = false,
  ...props 
}) => {
  const buttonContent = (
    <button
      className={`
        relative inline-flex items-center justify-center
        px-6 py-2 
        bg-black text-white 
        font-semibold text-sm
        rounded-lg
        border border-[#202020]
        transition-all duration-300 ease-in-out
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
      style={{
        borderBottom: '2px solid transparent',
        backgroundImage: 'linear-gradient(black, black), linear-gradient(90deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        backgroundSize: '100% 100%, 200% 100%',
        animation: 'rainbow 8s ease infinite'
      }}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      
      {/* Content */}
      <span className="relative z-10">
        {children}
      </span>
      
      {/* Bottom glow effect */}
      <div 
        className="absolute -bottom-1 left-0 right-0 h-3 blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, rgba(255,0,0,0.4), rgba(255,128,0,0.4), rgba(255,255,0,0.4), rgba(128,255,0,0.4), rgba(0,255,0,0.4), rgba(0,255,128,0.4), rgba(0,255,255,0.4), rgba(0,128,255,0.4), rgba(0,0,255,0.4), rgba(128,0,255,0.4), rgba(255,0,255,0.4), rgba(255,0,128,0.4))',
          backgroundSize: '200% 100%',
          animation: 'rainbow 8s ease infinite'
        }}
      ></div>
    </button>
  );

  // If 'to' prop is provided, wrap with Link
  if (to) {
    return (
      <Link to={to} className="inline-block">
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
};

export default RainbowButton;
