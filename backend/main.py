from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uuid
import json
import asyncio

app = FastAPI(title="Bridge Game API")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 簡単なダミーBridgeGameクラス
class BridgeGame:
    def __init__(self):
        self.status = "created"
        self.players = ["North", "South", "East", "West"]
        self.current_player = "North"
        self.cards_dealt = False
        
    def start_game(self):
        self.status = "started"
        self.cards_dealt = True
        
    def to_dict(self):
        return {
            "status": self.status,
            "players": self.players,
            "current_player": self.current_player,
            "cards_dealt": self.cards_dealt,
            "message": "Bridge game is running"
        }

# ゲームの保存
games: Dict[str, BridgeGame] = {}

# Pydanticモデルの定義
class GameResponse(BaseModel):
    game_id: str
    game_state: Dict[str, Any]

# APIエンドポイント
@app.post("/api/games", response_model=GameResponse)
async def create_game():
    try:
        game_id = str(uuid.uuid4())
        game = BridgeGame()
        games[game_id] = game
        
        return GameResponse(
            game_id=game_id,
            game_state=game.to_dict()
        )
    except Exception as e:
        print(f"Error creating game: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/games/{game_id}")
async def get_game(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games[game_id]
    return {"game_id": game_id, "game_state": game.to_dict()}

@app.post("/api/games/{game_id}/start")
async def start_game(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games[game_id]
    game.start_game()
    
    return {"success": True, "game_state": game.to_dict()}

@app.get("/")
async def root():
    return {"message": "Bridge Game API is running"}

@app.websocket("/ws/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):
    await websocket.accept()
    try:
        while True:
            # ゲーム状態を送信（ダミー）
            if game_id in games:
                await websocket.send_json(games[game_id].to_dict())
            await asyncio.sleep(2)  # 2秒ごとに送信
    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {game_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
