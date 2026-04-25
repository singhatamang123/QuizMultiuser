import asyncio
import json
import time
from models import Player, Question, GameState

QUESTION_TIME = 20
SCORING_TIME  = 3
COUNTDOWN_SEC = 3


class Room:
    def __init__(self, code: str, host_id: str):
        self.code = code
        self.host_id = host_id
        self.players: dict[str, Player] = {}
        self.state = GameState.LOBBY
        self.questions: list[Question] = []
        self.current_q_index = 0
        self.q_start_time = 0.0
        self._game_task = None
        self.host_ws = None
        self.question_stats = [] # Store stats for each question

    def reset(self):
        """Resets the room for a fresh game start."""
        if self._game_task:
            self._game_task.cancel()
            self._game_task = None
        
        self.state = GameState.LOBBY
        self.current_q_index = 0
        self.question_stats = []
        for p in self.players.values():
            p.score = 0
            p.answered = False
            p.answer_time = 0.0

    async def broadcast(self, data: dict):
        message = json.dumps(data)
        dead_ids = []
        for pid, player in self.players.items():
            try:
                await player.ws.send_text(message)
            except Exception:
                dead_ids.append(pid)
        for pid in dead_ids:
            self.players.pop(pid, None)
            
        if self.host_ws:
            try:
                await self.host_ws.send_text(message)
            except Exception:
                pass

    async def send_to_host(self, data: dict):
        if self.host_ws:
            try:
                await self.host_ws.send_text(json.dumps(data))
            except Exception:
                pass

    async def send_to(self, player_id: str, data: dict):
        player = self.players.get(player_id)
        if player:
            try:
                await player.ws.send_text(json.dumps(data))
            except Exception:
                pass

    def get_leaderboard(self) -> list:
        sorted_players = sorted(
            self.players.values(),
            key=lambda p: p.score,
            reverse=True,
        )
        return [
            {
                "id": p.id,
                "name": p.name,
                "tole": p.tole,
                "score": p.score,
                "streak": p.streak,
                "avatar": p.avatar,
            }
            for p in sorted_players
        ]

    async def player_join(self, player: Player):
        self.players[player.id] = player
        await self.broadcast({
            "event": "player_joined",
            "player": {
                "id": player.id,
                "name": player.name,
                "tole": player.tole,
                "avatar": player.avatar,
                "score": 0,
                "streak": 0,
            },
        })

    async def player_leave(self, player_id: str):
        self.players.pop(player_id, None)
        await self.broadcast({
            "event": "player_left",
            "player_id": player_id,
        })

    async def start_game(self, questions: list):
        # If playing again from GameOver, reset state first
        if self.state == GameState.GAMEOVER:
            self.reset()
            
        if self.state != GameState.LOBBY:
            return

        self.questions = questions
        self.current_q_index = 0

        # Reset scores/streaks for new game
        for p in self.players.values():
            p.score = 0
            p.streak = 0
            p.answered = False

        self.state = GameState.COUNTDOWN
        for tick in [3, 2, 1]:
            await self.broadcast({"event": "countdown", "tick": tick})
            await asyncio.sleep(1)

        # Cancel any previous task just in case
        if self._game_task:
            self._game_task.cancel()

        self._game_task = asyncio.create_task(self._question_loop())

    async def _question_loop(self):
        try:
            for i in range(len(self.questions)):
                self.current_q_index = i
                await self._run_question(self.questions[i])
                await self._run_scoring(self.questions[i])
            await self._end_game()
        except asyncio.CancelledError:
            print(f"[ROOM {self.code}] Question loop cancelled")

    async def _run_question(self, question: Question):
        self.state = GameState.QUESTION
        self.q_start_time = time.time()

        for p in self.players.values():
            p.answered = False
            p.answer_time = 0.0

        await self.broadcast({
            "event": "question",
            "index": self.current_q_index,
            "total": len(self.questions),
            "text": question.text,
            "options": question.options,
            "category": question.category,
            "time_limit": QUESTION_TIME,
        })

        loop = asyncio.get_event_loop()
        end_time = loop.time() + QUESTION_TIME
        while loop.time() < end_time:
            if all(p.answered for p in self.players.values()):
                break
            await asyncio.sleep(0.25)

    async def receive_answer(self, player_id: str, answer: str):
        if self.state != GameState.QUESTION:
            return

        player = self.players.get(player_id)
        if not player or player.answered:
            return

        player.answered = True
        player.answer_time = time.time() - self.q_start_time

        # Notify host that this player has answered
        await self.send_to_host({
            "event": "player_answered",
            "player_id": player_id,
            "name": player.name
        })

        question = self.questions[self.current_q_index]
        is_correct = answer.upper() == question.answer.upper()
        player.last_correct = is_correct

        if is_correct:
            player.streak += 1
            # Speed bonus: max 500
            speed_factor = max(0.0, 1.0 - (player.answer_time / QUESTION_TIME))
            base_points = 500 + (500 * speed_factor)
            
            # Streak bonus: 10% per streak level (max 50%)
            streak_bonus_pct = min(0.5, (player.streak - 1) * 0.1) if player.streak > 1 else 0
            points = int(base_points * (1.0 + streak_bonus_pct))
            
            player.score += points
        else:
            player.streak = 0
            points = 0

        await self.send_to(player_id, {
            "event": "answer_ack",
            "correct": is_correct,
            "points": points,
            "your_total": player.score,
            "streak": player.streak,
        })

    async def _run_scoring(self, question: Question):
        self.state = GameState.SCORING
        
        # Calculate stats for analytics
        correct_count = 0
        total_answered = 0
        sum_time = 0.0
        
        for p in self.players.values():
            if p.answered:
                total_answered += 1
                sum_time += p.answer_time
                if p.last_correct:
                    correct_count += 1

        self.question_stats.append({
            "text": question.text,
            "correct_count": correct_count,
            "total_players": len(self.players),
            "avg_time": round(sum_time / total_answered, 1) if total_answered > 0 else 0
        })
        
        await self.broadcast({
            "event": "round_result",
            "correct_answer": question.answer,
            "explanation": question.explanation,
            "leaderboard": self.get_leaderboard(),
        })
        await asyncio.sleep(SCORING_TIME)

    async def _end_game(self):
        self.state = GameState.GAMEOVER
        await self.broadcast({
            "event": "game_over",
            "final_leaderboard": self.get_leaderboard(),
            "analytics": self.question_stats
        })