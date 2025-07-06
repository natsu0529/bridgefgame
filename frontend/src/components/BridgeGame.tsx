import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BridgeAPI } from '../services/api';
import { PlayArea } from './PlayArea';
import { Hand } from './Hand';
import { VulnerabilityPanel } from './VulnerabilityPanel';
import { ContractPanel } from './ContractPanel';
import { TrickDisplay } from './TrickDisplay';
import { AuctionHistory } from './AuctionHistory';
import { ScoreCard } from './ScoreCard';
import { DummyDisplay } from './DummyDisplay';
import { BiddingGuide } from './BiddingGuide';
import { useBidding } from '../hooks/useBidding';
import { mockGameStates, getPhaseProgression } from '../data/mockData';
import type { GameState, Card } from '../types/game';

const GameContainer = styled.div`
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 6px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 6px;
  background: white;
  padding: 6px 10px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`;

const Title = styled.h1`
  color: #2196f3;
  margin: 0 0 4px 0;
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  line-height: 1.2;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
  font-size: clamp(0.8rem, 1.5vw, 1.1rem);
  line-height: 1.3;
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
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.10);
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  min-width: 300px; /* 最小幅を確保 */
  width: 100%; /* 利用可能な幅を全て使用 */
  
  /* グリッドエリアに配置 */
  grid-area: play;
  
  /* モバイルでは最小幅を小さく */
  @media (max-width: 767px) {
    min-width: 250px;
  }
`;

const DrawerToggle = styled.button`
  position: absolute;
  top: 10px;
  z-index: 10;
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
  
  &:hover {
    background: #1976d2;
    transform: scale(1.05);
  }
  
  /* スマホ・タブレットでは少し小さく */
  @media (max-width: 767px) {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  /* デスクトップでも表示 */
  @media (min-width: 768px) {
    font-size: 12px;
    padding: 4px 8px;
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
    }
  }
`;
const ResponsiveLayout = styled.div<{ 
  $displaySize: 'small' | 'medium' | 'large' | 'xlarge';
  $logOpen: boolean;
  $ctrlOpen: boolean;
}>`
  display: grid;
  flex: 1;
  gap: clamp(8px, 1vw, 20px);
  position: relative;
  overflow: hidden;
  
  /* デスクトップ: 動的グリッド（パネル状態に応じて列数を変更） */
  grid-template-columns: ${({ $displaySize, $logOpen, $ctrlOpen }) => {
    // パネルの幅を設定
    const getColumnWidth = () => {
      switch ($displaySize) {
        case 'small':   return '200px';
        case 'medium':  return '220px';
        case 'large':   return '250px';
        case 'xlarge':  return '280px';
        default:        return '220px';
      }
    };
    
    const columnWidth = getColumnWidth();
    
    // 両パネルが閉じている場合：プレイパネルのみ（中央配置）
    if (!$logOpen && !$ctrlOpen) {
      return '1fr';
    }
    // 左パネルのみ開いている場合
    else if ($logOpen && !$ctrlOpen) {
      return `${columnWidth} 1fr`;
    }
    // 右パネルのみ開いている場合
    else if (!$logOpen && $ctrlOpen) {
      return `1fr ${columnWidth}`;
    }
    // 両パネルが開いている場合
    else {
      return `${columnWidth} 1fr ${columnWidth}`;
    }
  }};
  
  /* グリッドエリアで明示的に配置 */
  grid-template-areas: ${({ $logOpen, $ctrlOpen }) => {
    if (!$logOpen && !$ctrlOpen) {
      return '"play"';
    } else if ($logOpen && !$ctrlOpen) {
      return '"log play"';
    } else if (!$logOpen && $ctrlOpen) {
      return '"play ctrl"';
    } else {
      return '"log play ctrl"';
    }
  }};
  
  /* モバイル・タブレット: 単一列レイアウト */
  @media (max-width: 767px) {
    grid-template-columns: 1fr !important;
    grid-template-rows: auto;
    grid-template-areas: "play" !important;
    gap: 0;
  }
`;

