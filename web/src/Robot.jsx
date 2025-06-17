import React from 'react';
const directionToRotation = {
  NORTH: 0,
  EAST: 90,
  SOUTH: 180,
  WEST: -90,
};

export default function Robot({ direction = 'NORTH' }) {
  return (
    <div
      className="text-cyan-300 text-4xl flex flex-col items-center justify-center transition-transform"
      title={direction}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: `rotate(${directionToRotation[direction]}deg)` }}
        className="robot-svg"
      >
        <g>
          <path
            d="M 8 4 L 12 0 L 16 4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </g>

        <rect x="3" y="8" width="18" height="8" rx="2" />
        <rect x="7" y="16" width="10" height="4" rx="1" />
        <circle cx="7.5" cy="12" r="1.5" />
        <circle cx="16.5" cy="12" r="1.5" />
      </svg>
    </div>
  );
}
