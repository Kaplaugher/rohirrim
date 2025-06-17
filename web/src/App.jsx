import { useState } from 'react';
import Board from './Board';

const directions = ['NORTH', 'EAST', 'SOUTH', 'WEST'];

function getNextDirection(current, turn) {
  const idx = directions.indexOf(current);
  if (turn === 'LEFT') return directions[(idx + 3) % 4];
  if (turn === 'RIGHT') return directions[(idx + 1) % 4];
  return current;
}

export default function App() {
  const [robot, setRobot] = useState(null); // {x, y, direction}
  const [report, setReport] = useState('');

  const handleCellClick = (x, y) => {
    setRobot({ x, y, direction: 'NORTH' });
    setReport('');
  };

  const handleMove = () => {
    if (!robot) return;
    let { x, y, direction } = robot;
    if (direction === 'NORTH' && y < 4) y++;
    if (direction === 'SOUTH' && y > 0) y--;
    if (direction === 'EAST' && x < 4) x++;
    if (direction === 'WEST' && x > 0) x--;
    setRobot({ x, y, direction });
    setReport('');
  };

  const handleLeft = () => {
    if (!robot) return;
    setRobot({
      ...robot,
      direction: getNextDirection(robot.direction, 'LEFT'),
    });
    setReport('');
  };

  const handleRight = () => {
    if (!robot) return;
    setRobot({
      ...robot,
      direction: getNextDirection(robot.direction, 'RIGHT'),
    });
    setReport('');
  };

  const handleReport = () => {
    if (!robot) return;
    setReport(`${robot.x},${robot.y},${robot.direction}`);
  };

  // Keyboard controls
  const handleKeyDown = (e) => {
    if (!robot) return;
    if (e.key === 'ArrowUp') handleMove();
    if (e.key === 'ArrowLeft') handleLeft();
    if (e.key === 'ArrowRight') handleRight();
  };

  return (
    <div
      className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-6 p-4 bg-slate-800 rounded-lg text-center w-full max-w-xl">
        Click to place the robot, use the buttons or arrows to move
      </div>
      <Board robot={robot} onCellClick={handleCellClick} />
      <div className="flex gap-4 mt-8">
        <button
          className="bg-cyan-600 px-6 py-2 rounded font-bold hover:bg-cyan-500"
          onClick={handleLeft}
        >
          Left
        </button>
        <button
          className="bg-cyan-600 px-6 py-2 rounded font-bold hover:bg-cyan-500"
          onClick={handleMove}
        >
          Move
        </button>
        <button
          className="bg-cyan-600 px-6 py-2 rounded font-bold hover:bg-cyan-500"
          onClick={handleRight}
        >
          Right
        </button>
      </div>
      <button
        className="mt-6 px-8 py-2 border border-cyan-400 rounded hover:bg-cyan-900"
        onClick={handleReport}
      >
        Report
      </button>
      {report && (
        <div className="mt-4 text-cyan-300 text-lg font-mono">
          Output: {report}
        </div>
      )}
    </div>
  );
}
