import React, { useRef, useEffect } from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { UserOutlined, RobotOutlined, ThunderboltOutlined, HeartOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

function GameLog({ log }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
      {log.map((entry, index) => (
        <Card key={index} size="small" style={{ marginBottom: '8px' }}>
          {(() => {
            switch (entry.type) {
              case 'PLAYER_CARD':
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <UserOutlined />
                      <Text strong style={{ whiteSpace: 'nowrap' }}>你出牌:</Text>
                      <Text>{entry.content}</Text>
                    </div>
                  </div>
                );
              case 'AI_CARD':
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <RobotOutlined />
                      <Text strong style={{ whiteSpace: 'nowrap' }}>AI 反击:</Text>
                      <Text>{entry.content}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '24px' }}>
                      <ThunderboltOutlined style={{ color: 'orange' }} />
                      <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>攻击力: {entry.attack}</Text>
                      <Text type="secondary">({entry.reason})</Text>
                    </div>
                  </div>
                );
              case 'PLAYER_CARD_ATTACK':
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <UserOutlined />
                      <Text strong style={{ whiteSpace: 'nowrap' }}>你反击:</Text>
                      <Text>{entry.content}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '24px' }}>
                      <ThunderboltOutlined style={{ color: 'orange' }} />
                      <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>攻击力: {entry.attack}</Text>
                      <Text type="secondary">({entry.reason})</Text>
                    </div>
                  </div>
                );
              case 'DAMAGE':
                return (
                  <Space>
                    <HeartOutlined style={{ color: 'red' }} />
                    <Text type="danger">{entry.target === 'PLAYER' ? '你' : 'AI'} 受到 {entry.amount} 点伤害！</Text>
                  </Space>
                );
                return (
                  <Space>
                    <HeartOutlined style={{ color: 'red' }} />
                    <Text type="danger">{entry.target === 'PLAYER' ? '你' : 'AI'} 受到 {entry.amount} 点伤害！</Text>
                  </Space>
                );
              default:
                return <Text type="danger">未知日志类型: {JSON.stringify(entry)}</Text>;
            }
          })()}
        </Card>
      ))}
      <div ref={logEndRef} />
    </div>
  );
}

export default GameLog;
