// RulerIcon.jsx
import React from 'react';

const RulerIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 9h2l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2M3 15h2l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

export default RulerIcon; // Export como default