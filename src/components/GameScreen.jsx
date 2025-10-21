import React, { useState } from 'react';
import { Row, Col, Typography, Input, Button, Spin, Result } from 'antd';
import { Card } from 'antd';
import PlayerHand from './PlayerHand';
import GameLog from './GameLog';
import HelpfulCards from './HelpfulCards';
import PlayerAvatar from './PlayerAvatar';
import AIAvatar from './AIAvatar';
import ActiveCard from './ActiveCard';
import HandContainer from './HandContainer';
import AICards from './AICards';

const { Title } = Typography;
const { TextArea } = Input;

function GameScreen({ gameState, playerHealth, aiHealth, playerHand, gameLog, aiCards, onPlayCard, onChooseAiCard, onPlayerCounter, onRestartGame, aiThinking, playerThinking, onGiveUp, onSeekHelp, helpfulArguments, onPlayHelpfulCard, activeAiCard }) {
  const [playerCounterArgument, setPlayerCounterArgument] = useState('');

  const handleSubmitCounter = () => {
    if (playerCounterArgument.trim()) {
      onPlayerCounter(playerCounterArgument);
      setPlayerCounterArgument('');
    }
  };

  const renderGameContent = () => {
    switch (gameState) {
      case 'START':
        return (
          <HandContainer>
            <PlayerHand hand={playerHand} onPlayCard={onPlayCard} loading={aiThinking || playerThinking} />
          </HandContainer>
        );
      case 'PLAYER_CHOOSING_HELPFUL_CARD':
        return (
          <HandContainer>
            <HelpfulCards cards={helpfulArguments} onChooseCard={onPlayHelpfulCard} />
          </HandContainer>
        );
      case 'PLAYER_CREATING_COUNTER':
        return (
          <HandContainer>
            <Title level={4} style={{ textAlign: 'center', marginBottom: '10px' }}>制作你的反击卡牌:</Title>
            <TextArea
              rows={4}
              value={playerCounterArgument}
              onChange={(e) => setPlayerCounterArgument(e.target.value)}
              placeholder="输入你的反击论点..."
              style={{ marginBottom: '16px' }}
              disabled={playerThinking}
            />
            <Button type="primary" onClick={handleSubmitCounter} block loading={playerThinking}>
              打出反击卡牌
            </Button>
            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Button block onClick={onGiveUp} disabled={playerThinking}>我认输</Button>
              </Col>
              <Col span={12}>
                <Button block onClick={onSeekHelp} disabled={playerThinking}>寻求场外援助</Button>
              </Col>
            </Row>
          </HandContainer>
        );
      case 'GAME_OVER':
        const winner = playerHealth <= 0 ? 'AI' : 'Player';
        const status = playerHealth <= 0 ? 'error' : 'success';
        const title = playerHealth <= 0 ? '你输了！' : '你赢了！';
        const subTitle = playerHealth <= 0 ? 'AI 成功反驳了你的所有论点。' : '你成功驳倒了 AI！';
        return (
          <Result
            status={status}
            title={title}
            subTitle={subTitle}
            extra={[
              <Button type="primary" key="console" onClick={onRestartGame}>
                再来一局
              </Button>,
            ]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
      {/* Game Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {/* Opponent's Card Area */}
        <div style={{ flex: 0, marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
            {/* AI Avatar Section */}
            <div style={{
              width: '120px',
              backgroundColor: '#141414',
              border: '1px solid #424242',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AIAvatar health={aiHealth} maxHealth={30} />
              <Title level={5} style={{ margin: '8px 0 4px 0' }}>AI</Title>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                {aiHealth} / 30
              </div>
            </div>

            {/* AI Cards Section */}
            <HandContainer style={{ flex: 1 }}>
              <Spin tip="AI 正在思考..." spinning={aiThinking} size="large">
                {gameState === 'PLAYER_CHOOSING_AI_CARD' && aiCards.length > 0 ? (
                  <AICards cards={aiCards} onChooseCard={onChooseAiCard} loading={aiThinking} />
                ) : activeAiCard ? (
                  <ActiveCard card={activeAiCard} />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '150px' }}>
                    {[...Array(5)].map((_, index) => (
                      <Card key={index} style={{ width: '18%', height: '100%', backgroundColor: '#1f1f1f' }} />
                    ))}
                  </div>
                )}
              </Spin>
            </HandContainer>
          </div>
        </div>

        {/* Central Play Area (Game Log) */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', borderTop: '1px dashed #424242', borderBottom: '1px dashed #424242', padding: '10px 0' }}>
          {gameLog.length > 0 && <GameLog log={gameLog} />}
        </div>

        {/* Player's Card/Input Area */}
        <div style={{ flex: 0 }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
            {/* Player Avatar Section */}
            <div style={{
              width: '120px',
              backgroundColor: '#141414',
              border: '1px solid #424242',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlayerAvatar health={playerHealth} maxHealth={30} />
              <Title level={5} style={{ margin: '8px 0 4px 0' }}>Player</Title>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                {playerHealth} / 30
              </div>
            </div>

            {/* Player Action Section */}
            <div style={{ flex: 1 }}>
              {renderGameContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Player Area */}
      {/* Removed as it's now part of the HandContainer */}
    </div>
  );
}

export default GameScreen;