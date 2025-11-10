# Real-TimeVideoProcessing-Task
The goal is to create a real-time web application that captures live video from the user’s camera, processes it on the backend, and visualizes the processed frames on the frontend — all in real time.

## Objective

- Capture live camera feed.
- Send each frame to the backend for processing.
- Backend draws a red semi-transparent shape (4 random points) and generates 5 new random points.
- Frontend draws a blue semi-transparent shape using the 5 points received from backend.

### Frontend (Angular)

- Live camera capture and display.
- Two video panels:
  - Left: Raw feed.
  - Right: Processed feed with overlays.
- Draws blue transparent shape using backend points.
- Shows frame number and delay.
- Built with Angular, TypeScript, HTML5 Canvas, and Socket.IO.

### Backend (Python + FastAPI)
- Receives video frames from frontend via WebSocket.
- Processes frame using OpenCV.
- Draws red transparent shape with 4 random points.
- Generates 5 new random points and sends them back with the processed frame.
- Handles multiple users simultaneously.

## Tech Stack

- **Frontend:** Angular, TypeScript, HTML5 Canvas, Socket.IO
- **Backend:** FastAPI, Python, OpenCV, NumPy, Socket.IO
- **Communication:** Real-time bi-directional using WebSockets

## How to Run

cd Frontend
npm install
ng serve --o ( to open on localhost direct)

### Backend
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 5000


