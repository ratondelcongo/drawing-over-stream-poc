import cv2
import base64
import socketio
import uuid
import os
from dotenv import load_dotenv


def send_frame(sio, frame):
    _, buffer = cv2.imencode(".jpg", frame)
    frame_base64 = base64.b64encode(buffer).decode("utf-8")
    sio.emit("data", {"frame_id": str(uuid.uuid4()), "frame": frame_base64})


load_dotenv()
SOCKET_URL = os.getenv("SOCKET_URL")

cap = cv2.VideoCapture(0)
sio = socketio.Client()
sio.connect(SOCKET_URL)

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # cv2.imshow("server", frame)
        send_frame(sio, frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
finally:
    cap.release()
    cv2.destroyAllWindows()
    sio.disconnect()
