import { useState, useEffect } from 'react';
import { Layout, Typography, theme, notification, Modal, Button, App as AntApp } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { topics, shuffleArray } from './topics';
import GameScreen from './components/GameScreen';
import HistoryDrawer from './components/HistoryDrawer';
import SettingsModal from './components/SettingsModal';
import aiService from './services/aiService';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const [gameState, setGameState] = useState('START'); // START, PLAYER_CHOOSING_AI_CARD, PLAYER_CREATING_COUNTER, ROUND_END, GAME_OVER
  const [playerHealth, setPlayerHealth] = useState(30);
  const [aiHealth, setAiHealth] = useState(30);
  const [playerHand, setPlayerHand] = useState([]);
  const [gameLog, setGameLog] = useState([]);
  const [aiThinking, setAiThinking] = useState(false); // AI generating cards
  const [playerThinking, setPlayerThinking] = useState(false); // Player counter or seeking help
  const [aiErrorState, setAiErrorState] = useState(null); // null, 'OPPONENT_AI_ERROR', 'REFEREE_AI_ERROR', 'OPPONENT_AI_NEXT_ROUND_ERROR'
  const [lastAction, setLastAction] = useState(null); // Stores the last action that caused an AI error, to retry it
  const [helpfulArguments, setHelpfulArguments] = useState([]);
  const [aiCards, setAiCards] = useState([]); // Stores the 3 AI cards for player to choose from
  const [activeAiCard, setActiveAiCard] = useState(null);
  const [history, setHistory] = useState([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [api, contextHolder] = notification.useNotification();
  const { token } = theme.useToken();
  const { modal } = AntApp.useApp();

  useEffect(() => {
    const savedHistory = localStorage.getItem('debateHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const shuffled = shuffleArray(topics);
    setPlayerHand(shuffled.slice(0, 5));
  }, []);

  const showNotification = (message, type = 'info') => {
    api[type]({
      message: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      placement: 'topRight',
    });
  };

  const handlePlayCard = async (cardContent) => {
    setAiThinking(true);
    setAiErrorState(null);
    setActiveAiCard(null);
    setAiCards([]);
    setLastAction({ type: 'PLAY_CARD', payload: cardContent });

    const newGameLog = [...gameLog, { type: 'PLAYER_CARD', content: cardContent }];
    setGameLog(newGameLog);

    try {
      const counterArguments = await aiService.generateCounterArguments(cardContent);
      if (!counterArguments || counterArguments.length === 0) {
        throw new Error('Opponent AI returned no counter-arguments.');
      }

      const ratedAICards = await Promise.all(counterArguments.map(async (arg) => {
        const rating = await aiService.rateArgument(newGameLog.map(item => item.content).join('\n'), arg);
        if (!rating || typeof rating.attack !== 'number' || rating.attack < 1 || rating.attack > 5) { // Updated range
          throw new Error('Referee AI returned invalid rating.');
        }
        return { content: arg, attack: rating.attack, reason: rating.reason, revealed: false };
      }));

      // Store the 3 AI cards and let player choose
      setAiCards(ratedAICards);
      setGameState('PLAYER_CHOOSING_AI_CARD');

    } catch (error) {
      console.error('Error during AI turn:', error);
      if (error.message.includes('Opponent AI')) {
        setAiErrorState('OPPONENT_AI_ERROR');
      } else if (error.message.includes('Referee AI')) {
        setAiErrorState('REFEREE_AI_ERROR');
      } else if (error.name === "AIConnectionError") {
        setAiErrorState('OPPONENT_AI_ERROR'); // Connection error during opponent AI generation
      } else {
        // Fallback for unexpected errors, treat as opponent AI failure
        setAiErrorState('OPPONENT_AI_ERROR');
      }
    } finally {
      setAiThinking(false);
    }
  };

  const handleChooseAiCard = (chosenCard) => {
    // Player chooses one of the 3 AI cards
    setActiveAiCard(chosenCard);

    const damage = chosenCard.attack;
    const newPlayerHealth = playerHealth - damage;
    setPlayerHealth(newPlayerHealth);

    const updatedGameLog = [
      ...gameLog,
      { type: 'AI_CARD', content: chosenCard.content, attack: chosenCard.attack, reason: chosenCard.reason },
      { type: 'DAMAGE', target: 'PLAYER', amount: damage }
    ];
    setGameLog(updatedGameLog);

    if (newPlayerHealth <= 0) {
      setGameState('GAME_OVER');
      showNotification('你输了！', 'error');
      saveGameToHistory('AI');
    } else {
      setGameState('PLAYER_CREATING_COUNTER');
    }
  };

  const generateNextAiRound = async (counterArgumentContent, updatedGameLog) => {
    // Continue to next round: AI generates new cards based on player's last counter
    const nextCounterArguments = await aiService.generateCounterArguments(counterArgumentContent);
    if (!nextCounterArguments || nextCounterArguments.length === 0) {
      throw new Error('Opponent AI returned no counter-arguments for next round.');
    }
    const nextRatedAICards = await Promise.all(nextCounterArguments.map(async (arg) => {
      const nextRating = await aiService.rateArgument(updatedGameLog.map(item => item.content).join('\n'), arg);
      if (!nextRating || typeof nextRating.attack !== 'number' || nextRating.attack < 1 || nextRating.attack > 5) { // Updated range
        throw new Error('Referee AI returned invalid rating for next round.');
      }
      return { content: arg, attack: nextRating.attack, reason: nextRating.reason, revealed: false };
    }));

    // Store the 3 AI cards and let player choose
    setAiCards(nextRatedAICards);
    setGameState('PLAYER_CHOOSING_AI_CARD');
  }

  const handlePlayerCounter = async (counterArgumentContent) => {
    setPlayerThinking(true);
    setAiErrorState(null);
    setLastAction({ type: 'PLAYER_COUNTER', payload: counterArgumentContent });

    // Do NOT add PLAYER_COUNTER to gameLog yet. It will be added as PLAYER_CARD_ATTACK after rating.
    const currentLogForRating = [...gameLog, { type: 'PLAYER_COUNTER_TEMP', content: counterArgumentContent }]; // Temporary entry for AI context

    try {
      const rating = await aiService.rateArgument(currentLogForRating.map(item => item.content).join('\n'), counterArgumentContent);
      if (!rating || typeof rating.attack !== 'number' || rating.attack < 1 || rating.attack > 5) { // Updated range
        throw new Error('Referee AI returned invalid rating.');
      }
      let damage = rating.attack;
      // Human-friendly bias: if player's score is 1 or 2, add 1 to it.
      if (damage <= 2) {
        damage += 1;
      }
      const newAiHealth = aiHealth - damage;
      setAiHealth(newAiHealth);

      const updatedGameLog = [
        ...gameLog, // Use original gameLog here
        { type: 'PLAYER_CARD_ATTACK', content: counterArgumentContent, attack: damage, reason: rating.reason }, // Use biased damage
        { type: 'DAMAGE', target: 'AI', amount: damage }
      ];
      setGameLog(updatedGameLog);

      // Check for game over conditions
      if (newAiHealth <= 0) {
        setGameState('GAME_OVER');
        showNotification('你赢了！', 'success');
        saveGameToHistory('Player');
        setPlayerThinking(false);
      } else {
        setPlayerThinking(false);
        setAiThinking(true);
        await generateNextAiRound(counterArgumentContent, updatedGameLog);
        setAiThinking(false);
      }
    } catch (error) {
      console.error('Error during player counter:', error);
      if (error.message.includes('next round')) {
        setAiErrorState('OPPONENT_AI_NEXT_ROUND_ERROR');
      } else if (error.message.includes('Referee AI')) {
        setAiErrorState('REFEREE_AI_ERROR');
      } else if (error.name === "AIConnectionError") {
        // If rating fails, it's a referee error. If generateNextAiRound fails, it's an opponent error.
        // The new specific error state for the latter is handled above.
        setAiErrorState('REFEREE_AI_ERROR');
      } else {
        // Fallback for unexpected errors
        setAiErrorState('REFEREE_AI_ERROR');
      }
      setPlayerThinking(false);
      setAiThinking(false);
    }
  };

  const handleRestartGame = () => {
    setGameState('START');
    setPlayerHealth(30);
    setAiHealth(30);
    setPlayerHand(shuffleArray(topics).slice(0, 5));
    setGameLog([]);
    setAiThinking(false);
    setPlayerThinking(false);
    setAiErrorState(null);
    setLastAction(null);
    setAiCards([]);
    setActiveAiCard(null);
  };

  const handleRetryAI = async () => {
    setAiErrorState(null);
    setAiThinking(true);

    if (aiErrorState === 'OPPONENT_AI_NEXT_ROUND_ERROR') {
      try {
        await generateNextAiRound(lastAction.payload, gameLog);
      } catch (error) {
        console.error('Error during retry of next round:', error);
        // If retry fails, set the error state back
        setAiErrorState('OPPONENT_AI_NEXT_ROUND_ERROR');
      } finally {
        setAiThinking(false);
      }
      return; // Exit after handling this specific retry
    }

    // For other errors, remove the last player action from gameLog to prevent duplicates on retry
    if (lastAction.type === 'PLAY_CARD' || lastAction.type === 'PLAYER_COUNTER') {
        setGameLog(prevLog => prevLog.slice(0, prevLog.length - 1));
    }

    setAiThinking(false);
    if (lastAction.type === 'PLAY_CARD') {
      handlePlayCard(lastAction.payload);
    } else if (lastAction.type === 'PLAYER_COUNTER') {
      handlePlayerCounter(lastAction.payload);
    }
  };

  const handleQuitGame = () => {
    setAiErrorState(null);
    handleRestartGame();
  };

  const showHistoryDrawer = () => {
    setIsHistoryDrawerOpen(true);
  };

  const closeHistoryDrawer = () => {
    setIsHistoryDrawerOpen(false);
  };

  const saveGameToHistory = (winner) => {
    const newHistoryItem = {
      id: uuidv4(),
      date: new Date().toLocaleString(),
      winner,
      gameLog,
      playerHealth,
      aiHealth,
      opinion: gameLog[0]?.content || '未知主题',
    };
    const updatedHistory = [newHistoryItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('debateHistory', JSON.stringify(updatedHistory));
  };

  const handleLoadGame = (id) => {
    const gameToLoad = history.find(item => item.id === id);
    if (gameToLoad) {
      setGameLog(gameToLoad.gameLog);
      setPlayerHealth(gameToLoad.playerHealth);
      setAiHealth(gameToLoad.aiHealth);
      setGameState('GAME_OVER');
      closeHistoryDrawer();
      showNotification('对战记录已加载。', 'success');
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('debateHistory');
    showNotification('已清空所有历史记录', 'success');
  };

  const handleDeleteHistory = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('debateHistory', JSON.stringify(updatedHistory));
    showNotification('已删除该条记录', 'success');
  };

  const handlePlayHelpfulCard = (cardContent) => {
    // A helpful card is a counter-argument
    handlePlayerCounter(cardContent);
    // Clear helpful arguments after choosing one
    setHelpfulArguments([]);
  };

  const handleGiveUp = () => {
    setGameState('GAME_OVER');
    showNotification('你认输了！', 'info');
    saveGameToHistory('AI');
  };

  const handleSeekHelp = async () => {
    setPlayerThinking(true);
    try {
      const lastPlayerArgument = gameLog.slice().reverse().find(log => log.type === 'PLAYER_CARD' || log.type === 'PLAYER_CARD_ATTACK');
      if (!lastPlayerArgument) {
        showNotification('没有可以寻求帮助的论点。', 'info');
        return;
      }

      const helpfulArgs = await aiService.getHelpfulArguments(lastPlayerArgument.content);
      setHelpfulArguments(helpfulArgs.map(arg => ({ content: arg }))); // Match card format
      setGameState('PLAYER_CHOOSING_HELPFUL_CARD');
    } catch (error) {
      console.error('Error seeking help:', error);
      showNotification('场外援助连接失败，请稍后重试。', 'error');
    } finally {
      setPlayerThinking(false);
    }
  };

  const getErrorModalContent = () => {
    switch (aiErrorState) {
      case 'REFEREE_AI_ERROR':
        return {
          title: '裁判打瞌睡了',
          message: '裁判AI未能返回有效打分，无法继续辩论。\n是否叫醒裁判，让他继续工作？',
          retryText: '叫醒裁判，继续辩论',
          quitText: '不叫醒，起身离席，停止辩论',
        };
      case 'OPPONENT_AI_ERROR':
        return {
          title: '对手走神了',
          message: '对手AI未能返回有效反驳论点，无法继续辩论。\n是否提醒对手，让他继续辩论？',
          retryText: '敲敲桌子，让对手继续辩论',
          quitText: '拍桌而起，径直离去',
        };
      case 'OPPONENT_AI_NEXT_ROUND_ERROR':
        return {
          title: '对手被你镇住了',
          message: '你的论点太强，对手一时语塞，没能想出下一轮的反驳。\n是否给他一点时间，让他好好想想？',
          retryText: '给他点时间',
          quitText: '乘胜追击，结束辩论',
        };
      default:
        return { title: '', message: '', retryText: '', quitText: '' };
    }
  };

  const errorModalContent = getErrorModalContent();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>Debate Card Battle</Title>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button icon={<SettingOutlined />} onClick={() => setIsSettingsModalOpen(true)}>
            设置
          </Button>
          <Button onClick={showHistoryDrawer}>查看历史</Button>
        </div>
      </Header>
      <Content>
        <GameScreen
          gameState={gameState}
          playerHealth={playerHealth}
          aiHealth={aiHealth}
          playerHand={playerHand}
          gameLog={gameLog}
          aiCards={aiCards}
          onPlayCard={handlePlayCard}
          onChooseAiCard={handleChooseAiCard}
          onPlayerCounter={handlePlayerCounter}
          onRestartGame={handleRestartGame}
          aiThinking={aiThinking}
          playerThinking={playerThinking}
          onGiveUp={handleGiveUp}
          onSeekHelp={handleSeekHelp}
          helpfulArguments={helpfulArguments}
          onPlayHelpfulCard={handlePlayHelpfulCard}
          activeAiCard={activeAiCard}
        />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        <Text type="secondary">Debate Card Battle ©2024</Text>
      </Footer>

      <Modal
        title={errorModalContent.title}
        open={!!aiErrorState}
        onCancel={handleQuitGame}
        footer={[
          <Button key="quit" onClick={handleQuitGame}>
            {errorModalContent.quitText}
          </Button>,
          <Button key="retry" type="primary" onClick={handleRetryAI}>
            {errorModalContent.retryText}
          </Button>,
        ]}
      >
        <p style={{ whiteSpace: 'pre-wrap' }}>{errorModalContent.message}</p>
      </Modal>

      <HistoryDrawer
        open={isHistoryDrawerOpen}
        onClose={closeHistoryDrawer}
        history={history}
        onLoad={handleLoadGame}
        onClear={handleClearHistory}
        onDelete={handleDeleteHistory}
      />

      <SettingsModal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onNotification={showNotification}
        modal={modal}
      />
    </Layout>
  );
}

export default App;
