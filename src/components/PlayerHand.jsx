import React, { useState } from 'react';
import { Card, Typography, Modal, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Paragraph, Title } = Typography;
const { TextArea } = Input;

function PlayerHand({ hand, onPlayCard, loading }) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customArgument, setCustomArgument] = useState('');

  const handleCustomSubmit = () => {
    if (customArgument.trim()) {
      onPlayCard(customArgument.trim());
      setCustomArgument('');
      setIsCustomModalOpen(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2%' }}>
        {hand.map((topic, index) => (
          <Card
            key={index}
            hoverable
            onClick={() => onPlayCard(topic)}
            style={{ cursor: 'pointer', width: '15%' }}
            styles={{ body: { height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
            disabled={loading}
          >
            <Paragraph ellipsis={{ rows: 4 }} style={{ textAlign: 'center' }}>{topic}</Paragraph>
          </Card>
        ))}

        {/* Custom Argument Card */}
        <Card
          hoverable
          onClick={() => setIsCustomModalOpen(true)}
          style={{
            cursor: 'pointer',
            width: '15%',
            border: '2px dashed #1677ff'
          }}
          styles={{ body: {
            height: '120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          } }}
          disabled={loading}
        >
          <PlusOutlined style={{ fontSize: '32px', color: '#1677ff', marginBottom: '8px' }} />
          <Paragraph style={{ textAlign: 'center', margin: 0, color: '#1677ff', fontWeight: 'bold' }}>
            自定义论点
          </Paragraph>
        </Card>
      </div>

      {/* Custom Argument Modal */}
      <Modal
        title="创建自定义论点"
        open={isCustomModalOpen}
        onCancel={() => {
          setIsCustomModalOpen(false);
          setCustomArgument('');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsCustomModalOpen(false);
            setCustomArgument('');
          }}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleCustomSubmit}
            disabled={!customArgument.trim()}
          >
            出牌
          </Button>
        ]}
      >
        <TextArea
          rows={4}
          value={customArgument}
          onChange={(e) => setCustomArgument(e.target.value)}
          placeholder="输入你的观点或论点..."
          maxLength={200}
          showCount
        />
      </Modal>
    </>
  );
}

export default PlayerHand;