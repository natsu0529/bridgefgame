import React, { useState } from 'react';
import styled from 'styled-components';
import type { GameState } from '../types/game';

interface BiddingGuideProps {
  gameState: GameState;
  currentBid?: { level: number; suit: string; player: string } | null;
  isPlayerTurn: boolean;
  onBid: (level: number, suit: string) => void;
  onPass: () => void;
  onDouble: () => void;
  onRedouble: () => void;
  onNextRound: () => void;
  canDouble: () => boolean;
  canRedouble: () => boolean;
  loading: boolean;
}

const BiddingContainer = styled.div`
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BidLevelContainer = styled.div`
  margin-bottom: 16px;
`;

const BidLevelTitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: bold;
`;

const BidLevelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 12px;
`;

const BidButton = styled.button<{ $selected: boolean; $disabled: boolean }>`
  padding: 8px 4px;
  border: 2px solid ${({ $selected, $disabled }) => 
    $disabled ? '#ccc' : $selected ? '#2196f3' : '#ddd'
  };
  border-radius: 4px;
  background: ${({ $selected, $disabled }) => 
    $disabled ? '#f5f5f5' : $selected ? '#e3f2fd' : '#fff'
  };
  color: ${({ $selected, $disabled }) => 
    $disabled ? '#999' : $selected ? '#2196f3' : '#333'
  };
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ $selected }) => $selected ? '#e3f2fd' : '#f0f0f0'};
  }
`;

const BidSuitContainer = styled.div`
  margin-bottom: 16px;
`;

const BidSuitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  margin-bottom: 12px;
`;

const SuitButton = styled.button<{ $selected: boolean; $disabled: boolean; $color: string }>`
  padding: 8px 4px;
  border: 2px solid ${({ $selected, $disabled }) => 
    $disabled ? '#ccc' : $selected ? '#2196f3' : '#ddd'
  };
  border-radius: 4px;
  background: ${({ $selected, $disabled }) => 
    $disabled ? '#f5f5f5' : $selected ? '#e3f2fd' : '#fff'
  };
  color: ${({ $selected, $disabled, $color }) => 
    $disabled ? '#999' : $selected ? '#2196f3' : $color
  };
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ $selected }) => $selected ? '#e3f2fd' : '#f0f0f0'};
  }
`;

const CurrentBidDisplay = styled.div`
  background: white;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  border-left: 4px solid #2196f3;
`;

const CurrentBidText = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

const BidHistoryContainer = styled.div`
  background: white;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  max-height: 150px;
  overflow-y: auto;
`;

const BidHistoryTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #666;
  margin-bottom: 8px;
`;

const BidHistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  margin-bottom: 2px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
`;

const BidHistoryPlayer = styled.span`
  font-weight: bold;
  color: #2196f3;
`;

