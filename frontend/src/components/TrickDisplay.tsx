import React from 'react';
import styled from 'styled-components';
import type { TrickCard } from '../types/game';

const TrickContainer = styled.div`
  background: #2e7d32;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  position: relative;
  min-height: 120px;
`;

const TrickTitle = styled.div`
  color: white;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
`;

const TrickCards = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
`;

const TrickCard = styled.div<{ position: 'north' | 'south' | 'east' | 'west' }>`
  position: absolute;
  background: white;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  min-width: 24px;
  text-align: center;
  
  ${props => {
    switch (props.position) {
      case 'north': return 'top: 0; left: 50%; transform: translateX(-50%);';
      case 'south': return 'bottom: 0; left: 50%; transform: translateX(-50%);';
      case 'east': return 'right: 0; top: 50%; transform: translateY(-50%);';
      case 'west': return 'left: 0; top: 50%; transform: translateY(-50%);';
      default: return '';
    }
  }}
`;

const CardSuit = styled.span<{ suit: string }>`
  color: ${props => {
    switch (props.suit) {
      case 'H': case 'D': return '#d32f2f';
      case 'S': case 'C': return '#000';
      default: return '#666';
    }
  }};
`;

const TrickInfo = styled.div`
  color: white;
  font-size: 10px;
  text-align: center;
  margin-top: 8px;
`;

interface TrickDisplayProps {
  currentTrick?: TrickCard[];
  trickNumber?: number;
  trumpSuit?: string | null;
}

export const TrickDisplay: React.FC<TrickDisplayProps> = ({
  currentTrick = [],
  trickNumber = 1,
  trumpSuit = null
}) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'S': return '♠';
      case 'H': return '♥';
      case 'D': return '♦';
      case 'C': return '♣';
      default: return suit;
    }
  };

  const getPlayerPosition = (player: string): 'north' | 'south' | 'east' | 'west' => {
    switch (player.toLowerCase()) {
      case 'north': return 'north';
      case 'south': return 'south';
      case 'east': return 'east';
      case 'west': return 'west';
      default: return 'south';
    }
  };

  return (
    <TrickContainer>
      <TrickTitle>Trick {trickNumber}</TrickTitle>
      <TrickCards>
        {currentTrick.map((trickCard, index) => (
          <TrickCard
            key={index}
            position={getPlayerPosition(trickCard.player)}
          >
            {trickCard.card.rank}
            <CardSuit suit={trickCard.card.suit}>
              {getSuitSymbol(trickCard.card.suit)}
            </CardSuit>
          </TrickCard>
        ))}
      </TrickCards>
      <TrickInfo>
        {trumpSuit && trumpSuit !== 'NT' && (
          <div>Trump: <CardSuit suit={trumpSuit}>{getSuitSymbol(trumpSuit)}</CardSuit></div>
        )}
        {trumpSuit === 'NT' && <div>No Trump</div>}
      </TrickInfo>
    </TrickContainer>
  );
};
