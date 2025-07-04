import React from 'react';
import styled from 'styled-components';
import type { AuctionCall } from '../types/game';

interface AuctionPanelProps {
  auctionHistory: AuctionCall[];
  currentBidder: string | null;
  onBid: (level: number, suit: string) => void;
  onPass: () => void;
  onDouble: () => void;
  onRedouble: () => void;
  canDouble: boolean;
  canRedouble: boolean;
  isPlayerTurn: boolean;
}

const AuctionContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;
`;

const AuctionTitle = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 24px;
`;

const AuctionHistory = styled.div`
  margin-bottom: 20px;
  max-height: 200px;
  overflow-y: auto;
`;

const AuctionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;

const AuctionHeader = styled.th`
  background: #f5f5f5;
  padding: 8px;
  border: 1px solid #ddd;
  text-align: center;
  font-weight: bold;
`;

const AuctionCell = styled.td`
  padding: 8px;
  border: 1px solid #ddd;
  text-align: center;
`;

const CurrentBidder = styled.div`
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #2196f3;
`;

const BiddingControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const BidSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Label = styled.label`
  font-weight: bold;
  margin-right: 10px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const SuitButton = styled.button<{ $suit: string }>`
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: ${({ $suit }) => {
    if ($suit === '♥' || $suit === '♦') return '#f44336';
    return '#424242';
  }};
  
  &:hover {
    background: #f5f5f5;
    border-color: #2196f3;
  }
  
  &.selected {
    background: #2196f3;
    color: white;
    border-color: #2196f3;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  background: ${({ $primary }) => $primary ? '#2196f3' : '#666'};
  color: white;
  
  &:hover {
    background: ${({ $primary }) => $primary ? '#1976d2' : '#555'};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const formatBid = (call: AuctionCall): string => {
  switch (call.type) {
    case 'bid':
      return `${call.level}${call.suit}`;
    case 'pass':
      return 'Pass';
    case 'double':
      return 'X';
    case 'redouble':
      return 'XX';
    default:
      return '';
  }
};

export const AuctionPanel: React.FC<AuctionPanelProps> = ({
  auctionHistory,
  currentBidder,
  onBid,
  onPass,
  onDouble,
  onRedouble,
  canDouble,
  canRedouble,
  isPlayerTurn
}) => {
  const [selectedLevel, setSelectedLevel] = React.useState(1);
  const [selectedSuit, setSelectedSuit] = React.useState('♣');

  const suits = ['♣', '♦', '♥', '♠', 'NT'];
  const levels = [1, 2, 3, 4, 5, 6, 7];

  // オークション履歴を4列で表示
  const formatAuctionHistory = () => {
    const players = ['South', 'West', 'North', 'East'];
    const rows: (AuctionCall | null)[][] = [];
    
    let currentRow: (AuctionCall | null)[] = [null, null, null, null];
    let currentIndex = 0;
    
    auctionHistory.forEach(call => {
      const playerIndex = players.indexOf(call.player);
      if (playerIndex !== -1) {
        currentRow[playerIndex] = call;
        currentIndex++;
        
        if (currentIndex % 4 === 0) {
          rows.push([...currentRow]);
          currentRow = [null, null, null, null];
        }
      }
    });
    
    if (currentIndex % 4 !== 0) {
      rows.push(currentRow);
    }
    
    return { players, rows };
  };

  const { players, rows } = formatAuctionHistory();

  return (
    <AuctionContainer>
      <AuctionTitle>🎯 Auction</AuctionTitle>
      
      {currentBidder && (
        <CurrentBidder>
          Current Bidder: {currentBidder}
        </CurrentBidder>
      )}

      <AuctionHistory>
        <AuctionTable>
          <thead>
            <tr>
              {players.map(player => (
                <AuctionHeader key={player}>{player}</AuctionHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((call, colIndex) => (
                  <AuctionCell key={colIndex}>
                    {call ? formatBid(call) : ''}
                  </AuctionCell>
                ))}
              </tr>
            ))}
          </tbody>
        </AuctionTable>
      </AuctionHistory>

      {isPlayerTurn && (
        <BiddingControls>
          <BidSection>
            <Label>Level:</Label>
            <Select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(Number(e.target.value))}
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </Select>
            
            <Label>Suit:</Label>
            {suits.map(suit => (
              <SuitButton
                key={suit}
                $suit={suit}
                className={selectedSuit === suit ? 'selected' : ''}
                onClick={() => setSelectedSuit(suit)}
              >
                {suit}
              </SuitButton>
            ))}
            
            <ActionButton
              $primary
              onClick={() => onBid(selectedLevel, selectedSuit)}
            >
              Bid
            </ActionButton>
          </BidSection>

          <ActionButtons>
            <ActionButton onClick={onPass}>
              Pass
            </ActionButton>
            <ActionButton 
              onClick={onDouble}
              disabled={!canDouble}
            >
              Double
            </ActionButton>
            <ActionButton 
              onClick={onRedouble}
              disabled={!canRedouble}
            >
              Redouble
            </ActionButton>
          </ActionButtons>
        </BiddingControls>
      )}
    </AuctionContainer>
  );
};
