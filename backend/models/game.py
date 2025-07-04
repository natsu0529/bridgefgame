from enum import Enum
from typing import List, Optional
from pydantic import BaseModel


class Suit(Enum):
    SPADES = "♠"
    HEARTS = "♥"
    DIAMONDS = "♦"
    CLUBS = "♣"


class Rank(Enum):
    TWO = "2"
    THREE = "3"
    FOUR = "4"
    FIVE = "5"
    SIX = "6"
    SEVEN = "7"
    EIGHT = "8"
    NINE = "9"
    TEN = "10"
    JACK = "J"
    QUEEN = "Q"
    KING = "K"
    ACE = "A"


class Card(BaseModel):
    suit: Suit
    rank: Rank
    
    def __str__(self):
        return f"{self.rank.value}{self.suit.value}"
    
    @property
    def value(self) -> int:
        """カードの値を数値で返す（2=2, ..., J=11, Q=12, K=13, A=14）"""
        rank_values = {
            Rank.TWO: 2, Rank.THREE: 3, Rank.FOUR: 4, Rank.FIVE: 5,
            Rank.SIX: 6, Rank.SEVEN: 7, Rank.EIGHT: 8, Rank.NINE: 9,
            Rank.TEN: 10, Rank.JACK: 11, Rank.QUEEN: 12, Rank.KING: 13,
            Rank.ACE: 14
        }
        return rank_values[self.rank]


class Player(BaseModel):
    name: str
    hand: List[Card] = []
    position: str  # North, South, East, West
    
    def sort_hand(self):
        """手札をスートと数値でソートする"""
        self.hand.sort(key=lambda card: (card.suit.value, card.value))


class Bid(BaseModel):
    level: int  # 1-7
    suit: Optional[Suit] = None  # None for No Trump
    is_pass: bool = False
    is_double: bool = False
    is_redouble: bool = False
    
    def __str__(self):
        if self.is_pass:
            return "Pass"
        elif self.is_double:
            return "Double"
        elif self.is_redouble:
            return "Redouble"
        else:
            suit_str = "NT" if self.suit is None else self.suit.value
            return f"{self.level}{suit_str}"


class Trick(BaseModel):
    cards: List[Card] = []
    leader: str  # プレイヤーのposition
    winner: Optional[str] = None


class GameState(BaseModel):
    players: List[Player]
    current_player: str
    dealer: str
    vulnerable: dict  # {"NS": bool, "EW": bool}
    bidding_phase: bool = True
    playing_phase: bool = False
    bids: List[Bid] = []
    current_bid: Optional[Bid] = None
    contract: Optional[Bid] = None
    declarer: Optional[str] = None
    dummy: Optional[str] = None
    tricks: List[Trick] = []
    current_trick: Optional[Trick] = None
    trump_suit: Optional[Suit] = None
    
    def get_player_by_position(self, position: str) -> Optional[Player]:
        """ポジションからプレイヤーを取得"""
        for player in self.players:
            if player.position == position:
                return player
        return None
    
    def get_next_player(self, current_position: str) -> str:
        """次のプレイヤーのポジションを取得"""
        positions = ["North", "East", "South", "West"]
        current_index = positions.index(current_position)
        return positions[(current_index + 1) % 4]
