
import { useState } from 'react';
import { Modal, Input, Button, List, Avatar, Spin, Typography } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

function DebateModal({ open, onClose, debateHistory, onNewArgument }) {
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);
    try {
      await onNewArgument(newMessage);
      setNewMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="深入辩论"
      width={700}
      footer={null}
      destroyOnHidden
    >
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
        <List
          style={{ flex: 1, overflowY: 'auto', padding: '16px' }}
          dataSource={debateHistory}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />} />}
                title={item.role === 'user' ? '你的观点' : 'AI 的观点'}
                description={<Text style={{ whiteSpace: 'pre-wrap' }}>{item.content}</Text>}
              />
            </List.Item>
          )}
        />
        <Spin spinning={loading}>
          <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
            <TextArea
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入你的新论点..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button type="primary" onClick={handleSend} style={{ marginTop: '10px', float: 'right' }} loading={loading}>
              发送
            </Button>
          </div>
        </Spin>
      </div>
    </Modal>
  );
}

export default DebateModal;
