import socketio
import cv2
import base64
import numpy as np
import uvicorn
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)

@app.get("/")
def home():
    return {"message": "backend running "}

@sio.event
async def connect(sid, environ):
    print(f" Client connect: {sid}")

@sio.event
async def disconnect(sid):
    print(f" Client disconnect: {sid}")

@sio.event
async def frame(sid, data):
    try:
        if not isinstance(data, dict) or "buf" not in data:
            print("no buf found ")
            return

        buf = data["buf"]

        if isinstance(buf, list):
            buf = bytes(buf)
        elif isinstance(buf, str):
            buf = base64.b64decode(buf.split(",")[-1])

        np_arr = np.frombuffer(buf, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            print("Failed to decode frame")
            return

        h, w, _ = frame.shape

        red_points = np.array([[w//4, h//4], [w//2, h//2], [w//4, 3*h//4]], np.int32)
        cv2.polylines(frame, [red_points], isClosed=True, color=(0, 0, 255), thickness=3)
        cv2.fillPoly(frame, [red_points], color=(0, 0, 255))

        blue_points = [
            [int(3*w/4 - 60), int(h/4)],
            [int(3*w/4 + 60), int(h/4)],
            [int(3*w/4 + 60), int(h/2)],
            [int(3*w/4 - 60), int(h/2)]
        ]

        _, buffer = cv2.imencode('.jpg', frame)
        image_b64 = base64.b64encode(buffer).decode('utf-8')

        payload = {
            "frameNum": data.get("frameNum"),
            "serverTs": int(time.time() * 1000),
            "image_b64": image_b64,
            "points": blue_points  
        }

        await sio.emit("processed", payload, to=sid)
        print(f"  processed successfully (frame #{data.get('frameNum')})")

    except Exception as e:
        print(" error processing frame:", e)

if __name__ == "__main__":
    uvicorn.run("main:asgi_app", host="0.0.0.0", port=5000, reload=True)