const BidHistoryBid = styled.span`
  color: #333;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' | 'warning' }>`
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: background 0.2s;
  flex: 1;
  min-width: 60px;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #4caf50;
          color: white;
          &:hover:not(:disabled) { background: #45a049; }
        `;
      case 'secondary':
        return `
          background: #666;
          color: white;
          &:hover:not(:disabled) { background: #555; }
        `;
      case 'danger':
        return `
          background: #f44336;
          color: white;
          &:hover:not(:disabled) { background: #d32f2f; }
        `;
      case 'warning':
        return `
          background: #ff9800;
          color: white;
          &:hover:not(:disabled) { background: #f57c00; }
        `;
    }
  }}
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TurnIndicator = styled.div<{ $isPlayerTurn: boolean }>`
  background: ${({ $isPlayerTurn }) => $isPlayerTurn ? '#4caf50' : '#ff9800'};
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 12px;
`;

const AllPassedIndicator = styled.div`
  background: #2196f3;
  color: white;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 12px;
`;

export const BiddingGuide: React.FC<BiddingGuideProps> = ({
  gameState,
  currentBid,
  isPlayerTurn,
  onBid,
  onPass,
  onDouble,
  onRedouble,
  onNextRound,
  canDouble,
  canRedouble,
  loading,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null);

  // 現在のビッドを取得
  const getCurrentBidDisplay = () => {
    if (!currentBid) {
      return 'No bid yet';
    }
    
    const suitSymbols: { [key: string]: string } = {
      'C': '♣', 'D': '♦', 'H': '♥', 'S': '♠', 'NT': 'NT'
    };
    
    return `${currentBid.level}${suitSymbols[currentBid.suit] || currentBid.suit} by ${currentBid.player}`;
  };

  // 4人連続パスかどうかを判定
  const isAllPassed = () => {
    const history = gameState.auction_history || [];
    if (history.length < 4) return false;
    
    // 最初の4つのビッドが全てパスかどうか
    return history.slice(0, 4).every(bid => bid.type === 'pass');
  };

  // 3人連続パスかどうかを判定（かつ最低1つのビッドがある）
  const isAuctionComplete = () => {
    const history = gameState.auction_history || [];
    if (history.length < 3) return false;
    
    // 最後の3つが全てパスで、かつ過去にビッドがある
    const lastThree = history.slice(-3);
    const hasActualBid = history.some(bid => bid.type === 'bid');
    
    return lastThree.every(bid => bid.type === 'pass') && hasActualBid;
  };

  // ビッドが有効かどうか
  const isValidBid = (level: number, suit: string) => {
    if (!currentBid) return true;
    
    const suitOrder = ['C', 'D', 'H', 'S', 'NT'];
    const currentSuitIndex = suitOrder.indexOf(currentBid.suit);
    const newSuitIndex = suitOrder.indexOf(suit);
    
    return level > currentBid.level || 
           (level === currentBid.level && newSuitIndex > currentSuitIndex);
  };

  // ビッド履歴を表示用に整形
  const formatBidHistory = () => {
    const history = gameState.auction_history || [];
    const suitSymbols: { [key: string]: string } = {
      'C': '♣', 'D': '♦', 'H': '♥', 'S': '♠', 'NT': 'NT'
    };
    
    return history.map((bid, index) => {
      let bidText = '';
      if (bid.type === 'bid') {
        bidText = `${bid.level}${suitSymbols[bid.suit || ''] || bid.suit || ''}`;
      } else if (bid.type === 'pass') {
        bidText = 'PASS';
      } else if (bid.type === 'double') {
        bidText = 'DOUBLE';
      } else if (bid.type === 'redouble') {
        bidText = 'REDOUBLE';
      }
      
      return {
        id: index,
        player: bid.player,
        bid: bidText
      };
    });
  };

  const handleBidClick = () => {
    if (selectedLevel && selectedSuit && isValidBid(selectedLevel, selectedSuit)) {
      onBid(selectedLevel, selectedSuit);
      setSelectedLevel(null);
      setSelectedSuit(null);
    }
  };

  // 4人連続パスの場合
  if (isAllPassed()) {
    return (
      <BiddingContainer>
        <AllPassedIndicator>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            All Players Passed
          </div>
          <div style={{ fontSize: '12px', marginBottom: '12px' }}>
            No contract established. Moving to next round.
          </div>
          <ActionButton
            $variant="primary"
            onClick={onNextRound}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Next Round'}
          </ActionButton>
        </AllPassedIndicator>
      </BiddingContainer>
    );
  }

  return (
    <BiddingContainer>
      <SectionTitle>Bidding Phase</SectionTitle>
      
      <TurnIndicator $isPlayerTurn={isPlayerTurn}>
        {isPlayerTurn ? 'Your Turn to Bid' : `Waiting for ${gameState.current_bidder}`}
      </TurnIndicator>
      
      <CurrentBidDisplay>
        <CurrentBidText>
          Current Bid: {getCurrentBidDisplay()}
        </CurrentBidText>
      </CurrentBidDisplay>
      
      {/* ビッド履歴 */}
      <BidHistoryContainer>
        <BidHistoryTitle>Bidding History:</BidHistoryTitle>
        {formatBidHistory().length === 0 ? (
          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            No bids yet
          </div>
        ) : (
          formatBidHistory().map((item) => (
            <BidHistoryItem key={item.id}>
              <BidHistoryPlayer>{item.player}</BidHistoryPlayer>
              <BidHistoryBid>{item.bid}</BidHistoryBid>
            </BidHistoryItem>
          ))
        )}
      </BidHistoryContainer>
      
      {isPlayerTurn && !isAuctionComplete() && (
        <>
          {/* レベル選択 */}
          <BidLevelContainer>
            <BidLevelTitle>Select Level:</BidLevelTitle>
            <BidLevelGrid>
              {[1, 2, 3, 4, 5, 6, 7].map(level => (
                <BidButton
                  key={level}
                  $selected={selectedLevel === level}
                  $disabled={false}
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </BidButton>
              ))}
            </BidLevelGrid>
          </BidLevelContainer>

          {/* スート選択 */}
          <BidSuitContainer>
            <BidLevelTitle>Select Suit:</BidLevelTitle>
            <BidSuitGrid>
              {[
                { suit: 'C', display: '♣', color: '#000' },
                { suit: 'D', display: '♦', color: '#d32f2f' },
                { suit: 'H', display: '♥', color: '#d32f2f' },
                { suit: 'S', display: '♠', color: '#000' },
                { suit: 'NT', display: 'NT', color: '#2196f3' },
              ].map(({ suit, display, color }) => (
                <SuitButton
                  key={suit}
                  $selected={selectedSuit === suit}
                  $disabled={false}
                  $color={color}
                  onClick={() => setSelectedSuit(suit)}
                >
                  {display}
                </SuitButton>
              ))}
            </BidSuitGrid>
          </BidSuitContainer>

          {/* アクションボタン */}
          <ActionButtonsContainer>
            <ActionButton
              $variant="primary"
              onClick={handleBidClick}
              disabled={!selectedLevel || !selectedSuit || !isValidBid(selectedLevel || 0, selectedSuit || '') || loading}
            >
              {loading ? 'Bidding...' : 
               selectedLevel && selectedSuit ? 
               `Bid ${selectedLevel}${selectedSuit === 'NT' ? 'NT' : 
                 selectedSuit === 'C' ? '♣' : 
                 selectedSuit === 'D' ? '♦' : 
                 selectedSuit === 'H' ? '♥' : 
                 selectedSuit === 'S' ? '♠' : selectedSuit}` : 
               'Select Bid'}
            </ActionButton>
            
            <ActionButton
              $variant="secondary"
              onClick={onPass}
              disabled={loading}
            >
              PASS
            </ActionButton>
            
            {canDouble() && (
              <ActionButton
                $variant="warning"
                onClick={onDouble}
                disabled={loading}
              >
                DOUBLE
              </ActionButton>
            )}
            
            {canRedouble() && (
              <ActionButton
                $variant="danger"
                onClick={onRedouble}
                disabled={loading}
              >
                REDOUBLE
              </ActionButton>
            )}
          </ActionButtonsContainer>
        </>
      )}
      
      {/* オークション完了の場合 */}
      {isAuctionComplete() && (
        <AllPassedIndicator>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            Auction Complete
          </div>
          <div style={{ fontSize: '12px' }}>
            Contract: {getCurrentBidDisplay()}
          </div>
        </AllPassedIndicator>
      )}
    </BiddingContainer>
  );
};
