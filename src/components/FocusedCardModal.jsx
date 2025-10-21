
import { Modal, Button, Typography, Card } from 'antd';
import { FireOutlined, CloseOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

function FocusedCardModal({ cardData, onClose, onContinueDebate }) {
  if (!cardData) {
    return null;
  }

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      width={600}
      closable={false}
    >
      <Card 
        title={<div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{`💡 ${cardData.title}`}</div>}
        variant="borderless"
      >
        <Paragraph style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '16px', minHeight: '100px' }}>
          {cardData.content}
        </Paragraph>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <Button icon={<CloseOutlined />} onClick={onClose}>
          收起
        </Button>
        <Button type="primary" icon={<FireOutlined />} onClick={() => onContinueDebate(cardData)}>
          以此观点继续辩论
        </Button>
      </div>
    </Modal>
  );
}

export default FocusedCardModal;