const Drawer = styled.div<{ open: boolean; $side: 'left' | 'right' }>`
  /* モバイル: 固定位置のオーバーレイ */
  position: fixed;
  top: 0;
  ${({ $side }) => $side === 'left' ? 'left: 0;' : 'right: 0;'}
  width: 85vw;
  max-width: 280px;
  height: 100vh;
  background: #fff;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  z-index: 100;
  transform: translateX(${({ open, $side }) => open ? '0' : ($side === 'left' ? '-100%' : '100%')});
  transition: transform 0.3s ease;
  padding: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* デスクトップ: グリッドの一部として表示 */
  @media (min-width: 768px) {
    position: static;
    height: 100%;
    max-width: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    border-radius: 8px;
    transform: none;
    background: #fff;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1;
    
    /* グリッドエリアに配置 */
    grid-area: ${({ $side }) => $side === 'left' ? 'log' : 'ctrl'};
    
    /* 開いている時の設定 */
    display: ${({ open }) => open ? 'block' : 'none'};
    width: ${({ open }) => open ? 'auto' : '0'};
    min-width: ${({ open }) => open ? '200px' : '0'};
    max-width: ${({ open }) => open ? '300px' : '0'};
    padding: ${({ open }) => open ? '10px' : '0'};
    margin: ${({ open }) => open ? '0' : '0'};
    border: ${({ open }) => open ? '1px solid #e0e0e0' : 'none'};
    
    /* アニメーション */
    transition: all 0.3s ease;
    opacity: ${({ open }) => open ? '1' : '0'};
    visibility: ${({ open }) => open ? 'visible' : 'hidden'};
  }
`;

