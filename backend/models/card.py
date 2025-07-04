class Card:
    """ブリッジゲームのカードを表すクラス"""
    
    def __init__(self, suit: str, rank: str):
        self.suit = suit
        self.rank = rank
        self.value = self._get_value()
    
    def _get_value(self):
        """カードの数値を返す（2=2, J=11, Q=12, K=13, A=14）"""
        if self.rank in ['J', 'Q', 'K', 'A']:
            return {'J': 11, 'Q': 12, 'K': 13, 'A': 14}[self.rank]
        return int(self.rank)
    
    def get_suit_rank(self):
        """スートのランクを返す（♠=4, ♥=3, ♦=2, ♣=1）"""
        return {'♠': 4, '♥': 3, '♦': 2, '♣': 1}[self.suit]
    
    def get_hcp(self):
        """High Card Pointsを返す"""
        return {'J': 1, 'Q': 2, 'K': 3, 'A': 4}.get(self.rank, 0)
    
    def __str__(self):
        return f"{self.rank}{self.suit}"
    
    def __repr__(self):
        return self.__str__()
    
    def __eq__(self, other):
        if not isinstance(other, Card):
            return False
        return self.suit == other.suit and self.rank == other.rank
    
    def __hash__(self):
        return hash((self.suit, self.rank))

    def to_dict(self):
        """シリアライズ用の辞書を返す"""
        return {
            'suit': self.suit,
            'rank': self.rank,
            'value': self.value
        }
    
    @classmethod
    def from_dict(cls, data):
        """辞書からCardオブジェクトを作成"""
        return cls(data['suit'], data['rank'])
