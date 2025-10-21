import { Card, Button, Typography } from 'antd';

const { Text, Title } = Typography;

function HelpfulCards({ cards, onChooseCard }) {
  return (
    <>
      <Title level={4} style={{ textAlign: 'center', marginBottom: '20px', color: '#faad14' }}>
        ⚡ 场外援助已到达！选择你的反击策略，给对手致命一击！
      </Title>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {cards.map((card, index) => (
          <Card 
            key={index} 
            hoverable 
            title={`援助论点 ${index + 1}`}
            style={{ width: '30%' }}
          >
            <Text>{card.content}</Text>
            <Button type="primary" block style={{ marginTop: '16px' }} onClick={() => onChooseCard(card.content)}>
              就用这个！
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}

export default HelpfulCards;