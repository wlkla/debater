import { Drawer, List, Button, Typography, Popconfirm, Tooltip } from 'antd';
import { DeleteOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

function HistoryDrawer({ open, onClose, history, onLoad, onClear, onDelete }) {
  return (
    <Drawer
      title="辩论历史"
      placement="right"
      onClose={onClose}
      open={open}
      width={350}
      footer={
        <Popconfirm
          title="确定要清空所有历史记录吗？"
          onConfirm={onClear}
          okText="确定"
          cancelText="取消"
          disabled={history.length === 0}
        >
          <Button danger icon={<DeleteOutlined />} disabled={history.length === 0}>
            清空全部
          </Button>
        </Popconfirm>
      }
    >
      {history.length > 0 ? (
        <List
          dataSource={history}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Tooltip title="查看">
                  <Button type="text" icon={<EyeOutlined />} onClick={() => onLoad(item.id)} />
                </Tooltip>,
                <Tooltip title="删除">
                  <Popconfirm
                    title="确定删除这条记录吗？"
                    onConfirm={() => onDelete(item.id)}
                    okText="删除"
                    cancelText="取消"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={<MessageOutlined />}
                title={<Text ellipsis>{item.opinion}</Text>}
                description={`生成于 ${item.date}`}
              />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Text type="secondary">暂无历史记录</Text>
        </div>
      )}
    </Drawer>
  );
}

export default HistoryDrawer;