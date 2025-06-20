import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Board from './Board';
import {
  getRobotPosition,
  sendRobotCommand,
  CommandType,
  Direction,
} from './robotApi';
import { toast } from 'sonner';

export default function App() {
  const queryClient = useQueryClient();
  const reportRef = useRef(null);

  // Query for robot position
  const {
    data: robot,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['robot'],
    queryFn: getRobotPosition,
  });

  // Mutation for robot commands
  const mutation = useMutation({
    mutationFn: sendRobotCommand,
    onSuccess: () => queryClient.invalidateQueries(['robot']),
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message?.message || error.message;
      toast.error(errorMessage);
    },
  });

  const handleCellClick = (x, y) => {
    mutation.mutate({
      type: CommandType.PLACE,
      x,
      y,
      direction: Direction.NORTH,
    });
    if (reportRef.current) reportRef.current.textContent = '';
  };

  const handleMove = () => {
    if (!robot) return;
    mutation.mutate({ type: CommandType.MOVE });
    if (reportRef.current) reportRef.current.textContent = '';
  };

  const handleLeft = () => {
    if (!robot) return;
    mutation.mutate({ type: CommandType.LEFT });
    if (reportRef.current) reportRef.current.textContent = '';
  };

  const handleRight = () => {
    if (!robot) return;
    mutation.mutate({ type: CommandType.RIGHT });
    if (reportRef.current) reportRef.current.textContent = '';
  };

  const handleReport = async () => {
    if (!robot) return;
    // Refetch to get latest position
    const { data } = await refetch();
    if (data && reportRef.current) {
      reportRef.current.textContent = `Output: ${data.x},${data.y},${data.direction}`;
    }
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
      {isLoading ? (
        <div className="text-cyan-300">Loading...</div>
      ) : isError ? (
        <div className="text-red-400">Error loading robot position</div>
      ) : (
        <Board robot={robot} onCellClick={handleCellClick} />
      )}
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
      <div
        ref={reportRef}
        className="mt-4 text-cyan-300 text-lg font-mono"
      ></div>
    </div>
  );
}
