import Robot from './Robot';

export default function Board({ robot, onCellClick }) {
  const size = 5;
  return (
    <div className="grid grid-cols-5 grid-rows-5 gap-1 bg-slate-700 p-4 rounded-lg w-fit mx-auto">
      {[...Array(size * size)].map((_, idx) => {
        const x = idx % size;
        const y = size - 1 - Math.floor(idx / size); // y=0 is bottom row
        const isRobot = robot && robot.x === x && robot.y === y;
        return (
          <div
            key={idx}
            className="w-20 h-20 flex items-center justify-center bg-slate-800 border border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors relative"
            onClick={() => onCellClick(x, y)}
          >
            {isRobot && <Robot direction={robot.direction} />}
          </div>
        );
      })}
    </div>
  );
}
