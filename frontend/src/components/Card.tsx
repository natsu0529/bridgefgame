import React from 'react';
import styled from 'styled-components';
import type { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  size?: 'small' | 'medium' | 'large';
  back?: boolean; // 裏面表示用
}

const CardContainer = styled.div<{
  $isRed: boolean;
  $disabled: boolean;
  $selected: boolean;
  $size: string;
}>`
  display: inline-block;
  width: ${({ $size }) => {
    switch ($size) {
      case 'small': return '40px';
      case 'large': return '80px';
      default: return '60px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'small': return '56px';
      case 'large': return '112px';
      default: return '84px';
    }
  }};
  background: ${({ $selected }) => $selected ? '#e3f2fd' : 'white'};
  border: 2px solid ${({ $selected, $isRed }) => {
    if ($selected) return '#2196f3';
    return $isRed ? '#f44336' : '#424242';
  }};
  border-radius: 8px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2px;
  position: relative;
  
  &:hover {
    transform: ${({ $disabled }) => $disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${({ $disabled }) => $disabled ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 4px 8px rgba(0, 0, 0, 0.2)'};
  }
`;

const Rank = styled.div<{ $isRed: boolean; $size: string }>`
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small': return '12px';
      case 'large': return '20px';
      default: return '16px';
    }
  }};
  font-weight: bold;
  color: ${({ $isRed }) => $isRed ? '#f44336' : '#424242'};
  line-height: 1;
`;

const Suit = styled.div<{ $size: string }>`
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small': return '16px';
      case 'large': return '32px';
      default: return '24px';
    }
  }};
  line-height: 1;
  margin-top: 2px;
`;

const getSuitSymbol = (suit: string): string => {
  switch (suit) {
    case '♠': return '♠';
    case '♥': return '♥';
    case '♦': return '♦';
    case '♣': return '♣';
    default: return suit;
  }
};

const isRedSuit = (suit: string): boolean => {
  return suit === '♥' || suit === '♦';
};

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  disabled = false,
  selected = false,
  size = 'medium',
  back = false
}) => {
  if (back) {
    return (
      <CardContainer
        $isRed={false}
        $disabled={disabled}
        $selected={selected}
        $size={size}
        onClick={disabled ? undefined : onClick}
        title="Backside"
      >
        <div style={{fontSize: size === 'large' ? 28 : size === 'small' ? 14 : 20, color: '#888'}}>#######</div>
      </CardContainer>
    );
  }
  const isRed = isRedSuit(card.suit);
  return (
    <CardContainer
      $isRed={isRed}
      $disabled={disabled}
      $selected={selected}
      $size={size}
      onClick={disabled ? undefined : onClick}
      title={`${card.rank}${getSuitSymbol(card.suit)}`}
    >
      <Rank $isRed={isRed} $size={size}>
        {card.rank}
      </Rank>
      <Suit $size={size}>
        {getSuitSymbol(card.suit)}
      </Suit>
    </CardContainer>
  );
};
