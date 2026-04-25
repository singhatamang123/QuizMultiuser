import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from models import Player, GameState, Question
from room import Room
from questions import generate_questions

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


@app.post("/save-to-bank")
async def save_to_bank(questions: list[dict]):
    try:
        try:
            with open("question_bank.json", "r") as f:
                bank = json.load(f)
        except FileNotFoundError:
            bank = []
        
        # Avoid duplicates based on text
        existing_texts = {q["text"] for q in bank}
        new_count = 0
        for q in questions:
            if q["text"] not in existing_texts:
                bank.append(q)
                new_count += 1
        
        with open("question_bank.json", "w") as f:
            json.dump(bank, f, indent=2)
            
        return {"status": "success", "added": new_count}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/bank")
async def get_bank():
    try:
        with open("question_bank.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except Exception as e:
        return {"status": "error", "message": str(e)}


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
    avatar = str(payload.get("avatar", "👤")).strip() or "👤"

    # ── Create room if new ────────────────────────────────────────────
    if room_code not in rooms:
        if name.lower() != "singha":
            await ws.send_text(json.dumps({"event": "error", "message": "Only the teacher can create a room."}))
            await ws.close()
            return
        rooms[room_code] = Room(code=room_code, host_id=player_id)
        print(f"[ROOM CREATED] {room_code} host={player_id}")
    else:
        print(f"[ROOM JOINED] {room_code} existing room")

    room = rooms[room_code]

    is_host = (player_id == room.host_id)
    if is_host:
        room.host_ws = ws
    else:
        player = Player(id=player_id, name=name, tole=tole, avatar=avatar, ws=ws)
        await room.player_join(player)

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
                "avatar": p.avatar,
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
                
                custom_qs = msg.get("questions")
                if custom_qs:
                    questions = [
                        Question(text=q["text"], options=q["options"], answer=q["answer"],
                                 explanation=q["explanation"], category=q["category"])
                        for q in custom_qs
                    ]
                    print(f"[REVIEW] Using {len(questions)} custom/bank questions")
                else:
                    category = msg.get("category", "Class V")
                    topic = msg.get("topic")
                    print(f"[REVIEW] Generating questions for review, category={category}, topic={topic}")
                    questions = await generate_questions(category=category, n=10, topic=topic)
                
                print(f"[REVIEW] Sending {len(questions)} questions for host review")
                review_payload = [
                    {"text": q.text, "options": q.options, "answer": q.answer,
                     "explanation": q.explanation, "category": q.category}
                    for q in questions
                ]
                await room.send_to_host({"event": "review_questions", "questions": review_payload})

            elif event == "approve_questions":
                if player_id != room.host_id:
                    continue
                q_data_list = msg.get("questions", [])
                approved = [
                    Question(text=q["text"], options=q["options"], answer=q["answer"],
                             explanation=q["explanation"], category=q["category"])
                    for q in q_data_list
                ]
                print(f"[START] Host approved {len(approved)} questions. Starting game!")
                await room.start_game(approved)

            elif event == "answer":
                answer = msg.get("answer", "").upper()
                if answer not in ("A", "B", "C", "D"):
                    continue
                print(f"[ANSWER] {name} answered {answer}")
                await room.receive_answer(player_id, answer)

            elif event == "stop_game":
                if player_id == room.host_id:
                    print(f"[STOP] Host {name} stopped the game in {room_code}")
                    room.reset()
                    await room.broadcast({"event": "game_stopped", "message": "Host has stopped the game."})

            elif event == "kick_player":
                if player_id != room.host_id:
                    continue
                target_id = msg.get("player_id")
                target_player = room.players.get(target_id)
                if target_player:
                    print(f"[KICK] {name} kicked {target_player.name}")
                    await room.send_to(target_id, {"event": "kicked"})
                    await target_player.ws.close()

    except WebSocketDisconnect:
        print(f"[DISCONNECT] {name} left room {room_code}")
    except Exception as e:
        print(f"[ERROR] {name}: {e}")
    finally:
        if is_host:
            room.host_ws = None
        else:
            await room.player_leave(player_id)
            
        if len(room.players) == 0 and room.host_ws is None:
            rooms.pop(room_code, None)
            print(f"[ROOM DELETED] {room_code} is empty")