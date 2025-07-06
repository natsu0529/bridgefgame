import type { GameState } from '../types/game';

export const mockGameStates: Record<string, GameState> = {
  partnership: {
    game_phase: 'partnership',
    current_round: 1,
    max_rounds: 4,
    dealer: 'North',
    current_bidder: null,
    auction_history: [],
    contract: null,
    declarer: null,
    dummy: null,
    trump_suit: null,
    contract_level: 0,
    doubled: 0,
    trick_leader: null,
    current_trick: [],
    tricks_won: { NS: 0, EW: 0 },
    dummy_revealed: false,
    round_scores: [],
    total_scores: { NS: 0, EW: 0 },
    vulnerable: { NS: false, EW: false },
    partnerships: {
      NS: ['North', 'South'],
      EW: ['East', 'West']
    },
    players: {
      North: [],
      South: [],
      East: [],
      West: []
    }
  },
  
  deal: {
    game_phase: 'deal',
    current_round: 1,
    max_rounds: 4,
    dealer: 'North',
    current_bidder: 'North',
    auction_history: [],
    contract: null,
    declarer: null,
    dummy: null,
    trump_suit: null,
    contract_level: 0,
    doubled: 0,
    trick_leader: null,
    current_trick: [],
    tricks_won: { NS: 0, EW: 0 },
    dummy_revealed: false,
    round_scores: [],
    total_scores: { NS: 0, EW: 0 },
    vulnerable: { NS: false, EW: false },
    partnerships: {
      NS: ['North', 'South'],
      EW: ['East', 'West']
    },
    players: {
      North: [],
      South: [],
      East: [],
      West: []
    }
  },
  
  auction: {
    game_phase: 'auction',
    current_round: 1,
    max_rounds: 4,
    dealer: 'North',
    current_bidder: 'South',
    auction_history: [
      { player: 'North', type: 'pass' },
      { player: 'East', type: 'pass' }
    ],
    contract: null,
    declarer: null,
    dummy: null,
    trump_suit: null,
    contract_level: 0,
    doubled: 0,
    trick_leader: null,
    current_trick: [],
    tricks_won: { NS: 0, EW: 0 },
    dummy_revealed: false,
    round_scores: [],
    total_scores: { NS: 0, EW: 0 },
    vulnerable: { NS: false, EW: false },
    partnerships: {
      NS: ['North', 'South'],
      EW: ['East', 'West']
    },
    players: {
      North: [
        { suit: 'spades', rank: 'A', value: 14 },
        { suit: 'hearts', rank: 'K', value: 13 },
        { suit: 'diamonds', rank: 'Q', value: 12 },
        { suit: 'clubs', rank: '10', value: 10 }
      ],
      South: [
        { suit: 'spades', rank: 'K', value: 13 },
        { suit: 'hearts', rank: 'Q', value: 12 },
        { suit: 'diamonds', rank: 'J', value: 11 },
        { suit: 'clubs', rank: '9', value: 9 }
      ],
      East: [
        { suit: 'spades', rank: 'Q', value: 12 },
        { suit: 'hearts', rank: 'J', value: 11 },
        { suit: 'diamonds', rank: '10', value: 10 },
        { suit: 'clubs', rank: '8', value: 8 }
      ],
      West: [
        { suit: 'spades', rank: 'J', value: 11 },
        { suit: 'hearts', rank: '10', value: 10 },
        { suit: 'diamonds', rank: '9', value: 9 },
        { suit: 'clubs', rank: '7', value: 7 }
      ]
    }
  }
};

export const getPhaseProgression = (currentPhase: string): string => {
  const progression = ['partnership', 'deal', 'auction', 'play', 'scoring'];
  const currentIndex = progression.indexOf(currentPhase);
  return progression[currentIndex + 1] || 'game_over';
};
