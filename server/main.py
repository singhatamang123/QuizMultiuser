import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from models import Player, GameState
from room import Room
from questions import get_questions

app = FastAPI(title="Tarka Quiz Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rooms: dict[str, Room] = {}


@app.get("/")
def health_check():
    return {
        "status": "running",
        "rooms": len(rooms),
        "room_list": list(rooms.keys()),
    }


@app.websocket("/ws/{room_code}/{player_id}")
async def websocket_endpoint(
    ws: WebSocket,
    room_code: str,
    player_id: str,
):
    await ws.accept()
    room_code = room_code.upper().strip()
    print(f"\n[CONNECT] player={player_id} room={room_code}")

    # ── Read join payload ─────────────────────────────────────────────
    try:
        raw = await ws.receive_text()
        payload = json.loads(raw)
        print(f"[JOIN PAYLOAD] {payload}")
    except Exception as e:
        print(f"[ERROR] Failed to read join payload: {e}")
        await ws.close()
        return

    name = str(payload.get("name", "Player")).strip() or "Player"
    tole = str(payload.get("tole", "Kathmandu")).strip() or "Kathmandu"

    # ── Create room if new ────────────────────────────────────────────
    if room_code not in rooms:
        rooms[room_code] = Room(code=room_code, host_id=player_id)
        print(f"[ROOM CREATED] {room_code} host={player_id}")
    else:
        print(f"[ROOM JOINED] {room_code} existing room")

    room = rooms[room_code]

    # ── Add player ────────────────────────────────────────────────────
    player = Player(id=player_id, name=name, tole=tole, ws=ws)
    await room.player_join(player)

    is_host = (player_id == room.host_id)
    print(f"[PLAYER ADDED] name={name} is_host={is_host} total_players={len(room.players)}")

    # ── Send joined confirmation ──────────────────────────────────────
    joined_msg = {
        "event": "joined",
        "room_code": room_code,
        "is_host": is_host,
        "players": [
            {
                "id": p.id,
                "name": p.name,
                "tole": p.tole,
                "score": p.score,
            }
            for p in room.players.values()
        ],
    }
    await ws.send_text(json.dumps(joined_msg))
    print(f"[SENT] joined to {name}")

    # ── Message loop ──────────────────────────────────────────────────
    try:
        async for raw_message in ws.iter_text():
            try:
                msg = json.loads(raw_message)
            except Exception:
                continue

            event = msg.get("event", "")
            print(f"[MSG] from={name} event={event} state={room.state.value}")

            if event == "start_game":
                if player_id != room.host_id:
                    print(f"[BLOCKED] {name} is not host, cannot start")
                    continue
                if room.state not in (GameState.LOBBY, GameState.GAMEOVER):
                    print(f"[BLOCKED] room state is {room.state.value}, not lobby or gameover")
                    continue
                category = msg.get("category", "Nepal general")
                print(f"[START] Starting game category={category}")
                questions = get_questions(category=category, n=10)
                print(f"[QUESTIONS] Got {len(questions)} questions")
                await room.start_game(questions)

            elif event == "answer":
                answer = msg.get("answer", "").upper()
                if answer not in ("A", "B", "C", "D"):
                    continue
                print(f"[ANSWER] {name} answered {answer}")
                await room.receive_answer(player_id, answer)

    except WebSocketDisconnect:
        print(f"[DISCONNECT] {name} left room {room_code}")
    except Exception as e:
        print(f"[ERROR] {name}: {e}")
    finally:
        await room.player_leave(player_id)
        if len(room.players) == 0:
            rooms.pop(room_code, None)
            print(f"[ROOM DELETED] {room_code} is empty")