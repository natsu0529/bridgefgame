import React from 'react';
import styled from 'styled-components';
import { Hand } from './Hand';
import type { Card } from '../types/game';

const DummyContainer = styled.div`
  background: #f0f0f0;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const DummyTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin-bottom: 8px;
  text-align: center;
`;

const DummyLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-bottom: 4px;
`;

const RevealedHand = styled.div`
  background: white;
  border-radius: 6px;
  padding: 8px;
`;

const HiddenHand = styled.div`
  background: #666;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
  color: white;
  font-style: italic;
`;

interface DummyDisplayProps {
  dummy: string | null;
  dummyCards?: Card[];
  dummyRevealed?: boolean;
  onCardClick?: (card: Card) => void;
  validCards?: Card[];
}

export const DummyDisplay: React.FC<DummyDisplayProps> = ({
  dummy,
  dummyCards = [],
  dummyRevealed = false,
  onCardClick,
  validCards = []
}) => {
  if (!dummy) return null;

  return (
    <DummyContainer>
      <DummyTitle>Dummy</DummyTitle>
      <DummyLabel>{dummy}</DummyLabel>
      
      {dummyRevealed ? (
        <RevealedHand>
          <Hand
            title=""
            cards={dummyCards}
            onCardClick={onCardClick}
            validCards={validCards}
            size="small"
          />
        </RevealedHand>
      ) : (
        <HiddenHand>
          Cards will be revealed after the opening lead
        </HiddenHand>
      )}
    </DummyContainer>
  );
};
