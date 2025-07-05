import React from 'react';
import styled from 'styled-components';
import { Card } from './Card';
import { Hand } from './Hand';
import type { TrickCard, GameState } from '../types/game';

interface PlayAreaProps {
  gameState: GameState;
  onCardPlay?: (card: any) => void;
  validCards?: any[];
}

const TableGrid = styled.div`
  display: grid;
  grid-template-areas:
    'north north north'
    'west center east'
    'south south south';
  grid-template-columns: 120px 1fr 120px;
  grid-template-rows: auto 1fr auto;
  gap: 0;
  min-height: 420px;
  background: #388e3c;
  border-radius: 16px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const NorthArea = styled.div`
  grid-area: north;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 12px 0 0 0;
`;
const SouthArea = styled.div`
  grid-area: south;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0 0 12px 0;
`;
const WestArea = styled.div`
  grid-area: west;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
`;
const EastArea = styled.div`
  grid-area: east;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
`;
const CenterArea = styled.div`
  grid-area: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
`;

const ContractInfo = styled.div`
  background: rgba(255,255,255,0.95);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TricksInfo = styled.div`
  margin-top: 10px;
  background: rgba(255,255,255,0.9);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  color: #333;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;
const TrickRow = styled.div`
  display: flex;
  gap: 12px;
  margin: 10px 0;
`;
const PlayerName = styled.div`
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px #222;
`;

export const PlayArea: React.FC<PlayAreaProps> = ({
  gameState
}) => {
  const { current_trick, players, dummy, declarer, dummy_revealed, tricks_won, contract, doubled } = gameState;
  // North: dummy, South: you, East/West: opponent
  const northHand = dummy_revealed && dummy ? players[dummy] : [];
  const southHand = players['South'] || [];
  const westCount = players['West'] ? players['West'].length : 13;
  const eastCount = players['East'] ? players['East'].length : 13;

  return (
    <>
      <TableGrid>
        <NorthArea>
          <div>
            <PlayerName>{dummy || 'North'}</PlayerName>
            <Hand cards={northHand} isRevealed={!!dummy_revealed} size="small" />
          </div>
        </NorthArea>
        <WestArea>
          <PlayerName>West</PlayerName>
          {Array.from({ length: westCount }).map((_, i) => (
            <Card key={i} card={{ suit: '', rank: '', value: 0 }} back size="small" />
          ))}
        </WestArea>
        <CenterArea>
          {contract && (
            <ContractInfo>
              Contract: {contract.level}{contract.suit}
              {doubled === 1 && ' X'}
              {doubled === 2 && ' XX'}
              <br />
              Declarer: {declarer}
            </ContractInfo>
          )}
          <TrickRow>
            {['North', 'East', 'South', 'West'].map(pos => {
              const play = current_trick.find((c: TrickCard) => c.player === pos);
              return play ? <Card key={pos} card={play.card} size="large" /> : <div key={pos} style={{ width: 50 }} />;
            })}
          </TrickRow>
          <TricksInfo>
            Tricks Won:<br />
            NS: {tricks_won?.NS ?? 0} &nbsp;&nbsp;&nbsp; EW: {tricks_won?.EW ?? 0}
            <br />
            <small>Need: {contract ? contract.level + 6 : 7} tricks</small>
          </TricksInfo>
        </CenterArea>
        <EastArea>
          <PlayerName>East</PlayerName>
          {Array.from({ length: eastCount }).map((_, i) => (
            <Card key={i} card={{ suit: '', rank: '', value: 0 }} back size="small" />
          ))}
        </EastArea>
        <SouthArea>
          <div>
            <PlayerName>You (South)</PlayerName>
            <Hand cards={southHand} size="medium" />
          </div>
        </SouthArea>
      </TableGrid>
    </>
  );
};
