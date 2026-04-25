from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class GameState(Enum):
    LOBBY     = "lobby"
    COUNTDOWN = "countdown"
    QUESTION  = "question"
    SCORING   = "scoring"
    GAMEOVER  = "gameover"


@dataclass
class Player:
    id: str
    name: str
    tole: str
    avatar: str = "👤"
    score: int = 0
    streak: int = 0
    answered: bool = False
    last_correct: bool = False
    answer_time: float = 0.0
    ws: Any = None


@dataclass
class Question:
    text: str
    options: list
    answer: str
    explanation: str
    category: str
    difficulty: str = "medium"