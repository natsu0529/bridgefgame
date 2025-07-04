export interface Card {
  suit: string;
  rank: string;
  value: number;
}

export interface GameState {
  game_phase: 'partnership' | 'deal' | 'auction' | 'play' | 'scoring' | 'game_over';
  current_round: number;
  max_rounds: number;
  dealer: string | null;
  current_bidder: string | null;
  auction_history: AuctionCall[];
  contract: BidCall | null;
  declarer: string | null;
  dummy: string | null;
  trump_suit: string | null;
  contract_level: number;
  doubled: number;
  trick_leader: string | null;
  current_trick: TrickCard[];
  tricks_won: { NS: number; EW: number };
  dummy_revealed: boolean;
  round_scores: RoundScore[];
  total_scores: { NS: number; EW: number };
  vulnerable: { NS: boolean; EW: boolean };
  partnerships?: {
    NS: string[];
    EW: string[];
  };
  players: {
    [key: string]: Card[];
  };
}

export interface AuctionCall {
  player: string;
  type: 'bid' | 'pass' | 'double' | 'redouble';
  level?: number;
  suit?: string;
}

export interface BidCall {
  type: 'bid';
  level: number;
  suit: string;
}

export interface TrickCard {
  player: string;
  card: Card;
}

export interface RoundScore {
  round: number;
  contract: string;
  declarer: string | null;
  made: number;
  ns_score: number;
  ew_score: number;
}

export interface BidAction {
  type: 'bid' | 'pass' | 'double' | 'redouble';
  level?: number;
  suit?: string;
}

export interface PlayCardAction {
  player: string;
  card: Card;
}
