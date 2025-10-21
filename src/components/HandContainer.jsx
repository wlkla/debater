import { Card } from 'antd';

function HandContainer({ children, style }) {
  return (
    <Card style={{ backgroundColor: '#141414', border: '1px solid #424242', ...style }}>
      {children}
    </Card>
  );
}

export default HandContainer;