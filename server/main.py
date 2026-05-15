from flask import Flask, request
from flask_socketio import SocketIO, join_room

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route("/")
def home():
    return "Socket.IO Server Running"

def build_assignment_message(data):
    teacher_name = (data.get("teacherName") or "el docente").strip()
    subject_name = (data.get("subjectName") or "la asignatura").strip()
    subject_code = (data.get("subjectCode") or "").strip()
    group_name = (data.get("groupName") or "").strip()

    subject_label = f"{subject_code} - {subject_name}" if subject_code else subject_name
    group_label = f" ({group_name})" if group_name else ""

    return f"Se asignó a {teacher_name} la asignatura {subject_label}{group_label}."


@socketio.on("assign_teacher_notification")
def handle_assign_teacher_notification(data):
    payload = data if isinstance(data, dict) else {}
    message = build_assignment_message(payload)
    teacher_id = str(payload.get("teacherId") or "").strip()
    teacher_user_id = str(payload.get("teacherUserId") or "").strip()

    notification = {
        "message": message,
        "teacherId": payload.get("teacherId"),
        "teacherName": payload.get("teacherName"),
        "subjectName": payload.get("subjectName"),
        "subjectCode": payload.get("subjectCode"),
        "groupName": payload.get("groupName"),
        "createdAt": payload.get("createdAt"),
    }

    # Prefer emitting to the teacher's user-based room if provided
    if teacher_user_id:
        socketio.emit("new_notification", notification, room=f"teacher_user:{teacher_user_id}")
    elif teacher_id:
        socketio.emit("new_notification", notification, room=f"teacher:{teacher_id}")
    else:
        socketio.emit("new_notification", notification)
    print(f"Notificación de asignación enviada para {request.sid}")


@socketio.on("join_teacher_room")
def handle_join_teacher_room(data):
    payload = data if isinstance(data, dict) else {}
    # allow joining by either teacherId (db id) or teacherUserId (user.id)
    teacher_id = str(payload.get("teacherId") or "").strip()
    teacher_user_id = str(payload.get("teacherUserId") or "").strip()

    if teacher_user_id:
        join_room(f"teacher_user:{teacher_user_id}")
        print(f"Socket {request.sid} unido a teacher_user:{teacher_user_id}")
        return

    if teacher_id:
        join_room(f"teacher:{teacher_id}")
        print(f"Socket {request.sid} unido a teacher:{teacher_id}")

@socketio.on("connect")
def handle_connect():
    print("Cliente conectado")

@socketio.on("disconnect")
def handle_disconnect():
    print("Cliente desconectado")

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=3000, debug=True)