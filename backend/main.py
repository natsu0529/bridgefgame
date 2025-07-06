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
        self.game_phase = "partnership"  # 'partnership' | 'deal' | 'auction' | 'play' | 'scoring' | 'game_over'
        self.players = ["North", "South", "East", "West"]
        self.current_player = "North"
        self.current_bidder = "North"
        self.cards_dealt = False
        self.current_round = 1
        self.max_rounds = 4
        self.dealer = "North"
        self.auction_history = []
        self.contract = None
        self.declarer = None
        self.dummy = None
        self.trump_suit = None
        self.contract_level = 0
        self.doubled = 0
        self.trick_leader = None
        self.current_trick = []
        self.tricks_won = {"NS": 0, "EW": 0}
        self.dummy_revealed = False
        self.round_scores = []
        self.total_scores = {"NS": 0, "EW": 0}
        self.vulnerable = {"NS": False, "EW": False}
        self.partnerships = {
            "NS": ["North", "South"],
            "EW": ["East", "West"]
        }
        self.players_cards = {
            "North": [],
            "South": [],
            "East": [],
            "West": []
        }
        
    def start_game(self):
        self.status = "started"
        self.game_phase = "deal"
        self.cards_dealt = True
        
    def deal_cards(self):
        # ダミー実装：カードを配る
        self.game_phase = "auction"
        self.current_bidder = self.dealer
        
    def to_dict(self):
        return {
            "game_phase": self.game_phase,
            "current_round": self.current_round,
            "max_rounds": self.max_rounds,
            "dealer": self.dealer,
            "current_bidder": self.current_bidder,
            "auction_history": self.auction_history,
            "contract": self.contract,
            "declarer": self.declarer,
            "dummy": self.dummy,
            "trump_suit": self.trump_suit,
            "contract_level": self.contract_level,
            "doubled": self.doubled,
            "trick_leader": self.trick_leader,
            "current_trick": self.current_trick,
            "tricks_won": self.tricks_won,
            "dummy_revealed": self.dummy_revealed,
            "round_scores": self.round_scores,
            "total_scores": self.total_scores,
            "vulnerable": self.vulnerable,
            "partnerships": self.partnerships,
            "players": self.players_cards
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

@app.post("/api/games/{game_id}/deal")
async def deal_cards(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games[game_id]
    game.deal_cards()
    
    return {"success": True, "game_state": game.to_dict()}

@app.post("/api/games/{game_id}/auction")
async def make_bid(game_id: str, bid_action: dict):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games[game_id]
    
    # ダミー実装：ビッドを受け取る
    bid_type = bid_action.get("type")
    if bid_type == "bid":
        level = bid_action.get("level")
        suit = bid_action.get("suit")
        game.auction_history.append({
            "player": game.current_bidder,
            "type": "bid",
            "level": level,
            "suit": suit
        })
    elif bid_type == "pass":
        game.auction_history.append({
            "player": game.current_bidder,
            "type": "pass"
        })
    elif bid_type == "double":
        game.auction_history.append({
            "player": game.current_bidder,
            "type": "double"
        })
    elif bid_type == "redouble":
        game.auction_history.append({
            "player": game.current_bidder,
            "type": "redouble"
        })
    
    # 次のプレイヤーへ
    players = ["North", "South", "East", "West"]
    current_index = players.index(game.current_bidder)
    game.current_bidder = players[(current_index + 1) % 4]
    
    return {"success": True, "game_state": game.to_dict()}

@app.post("/api/games/{game_id}/play")
async def play_card(game_id: str, play_action: dict):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games[game_id]
    # ダミー実装：カードプレイを受け取る
    
    return {"success": True, "game_state": game.to_dict()}

@app.post("/api/games/{game_id}/ai_action")
async def ai_action(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games[game_id]
    # ダミー実装：AIアクション
    
    return {"success": True, "game_state": game.to_dict()}

@app.post("/api/games/{game_id}/next_round")
async def next_round(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games[game_id]
    # ダミー実装：次のラウンドへ進む
    game.current_round += 1
    if game.current_round > game.max_rounds:
        game.game_phase = "game_over"
    else:
        game.game_phase = "deal"
        # ディーラーを次のプレイヤーに
        players = ["North", "South", "East", "West"]
        current_index = players.index(game.dealer)
        game.dealer = players[(current_index + 1) % 4]
        game.current_bidder = game.dealer
        game.auction_history = []
    
    return {"success": True, "game_state": game.to_dict()}

@app.post("/api/games/{game_id}/next_game")
async def next_game(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games[game_id]
    # ダミー実装：次のゲームへ進む
    game.current_player = "North"  # リセット
    
    return {"success": True, "game_state": game.to_dict()}

@app.post("/api/games/{game_id}/reset")
async def reset_game(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # ゲームをリセット
    games[game_id] = BridgeGame()
    
    return {"success": True, "game_state": games[game_id].to_dict()}

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