export const BridgeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 初期状態は画面サイズに応じて後で設定
  const [logOpen, setLogOpen] = useState(false);
  const [ctrlOpen, setCtrlOpen] = useState(false);
  const [displaySize, setDisplaySize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [useMockData, setUseMockData] = useState(false);

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

  // 初期表示サイズとパネル状態の設定
  useEffect(() => {
    const size = detectDisplaySize();
    setDisplaySize(size);
    
    // 初期パネル状態を設定
    const setInitialPanelState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      console.log('初期パネル状態設定:', { width, height, aspectRatio });
      
      // 縦画面（モバイル・タブレット）の場合：両パネル閉じる
      if (aspectRatio < 1.2) {
        setLogOpen(false);
        setCtrlOpen(false);
      } 
      // 横画面（デスクトップ）の場合：画面幅に応じて設定
      else {
        if (width < 1200) {
          // 小さい横画面：両パネル閉じる
          setLogOpen(false);
          setCtrlOpen(false);
        } else if (width < 1600) {
          // 中程度の横画面：ログパネルのみ開く
          setLogOpen(true);
          setCtrlOpen(false);
        } else {
          // 大きい横画面：両パネル開く
          setLogOpen(true);
          setCtrlOpen(true);
        }
      }
    };
    
    // 初期化時に実行
    setInitialPanelState();
  }, []);

  // ウィンドウサイズ変更時の処理
  useEffect(() => {
    const handleResize = () => {
      const newSize = detectDisplaySize();
      setDisplaySize(newSize);
      
      // リサイズ時はパネル状態を自動調整しない（ユーザーの意図を尊重）
      console.log('ウィンドウリサイズ:', { 
        width: window.innerWidth, 
        height: window.innerHeight, 
        aspectRatio: window.innerWidth / window.innerHeight,
        newSize 
      });
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

  const nextRound = async () => {
    if (!gameState) return;
    
    setLoading(true);
    try {
      setError(null);
      await api.nextRound();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const nextGame = async () => {
    if (!gameState) return;
    
    setLoading(true);
    try {
      setError(null);
      await api.nextGame();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = async () => {
    setLoading(true);
    try {
      setError(null);
      await api.resetGame();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const testAuctionPhase = () => {
    // テスト用: 手動でオークションフェーズに設定
    const testGameState: GameState = {
      game_phase: 'auction',
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
    };
    setGameState(testGameState);
  };

  const loadMockData = (phase: string) => {
    if (mockGameStates[phase]) {
      setGameState(mockGameStates[phase]);
    }
  };

  const nextPhase = () => {
    if (gameState && useMockData) {
      const nextPhase = getPhaseProgression(gameState.game_phase);
      if (nextPhase !== 'game_over') {
        loadMockData(nextPhase);
      }
    }
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

  // パネル状態リセット関数
  const resetPanelStates = () => {
    console.log('パネル状態をリセット');
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    // 縦画面（モバイル・タブレット）の場合：両パネル閉じる
    if (aspectRatio < 1.2) {
      setLogOpen(false);
      setCtrlOpen(false);
    } 
    // 横画面（デスクトップ）の場合：画面幅に応じて設定
    else {
      if (width < 1200) {
        setLogOpen(false);
        setCtrlOpen(false);
      } else if (width < 1600) {
        setLogOpen(true);
        setCtrlOpen(false);
      } else {
        setLogOpen(true);
        setCtrlOpen(true);
      }
    }
  };

  // 手動パネル切り替え関数
  const toggleLogPanel = () => {
    setLogOpen(prev => {
      console.log('ログパネル切り替え:', prev, '->', !prev);
      return !prev;
    });
  };

  const toggleCtrlPanel = () => {
    setCtrlOpen(prev => {
      console.log('操作パネル切り替え:', prev, '->', !prev);
      return !prev;
    });
  };

  const bidding = useBidding({
    gameState: gameState || {} as GameState,
    onBidSubmit: handleBid,
    onPass: handlePass,
    onDouble: handleDouble,
    onRedouble: handleRedouble,
  });

  if (!gameState) {
    return (
      <GameContainer>
        <Header>
          <Title>🃏 Bridge Game</Title>
          <Subtitle>Contract Bridge with AI Players</Subtitle>
        </Header>
           <ResponsiveLayout $displaySize={displaySize} $logOpen={logOpen} $ctrlOpen={ctrlOpen}>
        <DrawerToggle style={{left:10}} onClick={()=>setLogOpen(o=>!o)}>
          {logOpen ? '📋 ✕' : '📋 ≡'}
        </DrawerToggle>
        <DrawerToggle style={{right:10}} onClick={()=>setCtrlOpen(o=>!o)}>
          {ctrlOpen ? '⚙️ ✕' : '⚙️ ≡'}
        </DrawerToggle>
        
        {/* ログパネル - 常にレンダリング、open propで制御 */}
        <Drawer open={logOpen} $side="left">
          <h3 style={{ margin: '0 0 16px 0', color: '#2196f3', borderBottom: '2px solid #e0e0e0', paddingBottom: '8px' }}>
            Game Status
          </h3>
          <div style={{ textAlign: 'center', color: '#666' }}>
            No game in progress
          </div>
        </Drawer>
        
        {/* プレイパネル - PlayPanelコンポーネントを使用 */}
        <PlayPanel>
          <ActionButton $variant="primary" onClick={createNewGame} disabled={loading}>
            {loading ? 'Creating...' : 'Create New Game'}
          </ActionButton>
        </PlayPanel>
        
        {/* コントロールパネル - 常にレンダリング、open propで制御 */}
        <Drawer open={ctrlOpen} $side="right">
          <h3 style={{ margin: '0 0 16px 0', color: '#2196f3', borderBottom: '2px solid #e0e0e0', paddingBottom: '8px' }}>
            Controls
          </h3>
          
          <div style={{ background: '#fff3cd', padding: '8px', borderRadius: '4px', marginBottom: '12px', fontSize: '12px' }}>
            <div><strong>Panel Debug (No Game):</strong></div>
            <div>Log Panel: {logOpen ? 'OPEN' : 'CLOSED'}</div>
            <div>Control Panel: {ctrlOpen ? 'OPEN' : 'CLOSED'}</div>
            <div>Display Size: {displaySize.toUpperCase()}</div>
            <div>Window Size: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</div>
            <div>Aspect Ratio: {typeof window !== 'undefined' ? (window.innerWidth / window.innerHeight).toFixed(2) : 'N/A'}</div>
            <div>Device Type: {typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 1.2 ? 'PORTRAIT (Mobile/Tablet)' : 'LANDSCAPE (Desktop)'}</div>
            <div>GameState: NULL</div>
          </div>
          
          <div style={{ textAlign: 'center', color: '#666' }}>
            Start a game to see controls
          </div>
        </Drawer>
      </ResponsiveLayout>
        
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
      <ResponsiveLayout $displaySize={displaySize} $logOpen={logOpen} $ctrlOpen={ctrlOpen}>
        <DrawerToggle style={{left:10}} onClick={()=>setLogOpen(o=>!o)}>
          {logOpen ? '📋 ✕' : '📋 ≡'}
        </DrawerToggle>
        <DrawerToggle style={{right:10}} onClick={()=>setCtrlOpen(o=>!o)}>
          {ctrlOpen ? '⚙️ ✕' : '⚙️ ≡'}
        </DrawerToggle>
        
        {/* 左側ログパネル - 常にレンダリング、open propで制御 */}
        <Drawer open={logOpen} $side="left">
          <h3 style={{ margin: '0 0 16px 0', color: '#2196f3', borderBottom: '2px solid #e0e0e0', paddingBottom: '8px' }}>
            Game Status
          </h3>
          
          {/* ゲーム基本情報 */}
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Game Info</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#2196f3' }}>Phase:</span>
                <div style={{ color: '#333' }}>{(gameState.game_phase || '').replace('_', ' ').toUpperCase()}</div>
              </div>
              <div>
                <span style={{ fontWeight: 'bold', color: '#2196f3' }}>Round:</span>
                <div style={{ color: '#333' }}>{gameState.current_round} / {gameState.max_rounds}</div>
              </div>
              <div>
                <span style={{ fontWeight: 'bold', color: '#2196f3' }}>NS Score:</span>
                <div style={{ color: '#333' }}>{gameState.total_scores?.NS ?? 0}</div>
              </div>
              <div>
                <span style={{ fontWeight: 'bold', color: '#2196f3' }}>EW Score:</span>
                <div style={{ color: '#333' }}>{gameState.total_scores?.EW ?? 0}</div>
              </div>
              {gameState.dealer && (
                <div>
                  <span style={{ fontWeight: 'bold', color: '#2196f3' }}>Dealer:</span>
                  <div style={{ color: '#333' }}>{gameState.dealer}</div>
                </div>
              )}
              {gameState.game_phase === 'auction' && (
                <div>
                  <span style={{ fontWeight: 'bold', color: '#2196f3' }}>Current Bidder:</span>
                  <div style={{ color: '#333' }}>{gameState.current_bidder}</div>
                </div>
              )}
            </div>
          </div>

          {/* バルネラビリティ */}
          <VulnerabilityPanel
            vulnerable={gameState?.vulnerable}
            dealer={gameState?.dealer || null}
          />

          {/* 現在のコントラクト */}
          {gameState.contract && (
            <ContractPanel
              contract={gameState.contract}
              declarer={gameState.declarer || null}
              doubled={gameState.doubled}
            />
          )}

          {/* スコアカード */}
          <ScoreCard
            roundScores={gameState.round_scores || []}
            totalScores={gameState.total_scores || { NS: 0, EW: 0 }}
            vulnerable={gameState.vulnerable || { NS: false, EW: false }}
          />

          {/* 現在のトリック */}
          {gameState.game_phase === 'play' && (
            <TrickDisplay
              currentTrick={gameState.current_trick || []}
              trickNumber={gameState.tricks_won ? 
                (gameState.tricks_won.NS || 0) + (gameState.tricks_won.EW || 0) + 1 : 1}
              trumpSuit={gameState.trump_suit || null}
            />
          )}

          {/* オークション履歴 */}
          <AuctionHistory
            auctionHistory={gameState.auction_history || []}
            currentBidder={gameState.current_bidder || null}
          />
        </Drawer>
        
        {/* 中央プレイパネル */}
        <PlayPanel>
          {/* オークション表示 */}
          {gameState.game_phase === 'auction' && (
            <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
              <h2>Auction Phase</h2>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <AuctionHistory
                  auctionHistory={gameState?.auction_history}
                  currentBidder={gameState?.current_bidder || null}
                  contract={gameState?.contract}
                />
              </div>
              {gameState.current_bidder && (
                <p>Current bidder: {gameState.current_bidder}</p>
              )}
            </div>
          )}

          {/* プレイ表示 */}
          {gameState.game_phase === 'play' && (
            <div>
              <PlayArea gameState={gameState} />
              
              {/* トリック表示を中央に追加 */}
              <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                <TrickDisplay
                  currentTrick={gameState?.current_trick}
                  trickNumber={Math.floor(((gameState?.tricks_won?.NS || 0) + (gameState?.tricks_won?.EW || 0)) / 4) + 1}
                  trumpSuit={gameState?.trump_suit}
                />
              </div>
            </div>
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
            <div style={{ color: 'white', textAlign: 'center', width: '100%' }}>
              <h2>Auction Phase</h2>
              <p>Current bidder: {gameState.current_bidder}</p>
              
              {/* オークション用UIをプレイパネルに追加 */}
              {isPlayerTurn() && (
                <div style={{ background: 'rgba(255,255,255,0.95)', color: '#333', padding: '16px', borderRadius: '12px', margin: '16px auto', maxWidth: '400px' }}>
                  <h3 style={{ margin: '0 0 12px 0', color: '#2196f3' }}>Your Turn to Bid</h3>
                  
                  {/* クイックビッド */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Quick Bids:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {[
                        { level: 1, suit: 'C', display: '1♣' },
                        { level: 1, suit: 'D', display: '1♦' },
                        { level: 1, suit: 'H', display: '1♥' },
                        { level: 1, suit: 'S', display: '1♠' },
                        { level: 1, suit: 'NT', display: '1NT' },
                        { level: 2, suit: 'C', display: '2♣' },
                        { level: 2, suit: 'NT', display: '2NT' },
                        { level: 3, suit: 'NT', display: '3NT' }
                      ].map(({ level, suit, display }) => (
                        <button
                          key={`${level}${suit}`}
                          style={{
                            padding: '8px 4px',
                            border: '2px solid #2196f3',
                            borderRadius: '6px',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#2196f3',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#e3f2fd'}
                          onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#fff'}
                          onClick={() => handleBid(level, suit)}
                        >
                          {display}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        background: '#666',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                      onClick={handlePass}
                    >
                      PASS
                    </button>
                    
                    {canDouble() && (
                      <button
                        style={{
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '6px',
                          background: '#ff9800',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                        onClick={handleDouble}
                      >
                        DOUBLE
                      </button>
                    )}
                    
                    {canRedouble() && (
                      <button
                        style={{
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '6px',
                          background: '#f44336',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                        onClick={handleRedouble}
                      >
                        REDOUBLE
                      </button>
                    )}
                  </div>
                </div>
              )}
              
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
        
        {/* 右側操作パネル - 開いている時のみレンダリング */}
        {ctrlOpen && (
          <Drawer open={ctrlOpen} $side="right">
            <h3 style={{ margin: '0 0 16px 0', color: '#2196f3', borderBottom: '2px solid #e0e0e0', paddingBottom: '8px' }}>
              Controls
            </h3>
            
            {/* ...existing code... */}
            
            {/* パネル表示確認用 */}
            <div style={{ background: '#fff3cd', padding: '8px', borderRadius: '4px', marginBottom: '12px', fontSize: '12px' }}>
              <div><strong>Panel Debug:</strong></div>
              <div>Log Panel: {logOpen ? 'OPEN' : 'CLOSED'}</div>
              <div>Control Panel: {ctrlOpen ? 'OPEN' : 'CLOSED'}</div>
              <div>Display Size: {displaySize.toUpperCase()}</div>
              <div>Window Size: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</div>
              <div>Aspect Ratio: {typeof window !== 'undefined' ? (window.innerWidth / window.innerHeight).toFixed(2) : 'N/A'}</div>
              <div>Device Type: {typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 1.2 ? 'PORTRAIT (Mobile/Tablet)' : 'LANDSCAPE (Desktop)'}</div>
              <div>GameState exists: {gameState ? 'YES' : 'NO'}</div>
              <div>Game Phase: "{gameState?.game_phase || 'undefined'}"</div>
              <div>Auction condition: {gameState?.game_phase === 'auction' ? 'TRUE' : 'FALSE'}</div>
              {gameState && (
                <>
                  <div><strong>Full GameState:</strong></div>
                  <div>Current Round: {gameState.current_round}</div>
                  <div>Current Bidder: {gameState.current_bidder || 'none'}</div>
                  <div>Dealer: {gameState.dealer || 'none'}</div>
                  <div>All fields: {JSON.stringify(Object.keys(gameState))}</div>
                </>
              )}
            </div>
          
          {/* ゲーム進行ボタン */}
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Game Control</h4>
            
            {gameState?.game_phase === 'partnership' && (
              <button
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#4caf50',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  width: '100%',
                  marginBottom: '8px'
                }}
                onClick={startGame}
                disabled={loading}
              >
                {loading ? 'Starting...' : 'Start Game'}
              </button>
            )}
            
            {gameState?.game_phase === 'deal' && (
              <button
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#ff9800',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  width: '100%',
                  marginBottom: '8px'
                }}
                onClick={dealCards}
                disabled={loading}
              >
                {loading ? 'Dealing...' : 'Deal Cards'}
              </button>
            )}
            
            {/* Test button for auction phase */}
            <button
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: '#9c27b0',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                width: '100%',
                marginBottom: '8px'
              }}
              onClick={testAuctionPhase}
            >
              Test Auction Phase
            </button>
            
            {/* Mock Data Controls */}
            <div style={{ background: '#e8f5e8', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#2e7d32', fontSize: '12px' }}>Mock Mode</h4>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <button
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    borderRadius: '4px',
                    background: useMockData ? '#4caf50' : '#ccc',
                    color: useMockData ? '#fff' : '#666',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    flex: 1
                  }}
                  onClick={() => setUseMockData(!useMockData)}
                >
                  {useMockData ? 'Mock ON' : 'Mock OFF'}
                </button>
              </div>
              {useMockData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      background: '#4caf50',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                    onClick={() => loadMockData('partnership')}
                  >
                    Partnership Phase
                  </button>
                  <button
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      background: '#ff9800',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                    onClick={() => loadMockData('deal')}
                  >
                    Deal Phase
                  </button>
                  <button
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      background: '#2196f3',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                    onClick={() => loadMockData('auction')}
                  >
                    Auction Phase
                  </button>
                  <button
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      background: '#673ab7',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                    onClick={nextPhase}
                  >
                    Next Phase
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* ダミー表示 */}
          {gameState?.game_phase === 'play' && (
            <DummyDisplay
              dummy={gameState?.dummy || null}
              dummyCards={gameState?.dummy ? gameState?.players?.[gameState.dummy] : []}
              dummyRevealed={gameState?.dummy_revealed}
              onCardClick={gameState?.dummy === 'South' ? handleCardPlay : undefined}
              validCards={gameState?.dummy === 'South' ? getValidCards() : []}
            />
          )}
          
          {gameState.game_phase === 'auction' && (
            <div>
              {/* デバッグ情報 */}
              <div style={{ background: '#e3f2fd', padding: '8px', borderRadius: '4px', marginBottom: '12px', fontSize: '12px' }}>
                <div><strong>Debug Info:</strong></div>
                <div>Game Phase: {gameState.game_phase}</div>
                <div>Current Bidder: {gameState.current_bidder}</div>
                <div>Is Player Turn: {bidding.isPlayerTurn() ? 'YES' : 'NO'}</div>
                <div>Loading: {bidding.loading ? 'YES' : 'NO'}</div>
                <div>Current Bid: {bidding.currentBid ? 
                  `${bidding.currentBid.level}${bidding.currentBid.suit} by ${bidding.currentBid.player}` : 
                  'None'}
                </div>
                <div>Device: {displaySize}, W: {window.innerWidth}, H: {window.innerHeight}</div>
                <div>Aspect Ratio: {(window.innerWidth / window.innerHeight).toFixed(2)}</div>
                <div>Log Panel: {logOpen ? 'OPEN' : 'CLOSED'}, Ctrl Panel: {ctrlOpen ? 'OPEN' : 'CLOSED'}</div>
                <div style={{ marginTop: '8px' }}>
                  <button onClick={resetPanelStates} style={{ padding: '4px 8px', margin: '2px', fontSize: '10px' }}>
                    Reset Panel States
                  </button>
                  <button onClick={toggleLogPanel} style={{ padding: '4px 8px', margin: '2px', fontSize: '10px' }}>
                    Toggle Log
                  </button>
                  <button onClick={toggleCtrlPanel} style={{ padding: '4px 8px', margin: '2px', fontSize: '10px' }}>
                    Toggle Ctrl
                  </button>
                </div>
              </div>
              
              {/* 簡単なテスト用UI */}
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Simple Auction Test</h4>
                <button 
                  style={{ 
                    padding: '8px 16px', 
                    margin: '4px', 
                    background: '#2196f3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px' 
                  }}
                  onClick={() => bidding.handlePass()}
                >
                  PASS
                </button>
                <button 
                  style={{ 
                    padding: '8px 16px', 
                    margin: '4px', 
                    background: '#4caf50', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px' 
                  }}
                  onClick={() => bidding.handleBid(1, 'C')}
                >
                  1♣
                </button>
              </div>
              
              <BiddingGuide
                gameState={gameState}
                currentBid={bidding.currentBid}
                isPlayerTurn={bidding.isPlayerTurn()}
                onBid={bidding.handleBid}
                onPass={bidding.handlePass}
                onDouble={bidding.handleDouble}
                onRedouble={bidding.handleRedouble}
                onNextRound={nextRound}
                canDouble={bidding.canDouble}
                canRedouble={bidding.canRedouble}
                loading={bidding.loading}
              />
              
              {/* エラー表示 */}
              {bidding.error && (
                <div style={{ 
                  background: '#ffebee', 
                  color: '#c62828', 
                  padding: '8px 12px', 
                  borderRadius: '4px', 
                  marginBottom: '12px', 
                  fontSize: '12px' 
                }}>
                  {bidding.error}
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c62828',
                      cursor: 'pointer',
                      fontSize: '12px',
                      float: 'right'
                    }}
                    onClick={bidding.clearError}
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* AIアクション */}
              {!bidding.isPlayerTurn() && (
                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    Waiting for {gameState.current_bidder}...
                  </div>
                  <button
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      background: '#2196f3',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                    onClick={makeAIAction}
                    disabled={loading}
                  >
                    {loading ? 'AI Thinking...' : `Execute ${gameState.current_bidder}'s Turn`}
                  </button>
                </div>
              )}
              
              {/* 手札表示 */}
              {gameState.players?.South && (
                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Your Hand (South)</h4>
                  <Hand
                    title=""
                    cards={gameState.players.South}
                    size="small"
                  />
                </div>
              )}
            </div>
          )}
          
          {gameState.game_phase === 'play' && (
            <div>
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Play Controls</h4>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  Your turn: {isPlayerTurn() ? 'YES' : 'NO'}
                </div>
                
                {!isPlayerTurn() && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                      Waiting for {getCurrentPlayer()}...
                    </div>
                    <button
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        background: '#2196f3',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      onClick={makeAIAction}
                      disabled={loading}
                    >
                      {loading ? 'AI Thinking...' : `Execute ${getCurrentPlayer()}'s Turn`}
                    </button>
                  </div>
                )}
              </div>
              
              {/* 手札表示 */}
              {gameState.players?.South && (
                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Your Hand (South)</h4>
                  <Hand
                    title=""
                    cards={gameState.players.South}
                    onCardClick={isPlayerTurn() ? handleCardPlay : undefined}
                    validCards={isPlayerTurn() ? getValidCards() : []}
                    size="small"
                  />
                </div>
              )}
            </div>
          )}
          
          {gameState.game_phase === 'partnership' && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Game Setup</h4>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                North-South vs East-West
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                You are playing as South
              </div>
              <button
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#4caf50',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                onClick={startGame}
                disabled={loading}
              >
                {loading ? 'Starting...' : 'Start Game'}
              </button>
            </div>
          )}
          
          {gameState.game_phase === 'deal' && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Deal Phase</h4>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Dealer: {gameState.dealer}
              </div>
              <button
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#ff9800',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                onClick={dealCards}
                disabled={loading}
              >
                {loading ? 'Dealing...' : 'Deal Cards'}
              </button>
            </div>
          )}
          
          {/* ゲーム進行管理 */}
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Game Progress</h4>
            
            {/* ラウンド情報 */}
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              Round: {gameState?.current_round || 1}
            </div>
            
            {/* 進行ボタン */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gameState?.game_phase === 'scoring' && (
                <button
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#4caf50',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  onClick={nextRound}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Next Round'}
                </button>
              )}
              
              {gameState?.game_phase === 'game_over' && (
                <button
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#2196f3',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  onClick={nextGame}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Next Game'}
                </button>
              )}
              
              <button
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#f44336',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                onClick={resetGame}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Game'}
              </button>
            </div>
          </div>
        </Drawer>
        )}
      </ResponsiveLayout>
      {loading && (
        <LoadingSpinner>
          Processing...
        </LoadingSpinner>
      )}
    </GameContainer>
  );
};
