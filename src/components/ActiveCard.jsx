import { Card, Typography } from 'antd';

const { Paragraph, Text } = Typography;

function ActiveCard({ card, isPlaceholder }) {
  if (isPlaceholder || !card) {
    return (
      <Card style={{ width: '100%', height: '150px', backgroundColor: '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text type="secondary">AI 卡牌区域</Text>
      </Card>
    );
  }

  return (
    <Card title="AI 打出的卡牌" style={{ height: '150px' }}>
      <Paragraph ellipsis={{ rows: 2 }}>{card.content}</Paragraph>
      <Text strong>攻击力: {card.attack}</Text>
    </Card>
  );
}

export default ActiveCard;