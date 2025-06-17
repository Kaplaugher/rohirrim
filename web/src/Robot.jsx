const directionToRotation = {
  NORTH: 'rotate-0',
  EAST: 'rotate-90',
  SOUTH: 'rotate-180',
  WEST: '-rotate-90',
};

export default function Robot({ direction = 'NORTH' }) {
  return (
    <div
      className={`text-cyan-300 text-4xl flex items-center justify-center transition-transform ${directionToRotation[direction]}`}
      title={direction}
    >
      {/* Simple robot SVG icon */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-robot"
      >
        <rect x="3" y="8" width="18" height="8" rx="2" />
        <rect x="7" y="16" width="10" height="4" rx="1" />
        <circle cx="7.5" cy="12" r="1.5" />
        <circle cx="16.5" cy="12" r="1.5" />
      </svg>
    </div>
  );
}
