import React, { useState, useEffect } from 'react';

/**
 * Reusable Custom Dropdown Component
 * 
 * Features:
 * - Custom styled dropdown with consistent design
 * - Loading states with spinner animation
 * - Click outside to close functionality
 * - Configurable size variants (small, medium, large)
 * - Support for single and multiple selections
 * - Customizable styling and placeholder text
 * 
 * @param {Object} props - Component props
 * @param {Array} props.options - Array of options to display
 * @param {string|Array} props.value - Current selected value(s)
 * @param {Function} props.onChange - Callback function when selection changes
 * @param {string} props.placeholder - Placeholder text when no option is selected
 * @param {string} props.size - Size variant: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} props.disabled - Whether the dropdown is disabled
 * @param {boolean} props.multiple - Whether multiple selections are allowed
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.loading - Whether the dropdown is in loading state
 * @param {string} props.label - Label for the dropdown
 * @param {boolean} props.required - Whether the field is required
 * 
 * @example
 * // Single selection dropdown
 * <CustomDropdown
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}
 *   value={selectedValue}
 *   onChange={handleChange}
 *   placeholder="Select an option"
 *   label="Category"
 * />
 * 
 * @example
 * // Multiple selection dropdown
 * <CustomDropdown
 *   options={sizeOptions}
 *   value={selectedSizes}
 *   onChange={handleSizeChange}
 *   placeholder="Select sizes"
 *   multiple={true}
 *   label="Product Sizes"
 * />
 */
export const CustomDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  size = 'medium',
  disabled = false,
  multiple = false,
  className = '',
  loading = false,
  label = '',
  required = false
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Get size-specific classes for the dropdown
   * @param {string} size - The size variant
   * @returns {Object} - Object containing size-specific classes
   */
  const getSizeClasses = (size) => {
    const sizeMap = {
      small: {
        button: 'px-3 py-2 text-xs min-h-[32px]',
        icon: 'w-3 h-3',
        dropdown: 'text-xs',
        item: 'px-3 py-1.5 text-xs'
      },
      medium: {
        button: 'px-4 py-2.5 text-sm min-h-[40px]',
        icon: 'w-4 h-4',
        dropdown: 'text-sm',
        item: 'px-4 py-2 text-sm'
      },
      large: {
        button: 'px-4 py-3 text-base min-h-[48px]',
        icon: 'w-5 h-5',
        dropdown: 'text-base',
        item: 'px-4 py-2.5 text-base'
      }
    };
    return sizeMap[size] || sizeMap.medium;
  };

  /**
   * Toggle dropdown visibility
   */
  const toggleDropdown = () => {
    if (disabled || loading) return;
    setOpenDropdown(!openDropdown);
  };

  /**
   * Close dropdown
   */
  const closeDropdown = () => {
    setOpenDropdown(false);
    setSearchTerm('');
  };

  /**
   * Handle option selection
   * @param {Object} option - The selected option
   */
  const handleOptionSelect = (option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.some(v => v === option.value);
      
      let newValues;
      if (isSelected) {
        // Remove from selection
        newValues = currentValues.filter(v => v !== option.value);
      } else {
        // Add to selection
        newValues = [...currentValues, option.value];
      }
      
      onChange(newValues);
    } else {
      onChange(option.value);
      closeDropdown();
    }
  };

  /**
   * Get display text for the selected value(s)
   */
  const getDisplayText = () => {
    if (loading) return 'Loading...';
    
    if (multiple) {
      const selectedValues = Array.isArray(value) ? value : [];
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option ? option.label : selectedValues[0];
      }
      return `${selectedValues.length} selected`;
    } else {
      if (!value) return placeholder;
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
  };

  /**
   * Check if an option is selected
   * @param {Object} option - The option to check
   * @returns {boolean} - Whether the option is selected
   */
  const isOptionSelected = (option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      return currentValues.includes(option.value);
    } else {
      return value === option.value;
    }
  };

  /**
   * Filter options based on search term
   */
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-dropdown')) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`custom-dropdown ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-[14px] font-[500] mb-1 text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Dropdown Button */}
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled || loading}
          className={`
            w-full border border-gray-300 rounded-md bg-white text-left
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200 flex items-center justify-between
            ${sizeClasses.button}
            ${disabled || loading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400'}
            ${!value && !multiple ? 'text-gray-500' : 'text-gray-900'}
          `}
        >
          <span className="truncate flex-1">
            {getDisplayText()}
          </span>
          
          {loading ? (
            <svg className={`${sizeClasses.icon} animate-spin text-gray-400`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg 
              className={`${sizeClasses.icon} text-gray-400 transition-transform duration-200 ${openDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* Dropdown Menu */}
        {openDropdown && !loading && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
            {/* Search Input (if many options) */}
            {options.length > 5 && (
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Options List */}
            <div className="py-1 max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className={`${sizeClasses.item} text-gray-500 text-center`}>
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      w-full text-left transition-colors
                      ${sizeClasses.item}
                      ${isOptionSelected(option) 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'hover:bg-gray-100 text-gray-900'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {isOptionSelected(option) && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Multiple Selection Actions */}
            {multiple && (
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>
                    {Array.isArray(value) ? value.length : 0} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;
