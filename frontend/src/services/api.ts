import axios from 'axios';
import type { GameState, BidAction, PlayCardAction } from '../types/game';

const API_BASE_URL = '/api';

export class BridgeAPI {
  private static instance: BridgeAPI;
  private gameId: string | null = null;
  private websocket: WebSocket | null = null;
  private onGameStateChange: ((state: GameState) => void) | null = null;

  static getInstance(): BridgeAPI {
    if (!BridgeAPI.instance) {
      BridgeAPI.instance = new BridgeAPI();
    }
    return BridgeAPI.instance;
  }

  async createGame(): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/games`);
      this.gameId = response.data.game_id;
      this.connectWebSocket();
      return this.gameId!;
    } catch (error) {
      console.error('Failed to create game:', error);
      throw error;
    }
  }

  async getGameState(): Promise<GameState> {
    if (!this.gameId) {
      throw new Error('No active game');
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/games/${this.gameId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get game state:', error);
      throw error;
    }
  }

  async startGame(): Promise<void> {
    if (!this.gameId) {
      throw new Error('No active game');
    }
    
    try {
      await axios.post(`${API_BASE_URL}/games/${this.gameId}/start`);
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }

  async dealCards(): Promise<void> {
    if (!this.gameId) {
      throw new Error('No active game');
    }
    
    try {
      await axios.post(`${API_BASE_URL}/games/${this.gameId}/deal`);
    } catch (error) {
      console.error('Failed to deal cards:', error);
      throw error;
    }
  }

  async makeBid(bidAction: BidAction): Promise<void> {
    if (!this.gameId) {
      throw new Error('No active game');
    }
    
    try {
      await axios.post(`${API_BASE_URL}/games/${this.gameId}/auction`, bidAction);
    } catch (error) {
      console.error('Failed to make bid:', error);
      throw error;
    }
  }

  async playCard(playAction: PlayCardAction): Promise<void> {
    if (!this.gameId) {
      throw new Error('No active game');
    }
    
    try {
      await axios.post(`${API_BASE_URL}/games/${this.gameId}/play`, playAction);
    } catch (error) {
      console.error('Failed to play card:', error);
      throw error;
    }
  }

  async aiAction(): Promise<void> {
    if (!this.gameId) {
      throw new Error('No active game');
    }
    
    try {
      await axios.post(`${API_BASE_URL}/games/${this.gameId}/ai_action`);
    } catch (error) {
      console.error('Failed to execute AI action:', error);
      throw error;
    }
  }

  async nextRound(): Promise<void> {
    if (!this.gameId) {
      throw new Error('No active game');
    }
    
    try {
      await axios.post(`${API_BASE_URL}/games/${this.gameId}/next_round`);
    } catch (error) {
      console.error('Failed to start next round:', error);
      throw error;
    }
  }

  async nextGame(): Promise<void> {
    if (!this.gameId) {
      throw new Error('No active game');
    }
    
    try {
      await axios.post(`${API_BASE_URL}/games/${this.gameId}/next_game`);
    } catch (error) {
      console.error('Failed to start next game:', error);
      throw error;
    }
  }

  async resetGame(): Promise<void> {
    if (!this.gameId) {
      throw new Error('No active game');
    }
    
    try {
      await axios.post(`${API_BASE_URL}/games/${this.gameId}/reset`);
    } catch (error) {
      console.error('Failed to reset game:', error);
      throw error;
    }
  }

  async deleteGame(): Promise<void> {
    if (!this.gameId) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/games/${this.gameId}`);
      this.gameId = null;
      this.disconnectWebSocket();
    } catch (error) {
      console.error('Failed to delete game:', error);
      throw error;
    }
  }

  setOnGameStateChange(callback: (state: GameState) => void): void {
    this.onGameStateChange = callback;
  }

  private connectWebSocket(): void {
    if (!this.gameId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.websocket = new WebSocket(`${protocol}//${host}/ws/${this.gameId}`);
    
    this.websocket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    this.websocket.onmessage = (event) => {
      try {
        const gameState = JSON.parse(event.data);
        if (this.onGameStateChange) {
          this.onGameStateChange(gameState);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    this.websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}
