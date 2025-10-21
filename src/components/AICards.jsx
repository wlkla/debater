import { Card, Button, Typography } from 'antd';

const { Text, Paragraph } = Typography;

function AICards({ cards, onChooseCard, loading }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2%' }}>
      {cards.map((card, index) => (
        <Card
          key={index}
          hoverable
          title={`AI 反驳 ${index + 1}`}
          style={{ width: '32%' }}
          styles={{ body: { minHeight: '150px' } }}
        >
          <Paragraph ellipsis={{ rows: 4 }}>{card.content}</Paragraph>
          <Button
            type="primary"
            block
            style={{ marginTop: '16px' }}
            onClick={() => onChooseCard(card)}
            disabled={loading}
          >
            选择这张卡牌
          </Button>
        </Card>
      ))}
    </div>
  );
}

export default AICards;
