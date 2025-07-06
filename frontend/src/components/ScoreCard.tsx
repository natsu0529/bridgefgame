import React from 'react';
import styled from 'styled-components';
import type { RoundScore } from '../types/game';

const ScoreContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const ScoreTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 4px;
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 4px;
  margin-bottom: 8px;
`;

const ScoreHeader = styled.div`
  font-size: 10px;
  font-weight: bold;
  color: #666;
  text-align: center;
  padding: 4px;
  background: #e9ecef;
  border-radius: 4px;
`;

const ScoreCell = styled.div`
  text-align: center;
  padding: 4px;
  font-size: 11px;
  color: #333;
  border-radius: 4px;
`;

const TotalScore = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 8px;
  background: #e3f2fd;
  border-radius: 4px;
  font-weight: bold;
`;

const TeamScore = styled.div<{ $winning?: boolean }>`
  font-size: 16px;
  color: ${props => props.$winning ? '#2196f3' : '#333'};
`;

const VulnerabilityIndicator = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const VulBadge = styled.div<{ $vulnerable: boolean }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  background: ${props => props.$vulnerable ? '#f44336' : '#4caf50'};
  color: white;
`;

interface ScoreCardProps {
  roundScores?: RoundScore[];
  totalScores?: { NS: number; EW: number };
  vulnerable?: { NS: boolean; EW: boolean };
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  roundScores = [],
  totalScores = { NS: 0, EW: 0 },
  vulnerable = { NS: false, EW: false }
}) => {
  const isNSWinning = totalScores.NS > totalScores.EW;

  return (
    <ScoreContainer>
      <ScoreTitle>Score Card</ScoreTitle>
      
      <VulnerabilityIndicator>
        <VulBadge $vulnerable={vulnerable.NS}>
          NS {vulnerable.NS ? 'VUL' : 'NV'}
        </VulBadge>
        <VulBadge $vulnerable={vulnerable.EW}>
          EW {vulnerable.EW ? 'VUL' : 'NV'}
        </VulBadge>
      </VulnerabilityIndicator>

      <ScoreGrid>
        <ScoreHeader>Round</ScoreHeader>
        <ScoreHeader>NS</ScoreHeader>
        <ScoreHeader>EW</ScoreHeader>
        
        {roundScores.map((score, index) => (
          <React.Fragment key={index}>
            <ScoreCell>{score.round}</ScoreCell>
            <ScoreCell>{score.ns_score}</ScoreCell>
            <ScoreCell>{score.ew_score}</ScoreCell>
          </React.Fragment>
        ))}
      </ScoreGrid>

      <TotalScore>
        <TeamScore $winning={isNSWinning}>
          NS: {totalScores.NS}
        </TeamScore>
        <div style={{ fontSize: '12px', color: '#666' }}>vs</div>
        <TeamScore $winning={!isNSWinning}>
          EW: {totalScores.EW}
        </TeamScore>
      </TotalScore>
    </ScoreContainer>
  );
};
