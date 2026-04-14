# Tarka Quiz - Premium Real-time Trivia 🚀

Tarka Quiz is a high-energy, multiplayer trivia platform inspired by Kahoot, designed specifically for a premium user experience with real-time interactions, synthesized audio, and dynamic 3D visuals.

![Join Screen](https://raw.githubusercontent.com/singhatamang123/QuizMultiuser/main/screenshots/join.png)

## ✨ Features

- **Real-time Multiplayer**: Powered by WebSocket (FastAPI) for instantaneous player synchronization.
- **Synthesized Audio System**: Custom Web Audio API sound engine providing immersive game feedback without large asset overhead.
- **Premium 3D UI**: Overhauled design system with vibrant "Kahoot-style" visuals, glassmorphism, and tactile 3D interactions.
- **Fire Streak System**: Rewards speed and accuracy with stacking point multipliers and visual flaming badges.
- **Nepal-Centric Trivia**: Curated categories including Geography, Food, Festivals, and more.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Framer Motion, Zustand (State Management), Web Audio API.
- **Backend**: Python, FastAPI, WebSockets, Uvicorn.
- **Styling**: Vanilla CSS Modules for maximum performance and design control.

## 🚀 Quick Start

### 1. Requirements
- Node.js 18+
- Python 3.9+

### 2. Backend Setup
```bash
cd server
pip install -r requirements.txt
python main.py
```
*The server will run on `http://localhost:8000`*

### 3. Frontend Setup
```bash
cd tarka-quiz
npm install
npm run dev
```
*The application will be available at `http://localhost:3000`*

## 📝 License
This project is open-source and available under the MIT License.
