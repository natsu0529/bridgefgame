import React from 'react';
import styled from 'styled-components';
import type { AuctionCall } from '../types/game';

const AuctionContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  max-height: 200px;
  overflow-y: auto;
`;

const AuctionTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 4px;
`;

const AuctionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-bottom: 8px;
`;

const PlayerHeader = styled.div`
  font-size: 10px;
  font-weight: bold;
  color: #666;
  text-align: center;
  padding: 4px 0;
  background: #e9ecef;
  border-radius: 4px;
`;

const BidCell = styled.div<{ $isContract?: boolean }>`
  text-align: center;
  padding: 4px;
  font-size: 11px;
  font-weight: ${props => props.$isContract ? 'bold' : 'normal'};
  color: ${props => props.$isContract ? '#2196f3' : '#333'};
  background: ${props => props.$isContract ? '#e3f2fd' : 'transparent'};
  border-radius: 4px;
`;

const BidSuit = styled.span<{ suit: string }>`
  color: ${props => {
    switch (props.suit) {
      case 'H': case 'D': return '#d32f2f';
      case 'S': case 'C': return '#000';
      case 'NT': return '#2196f3';
      default: return '#666';
    }
  }};
`;

const CurrentBidder = styled.div`
  font-size: 12px;
  color: #2196f3;
  font-weight: bold;
  text-align: center;
  margin-top: 8px;
`;

interface AuctionHistoryProps {
  auctionHistory?: AuctionCall[];
  currentBidder: string | null;
  contract?: any;
}

export const AuctionHistory: React.FC<AuctionHistoryProps> = ({
  auctionHistory = [],
  currentBidder,
  contract
}) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'S': return '♠';
      case 'H': return '♥';
      case 'D': return '♦';
      case 'C': return '♣';
      case 'NT': return 'NT';
      default: return suit;
    }
  };

  const formatBid = (call: AuctionCall) => {
    if (call.type === 'bid' && call.level && call.suit) {
      return (
        <>
          {call.level}
          <BidSuit suit={call.suit}>
            {getSuitSymbol(call.suit)}
          </BidSuit>
        </>
      );
    }
    return call.type.toUpperCase();
  };

  const isContractBid = (call: AuctionCall) => {
    return contract && 
           call.type === 'bid' && 
           call.level === contract.level && 
           call.suit === contract.suit;
  };

  // グリッド表示のためのデータ整理
  const players = ['West', 'North', 'East', 'South'];
  const rows: (AuctionCall | null)[][] = [];
  let currentRow: (AuctionCall | null)[] = [null, null, null, null];
  let startPlayerIndex = 0;

  if (auctionHistory.length > 0) {
    startPlayerIndex = players.indexOf(auctionHistory[0].player);
  }

  auctionHistory.forEach((call, index) => {
    const playerIndex = (startPlayerIndex + index) % 4;
    currentRow[playerIndex] = call;
    
    if (playerIndex === 3 || index === auctionHistory.length - 1) {
      rows.push([...currentRow]);
      currentRow = [null, null, null, null];
    }
  });

  return (
    <AuctionContainer>
      <AuctionTitle>Auction History</AuctionTitle>
      
      <AuctionGrid>
        {players.map(player => (
          <PlayerHeader key={player}>{player}</PlayerHeader>
        ))}
        
        {rows.map((row, rowIndex) => 
          row.map((call, colIndex) => (
            <BidCell 
              key={`${rowIndex}-${colIndex}`}
              $isContract={call ? isContractBid(call) : false}
            >
              {call ? formatBid(call) : '-'}
            </BidCell>
          ))
        )}
      </AuctionGrid>

      {currentBidder && (
        <CurrentBidder>
          Current Bidder: {currentBidder}
        </CurrentBidder>
      )}
    </AuctionContainer>
  );
};
