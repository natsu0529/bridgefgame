import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BridgeAPI } from '../services/api';
import { AuctionPanel } from './AuctionPanel';
import { PlayArea } from './PlayArea';
import { Hand } from './Hand';
import type { GameState, Card } from '../types/game';

const GameContainer = styled.div`
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 8px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 10px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`;

const Title = styled.h1`
  color: #2196f3;
  margin: 0 0 10px 0;
  font-size: clamp(1.8rem, 4vw, 3rem);
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.4rem);
`;

const GameInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(100px, 12vw, 180px), 1fr));
  gap: clamp(6px, 1vw, 12px);
  margin-bottom: clamp(6px, 1vh, 12px);
  flex-shrink: 0;
`;

const InfoCard = styled.div`
  background: white;
  padding: clamp(6px, 1vw, 12px);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: clamp(9px, 1.2vw, 14px);
  color: #666;
  margin-bottom: 2px;
`;

const InfoValue = styled.div`
  font-size: clamp(12px, 1.8vw, 18px);
  font-weight: bold;
  color: #333;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: clamp(8px, 1.5vw, 16px) clamp(16px, 3vw, 32px);
  border: none;
  border-radius: 6px;
  font-size: clamp(12px, 2vw, 18px);
  font-weight: bold;
  cursor: pointer;
  margin: 0 10px 10px 0;
  transition: all 0.2s ease;
  
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #2196f3;
          color: white;
          &:hover { background: #1976d2; }
        `;
      case 'secondary':
        return `
          background: #666;
          color: white;
          &:hover { background: #555; }
        `;
      case 'danger':
        return `
          background: #f44336;
          color: white;
          &:hover { background: #d32f2f; }
        `;
    }
  }}
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const GamePhaseIndicator = styled.div<{ $phase: string }>`
  background: ${({ $phase }) => {
    switch ($phase) {
      case 'partnership': return '#9c27b0';
      case 'deal': return '#ff9800';
      case 'auction': return '#2196f3';
      case 'play': return '#4caf50';
      case 'scoring': return '#f44336';
      case 'game_over': return '#424242';
      default: return '#666';
    }
  }};
  color: white;
  padding: clamp(6px, 1vw, 12px) clamp(12px, 2vw, 20px);
  border-radius: 20px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: clamp(10px, 1.5vw, 16px);
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 6px;
  margin: 10px 0;
  border-left: 4px solid #c62828;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #666;
`;

const PlayPanel = styled.section`
  background: #388e3c;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  overflow: hidden;
`;

const DrawerToggle = styled.button`
  display: none;
  position: absolute;
  top: 10px;
  z-index: 10;
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  @media (max-width: 767px) {
    display: block;
  }
`;
const ResponsiveLayout = styled.div<{ $displaySize: 'small' | 'medium' | 'large' | 'xlarge' }>`
  display: grid;
  flex: 1;
  gap: clamp(8px, 1vw, 20px);
  position: relative;
  overflow: hidden;
  
  grid-template-columns: ${({ $displaySize }) => {
    switch ($displaySize) {
      case 'small':   // ~19インチ以下 - コンパクト
        return 'clamp(240px, 20vw, 350px) 1fr clamp(240px, 20vw, 350px)';
      case 'medium':  // ~24インチ程度 - 標準
        return 'clamp(280px, 25vw, 450px) 1fr clamp(280px, 25vw, 450px)';
      case 'large':   // ~29インチ程度 - 大画面
        return 'clamp(350px, 30vw, 550px) 1fr clamp(350px, 30vw, 550px)';
      case 'xlarge':  // 30インチ以上 - 超大画面
        return 'clamp(400px, 35vw, 650px) 1fr clamp(400px, 35vw, 650px)';
      default:
        return 'clamp(280px, 25vw, 450px) 1fr clamp(280px, 25vw, 450px)';
    }
  }};
  
  /* スマホ・タブレット対応 */
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

const Drawer = styled.div<{ open: boolean; side: 'left' | 'right' }>`
  position: fixed;
  top: 0;
  ${({ side }) => side === 'left' ? 'left: 0;' : 'right: 0;'}
  width: 85vw;
  max-width: 35vw;
  height: 100vh;
  background: #fff;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  z-index: 100;
  transform: translateX(${({ open, side }) => open ? '0' : (side === 'left' ? '-100%' : '100%')});
  transition: transform 0.3s;
  padding: 16px;
  overflow-y: auto;
  @media (min-width: 768px) {
    position: static;
    height: 100%;
    width: 100%;
    max-width: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border-radius: 10px;
    transform: none;
    transition: none;
    background: #fff;
  }
`;

export const BridgeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [ctrlOpen, setCtrlOpen] = useState(false);
  const [displaySize, setDisplaySize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');

  const api = BridgeAPI.getInstance();

  // ディスプレイサイズを検出する関数
  const detectDisplaySize = () => {
    const width = window.screen.width;
    const height = window.screen.height;
    const dpr = window.devicePixelRatio || 1;
    
    // 物理的な画面サイズを推定（インチ）
    const physicalWidth = width / dpr;
    const physicalHeight = height / dpr;
    const diagonal = Math.sqrt(physicalWidth * physicalWidth + physicalHeight * physicalHeight);
    
    // 画面のピクセル密度から大まかなディスプレイサイズを推定
    // 一般的なモニターDPIは96-120程度
    const estimatedInches = diagonal / 96; // 96DPIと仮定
    
    if (estimatedInches < 20) {
      return 'small';   // ~19インチ以下
    } else if (estimatedInches < 25) {
      return 'medium';  // ~24インチ程度
    } else if (estimatedInches < 30) {
      return 'large';   // ~29インチ程度
    } else {
      return 'xlarge';  // 30インチ以上
    }
  };

  useEffect(() => {
    // 初期化時にディスプレイサイズを検出
    const size = detectDisplaySize();
    setDisplaySize(size);
    
    // ウィンドウサイズ変更時にも再検出
    const handleResize = () => {
      const newSize = detectDisplaySize();
      setDisplaySize(newSize);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // WebSocketでゲーム状態の更新を受信
    api.setOnGameStateChange((state: GameState) => {
      setGameState(state);
      setLoading(false);
    });
  }, [api]);

  const handleError = (err: any) => {
    setError(err.message || 'An error occurred');
    setLoading(false);
  };

  const createNewGame = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.createGame();
      const state = await api.getGameState();
      setGameState(state);
    } catch (err) {
      handleError(err);
    }
  };

  const startGame = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.startGame();
    } catch (err) {
      handleError(err);
    }
  };

  const dealCards = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.dealCards();
    } catch (err) {
      handleError(err);
    }
  };

  const makeAIAction = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.aiAction();
    } catch (err) {
      handleError(err);
    }
  };

  const handleBid = async (level: number, suit: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.makeBid({ type: 'bid', level, suit });
    } catch (err) {
      handleError(err);
    }
  };

  const handlePass = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.makeBid({ type: 'pass' });
    } catch (err) {
      handleError(err);
    }
  };

  const handleDouble = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.makeBid({ type: 'double' });
    } catch (err) {
      handleError(err);
    }
  };

  const handleRedouble = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.makeBid({ type: 'redouble' });
    } catch (err) {
      handleError(err);
    }
  };

  const handleCardPlay = async (card: Card) => {
    try {
      setLoading(true);
      setError(null);
      await api.playCard({ player: 'South', card });
    } catch (err) {
      handleError(err);
    }
  };

  const getValidCards = (): Card[] => {
    if (!gameState || gameState.game_phase !== 'play') return [];
    
    // 現在のプレイヤーが South または dummy を操作する場合
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer !== 'South' && !(currentPlayer === gameState.dummy && gameState.declarer === 'South')) {
      return [];
    }
    
    const hand = gameState.players[currentPlayer] || [];
    
    if (gameState.current_trick.length === 0) {
      return hand; // リードの場合は何でもOK
    }
    
    const ledSuit = gameState.current_trick[0].card.suit;
    const followCards = hand.filter(card => card.suit === ledSuit);
    
    return followCards.length > 0 ? followCards : hand;
  };

  const getCurrentPlayer = (): string => {
    if (!gameState || gameState.game_phase !== 'play') return '';
    
    if (gameState.current_trick.length === 0) {
      return gameState.trick_leader || '';
    }
    
    const players = ['South', 'West', 'North', 'East'];
    const lastPlayerIndex = players.indexOf(gameState.current_trick[gameState.current_trick.length - 1].player);
    return players[(lastPlayerIndex + 1) % 4];
  };

  const isPlayerTurn = (): boolean => {
    if (!gameState) return false;
    
    if (gameState.game_phase === 'auction') {
      return gameState.current_bidder === 'South';
    }
    
    if (gameState.game_phase === 'play') {
      const currentPlayer = getCurrentPlayer();
      return currentPlayer === 'South' || (currentPlayer === gameState.dummy && gameState.declarer === 'South');
    }
    
    return false;
  };

  const canDouble = (): boolean => {
    if (!gameState || gameState.auction_history.length === 0) return false;
    
    const lastCall = gameState.auction_history[gameState.auction_history.length - 1];
    return lastCall.type === 'bid' && 
           lastCall.player !== 'South' && 
           lastCall.player !== (gameState.partnerships?.NS?.includes('South') ? 'North' : 'East') &&
           gameState.doubled === 0;
  };

  const canRedouble = (): boolean => {
    if (!gameState || gameState.auction_history.length === 0) return false;
    
    const lastCall = gameState.auction_history[gameState.auction_history.length - 1];
    return lastCall.type === 'double' && 
           lastCall.player !== 'South' && 
           lastCall.player !== (gameState.partnerships?.NS?.includes('South') ? 'North' : 'East') &&
           gameState.doubled === 1;
  };

  if (!gameState) {
    return (
      <GameContainer>
        <Header>
          <Title>🃏 Bridge Game</Title>
          <Subtitle>Contract Bridge with AI Players</Subtitle>
        </Header>
        
        <div style={{ textAlign: 'center' }}>
          <ActionButton $variant="primary" onClick={createNewGame} disabled={loading}>
            {loading ? 'Creating...' : 'Create New Game'}
          </ActionButton>
        </div>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      <Header>
        <Title>🃏 Bridge Game</Title>
        <Subtitle>Contract Bridge with AI Players</Subtitle>
      </Header>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <GameInfo>
        <InfoCard>
          <InfoLabel>Game Phase</InfoLabel>
          <InfoValue>
            <GamePhaseIndicator $phase={gameState.game_phase}>
              {(gameState.game_phase || '').replace('_', ' ')}
            </GamePhaseIndicator>
          </InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>Round</InfoLabel>
          <InfoValue>{gameState.current_round} / {gameState.max_rounds}</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>NS Score</InfoLabel>
          <InfoValue>{gameState.total_scores?.NS ?? 0}</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>EW Score</InfoLabel>
          <InfoValue>{gameState.total_scores?.EW ?? 0}</InfoValue>
        </InfoCard>
        
        {gameState.dealer && (
          <InfoCard>
            <InfoLabel>Dealer</InfoLabel>
            <InfoValue>{gameState.dealer}</InfoValue>
          </InfoCard>
        )}
      </GameInfo>
      <ResponsiveLayout $displaySize={displaySize}>
        <DrawerToggle style={{left:10}} onClick={()=>setLogOpen(o=>!o)}>
          {logOpen ? '← Log' : '→ Log'}
        </DrawerToggle>
        <DrawerToggle style={{right:10}} onClick={()=>setCtrlOpen(o=>!o)}>
          {ctrlOpen ? 'Controls →' : '← Controls'}
        </DrawerToggle>
        
        {/* 左側ログパネル */}
        <Drawer open={logOpen} side="left">
          <h3>Game Log</h3>
          <div>
            <p>Phase: {gameState.game_phase}</p>
            <p>Current Player: {gameState.current_bidder || 'N/A'}</p>
            {gameState.auction_history && gameState.auction_history.length > 0 && (
              <div>
                <h4>Auction History:</h4>
                {gameState.auction_history.slice(-5).map((bid, i) => (
                  <div key={i}>{bid.player}: {bid.type === 'bid' ? `${bid.level}${bid.suit}` : bid.type}</div>
                ))}
              </div>
            )}
          </div>
        </Drawer>
        
        {/* 中央プレイパネル */}
        <PlayPanel>
          {gameState.game_phase === 'play' && (
            <PlayArea gameState={gameState} />
          )}
          {gameState.game_phase === 'partnership' && (
            <div style={{ color: 'white', textAlign: 'center' }}>
              <h2>Partnership Phase</h2>
              <p>North-South vs East-West. You are South.</p>
              <ActionButton $variant="primary" onClick={startGame} disabled={loading}>
                {loading ? 'Starting...' : 'Start Game'}
              </ActionButton>
            </div>
          )}
          {gameState.game_phase === 'deal' && (
            <div style={{ color: 'white', textAlign: 'center' }}>
              <h2>Deal Phase</h2>
              <p>Dealer: {gameState.dealer}</p>
              <ActionButton $variant="primary" onClick={dealCards} disabled={loading}>
                {loading ? 'Dealing...' : 'Deal Cards'}
              </ActionButton>
            </div>
          )}
          {gameState.game_phase === 'auction' && (
            <div style={{ color: 'white', textAlign: 'center' }}>
              <h2>Auction Phase</h2>
              <p>Current bidder: {gameState.current_bidder}</p>
              {gameState.players?.South && (
                <Hand
                  title="Your Hand (South)"
                  cards={gameState.players.South}
                  size="small"
                />
              )}
              {!isPlayerTurn() && (
                <ActionButton $variant="secondary" onClick={makeAIAction} disabled={loading}>
                  {loading ? 'AI Thinking...' : `Execute ${gameState.current_bidder}'s Turn`}
                </ActionButton>
              )}
            </div>
          )}
        </PlayPanel>
        
        {/* 右側操作パネル */}
        <Drawer open={ctrlOpen} side="right">
          <h3>Controls</h3>
          {gameState.game_phase === 'auction' && (
            <AuctionPanel
              auctionHistory={gameState.auction_history}
              currentBidder={gameState.current_bidder}
              onBid={handleBid}
              onPass={handlePass}
              onDouble={handleDouble}
              onRedouble={handleRedouble}
              canDouble={canDouble()}
              canRedouble={canRedouble()}
              isPlayerTurn={isPlayerTurn()}
            />
          )}
          {gameState.game_phase === 'play' && (
            <div>
              <h4>Play Controls</h4>
              {gameState.players?.South && (
                <Hand
                  title="Your Hand"
                  cards={gameState.players.South}
                  onCardClick={isPlayerTurn() ? handleCardPlay : undefined}
                  validCards={isPlayerTurn() ? getValidCards() : []}
                  size="small"
                />
              )}
              {!isPlayerTurn() && (
                <ActionButton $variant="secondary" onClick={makeAIAction} disabled={loading}>
                  {loading ? 'AI Thinking...' : `Execute ${getCurrentPlayer()}'s Turn`}
                </ActionButton>
              )}
            </div>
          )}
        </Drawer>
      </ResponsiveLayout>
      {loading && (
        <LoadingSpinner>
          Processing...
        </LoadingSpinner>
      )}
    </GameContainer>
  );
};
