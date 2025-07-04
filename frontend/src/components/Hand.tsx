import React from 'react';
import styled from 'styled-components';
import { Card } from './Card';
import type { Card as CardType } from '../types/game';

interface HandProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  validCards?: CardType[];
  title?: string;
  isRevealed?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const HandContainer = styled.div`
  margin: 10px 0;
`;

const HandTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
`;

const SuitRow = styled.div`
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`;

const SuitLabel = styled.span<{ $isRed: boolean }>`
  font-size: 20px;
  font-weight: bold;
  color: ${({ $isRed }) => $isRed ? '#f44336' : '#424242'};
  margin-right: 10px;
  min-width: 30px;
`;

const CardsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const EmptyHand = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
`;

const isRedSuit = (suit: string): boolean => {
  return suit === '♥' || suit === '♦';
};

const isCardValid = (card: CardType, validCards?: CardType[]): boolean => {
  if (!validCards) return true;
  return validCards.some(valid => valid.suit === card.suit && valid.rank === card.rank);
};

export const Hand: React.FC<HandProps> = ({
  cards,
  onCardClick,
  validCards,
  title,
  isRevealed = true,
  size = 'medium'
}) => {
  if (!isRevealed) {
    return (
      <HandContainer>
        {title && <HandTitle>{title}</HandTitle>}
        <EmptyHand>Hand is hidden</EmptyHand>
      </HandContainer>
    );
  }

  if (cards.length === 0) {
    return (
      <HandContainer>
        {title && <HandTitle>{title}</HandTitle>}
        <EmptyHand>No cards</EmptyHand>
      </HandContainer>
    );
  }

  // カードをスート別に分類
  const suits = ['♠', '♥', '♦', '♣'];
  const cardsBySuit = suits.reduce((acc, suit) => {
    acc[suit] = cards.filter(card => card.suit === suit)
      .sort((a, b) => b.value - a.value); // 高い順にソート
    return acc;
  }, {} as Record<string, CardType[]>);

  return (
    <HandContainer>
      {title && <HandTitle>{title}</HandTitle>}
      {suits.map(suit => {
        const suitCards = cardsBySuit[suit];
        if (suitCards.length === 0) return null;

        return (
          <SuitRow key={suit}>
            <SuitLabel $isRed={isRedSuit(suit)}>{suit}:</SuitLabel>
            <CardsRow>
              {suitCards.map((card, index) => (
                <Card
                  key={`${card.suit}-${card.rank}-${index}`}
                  card={card}
                  onClick={onCardClick ? () => onCardClick(card) : undefined}
                  disabled={!isCardValid(card, validCards)}
                  size={size}
                />
              ))}
            </CardsRow>
          </SuitRow>
        );
      })}
    </HandContainer>
  );
};
