import React from 'react';
import styled from 'styled-components';
import type { BidCall } from '../types/game';

const ContractDisplay = styled.div`
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  text-align: center;
`;

const ContractLevel = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 4px;
`;

const ContractSuit = styled.span<{ suit: string }>`
  font-size: 24px;
  font-weight: bold;
  color: ${props => {
    switch (props.suit) {
      case 'H': case 'D': return '#d32f2f';
      case 'S': case 'C': return '#000';
      case 'NT': return '#2196f3';
      default: return '#666';
    }
  }};
`;

const ContractInfo = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const DoubleIndicator = styled.div<{ doubled: number }>`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.doubled > 0 ? '#f44336' : 'transparent'};
  margin-top: 4px;
`;

const NoContract = styled.div`
  font-size: 14px;
  color: #666;
  font-style: italic;
`;

interface ContractPanelProps {
  contract: BidCall | null;
  declarer: string | null;
  doubled?: number;
}

export const ContractPanel: React.FC<ContractPanelProps> = ({
  contract,
  declarer,
  doubled = 0
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

  const getDoubledText = (doubled: number) => {
    if (doubled === 1) return 'X';
    if (doubled === 2) return 'XX';
    return '';
  };

  return (
    <ContractDisplay>
      {contract ? (
        <>
          <ContractLevel>
            {contract.level}
            <ContractSuit suit={contract.suit}>
              {getSuitSymbol(contract.suit)}
            </ContractSuit>
          </ContractLevel>
          <DoubleIndicator doubled={doubled}>
            {getDoubledText(doubled)}
          </DoubleIndicator>
          <ContractInfo>
            Declarer: {declarer}
          </ContractInfo>
          <ContractInfo>
            Target: {6 + contract.level} tricks
          </ContractInfo>
        </>
      ) : (
        <NoContract>No Contract</NoContract>
      )}
    </ContractDisplay>
  );
};
