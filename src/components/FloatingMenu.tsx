import React, { useState, useRef, useEffect } from 'react';
import { FloatingMenuProps } from '@/types/artwork';

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ years, selectedYear, onYearSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);

    // Set menu width to the width of the "Complete Works" text if not already set
    if (!menuWidth && buttonRef.current) {
      setMenuWidth(buttonRef.current.offsetWidth);
    }
  };

  const handleMouseLeave = () => {
    // Add a small delay to allow for easier interaction
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleYearClick = (e: React.MouseEvent, year: number | null) => {
    e.preventDefault();
    onYearSelect(selectedYear === year ? null : year);

    // Clear timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Determine button text based on selected year
  const buttonText = selectedYear
    ? `${selectedYear}`
    : 'Complete Works';

  // Prepare menu items
  const menuItems = selectedYear
    ? [
      { label: 'Complete Works', value: null },
      ...years.map(year => ({ label: `${year}`, value: year }))
    ]
    : years.map(year => ({ label: `${year}`, value: year }));

  return (
    <div
      ref={menuRef}
      className="absolute top-4 right-4 z-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
        style={{ minWidth: menuWidth ? `${menuWidth}px` : 'auto' }}
        className="flex items-center justify-center gap-2 px-3 py-2 
                   bg-gray-800 text-white 
                   rounded-lg shadow-md 
                   hover:bg-gray-700 
                   transition-colors duration-200 
                   focus:outline-none focus:ring-2 focus:ring-gray-600"
      >
        {buttonText}
      </button>

      {isOpen && (
        <div
          style={{ width: menuWidth ? `${menuWidth}px` : 'auto' }}
          className="absolute top-full right-0 mt-2 
                     bg-gray-800 text-white 
                     rounded-lg shadow-lg 
                     overflow-hidden 
                     border border-gray-700 
                     animate-fade-in-down"
        >
          {menuItems.map(({ label, value }) => (
            <button
              key={label}
              onClick={(e) => handleYearClick(e, value as number | null)}
              className={`block w-full text-center px-3 py-2 text-sm 
                          transition-colors duration-200 
                          ${selectedYear === value
                  ? 'bg-gray-700'
                  : 'hover:bg-gray-700'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FloatingMenu;