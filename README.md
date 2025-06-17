# Toy Robot Simulator

A full-stack application that simulates a toy robot moving on a 5x5 square tabletop. The application consists of a NestJS backend API and a React frontend web application.

## Project Structure

```
rohirrim/
├── api/         # NestJS backend application
└── web/         # React frontend application
```

## Screenshots
<img width="849" alt="Screenshot 2025-06-17 at 5 15 42 PM" src="https://github.com/user-attachments/assets/7314a198-7554-4fd6-a953-2ac030457b8b" />

<img width="873" alt="Screenshot 2025-06-17 at 5 16 00 PM" src="https://github.com/user-attachments/assets/ed771b6f-df9e-47d8-9ac0-3bbbaf03671b" />


## Features

- Interactive 5x5 tabletop grid where clicking places the robot
- Robot movement controls via buttons and arrow keys
- Persistent storage of robot position and movement history
- Real-time position updates
- Command validation to prevent robot from falling off the table

### Robot Commands

- **PLACE**: Places the robot on the table at specified X,Y coordinates facing a direction
- **MOVE**: Moves the robot one space forward in the current direction
- **LEFT**: Rotates the robot 90 degrees left
- **RIGHT**: Rotates the robot 90 degrees right
- **REPORT**: Displays the current position and facing direction

## Technical Details

- Created with Cursor IDE, Tailwind, NestJS, React, Tanstack Query, Vitest, Jest

### Backend (NestJS)
- RESTful API endpoints for robot control
- Database integration for position persistence
- Movement history tracking
- Command validation logic

### Frontend (React)
- Interactive grid interface
- Visual representation of robot position and direction
- Keyboard controls (arrow keys)
- Real-time position updates

## Setup Instructions

### Backend Setup
```bash
cd api
pnpm install
# Configure your database connection in .env
pnpm start
```

### Frontend Setup
```bash
cd web
pnpm install
pnpm dev
```

## Testing Instructions

1. **Basic Movement Test**
   - Click on position (0,0) to PLACE robot facing NORTH
   - Press MOVE button or up arrow key
   - Click REPORT to verify position is (0,1,NORTH)

2. **Rotation Test**
   - PLACE robot at (0,0) facing NORTH
   - Press LEFT button
   - Click REPORT to verify robot is facing WEST

3. **Complex Movement Test**
   - PLACE robot at (1,2) facing NORTH
   - Press MOVE twice
   - Press RIGHT
   - Press MOVE
   - Click REPORT to verify position is (2,4,EAST)

4. **Boundary Test**
   - PLACE robot at (0,0) facing SOUTH
   - Press MOVE (should be ignored)
   - Click REPORT to verify position remains (0,0,SOUTH)

5. **Persistence Test**
   - Move robot to any position
   - Refresh the page
   - Verify robot appears in the last known position

## Constraints

- Robot must not fall off the table during movement
- Invalid moves are ignored


## Coordinate System

- Origin (0,0) is at the SOUTH WEST corner (bottom left)
- X increases from left to right
- Y increases from bottom to top
- Valid coordinates range from 0 to 4 for both X and Y

