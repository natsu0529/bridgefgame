import { useState, useCallback, useMemo } from 'react';
import type { GameState } from '../types/game';

interface BidState {
  level: number;
  suit: string;
  player: string;
  doubled?: boolean;
  redoubled?: boolean;
}

interface UseBiddingProps {
  gameState: GameState;
  onBidSubmit: (level: number, suit: string) => Promise<void>;
  onPass: () => Promise<void>;
  onDouble: () => Promise<void>;
  onRedouble: () => Promise<void>;
}

export const useBidding = ({
  gameState,
  onBidSubmit,
  onPass,
  onDouble,
  onRedouble,
}: UseBiddingProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 現在のビッドを取得
  const currentBid = useMemo((): BidState | null => {
    if (!gameState.auction_history || gameState.auction_history.length === 0) {
      return null;
    }
    
    // 最後の有効なビッドを探す（PASSではないもの）
    for (let i = gameState.auction_history.length - 1; i >= 0; i--) {
      const bid = gameState.auction_history[i];
      if (bid.type !== 'pass') {
        return {
          level: bid.level || 0,
          suit: bid.suit || '',
          player: bid.player,
          doubled: gameState.doubled > 0,
          redoubled: gameState.doubled > 1,
        };
      }
    }
    
    return null;
  }, [gameState.auction_history, gameState.doubled]);

  // プレイヤーのターンかどうか
  const isPlayerTurn = useCallback(() => {
    return gameState.current_bidder === 'South';
  }, [gameState.current_bidder]);

  // ダブルが可能かどうか
  const canDouble = useCallback(() => {
    if (!currentBid) return false;
    if (currentBid.doubled || currentBid.redoubled) return false;
    // 相手チームのビッドに対してのみダブル可能
    const playerTeam = ['North', 'South'];
    const opponentTeam = ['East', 'West'];
    return (
      (playerTeam.includes('South') && opponentTeam.includes(currentBid.player)) ||
      (opponentTeam.includes('South') && playerTeam.includes(currentBid.player))
    );
  }, [currentBid]);

  // リダブルが可能かどうか
  const canRedouble = useCallback(() => {
    if (!currentBid) return false;
    if (!currentBid.doubled || currentBid.redoubled) return false;
    // 自チームのビッドがダブルされている場合のみリダブル可能
    const playerTeam = ['North', 'South'];
    return playerTeam.includes(currentBid.player);
  }, [currentBid]);

  // ビッドが有効かどうか
  const isValidBid = useCallback((level: number, suit: string) => {
    if (!currentBid) return true;
    
    const suitOrder = ['C', 'D', 'H', 'S', 'NT'];
    const currentSuitIndex = suitOrder.indexOf(currentBid.suit);
    const newSuitIndex = suitOrder.indexOf(suit);
    
    // レベルが高いか、同じレベルでスートが高い場合のみ有効
    return level > currentBid.level || 
           (level === currentBid.level && newSuitIndex > currentSuitIndex);
  }, [currentBid]);

  // ビッドのバリデーション
  const validateBid = useCallback((level: number, suit: string) => {
    if (level < 1 || level > 7) {
      return 'Bid level must be between 1 and 7';
    }
    
    if (!['C', 'D', 'H', 'S', 'NT'].includes(suit)) {
      return 'Invalid suit';
    }
    
    if (!isValidBid(level, suit)) {
      return 'Bid must be higher than current bid';
    }
    
    return null;
  }, [isValidBid]);

  // ビッドを実行
  const handleBid = useCallback(async (level: number, suit: string) => {
    const validationError = validateBid(level, suit);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (!isPlayerTurn()) {
      setError('It is not your turn to bid');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await onBidSubmit(level, suit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit bid');
    } finally {
      setLoading(false);
    }
  }, [validateBid, isPlayerTurn, onBidSubmit]);

  // パスを実行
  const handlePass = useCallback(async () => {
    if (!isPlayerTurn()) {
      setError('It is not your turn to bid');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await onPass();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pass');
    } finally {
      setLoading(false);
    }
  }, [isPlayerTurn, onPass]);

  // ダブルを実行
  const handleDouble = useCallback(async () => {
    if (!canDouble()) {
      setError('Cannot double at this time');
      return;
    }
    
    if (!isPlayerTurn()) {
      setError('It is not your turn to bid');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await onDouble();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to double');
    } finally {
      setLoading(false);
    }
  }, [canDouble, isPlayerTurn, onDouble]);

  // リダブルを実行
  const handleRedouble = useCallback(async () => {
    if (!canRedouble()) {
      setError('Cannot redouble at this time');
      return;
    }
    
    if (!isPlayerTurn()) {
      setError('It is not your turn to bid');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await onRedouble();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redouble');
    } finally {
      setLoading(false);
    }
  }, [canRedouble, isPlayerTurn, onRedouble]);

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 便利な値を計算
  const biddingStats = useMemo(() => {
    const history = gameState.auction_history || [];
    const totalBids = history.length;
    const passes = history.filter(bid => bid.type === 'pass').length;
    const actualBids = history.filter(bid => bid.type !== 'pass').length;
    const consecutivePasses = history.slice(-3).every(bid => bid.type === 'pass') ? 3 : 0;
    
    return {
      totalBids,
      passes,
      actualBids,
      consecutivePasses,
      biddingComplete: consecutivePasses >= 3 && actualBids > 0,
    };
  }, [gameState.auction_history]);

  return {
    // State
    currentBid,
    loading,
    error,
    biddingStats,
    
    // Actions
    handleBid,
    handlePass,
    handleDouble,
    handleRedouble,
    clearError,
    
    // Utilities
    isPlayerTurn,
    canDouble,
    canRedouble,
    isValidBid,
    validateBid,
  };
};
