import React from 'react';
import { NavigationArrowsProps } from '../types/artwork';

const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  onPrev,
  onNext,
  showPrev,
  showNext
}) => {
  return (
    <>
      {showPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 
            bg-gray-800 text-white 
            rounded-lg shadow-md 
            hover:bg-gray-700 
            transition-colors duration-200 
            focus:outline-none focus:ring-2 focus:ring-gray-600
            p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
      {showNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 
            bg-gray-800 text-white 
            rounded-lg shadow-md 
            hover:bg-gray-700 
            transition-colors duration-200 
            focus:outline-none focus:ring-2 focus:ring-gray-600
            p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default NavigationArrows;