from typing import List, Dict, Any, Optional
from .card import Card
import random

class BridgeGame:
    """シンプルなブリッジゲーム実装"""
    
    def __init__(self):
        # ゲーム状態
        self.game_phase = 'partnership'
        self.current_round = 1
        self.max_rounds = 5
        
        # プレイヤー
        self.players = {'North': [], 'South': [], 'East': [], 'West': []}
        self.partnerships = {'NS': ['North', 'South'], 'EW': ['East', 'West']}
        
        # ディーラー
        self.dealer = None
        
        # オークション
        self.auction_history = []
        self.current_bidder = None
        self.contract = None
        self.declarer = None
        self.dummy = None
        self.trump_suit = None
        self.contract_level = 0
        self.doubled = 0
        
        # プレイ
        self.current_trick = []
        self.trick_leader = None
        self.tricks_won = {'NS': 0, 'EW': 0}
        self.dummy_revealed = False
        
        # スコア
        self.round_scores = []
        self.total_scores = {'NS': 0, 'EW': 0}
        self.vulnerable = {'NS': False, 'EW': False}
        
        # デッキ
        self.suits = ['♠', '♥', '♦', '♣']
        self.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        
    def determine_partnerships_and_dealer(self):
        """パートナーシップとディーラーを決定"""
        self.dealer = random.choice(list(self.players.keys()))
        self.game_phase = 'deal'
        
    def deal_cards(self):
        """カードを配る"""
        deck = [Card(suit, rank) for suit in self.suits for rank in self.ranks]
        random.shuffle(deck)
        
        players_order = ['North', 'East', 'South', 'West']
        for i, card in enumerate(deck):
            player = players_order[i % 4]
            self.players[player].append(card)
            
        # 各プレイヤーの手札をソート
        for player in self.players:
            self.players[player].sort(key=lambda c: (c.suit, c.value))
            
    def start_auction(self):
        """オークションを開始"""
        self.game_phase = 'auction'
        # ディーラーの左隣から開始
        players_order = ['North', 'East', 'South', 'West']
        dealer_index = players_order.index(self.dealer)
        self.current_bidder = players_order[(dealer_index + 1) % 4]
        
    def make_auction_call(self, call: dict):
        """オークションコールを行う"""
        call['player'] = self.current_bidder
        self.auction_history.append(call)
        
        if call['type'] == 'bid':
            self.contract = call
            self.declarer = self.current_bidder
            self.contract_level = call['level']
            self.trump_suit = call['suit']
            
        # 次のビッダーを設定
        players_order = ['North', 'East', 'South', 'West']
        current_index = players_order.index(self.current_bidder)
        self.current_bidder = players_order[(current_index + 1) % 4]
        
        # オークション終了チェック
        if self._is_auction_finished():
            self._end_auction()
            
    def _is_auction_finished(self) -> bool:
        """オークションが終了したかチェック"""
        if len(self.auction_history) < 4:
            return False
        last_three = self.auction_history[-3:]
        return all(call['type'] == 'pass' for call in last_three)
        
    def _end_auction(self):
        """オークション終了処理"""
        if self.contract:
            self.game_phase = 'play'
            # ダミーを決定
            players_order = ['North', 'East', 'South', 'West']
            declarer_index = players_order.index(self.declarer)
            dummy_index = (declarer_index + 2) % 4
            self.dummy = players_order[dummy_index]
            # トリックリーダーはディクレアラーの左隣
            self.trick_leader = players_order[(declarer_index + 1) % 4]
        else:
            self.game_phase = 'scoring'
            
    def is_valid_bid(self, call: dict) -> bool:
        """ビッドが有効かチェック"""
        if call['type'] != 'bid':
            return True
            
        if not self.contract:
            return True
            
        current_level = self.contract.get('level', 0)
        current_suit = self.contract.get('suit', '')
        
        if call['level'] > current_level:
            return True
            
        if call['level'] == current_level:
            suit_order = ['♣', '♦', '♥', '♠', 'NT']
            current_index = suit_order.index(current_suit) if current_suit in suit_order else -1
            call_index = suit_order.index(call['suit']) if call['suit'] in suit_order else -1
            return call_index > current_index
            
        return False
        
    def can_double(self) -> bool:
        """ダブルできるかチェック"""
        return len(self.auction_history) > 0 and self.auction_history[-1]['type'] == 'bid'
        
    def can_redouble(self) -> bool:
        """リダブルできるかチェック"""
        return len(self.auction_history) > 0 and self.auction_history[-1]['type'] == 'double'
        
    def play_card(self, player: str, card: Card):
        """カードをプレイ"""
        if player in self.players and card in self.players[player]:
            self.players[player].remove(card)
            self.current_trick.append({'player': player, 'card': card})
            
    def complete_trick(self):
        """トリックを完成"""
        if len(self.current_trick) == 4:
            # 勝者を決定
            winner = self._determine_trick_winner()
            
            # トリック数を更新
            if winner in ['North', 'South']:
                self.tricks_won['NS'] += 1
            else:
                self.tricks_won['EW'] += 1
                
            # 新しいトリックを開始
            self.current_trick = []
            self.trick_leader = winner
            
            # 13トリック終了チェック
            if self.tricks_won['NS'] + self.tricks_won['EW'] == 13:
                self.game_phase = 'scoring'
                
    def _determine_trick_winner(self) -> str:
        """トリックの勝者を決定"""
        if not self.current_trick:
            return self.trick_leader
            
        lead_suit = self.current_trick[0]['card'].suit
        trump_suit = self.trump_suit
        
        winning_card = None
        winner = None
        
        for play in self.current_trick:
            card = play['card']
            player = play['player']
            
            if winning_card is None:
                winning_card = card
                winner = player
                continue
                
            # トランプスートの処理
            if trump_suit and card.suit == trump_suit:
                if winning_card.suit != trump_suit or card.value > winning_card.value:
                    winning_card = card
                    winner = player
            # リードスートをフォロー
            elif card.suit == lead_suit:
                if winning_card.suit != trump_suit and card.value > winning_card.value:
                    winning_card = card
                    winner = player
                    
        return winner
        
    def get_valid_cards(self, player: str) -> List[Card]:
        """プレイ可能なカードを取得"""
        if player not in self.players:
            return []
            
        hand = self.players[player]
        
        if not self.current_trick:
            return hand
            
        lead_suit = self.current_trick[0]['card'].suit
        suit_cards = [card for card in hand if card.suit == lead_suit]
        
        return suit_cards if suit_cards else hand
        
    def get_ai_auction_call(self, player: str) -> dict:
        """AI用のオークションコールを取得"""
        # 簡単なAIロジック
        return {'type': 'pass'}
        
    def get_ai_card_play(self, player: str) -> Card:
        """AI用のカードプレイを取得"""
        valid_cards = self.get_valid_cards(player)
        return random.choice(valid_cards) if valid_cards else None
        
    def get_next_player(self, current_player: str) -> str:
        """次のプレイヤーを取得"""
        players_order = ['North', 'East', 'South', 'West']
        current_index = players_order.index(current_player)
        return players_order[(current_index + 1) % 4]
        
    def to_dict(self) -> dict:
        """ゲーム状態を辞書形式で返す"""
        return {
            "game_phase": self.game_phase,
            "current_round": self.current_round,
            "max_rounds": self.max_rounds,
            "dealer": self.dealer,
            "current_bidder": self.current_bidder,
            "auction_history": self.auction_history,
            "contract": {
                "type": "bid",
                "level": self.contract_level,
                "suit": self.trump_suit
            } if self.contract else None,
            "declarer": self.declarer,
            "dummy": self.dummy,
            "trump_suit": self.trump_suit,
            "contract_level": self.contract_level,
            "doubled": self.doubled,
            "trick_leader": self.trick_leader,
            "current_trick": [
                {
                    "player": trick['player'],
                    "card": {
                        "suit": trick['card'].suit,
                        "rank": trick['card'].rank,
                        "value": trick['card'].value
                    }
                }
                for trick in self.current_trick
            ],
            "tricks_won": self.tricks_won,
            "dummy_revealed": self.dummy_revealed,
            "round_scores": self.round_scores,
            "total_scores": self.total_scores,
            "vulnerable": self.vulnerable,
            "partnerships": self.partnerships,
            "players": {
                player: [
                    {
                        "suit": card.suit,
                        "rank": card.rank,
                        "value": card.value
                    }
                    for card in hand
                ]
                for player, hand in self.players.items()
            }
        }
